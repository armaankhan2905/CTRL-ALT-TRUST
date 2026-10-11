from datetime import datetime
from typing import Dict, Any, List, Tuple
from sqlalchemy.orm import Session
from models import User, Device, ZeroTrustPolicy
from ml_engine import ml_detector
from schemas import ZeroTrustDecision, TrustFactors, RiskScoreBreakdown

class ZeroTrustRiskEngine:
    def __init__(self):
        self.critical_risk_threshold = 60 # Anything >= 61 is blocked
        self.working_hours_start = 8 # 08:00 AM
        self.working_hours_end = 18  # 06:00 PM

    def evaluate_request(
        self,
        db: Session,
        user: User,
        device_name: str,
        ip_address: str,
        target_asset: str,
        command_type: str,
        override_time: str = None,
        force_unknown_device: bool = False,
        force_external_ip: bool = False,
        secondary_confirmation: bool = False,
        request_rate: float = 2.0 # commands per minute
    ) -> ZeroTrustDecision:
        reasons = []

        # 1. Identity Risk (0 - 20)
        identity_risk = 0
        if not user or not user.is_active:
            identity_risk = 20
            reasons.append("Unauthenticated or disabled user account.")
        else:
            reasons.append(f"Identity verified: {user.full_name} ({user.user_code}).")

        # 2. Role Risk (0 - 15)
        role_risk = 0
        user_role = user.role if user else "UNKNOWN"

        # Check command sensitivity
        command_sensitivity = "LOW"
        sensitivity_code = 1
        if command_type in ["EMERGENCY_SHUTDOWN", "CHANGE_CONFIG"]:
            command_sensitivity = "CRITICAL"
            sensitivity_code = 4
        elif command_type in ["STOP", "STOP_PUMP"]:
            command_sensitivity = "HIGH"
            sensitivity_code = 3
        elif command_type in ["START", "START_PUMP", "OPEN", "CLOSE"]:
            command_sensitivity = "MEDIUM"
            sensitivity_code = 2

        # Role permissions check
        if command_sensitivity in ["HIGH", "CRITICAL"] and user_role == "OPERATOR":
            if command_sensitivity == "CRITICAL":
                role_risk = 15
                reasons.append("Operator role lacks permission for critical SCADA override.")
            else:
                role_risk = 5
                reasons.append("Operator role attempting high-sensitivity command.")
        elif user_role == "ENGINEER" and command_sensitivity == "CRITICAL":
            role_risk = 5
        else:
            reasons.append(f"Role '{user_role}' authorized for {command_sensitivity} command.")

        # 3. Device Risk (0 - 15)
        device_risk = 0
        device_trusted = True
        device_status = "TRUSTED"
        device_trust_score = 95.0

        if force_unknown_device or device_name.upper().startswith("UNKNOWN"):
            device_risk = 15
            device_trusted = False
            device_status = "UNTRUSTED"
            device_trust_score = 10.0
            reasons.append("Untrusted / unregistered device detected.")
        else:
            dev = db.query(Device).filter(Device.name == device_name).first()
            if dev:
                device_status = dev.trust_status
                if dev.trust_status == "ISOLATED":
                    device_risk = 15
                    device_trusted = False
                    device_trust_score = 0.0
                    reasons.append("Device is currently ISOLATED due to previous threat detection.")
                elif dev.trust_status == "UNTRUSTED":
                    device_risk = 15
                    device_trusted = False
                    device_trust_score = 25.0
                    reasons.append("Device trust status is revoked.")
                else:
                    reasons.append(f"Device '{dev.name}' verified as TRUSTED.")
            else:
                device_risk = 15
                device_trusted = False
                device_status = "UNTRUSTED"
                device_trust_score = 15.0
                reasons.append(f"Device '{device_name}' not found in registry.")

        # 4. IP / Network Subnet Risk (0 - 15)
        ip_risk = 0
        is_internal_ip = True

        if force_external_ip or not (ip_address.startswith("172.16.") or ip_address.startswith("192.168.1.") or ip_address == "127.0.0.1"):
            ip_risk = 15
            is_internal_ip = False
            reasons.append(f"External/untrusted IP subnet detected: {ip_address}.")
        else:
            reasons.append(f"Internal SCADA IP address verified: {ip_address}.")

        # 5. Time Window Risk (0 - 10)
        time_risk = 0
        is_normal_time = True
        current_hour = datetime.now().hour

        if override_time:
            if "02:" in override_time or "03:" in override_time or "PM" in override_time and "11:" in override_time:
                current_hour = 2 # 02:00 AM off-hours simulation

        if current_hour < self.working_hours_start or current_hour >= self.working_hours_end:
            time_risk = 10
            is_normal_time = False
            reasons.append(f"Command issued outside normal operational window ({current_hour:02d}:00 hours).")
        else:
            reasons.append(f"Command issued within normal operational hours ({current_hour:02d}:00).")

        # 6. Command Sensitivity Risk (0 - 10)
        sensitivity_risk = 0
        if command_sensitivity == "CRITICAL":
            sensitivity_risk = 10
        elif command_sensitivity == "HIGH":
            sensitivity_risk = 7
        elif command_sensitivity == "MEDIUM":
            sensitivity_risk = 3

        # 7. ML Behavior Anomaly Risk (0 - 15)
        ml_class, ml_conf, attack_prob = ml_detector.predict_request_anomaly(
            request_frequency=request_rate,
            command_frequency=request_rate,
            device_trust_score=device_trust_score,
            is_internal_ip=is_internal_ip,
            hour_of_day=float(current_hour),
            command_sensitivity_code=sensitivity_code
        )

        behavior_risk = int(attack_prob * 15)
        if ml_class != "NORMAL":
            reasons.append(f"ML Anomaly Engine detected suspicious behavior ({ml_class}, attack prob: {attack_prob*100:.1f}%).")
        else:
            reasons.append("ML Behavior Classifier: Request pattern evaluates as NORMAL.")

        # Total Composite Risk Score (0 - 100)
        total_risk = identity_risk + role_risk + device_risk + ip_risk + time_risk + sensitivity_risk + behavior_risk
        total_risk = max(0, min(100, total_risk))

        # Risk Classification
        if total_risk <= 30:
            risk_cat = "LOW"
        elif total_risk <= 60:
            risk_cat = "MEDIUM"
        elif total_risk <= 80:
            risk_cat = "HIGH"
        else:
            risk_cat = "CRITICAL"

        # Final Zero Trust Decision
        if total_risk > self.critical_risk_threshold:
            decision = "BLOCK"
            reasons.append(f"Access BLOCKED: Total Risk Score {total_risk}/100 exceeds safety threshold ({self.critical_risk_threshold}).")
        elif total_risk > 30 and not secondary_confirmation:
            decision = "REQUIRE_VERIFICATION"
            reasons.append("Medium risk level: Secondary verification / confirmation required.")
        else:
            decision = "ALLOW"
            reasons.append("All Zero Trust policy requirements satisfied. Access GRANTED.")

        factors = TrustFactors(
            identity_verified=(identity_risk == 0),
            role_authorized=(role_risk < 10),
            device_trusted=device_trusted and (device_status == "TRUSTED"),
            ip_internal=is_internal_ip,
            time_normal=is_normal_time,
            location_expected=is_internal_ip,
            command_allowed=(role_risk < 10),
            ml_behavior_normal=(ml_class == "NORMAL")
        )

        breakdown = RiskScoreBreakdown(
            identity_risk=identity_risk,
            device_risk=device_risk,
            ip_risk=ip_risk,
            time_risk=time_risk,
            role_risk=role_risk,
            command_sensitivity_risk=sensitivity_risk,
            behavior_anomaly_risk=behavior_risk,
            total_score=total_risk,
            risk_category=risk_cat
        )

        return ZeroTrustDecision(
            decision=decision,
            risk_score=total_risk,
            risk_category=risk_cat,
            factors=factors,
            risk_breakdown=breakdown,
            ml_result=ml_class,
            ml_confidence=ml_conf,
            reasons=reasons,
            requires_mfa=(decision == "REQUIRE_VERIFICATION")
        )

zta_engine = ZeroTrustRiskEngine()
