import random
import time
from datetime import datetime
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from models import SCADAAsset

class SCADASimulationEngine:
    def __init__(self):
        self.simulation_mode = "NORMAL" # NORMAL, WARNING, CRITICAL, ATTACK
        # Baseline sensor values
        self.water_level = 72.4
        self.pressure = 4.3
        self.temperature = 27.1
        self.flow_rate = 82.0
        self.chlorine_level = 1.8

    def tick_sensor_telemetry(self, db: Session):
        """Simulates gradual sensor changes according to plant physical state."""
        # Sync current DB values first if existing
        tank = db.query(SCADAAsset).filter(SCADAAsset.asset_code == "TANK-01").first()
        if tank: self.water_level = tank.value
        press = db.query(SCADAAsset).filter(SCADAAsset.asset_code == "SENSOR-PRESSURE").first()
        if press: self.pressure = press.value
        temp = db.query(SCADAAsset).filter(SCADAAsset.asset_code == "SENSOR-TEMP").first()
        if temp: self.temperature = temp.value
        flow = db.query(SCADAAsset).filter(SCADAAsset.asset_code == "SENSOR-FLOW").first()
        if flow: self.flow_rate = flow.value
        chlor = db.query(SCADAAsset).filter(SCADAAsset.asset_code == "SENSOR-CHLORINE").first()
        if chlor: self.chlorine_level = chlor.value

        # Check pump & valve statuses from DB
        pump1 = db.query(SCADAAsset).filter(SCADAAsset.asset_code == "PUMP-01").first()
        pump2 = db.query(SCADAAsset).filter(SCADAAsset.asset_code == "PUMP-02").first()
        valve1 = db.query(SCADAAsset).filter(SCADAAsset.asset_code == "VALVE-01").first()

        is_pumping = (pump1 and pump1.status == "RUNNING") or (pump2 and pump2.status == "RUNNING")
        valve_open = valve1 and valve1.status == "OPEN"

        # Apply simulation delta
        if self.simulation_mode == "NORMAL":
            if is_pumping:
                self.water_level = min(98.0, self.water_level + random.uniform(0.1, 0.4))
                self.flow_rate = max(70.0, min(110.0, self.flow_rate + random.uniform(-1.5, 1.5)))
                self.pressure = max(3.5, min(5.5, self.pressure + random.uniform(-0.08, 0.08)))
            else:
                # Gradual decrease with realistic noise
                self.water_level = max(10.0, self.water_level - random.uniform(0.05, 0.2))
                self.flow_rate = max(0.0, self.flow_rate - random.uniform(1.0, 3.0))
                self.pressure = max(1.5, min(3.5, self.pressure + random.uniform(-0.05, 0.05)))

            # Always add small ambient noise to temperature and chlorine
            temp_delta = random.choice([-0.1, 0.1, -0.2, 0.2, 0.05, -0.05])
            self.temperature = max(18.0, min(35.0, round(self.temperature + temp_delta, 1)))

            chlor_delta = random.choice([-0.02, 0.02, -0.01, 0.01])
            self.chlorine_level = max(0.5, min(3.5, round(self.chlorine_level + chlor_delta, 2)))

        elif self.simulation_mode == "WARNING":
            self.water_level = max(15.0, self.water_level - 0.8)
            self.pressure = min(6.8, self.pressure + 0.15)
            self.flow_rate = min(140.0, self.flow_rate + 3.0)

        elif self.simulation_mode == "ATTACK":
            self.pressure = min(8.9, self.pressure + 0.4) # Overpressure threat
            self.temperature = min(58.0, self.temperature + 1.2) # Overheating
            self.chlorine_level = min(9.5, self.chlorine_level + 0.4) # Chemical over-dosing anomaly

        # Ensure sensor values always shift slightly on tick so refresh is visually distinct
        sensor_updates = {
            "TANK-01": round(self.water_level, 1),
            "SENSOR-PRESSURE": round(self.pressure, 2),
            "SENSOR-TEMP": round(self.temperature, 1),
            "SENSOR-FLOW": round(self.flow_rate, 1),
            "SENSOR-CHLORINE": round(self.chlorine_level, 2)
        }

        for code, val in sensor_updates.items():
            asset = db.query(SCADAAsset).filter(SCADAAsset.asset_code == code).first()
            if asset:
                asset.value = val
                asset.last_updated = datetime.utcnow()

        db.commit()

    def execute_authorized_command(self, db: Session, target_asset_code: str, command_type: str) -> bool:
        """Applies state changes only after Zero Trust Engine authorization."""
        if target_asset_code == "PLANT_EMERGENCY" or command_type == "EMERGENCY_SHUTDOWN":
            # Shut down all pumps, close intake valves
            pumps = db.query(SCADAAsset).filter(SCADAAsset.asset_type == "PUMP").all()
            for p in pumps:
                p.status = "STOPPED"
            valves = db.query(SCADAAsset).filter(SCADAAsset.asset_type == "VALVE").all()
            for v in valves:
                v.status = "CLOSED"
            db.commit()
            return True

        asset = db.query(SCADAAsset).filter(SCADAAsset.asset_code == target_asset_code).first()
        if not asset:
            return False

        if command_type in ["START", "START_PUMP"]:
            asset.status = "RUNNING"
        elif command_type in ["STOP", "STOP_PUMP"]:
            asset.status = "STOPPED"
        elif command_type in ["OPEN", "OPEN_VALVE"]:
            asset.status = "OPEN"
        elif command_type in ["CLOSE", "CLOSE_VALVE"]:
            asset.status = "CLOSED"

        asset.last_updated = datetime.utcnow()
        db.commit()
        return True

scada_engine = SCADASimulationEngine()
