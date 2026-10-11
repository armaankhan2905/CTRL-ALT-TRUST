from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

# --- Auth Schemas ---
class UserLogin(BaseModel):
    email: str
    password: str

class UserSignup(BaseModel):
    full_name: str
    email: str
    password: str
    organization: Optional[str] = "Water Operations Command"
    role: str = "OPERATOR" # OPERATOR or ENGINEER (Admin restricted)

class UserResponse(BaseModel):
    id: int
    user_code: str
    full_name: str
    email: str
    organization: str
    role: str
    status: str = "ACTIVE"
    is_active: bool
    risk_score: int
    created_at: datetime
    last_login: Optional[datetime] = None

    class Config:
        from_attributes = True

class UserSignupResponse(BaseModel):
    message: str
    status: str
    user: UserResponse

class UserStatusUpdate(BaseModel):
    status: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None

# --- Device Schemas ---
class DeviceCreate(BaseModel):
    name: str
    device_type: str = "HMI Workstation"
    ip_address: str = "172.16.1.5"
    assigned_user: Optional[str] = None
    network_subnet: str = "Internal SCADA (172.16.1.x)"
    trust_status: str = "TRUSTED"

class DeviceUpdate(BaseModel):
    trust_status: Optional[str] = None # TRUSTED, UNTRUSTED, ISOLATED
    assigned_user: Optional[str] = None
    risk_level: Optional[str] = None

class DeviceResponse(BaseModel):
    id: int
    device_code: str
    name: str
    ip_address: str
    device_type: str
    assigned_user: Optional[str]
    trust_status: str
    network_subnet: str
    risk_level: str
    last_seen: datetime

    class Config:
        from_attributes = True

# --- SCADA & Zero Trust Schemas ---
class SCADAAssetResponse(BaseModel):
    id: int
    asset_code: str
    name: str
    asset_type: str
    status: str
    value: float
    unit: str
    min_val: float
    max_val: float
    risk_score: int
    last_updated: datetime

    class Config:
        from_attributes = True

class SCADACommandRequest(BaseModel):
    target_asset: str # PUMP-01, PUMP-02, VALVE-01, VALVE-02, PLANT_EMERGENCY
    command_type: str # START, STOP, OPEN, CLOSE, EMERGENCY_SHUTDOWN
    device_name: Optional[str] = "SCADA-PC-01"
    ip_address: Optional[str] = "172.16.1.5"
    override_time: Optional[str] = None # Custom timestamp for time-window testing e.g. "02:37 AM"
    force_unknown_device: Optional[bool] = False
    force_external_ip: Optional[bool] = False
    secondary_confirmation: Optional[bool] = False

class TrustFactors(BaseModel):
    identity_verified: bool
    role_authorized: bool
    device_trusted: bool
    ip_internal: bool
    time_normal: bool
    location_expected: bool
    command_allowed: bool
    ml_behavior_normal: bool

class RiskScoreBreakdown(BaseModel):
    identity_risk: int
    device_risk: int
    ip_risk: int
    time_risk: int
    role_risk: int
    command_sensitivity_risk: int
    behavior_anomaly_risk: int
    total_score: int
    risk_category: str # LOW, MEDIUM, HIGH, CRITICAL

class ZeroTrustDecision(BaseModel):
    decision: str # ALLOW, BLOCK, REQUIRE_VERIFICATION
    risk_score: int
    risk_category: str
    factors: TrustFactors
    risk_breakdown: RiskScoreBreakdown
    ml_result: str
    ml_confidence: float
    reasons: List[str]
    requires_mfa: bool = False

class SCADACommandResponse(BaseModel):
    success: bool
    message: str
    command_code: str
    decision: ZeroTrustDecision
    scada_state_changed: bool
    timestamp: datetime

# --- Security Events & Alerts ---
class SecurityEventResponse(BaseModel):
    id: int
    event_code: str
    timestamp: datetime
    user_name: str
    role: str
    device_name: str
    ip_address: str
    command: str
    risk_score: int
    ml_result: str
    zta_decision: str
    status: str
    severity: str
    category: str

    class Config:
        from_attributes = True

class SecurityAlertResponse(BaseModel):
    id: int
    alert_code: str
    timestamp: datetime
    severity: str
    title: str
    description: str
    user_name: str
    device_name: str
    ip_address: str
    action_taken: str
    risk_score: int
    is_resolved: bool

    class Config:
        from_attributes = True

# --- Attack Simulation ---
class AttackSimulationRequest(BaseModel):
    attack_type: str # UNKNOWN_DEVICE, EXTERNAL_IP, BRUTE_FORCE, UNAUTHORIZED_COMMAND, ABNORMAL_TRAFFIC, RANSOMWARE, INSIDER_THREAT, COMMAND_INJECTION
    target_asset: Optional[str] = "PUMP-01"

class AttackSimulationResponse(BaseModel):
    attack_type: str
    title: str
    description: str
    simulated_request: Dict[str, Any]
    decision: ZeroTrustDecision
    automated_response: List[str]
    alert_generated: SecurityAlertResponse

# --- ML Analytics & Vulnerability ---
class MLMetricsResponse(BaseModel):
    total_events_analyzed: int
    normal_events_count: int
    anomalies_count: int
    attack_events_count: int
    detection_rate: float
    active_model: str
    model_confidence: float
    model_comparison: List[Dict[str, Any]]
    feature_importances: List[Dict[str, Any]]

class VulnerabilityResponse(BaseModel):
    id: int
    cve_id: str
    title: str
    description: str
    severity: str
    cvss_score: float
    affected_component: str
    status: str
    recommendation: str
    publish_date: str

    class Config:
        from_attributes = True

class DashboardSummaryResponse(BaseModel):
    system_status: str
    scada_status: str
    zero_trust_status: str
    ml_status: str
    security_score: int
    total_requests: int
    allowed_count: int
    blocked_count: int
    active_threats: int
    active_alerts: int
    trusted_devices_count: int
    isolated_devices_count: int
    scada_assets: List[SCADAAssetResponse]
    recent_events: List[SecurityEventResponse]
    recent_alerts: List[SecurityAlertResponse]
