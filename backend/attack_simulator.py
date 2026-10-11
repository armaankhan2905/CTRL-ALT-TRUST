from datetime import datetime
from typing import Dict, Any, Tuple
from sqlalchemy.orm import Session
from models import User, Device, SecurityEvent, SecurityAlert, SCADAAsset
from zero_trust_engine import zta_engine
from schemas import ZeroTrustDecision, SecurityAlertResponse

class AttackSimulatorLab:
    def __init__(self):
        pass

    def run_simulation(
        self,
        db: Session,
        attack_type: str,
        current_user: User
    ) -> Tuple[Dict[str, Any], ZeroTrustDecision, list, SecurityAlert]:
        """Executes simulated attack scenarios against the SCADA environment."""

        automated_responses = []
        alert_title = ""
        alert_desc = ""
        severity = "HIGH"

        if attack_type == "UNKNOWN_DEVICE":
            sim_user_name = "Operator01"
            sim_device = "UNKNOWN-PC-89"
            sim_ip = "203.0.113.45" # External documentation IP
            sim_command = "STOP PUMP 1"

            decision = zta_engine.evaluate_request(
                db=db,
                user=current_user,
                device_name=sim_device,
                ip_address=sim_ip,
                target_asset="PUMP-01",
                command_type="STOP",
                force_unknown_device=True,
                force_external_ip=True
            )

            alert_title = "🚨 Unknown Device SCADA Access Attempt"
            alert_desc = f"An unregistered device ({sim_device}) from external IP {sim_ip} attempted unauthorized pump shutdown."
            severity = "HIGH"
            automated_responses = [
                "1. Access request immediately blocked at Zero Trust Gateway.",
                "2. Network socket connection rejected.",
                "3. Incident logged to Security Audit Trail.",
                "4. SOC Administrator notified."
            ]

        elif attack_type == "EXTERNAL_IP":
            sim_user_name = current_user.full_name
            sim_device = "SCADA-PC-01"
            sim_ip = "203.0.113.99"
            sim_command = "OPEN INTAKE VALVE 1"

            decision = zta_engine.evaluate_request(
                db=db,
                user=current_user,
                device_name=sim_device,
                ip_address=sim_ip,
                target_asset="VALVE-01",
                command_type="OPEN",
                force_external_ip=True
            )

            alert_title = "⚠️ External Subnet SCADA Access Attempt"
            alert_desc = f"Valid user '{sim_user_name}' attempted SCADA operation from an untrusted public network IP ({sim_ip})."
            severity = "WARNING"
            automated_responses = [
                "1. Zero Trust Network Access (ZTNA) policy enforced.",
                "2. Access denied due to untrusted IP subnet.",
                "3. Step-up authentication required."
            ]

        elif attack_type == "BRUTE_FORCE":
            sim_user_name = "Admin_Target"
            sim_device = "UNKNOWN-ATTACK-NODE"
            sim_ip = "198.51.100.12"
            sim_command = "AUTHENTICATION_BURST"

            # Create high risk score
            decision = zta_engine.evaluate_request(
                db=db,
                user=current_user,
                device_name=sim_device,
                ip_address=sim_ip,
                target_asset="AUTH_SERVER",
                command_type="LOGIN",
                force_unknown_device=True,
                force_external_ip=True,
                request_rate=45.0
            )

            alert_title = "🚨 Brute Force Authentication Attack Pattern"
            alert_desc = f"Detected 25 rapid failed login attempts targeting account '{sim_user_name}' from IP {sim_ip}."
            severity = "HIGH"
            automated_responses = [
                "1. User account temporarily locked out for 15 minutes.",
                "2. Origin IP address added to dynamic firewall blackhole.",
                "3. High-priority security incident logged."
            ]

        elif attack_type == "UNAUTHORIZED_COMMAND":
            sim_user_name = current_user.full_name
            sim_device = "SCADA-PC-01"
            sim_ip = "172.16.1.5"
            sim_command = "DELETE_DEVICE_REGISTRY"

            # Modify operator permissions check
            decision = zta_engine.evaluate_request(
                db=db,
                user=current_user,
                device_name=sim_device,
                ip_address=sim_ip,
                target_asset="SECURITY_POLICY",
                command_type="EMERGENCY_SHUTDOWN"
            )

            alert_title = "🚫 Privilege Escalation / Unauthorized Command"
            alert_desc = f"User '{sim_user_name}' ({current_user.role}) attempted restricted admin system modification."
            severity = "HIGH"
            automated_responses = [
                "1. Role-Based Access Control (RBAC) blocked command execution.",
                "2. System state protected from modification.",
                "3. Security manager alert emitted."
            ]

        elif attack_type == "ABNORMAL_TRAFFIC":
            sim_user_name = current_user.full_name
            sim_device = "SCADA-PC-02"
            sim_ip = "172.16.1.6"
            sim_command = "COMMAND_FLOOD_BURST (150 cmds/min)"

            decision = zta_engine.evaluate_request(
                db=db,
                user=current_user,
                device_name=sim_device,
                ip_address=sim_ip,
                target_asset="PUMP-01",
                command_type="START",
                request_rate=150.0 # High burst frequency
            )

            alert_title = "⚡ Abnormal SCADA Traffic Anomaly (DoS Burst)"
            alert_desc = "ML Behavior Classifier detected anomalous high-frequency command burst (150 requests/min)."
            severity = "CRITICAL"
            automated_responses = [
                "1. Rate-limiting threshold exceeded.",
                "2. Automated command throttling engaged.",
                "3. ML anomaly score updated to 0.98 (CRITICAL)."
            ]

        elif attack_type == "RANSOMWARE":
            sim_user_name = "COMPROMISED_HOST"
            sim_device = "ENGINEERING-PC-01"
            sim_ip = "172.16.1.7"
            sim_command = "PLC_FIRMWARE_OVERWRITE_REQUEST"

            # Isolate device in DB
            dev = db.query(Device).filter(Device.name == sim_device).first()
            if dev:
                dev.trust_status = "ISOLATED"
                dev.risk_level = "CRITICAL"

            decision = zta_engine.evaluate_request(
                db=db,
                user=current_user,
                device_name=sim_device,
                ip_address=sim_ip,
                target_asset="PLC_CONTROLLER",
                command_type="EMERGENCY_SHUTDOWN",
                request_rate=90.0
            )

            alert_title = "☣️ Ransomware Threat Detected & Contained"
            alert_desc = f"Simulated ransomware activity on '{sim_device}' attempting PLC binary modification. Demand: 5 BTC."
            severity = "CRITICAL"
            automated_responses = [
                "1. Zero Trust Automated Isolation activated.",
                "2. Host 'ENGINEERING-PC-01' instantly network isolated.",
                "3. PLC Controller firmware locked in Read-Only safety state.",
                "4. Backup configuration restored."
            ]

        elif attack_type == "INSIDER_THREAT":
            sim_user_name = current_user.full_name
            sim_device = "SCADA-PC-01"
            sim_ip = "172.16.1.5"
            sim_command = "RAPID_PUMP_STOP_SEQUENCE"

            decision = zta_engine.evaluate_request(
                db=db,
                user=current_user,
                device_name=sim_device,
                ip_address=sim_ip,
                target_asset="PUMP-01",
                command_type="STOP",
                override_time="02:37 AM", # Off hours
                request_rate=35.0
            )

            alert_title = "🔍 Insider Threat Pattern Detected"
            alert_desc = f"Authenticated user '{sim_user_name}' on trusted device attempting off-hours critical equipment shutdown."
            severity = "HIGH"
            automated_responses = [
                "1. Authenticated user trusted status suspended.",
                "2. Secondary supervisor approval required.",
                "3. Behavioral risk score escalated to 85/100."
            ]

        else: # COMMAND_INJECTION
            sim_user_name = "Attacker"
            sim_device = "SCADA-PC-01"
            sim_ip = "172.16.1.5"
            sim_command = "START_PUMP; DROP TABLE scada_assets;--"

            decision = zta_engine.evaluate_request(
                db=db,
                user=current_user,
                device_name=sim_device,
                ip_address=sim_ip,
                target_asset="PUMP-01",
                command_type="START"
            )

            alert_title = "🛑 SCADA Command Injection Attempt"
            alert_desc = "Malicious payload input detected in SCADA command argument buffer."
            severity = "CRITICAL"
            automated_responses = [
                "1. Input sanitizer blocked command payload.",
                "2. Zero Trust Gateway dropped request.",
                "3. Security event logged."
            ]

        # Log Security Alert in DB
        alert_obj = SecurityAlert(
            alert_code=f"ALT-{datetime.utcnow().strftime('%H%M%S')}",
            timestamp=datetime.utcnow(),
            severity=severity,
            title=alert_title,
            description=alert_desc,
            user_name=sim_user_name,
            device_name=sim_device,
            ip_address=sim_ip,
            action_taken=automated_responses[0] if automated_responses else "Blocked by ZTA",
            risk_score=decision.risk_score,
            is_resolved=False
        )
        db.add(alert_obj)

        # Log Security Event in DB
        event_obj = SecurityEvent(
            event_code=f"EVT-{datetime.utcnow().strftime('%M%S%f')[:8]}",
            timestamp=datetime.utcnow(),
            user_name=sim_user_name,
            role=current_user.role if current_user else "OPERATOR",
            device_name=sim_device,
            ip_address=sim_ip,
            command=sim_command,
            risk_score=decision.risk_score,
            ml_result=decision.ml_result,
            zta_decision=decision.decision,
            status="BLOCKED" if decision.decision == "BLOCK" else "SUCCESS",
            severity=severity,
            category=f"Attack Simulation ({attack_type})"
        )
        db.add(event_obj)
        db.commit()

        sim_request = {
            "user": sim_user_name,
            "device": sim_device,
            "ip": sim_ip,
            "command": sim_command,
            "timestamp": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
        }

        return sim_request, decision, automated_responses, alert_obj

attack_lab = AttackSimulatorLab()
