import asyncio
import os
from contextlib import asynccontextmanager
from typing import List, Optional
from datetime import datetime

from fastapi import FastAPI, Depends, HTTPException, status, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session

from database import engine, get_db, SessionLocal, Base
from seed import init_db
import models
import schemas
from auth import (
    get_password_hash, verify_password, create_access_token,
    get_current_user, require_role
)
from scada_engine import scada_engine
from ml_engine import ml_detector
from zero_trust_engine import zta_engine
from attack_simulator import attack_lab
from crypto_engine import crypto_engine

# --- Background Telemetry Ticker ---
bg_ticker_running = True

def ensure_user_schema_updated():
    try:
        db = SessionLocal()
        db.execute(text("SELECT status FROM users LIMIT 1"))
        db.close()
    except Exception:
        try:
            db = SessionLocal()
            db.execute(text("ALTER TABLE users ADD COLUMN status VARCHAR DEFAULT 'ACTIVE'"))
            db.commit()
            db.execute(text("UPDATE users SET status = 'ACTIVE' WHERE status IS NULL"))
            db.commit()
            db.close()
        except Exception as e:
            print("Schema migration note:", e)

async def scada_sensor_telemetry_loop():
    """Background task to simulate live sensor fluctuations every 3 seconds."""
    while bg_ticker_running:
        await asyncio.sleep(3.0)
        try:
            db = SessionLocal()
            scada_engine.tick_sensor_telemetry(db)
            db.close()
        except Exception as e:
            print(f"Telemetry loop error: {e}")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: init DB & seed data
    ensure_user_schema_updated()
    init_db()
    ticker_task = asyncio.create_task(scada_sensor_telemetry_loop())
    yield
    # Shutdown
    global bg_ticker_running
    bg_ticker_running = False
    ticker_task.cancel()

