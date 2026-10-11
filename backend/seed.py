from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from database import SessionLocal, engine, Base
from models import User, Device, SCADAAsset, SecurityEvent, SecurityAlert, Vulnerability, ZeroTrustPolicy, MLModelMetric
from auth import get_password_hash

def init_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Define canonical and legacy demo users
    demo_users_spec = [
        {
            "user_code": "USR-001-TG",
            "full_name": "Admin Security Officer",
            "email": "admin@trustgrid.local",
            "password": "admin123",
            "organization": "Water Treatment Operations",
            "role": "ADMIN",
            "risk_score": 0
        },
        {
            "user_code": "USR-002-TG",
            "full_name": "Operator One",
            "email": "operator@trustgrid.local",
            "password": "operator123",
            "organization": "Water Treatment Operations",
            "role": "OPERATOR",
            "risk_score": 12
        },
        {
            "user_code": "USR-003-TG",
            "full_name": "Engineer One",
            "email": "engineer@trustgrid.local",
            "password": "engineer123",
            "organization": "Water Treatment Operations",
            "role": "ENGINEER",
            "risk_score": 5
        },
        {
            "user_code": "USR-001",
            "full_name": "Admin Security Officer",
            "email": "admin@scadasentinel.local",
            "password": "admin123",
            "organization": "Water Treatment Operations",
            "role": "ADMIN",
            "risk_score": 0
        },
        {
            "user_code": "USR-002",
            "full_name": "Operator One",
            "email": "operator@scadasentinel.local",
            "password": "operator123",
            "organization": "Water Treatment Operations",
            "role": "OPERATOR",
            "risk_score": 12
        },
        {
            "user_code": "USR-003",
            "full_name": "Engineer One",
            "email": "engineer@scadasentinel.local",
            "password": "engineer123",
            "organization": "Water Treatment Operations",
            "role": "ENGINEER",
            "risk_score": 5
        },
    ]

    # Seed demo users idempotently
    for spec in demo_users_spec:
        email = spec["email"].strip().lower()
        existing = db.query(User).filter(User.email.ilike(email)).first()
        if not existing:
            new_u = User(
                user_code=spec["user_code"],
                full_name=spec["full_name"],
                email=email,
                hashed_password=get_password_hash(spec["password"]),
                organization=spec["organization"],
                role=spec["role"],
                status="ACTIVE",
                is_active=True,
                risk_score=spec["risk_score"]
            )
            db.add(new_u)
        else:
            # Ensure seeded demo accounts remain ACTIVE and enabled
            if existing.status in ["PENDING", None]:
                existing.status = "ACTIVE"
                existing.is_active = True

    db.commit()

    # Seed remaining tables if not seeded yet
    if db.query(Device).first():
        db.close()
        return

    # Seed Devices
    devices = [
        Device(
            device_code="DEV-001",
            name="SCADA-PC-01",
            ip_address="172.16.1.5",
            device_type="HMI Workstation",
            assigned_user="Operator One",
            trust_status="TRUSTED",
            network_subnet="Internal SCADA (172.16.1.x)",
            risk_level="LOW"
        ),
        Device(
            device_code="DEV-002",
            name="SCADA-PC-02",
            ip_address="172.16.1.6",
            device_type="HMI Control Room",
            assigned_user="Operator One",
            trust_status="TRUSTED",
            network_subnet="Internal SCADA (172.16.1.x)",
            risk_level="LOW"
        ),
        Device(
            device_code="DEV-003",
            name="ENGINEERING-PC-01",
            ip_address="172.16.1.7",
            device_type="Engineering Console",
            assigned_user="Engineer One",
            trust_status="TRUSTED",
            network_subnet="Internal SCADA (172.16.1.x)",
            risk_level="LOW"
        ),
        Device(
            device_code="DEV-099",
            name="UNKNOWN-PC-89",
            ip_address="203.0.113.45",
            device_type="External Workstation",
            assigned_user="Unknown",
            trust_status="UNTRUSTED",
            network_subnet="External Public (203.0.113.x)",
            risk_level="HIGH"
        )
    ]
    db.add_all(devices)

    # Seed SCADA Assets (Initial State per Hackathon Spec Section 67)
    assets = [
        SCADAAsset(
            asset_code="PUMP-01",
            name="Intake Pump 1",
            asset_type="PUMP",
            status="RUNNING",
            value=82.0,
            unit="L/min",
            min_val=0.0,
            max_val=150.0,
            risk_score=0
        ),
        SCADAAsset(
            asset_code="PUMP-02",
            name="Distribution Pump 2",
            asset_type="PUMP",
            status="STANDBY",
            value=0.0,
            unit="L/min",
            min_val=0.0,
            max_val=150.0,
            risk_score=0
        ),
        SCADAAsset(
            asset_code="VALVE-01",
            name="Intake Valve 1",
            asset_type="VALVE",
            status="OPEN",
            value=100.0,
            unit="%",
            min_val=0.0,
            max_val=100.0,
            risk_score=0
        ),
        SCADAAsset(
            asset_code="VALVE-02",
            name="Chlorine Valve 2",
            asset_type="VALVE",
            status="CLOSED",
            value=0.0,
            unit="%",
            min_val=0.0,
            max_val=100.0,
            risk_score=0
        ),
        SCADAAsset(
            asset_code="TANK-01",
            name="Water Storage Tank 1",
            asset_type="TANK",
            status="RUNNING",
            value=72.4,
            unit="%",
            min_val=0.0,
            max_val=100.0,
            risk_score=0
        ),
        SCADAAsset(
            asset_code="SENSOR-PRESSURE",
            name="Main Line Pressure",
            asset_type="SENSOR",
            status="RUNNING",
            value=4.3,
            unit="bar",
            min_val=0.0,
            max_val=10.0,
            risk_score=0
        ),
        SCADAAsset(
            asset_code="SENSOR-TEMP",
            name="Water Temperature",
            asset_type="SENSOR",
            status="RUNNING",
            value=27.1,
            unit="°C",
            min_val=0.0,
            max_val=60.0,
            risk_score=0
        ),
        SCADAAsset(
            asset_code="SENSOR-FLOW",
            name="Main Line Flow Rate",
            asset_type="SENSOR",
            status="RUNNING",
            value=82.0,
            unit="L/min",
            min_val=0.0,
            max_val=200.0,
            risk_score=0
        ),
        SCADAAsset(
            asset_code="SENSOR-CHLORINE",
            name="Chlorine Concentration",
            asset_type="SENSOR",
            status="RUNNING",
            value=1.8,
            unit="mg/L",
            min_val=0.0,
            max_val=5.0,
            risk_score=0
        )
    ]
    db.add_all(assets)

    # Seed Vulnerability Intelligence Database (ICS / SCADA focus)
    vulnerabilities = [
        Vulnerability(
            cve_id="CVE-2024-21887",
            title="Ivanti Connect Secure Zero-Day RCE in ICS Gateways",
            description="A command injection vulnerability in web components of Ivanti Connect Secure allows an authenticated administrator to execute arbitrary commands.",
            severity="CRITICAL",
            cvss_score=9.1,
            affected_component="ICS Gateway Router",
            status="Requires Attention",
            recommendation="Apply Ivanti patch v22.3R1 immediately and enable Zero Trust Granular Microsegmentation.",
            publish_date="2024-01-12"
        ),
        Vulnerability(
            cve_id="CVE-2023-3595",
            title="Rockwell Automation FactoryTalk Linx Remote Code Execution",
            description="Unauthenticated remote code execution vulnerability in Rockwell Automation FactoryTalk Linx communications service.",
            severity="CRITICAL",
            cvss_score=9.8,
            affected_component="FactoryTalk Linx HMI Engine",
            status="Requires Attention",
            recommendation="Restrict port 44818 to trusted IP ranges and apply Rockwell Security Advisory 2023-08.",
            publish_date="2023-07-18"
        ),
        Vulnerability(
            cve_id="CVE-2022-38465",
            title="Modbus TCP Unauthenticated Command Injection in PLC Controllers",
            description="Lack of authentication in Modbus TCP protocol permits attackers on local network to send arbitrary coil state write commands.",
            severity="HIGH",
            cvss_score=8.6,
            affected_component="Modbus TCP Gateway / PLC",
            status="Mitigated",
            recommendation="Enforce TRUST-GRID Zero Trust Gateway validation on all incoming Modbus command packets.",
            publish_date="2022-11-05"
        ),
        Vulnerability(
            cve_id="CVE-2021-44228",
            title="Apache Log4j RCE in SCADA Data Logging Subsystem",
            description="JNDI lookup feature in Log4j library allows remote attackers to execute arbitrary code via malicious logging parameters.",
            severity="CRITICAL",
            cvss_score=10.0,
            affected_component="SCADA Audit Logger",
            status="Patched",
            recommendation="Log4j upgraded to version 2.17.1. JVM flag log4j2.formatMsgNoLookups set to true.",
            publish_date="2021-12-10"
        )
    ]
    db.add_all(vulnerabilities)

    # Seed Zero Trust Policies
    policies = [
        ZeroTrustPolicy(
            policy_code="ZTP-001",
            name="Working Hours SCADA Enforcement",
            description="Enforces strict risk score elevation for SCADA commands issued outside 08:00-18:00 operating window.",
            category="Context Policy",
            min_role="OPERATOR",
            allow_external_ip=False,
            max_risk_threshold=60,
            is_enabled=True
        ),
        ZeroTrustPolicy(
            policy_code="ZTP-002",
            name="Untrusted Subnet Auto-Block",
            description="Automatically blocks all SCADA write operations originating outside internal 172.16.1.x subnet.",
            category="Network Policy",
            min_role="OPERATOR",
            allow_external_ip=False,
            max_risk_threshold=40,
            is_enabled=True
        ),
        ZeroTrustPolicy(
            policy_code="ZTP-003",
            name="Critical Command MFA Verification",
            description="Requires multi-factor confirmation for critical commands like Pump Shutdown & Config Overwrite.",
            category="Access Control",
            min_role="ENGINEER",
            allow_external_ip=False,
            max_risk_threshold=50,
            is_enabled=True
        ),
        ZeroTrustPolicy(
            policy_code="ZTP-004",
            name="ML Behavioral Threat Containment",
            description="Triggers automated device isolation when ML Anomaly Confidence exceeds 90%.",
            category="Threat Prevention",
            min_role="ADMIN",
            allow_external_ip=False,
            max_risk_threshold=80,
            is_enabled=True
        )
    ]
    db.add_all(policies)

    # Seed ML Model Comparison Metrics
    ml_models = [
        MLModelMetric(model_name="Random Forest", accuracy=96.4, precision=95.8, recall=94.2, f1_score=95.0, is_active=True),
        MLModelMetric(model_name="AdaBoost", accuracy=93.7, precision=92.1, recall=91.5, f1_score=91.8, is_active=False),
        MLModelMetric(model_name="XGBoost", accuracy=97.1, precision=96.9, recall=96.2, f1_score=96.5, is_active=False)
    ]
    db.add_all(ml_models)

    # Seed Initial Audit Log Events
    events = [
        SecurityEvent(
            event_code="EVT-001",
            timestamp=datetime.utcnow() - timedelta(minutes=15),
            user_name="Operator One",
            role="OPERATOR",
            device_name="SCADA-PC-01",
            ip_address="172.16.1.5",
            command="START PUMP 1",
            risk_score=12,
            ml_result="NORMAL",
            zta_decision="ALLOW",
            status="SUCCESS",
            severity="INFO",
            category="SCADA Control"
        ),
        SecurityEvent(
            event_code="EVT-002",
            timestamp=datetime.utcnow() - timedelta(minutes=8),
            user_name="Unknown",
            role="UNKNOWN",
            device_name="UNKNOWN-PC-89",
            ip_address="203.0.113.45",
            command="STOP PUMP 1",
            risk_score=94,
            ml_result="ANOMALOUS / ATTACK",
            zta_decision="BLOCK",
            status="BLOCKED",
            severity="CRITICAL",
            category="Attack Attempt"
        )
    ]
    db.add_all(events)

    # Seed Initial Alerts
    alerts = [
        SecurityAlert(
            alert_code="ALT-001",
            timestamp=datetime.utcnow() - timedelta(minutes=8),
            severity="CRITICAL",
            title="🚨 Unauthorized SCADA Command Blocked",
            description="Unknown device UNKNOWN-PC-89 from 203.0.113.45 attempted critical pump shutdown. Access BLOCKED.",
            user_name="Unknown",
            device_name="UNKNOWN-PC-89",
            ip_address="203.0.113.45",
            action_taken="Blocked by Zero Trust Policy",
            risk_score=94,
            is_resolved=False
        )
    ]
    db.add_all(alerts)

    db.commit()
    db.close()
    print("TRUST-GRID Database Initialized & Seeded Successfully.")

if __name__ == "__main__":
    init_db()
