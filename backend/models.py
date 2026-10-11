from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    user_code = Column(String, unique=True, index=True) # e.g. USR-001
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    organization = Column(String, default="Water Operations Command")
    role = Column(String, default="OPERATOR") # ADMIN, ENGINEER, OPERATOR
    status = Column(String, default="PENDING") # PENDING, ACTIVE, REJECTED, DELETED, INACTIVE
    is_active = Column(Boolean, default=True)
    risk_score = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)

class Device(Base):
    __tablename__ = "devices"

    id = Column(Integer, primary_key=True, index=True)
    device_code = Column(String, unique=True, index=True) # e.g. SCADA-PC-01
    name = Column(String, nullable=False)
    ip_address = Column(String, nullable=False)
    device_type = Column(String, default="HMI Workstation") # HMI Workstation, PLC Controller, Engineering Console
    assigned_user = Column(String, nullable=True)
    trust_status = Column(String, default="TRUSTED") # TRUSTED, UNTRUSTED, ISOLATED
    network_subnet = Column(String, default="Internal SCADA (172.16.1.x)")
    risk_level = Column(String, default="LOW") # LOW, MEDIUM, HIGH, CRITICAL
    last_seen = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

class SCADAAsset(Base):
    __tablename__ = "scada_assets"

    id = Column(Integer, primary_key=True, index=True)
    asset_code = Column(String, unique=True, index=True) # PUMP-01, VALVE-01, TANK-01, SENSOR-WATER-LEVEL
    name = Column(String, nullable=False)
    asset_type = Column(String, nullable=False) # PUMP, VALVE, TANK, SENSOR
    status = Column(String, nullable=False) # RUNNING, STOPPED, STANDBY, OPEN, CLOSED, FAULT
    value = Column(Float, default=0.0) # Numerical reading e.g. 72.0 (%) or 4.3 (bar)
    unit = Column(String, default="") # %, bar, °C, L/min, mg/L
    min_val = Column(Float, default=0.0)
    max_val = Column(Float, default=100.0)
    risk_score = Column(Integer, default=0)
    last_updated = Column(DateTime, default=datetime.utcnow)

class SCADACommand(Base):
    __tablename__ = "scada_commands"

    id = Column(Integer, primary_key=True, index=True)
    command_code = Column(String, unique=True, index=True)
    user_name = Column(String, nullable=False)
    role = Column(String, nullable=False)
    device_name = Column(String, nullable=False)
    ip_address = Column(String, nullable=False)
    target_asset = Column(String, nullable=False)
    command_type = Column(String, nullable=False) # START_PUMP, STOP_PUMP, OPEN_VALVE, CLOSE_VALVE, EMERGENCY_SHUTDOWN
    sensitivity = Column(String, default="MEDIUM") # LOW, MEDIUM, HIGH, CRITICAL
    risk_score = Column(Integer, default=0)
    ml_result = Column(String, default="NORMAL") # NORMAL, ANOMALOUS, ATTACK
    ml_confidence = Column(Float, default=0.95)
    decision = Column(String, nullable=False) # ALLOW, BLOCK, REQUIRE_VERIFICATION
    reason = Column(Text, nullable=False)
    executed_at = Column(DateTime, default=datetime.utcnow)

class SecurityEvent(Base):
    __tablename__ = "security_events"

    id = Column(Integer, primary_key=True, index=True)
    event_code = Column(String, unique=True, index=True) # EVT-001
    timestamp = Column(DateTime, default=datetime.utcnow)
    user_name = Column(String, default="System")
    role = Column(String, default="OPERATOR")
    device_name = Column(String, default="SCADA-PC-01")
    ip_address = Column(String, default="172.16.1.5")
    command = Column(String, nullable=False)
    risk_score = Column(Integer, default=0)
    ml_result = Column(String, default="NORMAL")
    zta_decision = Column(String, default="ALLOW")
    status = Column(String, default="SUCCESS")
    severity = Column(String, default="INFO") # INFO, WARNING, HIGH, CRITICAL
    category = Column(String, default="SCADA Operation")

class SecurityAlert(Base):
    __tablename__ = "security_alerts"

    id = Column(Integer, primary_key=True, index=True)
    alert_code = Column(String, unique=True, index=True) # ALT-001
    timestamp = Column(DateTime, default=datetime.utcnow)
    severity = Column(String, default="WARNING") # INFO, WARNING, HIGH, CRITICAL
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    user_name = Column(String, default="Unknown")
    device_name = Column(String, default="Unknown")
    ip_address = Column(String, default="0.0.0.0")
    action_taken = Column(String, default="Blocked by Zero Trust Policy")
    risk_score = Column(Integer, default=50)
    is_resolved = Column(Boolean, default=False)

class Vulnerability(Base):
    __tablename__ = "vulnerabilities"

    id = Column(Integer, primary_key=True, index=True)
    cve_id = Column(String, unique=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    severity = Column(String, default="HIGH") # LOW, MEDIUM, HIGH, CRITICAL
    cvss_score = Column(Float, default=7.5)
    affected_component = Column(String, nullable=False)
    status = Column(String, default="Requires Attention") # Requires Attention, Mitigated, Patched
    recommendation = Column(Text, nullable=False)
    publish_date = Column(String, default="2025-02-15")

class ZeroTrustPolicy(Base):
    __tablename__ = "zero_trust_policies"

    id = Column(Integer, primary_key=True, index=True)
    policy_code = Column(String, unique=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String, default="Access Control")
    min_role = Column(String, default="OPERATOR")
    allow_external_ip = Column(Boolean, default=False)
    max_risk_threshold = Column(Integer, default=60)
    is_enabled = Column(Boolean, default=True)

class MLModelMetric(Base):
    __tablename__ = "ml_model_metrics"

    id = Column(Integer, primary_key=True, index=True)
    model_name = Column(String, unique=True, index=True) # Random Forest, AdaBoost, XGBoost
    accuracy = Column(Float, default=0.965)
    precision = Column(Float, default=0.958)
    recall = Column(Float, default=0.942)
    f1_score = Column(Float, default=0.950)
    is_active = Column(Boolean, default=False)
    trained_at = Column(DateTime, default=datetime.utcnow)