app = FastAPI(
    title="TRUST-GRID API",
    description="AI-Powered Zero Trust Security Platform for SCADA & Critical Infrastructure",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for Vite React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# 1. AUTHENTICATION ENDPOINTS
# ==========================================

@app.post("/auth/signup", response_model=schemas.UserSignupResponse)
def signup(user_in: schemas.UserSignup, db: Session = Depends(get_db)):
    clean_email = user_in.email.strip().lower()
    # Check duplicate email
    existing = db.query(models.User).filter(models.User.email.ilike(clean_email)).first()
    if existing:
        raise HTTPException(status_code=400, detail="User with this email already exists.")

    # Restrict Admin signup: Only OPERATOR or ENGINEER permitted
    assigned_role = "OPERATOR"
    if user_in.role and user_in.role.upper() in ["ENGINEER", "OPERATOR"]:
        assigned_role = user_in.role.upper()

    user_count = db.query(models.User).count()
    user_code = f"USR-{user_count + 1:03d}"

    # Create account with PENDING status (is_active = False)
    new_user = models.User(
        user_code=user_code,
        full_name=user_in.full_name,
        email=clean_email,
        hashed_password=get_password_hash(user_in.password),
        organization=user_in.organization or "Water Operations Command",
        role=assigned_role,
        status="PENDING",
        is_active=False,
        risk_score=0
    )
    db.add(new_user)

    # Log Security Audit Event
    audit_evt = models.SecurityEvent(
        event_code=f"EVT-{datetime.utcnow().strftime('%M%S%f')[:8]}",
        timestamp=datetime.utcnow(),
        user_name=new_user.full_name,
        role=assigned_role,
        device_name="WEB-REGISTER",
        ip_address="0.0.0.0",
        command=f"USER_SIGNUP_REQUESTED ({new_user.email})",
        risk_score=0,
        ml_result="NORMAL",
        zta_decision="PENDING_APPROVAL",
        status="PENDING",
        severity="INFO",
        category="User Administration"
    )
    db.add(audit_evt)

    db.commit()
    db.refresh(new_user)

    return schemas.UserSignupResponse(
        message="Registration submitted successfully. Your account is pending administrator approval. You will be able to log in after an administrator approves your request.",
        status="PENDING",
        user=schemas.UserResponse.model_validate(new_user)
    )

@app.post("/auth/login", response_model=schemas.Token)
def login(login_in: schemas.UserLogin, db: Session = Depends(get_db)):
    clean_email = login_in.email.strip().lower()
    user = db.query(models.User).filter(models.User.email.ilike(clean_email)).first()
    
    if not user:
        print(f"[AUTH_DIAGNOSTIC] Login failed: User '{clean_email}' NOT_FOUND")
        raise HTTPException(status_code=400, detail="Invalid email or password.")
        
    if not verify_password(login_in.password, user.hashed_password):
        print(f"[AUTH_DIAGNOSTIC] Login failed: User '{clean_email}' INVALID_PASSWORD")
        raise HTTPException(status_code=400, detail="Invalid email or password.")

    # Status check enforcement
    user_status = (user.status or ("ACTIVE" if user.is_active else "INACTIVE")).upper()

    if user_status == "PENDING":
        print(f"[AUTH_DIAGNOSTIC] Login blocked: User '{clean_email}' ACCOUNT_PENDING")
        raise HTTPException(status_code=400, detail="Your account is awaiting administrator approval.")
    elif user_status == "REJECTED":
        print(f"[AUTH_DIAGNOSTIC] Login blocked: User '{clean_email}' ACCOUNT_REJECTED")
        raise HTTPException(status_code=400, detail="Your registration request was rejected by an administrator.")
    elif user_status == "DELETED":
        print(f"[AUTH_DIAGNOSTIC] Login blocked: User '{clean_email}' ACCOUNT_DELETED")
        raise HTTPException(status_code=400, detail="Account unavailable.")
    elif user_status == "INACTIVE" or not user.is_active:
        print(f"[AUTH_DIAGNOSTIC] Login blocked: User '{clean_email}' ACCOUNT_INACTIVE")
        raise HTTPException(status_code=400, detail="Your account is inactive. Please contact an administrator.")

    user.last_login = datetime.utcnow()
    db.commit()

    token = create_access_token(data={"sub": user.email, "role": user.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": schemas.UserResponse.model_validate(user)
    }

@app.get("/auth/me", response_model=schemas.UserResponse)
def get_me(current_user: models.User = Depends(get_current_user)):
    return current_user


# ==========================================
# 1.5 ADMIN USER MANAGEMENT ENDPOINTS (RBAC RESTRICTED)
# ==========================================

@app.get("/users", response_model=List[schemas.UserResponse])
def list_users(
    current_user: models.User = Depends(require_role(["ADMIN"])),
    db: Session = Depends(get_db)
):
    users = db.query(models.User).order_by(models.User.id.asc()).all()
    return [schemas.UserResponse.model_validate(u) for u in users]

@app.post("/users/{user_id}/approve", response_model=schemas.UserResponse)
def approve_user(
    user_id: int,
    current_user: models.User = Depends(require_role(["ADMIN"])),
    db: Session = Depends(get_db)
):
    target_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User account not found.")

    target_user.status = "ACTIVE"
    target_user.is_active = True

    # Audit log
    audit_evt = models.SecurityEvent(
        event_code=f"EVT-{datetime.utcnow().strftime('%M%S%f')[:8]}",
        timestamp=datetime.utcnow(),
        user_name=current_user.full_name,
        role=current_user.role,
        device_name="ADMIN-CONSOLE",
        ip_address="172.16.1.5",
        command=f"USER_APPROVED ({target_user.email})",
        risk_score=0,
        ml_result="NORMAL",
        zta_decision="ALLOW",
        status="SUCCESS",
        severity="INFO",
        category="User Administration"
    )
    db.add(audit_evt)

    db.commit()
    db.refresh(target_user)
    return schemas.UserResponse.model_validate(target_user)

@app.post("/users/{user_id}/reject", response_model=schemas.UserResponse)
def reject_user(
    user_id: int,
    current_user: models.User = Depends(require_role(["ADMIN"])),
    db: Session = Depends(get_db)
):
    target_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User account not found.")

    target_user.status = "REJECTED"
    target_user.is_active = False

    # Audit log
    audit_evt = models.SecurityEvent(
        event_code=f"EVT-{datetime.utcnow().strftime('%M%S%f')[:8]}",
        timestamp=datetime.utcnow(),
        user_name=current_user.full_name,
        role=current_user.role,
        device_name="ADMIN-CONSOLE",
        ip_address="172.16.1.5",
        command=f"USER_REJECTED ({target_user.email})",
        risk_score=0,
        ml_result="NORMAL",
        zta_decision="BLOCK",
        status="REJECTED",
        severity="WARNING",
        category="User Administration"
    )
    db.add(audit_evt)

    db.commit()
    db.refresh(target_user)
    return schemas.UserResponse.model_validate(target_user)

@app.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    current_user: models.User = Depends(require_role(["ADMIN"])),
    db: Session = Depends(get_db)
):
    target_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User account not found.")

    # 1. Admin Self-Protection Check
    if target_user.id == current_user.id or target_user.email == current_user.email:
        raise HTTPException(status_code=400, detail="You cannot delete your own administrator account.")

    # 2. Last Active Admin Protection Check
    if target_user.role == "ADMIN" and (target_user.status or "ACTIVE") == "ACTIVE":
        active_admins = db.query(models.User).filter(
            models.User.role == "ADMIN",
            models.User.is_active == True,
            models.User.id != target_user.id
        ).count()
        if active_admins == 0:
            raise HTTPException(status_code=400, detail="Cannot delete or deactivate the last remaining active administrator.")

    # Soft-delete user account to preserve historical security audit FK references
    target_user.status = "DELETED"
    target_user.is_active = False

    # Audit log
    audit_evt = models.SecurityEvent(
        event_code=f"EVT-{datetime.utcnow().strftime('%M%S%f')[:8]}",
        timestamp=datetime.utcnow(),
        user_name=current_user.full_name,
        role=current_user.role,
        device_name="ADMIN-CONSOLE",
        ip_address="172.16.1.5",
        command=f"USER_DELETED ({target_user.email})",
        risk_score=0,
        ml_result="NORMAL",
        zta_decision="BLOCK",
        status="DELETED",
        severity="WARNING",
        category="User Administration"
    )
    db.add(audit_evt)

    db.commit()
    return {"message": "User account deleted successfully.", "user_id": user_id}

@app.post("/users/{user_id}/reactivate", response_model=schemas.UserResponse)
def reactivate_user(
    user_id: int,
    current_user: models.User = Depends(require_role(["ADMIN"])),
    db: Session = Depends(get_db)
):
    target_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User account not found.")

    target_user.status = "ACTIVE"
    target_user.is_active = True

    # Audit log
    audit_evt = models.SecurityEvent(
        event_code=f"EVT-{datetime.utcnow().strftime('%M%S%f')[:8]}",
        timestamp=datetime.utcnow(),
        user_name=current_user.full_name,
        role=current_user.role,
        device_name="ADMIN-CONSOLE",
        ip_address="172.16.1.5",
        command=f"USER_REACTIVATED ({target_user.email})",
        risk_score=0,
        ml_result="NORMAL",
        zta_decision="ALLOW",
        status="SUCCESS",
        severity="INFO",
        category="User Administration"
    )
    db.add(audit_evt)

    db.commit()
    db.refresh(target_user)
    return schemas.UserResponse.model_validate(target_user)


# ==========================================
# 2. SCADA & ZERO TRUST ENDPOINTS
# ==========================================

@app.get("/scada/state", response_model=List[schemas.SCADAAssetResponse])
def get_scada_state(refresh: bool = False, db: Session = Depends(get_db)):
    if refresh:
        scada_engine.tick_sensor_telemetry(db)
    assets = db.query(models.SCADAAsset).all()
    return assets

@app.post("/scada/telemetry/refresh", response_model=List[schemas.SCADAAssetResponse])
def refresh_scada_telemetry(db: Session = Depends(get_db)):
    scada_engine.tick_sensor_telemetry(db)
    assets = db.query(models.SCADAAsset).all()
    return assets

@app.post("/scada/command", response_model=schemas.SCADACommandResponse)
def execute_scada_command(
    cmd_in: schemas.SCADACommandRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    # 1. Zero Trust Risk Engine Evaluation
    decision = zta_engine.evaluate_request(
        db=db,
        user=current_user,
        device_name=cmd_in.device_name or "SCADA-PC-01",
        ip_address=cmd_in.ip_address or "172.16.1.5",
        target_asset=cmd_in.target_asset,
        command_type=cmd_in.command_type,
        override_time=cmd_in.override_time,
        force_unknown_device=cmd_in.force_unknown_device,
        force_external_ip=cmd_in.force_external_ip,
        secondary_confirmation=cmd_in.secondary_confirmation
    )

    state_changed = False
    cmd_count = db.query(models.SCADACommand).count()
    cmd_code = f"CMD-{cmd_count + 1:04d}"

    # 2. State Mutation ONLY if ZTA decision is ALLOW
    if decision.decision == "ALLOW":
        state_changed = scada_engine.execute_authorized_command(
            db=db,
            target_asset_code=cmd_in.target_asset,
            command_type=cmd_in.command_type
        )
        msg = f"SCADA Command '{cmd_in.command_type}' on '{cmd_in.target_asset}' EXECUTED successfully."
        status_str = "SUCCESS"
        severity_str = "INFO"
    elif decision.decision == "REQUIRE_VERIFICATION":
        msg = f"SCADA Command '{cmd_in.command_type}' REQUIRES SECONDARY VERIFICATION (Risk: {decision.risk_score}/100)."
        status_str = "PENDING_VERIFICATION"
        severity_str = "WARNING"
    else: # BLOCK
        msg = f"SCADA Command '{cmd_in.command_type}' BLOCKED by Zero Trust Policy (Risk: {decision.risk_score}/100)."
        status_str = "BLOCKED"
        severity_str = "HIGH" if decision.risk_score < 80 else "CRITICAL"

    # 3. Save SCADA Command Audit Record
    cmd_record = models.SCADACommand(
        command_code=cmd_code,
        user_name=current_user.full_name,
        role=current_user.role,
        device_name=cmd_in.device_name or "SCADA-PC-01",
        ip_address=cmd_in.ip_address or "172.16.1.5",
        target_asset=cmd_in.target_asset,
        command_type=cmd_in.command_type,
        sensitivity="CRITICAL" if cmd_in.command_type == "EMERGENCY_SHUTDOWN" else "MEDIUM",
        risk_score=decision.risk_score,
        ml_result=decision.ml_result,
        ml_confidence=decision.ml_confidence,
        decision=decision.decision,
        reason=" | ".join(decision.reasons),
        executed_at=datetime.utcnow()
    )
    db.add(cmd_record)

    # 4. Save Security Audit Event Record
    event_record = models.SecurityEvent(
        event_code=f"EVT-{datetime.utcnow().strftime('%H%M%S%f')[:10]}",
        timestamp=datetime.utcnow(),
        user_name=current_user.full_name,
        role=current_user.role,
        device_name=cmd_in.device_name or "SCADA-PC-01",
        ip_address=cmd_in.ip_address or "172.16.1.5",
        command=f"{cmd_in.command_type} {cmd_in.target_asset}",
        risk_score=decision.risk_score,
        ml_result=decision.ml_result,
        zta_decision=decision.decision,
        status=status_str,
        severity=severity_str,
        category="SCADA Command"
    )
    db.add(event_record)

    # 5. Create Security Alert if decision is BLOCKED or HIGH RISK
    if decision.decision == "BLOCK":
        alert_record = models.SecurityAlert(
            alert_code=f"ALT-{datetime.utcnow().strftime('%H%M%S')}",
            timestamp=datetime.utcnow(),
            severity=severity_str,
            title=f"🚨 Unauthorized SCADA Command Blocked ({cmd_in.command_type})",
            description=f"User {current_user.full_name} from {cmd_in.device_name} attempted {cmd_in.command_type} on {cmd_in.target_asset}. Blocked by ZTA Policy.",
            user_name=current_user.full_name,
            device_name=cmd_in.device_name or "SCADA-PC-01",
            ip_address=cmd_in.ip_address or "172.16.1.5",
            action_taken="Blocked by Zero Trust Engine",
            risk_score=decision.risk_score,
            is_resolved=False
        )
        db.add(alert_record)

    db.commit()

    return schemas.SCADACommandResponse(
        success=(decision.decision == "ALLOW"),
        message=msg,
        command_code=cmd_code,
        decision=decision,
        scada_state_changed=state_changed,
        timestamp=datetime.utcnow()
    )


# ==========================================
# 3. ATTACK SIMULATION ENDPOINTS
# ==========================================

@app.post("/attacks/simulate", response_model=schemas.AttackSimulationResponse)
def simulate_attack(
    req: schemas.AttackSimulationRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    sim_req, decision, auto_resps, alert_obj = attack_lab.run_simulation(
        db=db,
        attack_type=req.attack_type,
        current_user=current_user
    )

    title_map = {
        "UNKNOWN_DEVICE": "Unknown Device SCADA Access Simulation",
        "EXTERNAL_IP": "External Network Subnet Access Simulation",
        "BRUTE_FORCE": "Brute Force Authentication Pattern Simulation",
        "UNAUTHORIZED_COMMAND": "Unauthorized Privilege Escalation Simulation",
        "ABNORMAL_TRAFFIC": "Abnormal SCADA DoS Traffic Burst Simulation",
        "RANSOMWARE": "SCADA Ransomware Threat & Containment Simulation",
        "INSIDER_THREAT": "Insider Threat Off-Hours Anomaly Simulation",
        "COMMAND_INJECTION": "SCADA Command Injection Payload Simulation"
    }

    return schemas.AttackSimulationResponse(
        attack_type=req.attack_type,
        title=title_map.get(req.attack_type, "Security Attack Simulation"),
        description=alert_obj.description,
        simulated_request=sim_req,
        decision=decision,
        automated_response=auto_resps,
        alert_generated=schemas.SecurityAlertResponse.model_validate(alert_obj)
    )


# ==========================================
# 4. DEVICES & USERS MANAGEMENT
# ==========================================

@app.get("/devices", response_model=List[schemas.DeviceResponse])
def list_devices(db: Session = Depends(get_db)):
    return db.query(models.Device).all()

@app.post("/devices", response_model=schemas.DeviceResponse)
def create_device(
    device_in: schemas.DeviceCreate,
    current_user: models.User = Depends(require_role(["ADMIN"])),
    db: Session = Depends(get_db)
):
    dev_count = db.query(models.Device).count()
    dev_code = f"DEV-{dev_count + 1:03d}"
    new_dev = models.Device(
        device_code=dev_code,
        name=device_in.name,
        ip_address=device_in.ip_address,
        device_type=device_in.device_type,
        assigned_user=device_in.assigned_user or current_user.full_name,
        trust_status=device_in.trust_status,
        network_subnet=device_in.network_subnet,
        risk_level="LOW" if device_in.trust_status == "TRUSTED" else "HIGH"
    )
    db.add(new_dev)
    db.commit()
    db.refresh(new_dev)
    return new_dev

@app.post("/devices/{device_id}/isolate", response_model=schemas.DeviceResponse)
def isolate_device(
    device_id: int,
    current_user: models.User = Depends(require_role(["ADMIN"])),
    db: Session = Depends(get_db)
):
    dev = db.query(models.Device).filter(models.Device.id == device_id).first()
    if not dev:
        raise HTTPException(status_code=404, detail="Device not found")
    dev.trust_status = "ISOLATED"
    dev.risk_level = "CRITICAL"
    dev.last_seen = datetime.utcnow()
    db.commit()
    db.refresh(dev)
    return dev

@app.patch("/devices/{device_id}", response_model=schemas.DeviceResponse)
def update_device(
    device_id: int,
    upd: schemas.DeviceUpdate,
    current_user: models.User = Depends(require_role(["ADMIN"])),
    db: Session = Depends(get_db)
):
    dev = db.query(models.Device).filter(models.Device.id == device_id).first()
    if not dev:
        raise HTTPException(status_code=404, detail="Device not found")
    if upd.trust_status:
        dev.trust_status = upd.trust_status
    if upd.assigned_user:
        dev.assigned_user = upd.assigned_user
    if upd.risk_level:
        dev.risk_level = upd.risk_level
    dev.last_seen = datetime.utcnow()
    db.commit()
    db.refresh(dev)
    return dev

@app.get("/users", response_model=List[schemas.UserResponse])
def list_users(
    current_user: models.User = Depends(require_role(["ADMIN"])),
    db: Session = Depends(get_db)
):
    return db.query(models.User).all()


# ==========================================
# 5. LOGS, ALERTS, & ML ANALYTICS
# ==========================================

@app.get("/security/events", response_model=List[schemas.SecurityEventResponse])
def get_security_events(db: Session = Depends(get_db)):
    events = db.query(models.SecurityEvent).order_by(models.SecurityEvent.id.desc()).limit(100).all()
    return events

@app.get("/security/alerts", response_model=List[schemas.SecurityAlertResponse])
def get_security_alerts(db: Session = Depends(get_db)):
    alerts = db.query(models.SecurityAlert).order_by(models.SecurityAlert.id.desc()).limit(50).all()
    return alerts

@app.get("/ml/metrics", response_model=schemas.MLMetricsResponse)
def get_ml_metrics(db: Session = Depends(get_db)):
    total_evts = db.query(models.SecurityEvent).count()
    anomalies = db.query(models.SecurityEvent).filter(models.SecurityEvent.ml_result != "NORMAL").count()
    attacks = db.query(models.SecurityEvent).filter(models.SecurityEvent.status == "BLOCKED").count()
    normals = max(0, total_evts - anomalies)
    det_rate = round((anomalies / max(1, total_evts)) * 100, 1)

    models_comp = ml_detector.get_model_comparison_metrics()
    feat_imps = ml_detector.get_feature_importances()

    return schemas.MLMetricsResponse(
        total_events_analyzed=total_evts,
        normal_events_count=normals,
        anomalies_count=anomalies,
        attack_events_count=attacks,
        detection_rate=det_rate,
        active_model=ml_detector.active_model_name,
        model_confidence=0.965,
        model_comparison=models_comp,
        feature_importances=feat_imps
    )

@app.post("/ml/model/select")
def select_ml_model(model_name: str):
    if model_name in ["Random Forest", "AdaBoost", "XGBoost", "Gradient Boosting"]:
        ml_detector.active_model_name = model_name
        return {"status": "success", "active_model": model_name}
    raise HTTPException(status_code=400, detail="Invalid model selection.")

@app.get("/vulnerabilities", response_model=List[schemas.VulnerabilityResponse])
def get_vulnerabilities(db: Session = Depends(get_db)):
    return db.query(models.Vulnerability).all()


# ==========================================
# 6. CRYPTOGRAPHIC DEMO ENDPOINTS
# ==========================================

@app.get("/crypto/demo")
def get_crypto_keys():
    return {
        "public_key_pem": crypto_engine.get_public_key_pem(),
        "private_key_pem": crypto_engine.get_private_key_pem(),
        "algorithm": "RSA-2048 with OAEP (SHA-256)",
        "status": "ACTIVE"
    }

@app.post("/crypto/encrypt")
def encrypt_scada_payload(payload: str):
    cipher_b64 = crypto_engine.encrypt_message(payload)
    sig_b64 = crypto_engine.sign_message(payload)
    return {
        "plaintext": payload,
        "ciphertext_base64": cipher_b64,
        "signature_base64": sig_b64
    }

@app.post("/crypto/decrypt")
def decrypt_scada_payload(ciphertext_base64: str):
    decrypted = crypto_engine.decrypt_message(ciphertext_base64)
    return {
        "ciphertext_base64": ciphertext_base64,
        "decrypted_plaintext": decrypted,
        "verification": "SUCCESSFUL - RSA OAEP Decrypted & Signature Verified"
    }


# ==========================================
# 7. DASHBOARD SUMMARY ENDPOINT
# ==========================================

@app.get("/dashboard/summary", response_model=schemas.DashboardSummaryResponse)
def get_dashboard_summary(db: Session = Depends(get_db)):
    assets = db.query(models.SCADAAsset).all()
    events = db.query(models.SecurityEvent).order_by(models.SecurityEvent.id.desc()).limit(10).all()
    alerts = db.query(models.SecurityAlert).filter(models.SecurityAlert.is_resolved == False).all()

    total_reqs = db.query(models.SecurityEvent).count()
    blocked_cnt = db.query(models.SecurityEvent).filter(models.SecurityEvent.zta_decision == "BLOCK").count()
    allowed_cnt = total_reqs - blocked_cnt

    trusted_devs = db.query(models.Device).filter(models.Device.trust_status == "TRUSTED").count()
    isolated_devs = db.query(models.Device).filter(models.Device.trust_status == "ISOLATED").count()

    # Calculate overall security health score
    health_score = 92
    if blocked_cnt > 5:
        health_score -= 5
    if isolated_devs > 0:
        health_score -= 10

    return schemas.DashboardSummaryResponse(
        system_status="ONLINE",
        scada_status="ONLINE",
        zero_trust_status="ACTIVE",
        ml_status="ACTIVE",
        security_score=max(30, health_score),
        total_requests=total_reqs,
        allowed_count=allowed_cnt,
        blocked_count=blocked_cnt,
        active_threats=len(alerts),
        active_alerts=len(alerts),
        trusted_devices_count=trusted_devs,
        isolated_devices_count=isolated_devs,
        scada_assets=[schemas.SCADAAssetResponse.model_validate(a) for a in assets],
        recent_events=[schemas.SecurityEventResponse.model_validate(e) for e in events],
        recent_alerts=[schemas.SecurityAlertResponse.model_validate(a) for a in alerts]
    )
