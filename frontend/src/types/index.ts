export type UserRole = 'ADMIN' | 'ENGINEER' | 'OPERATOR';

export interface User {
  id: number;
  user_code: string;
  full_name: string;
  email: string;
  organization: string;
  role: UserRole;
  status?: string;
  is_active: boolean;
  risk_score: number;
  created_at: string;
  last_login?: string;
}

export interface Device {
  id: number;
  device_code: string;
  name: string;
  ip_address: string;
  device_type: string;
  assigned_user?: string;
  trust_status: 'TRUSTED' | 'UNTRUSTED' | 'ISOLATED';
  network_subnet: string;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  last_seen: string;
}

export interface SCADAAsset {
  id: number;
  asset_code: string;
  name: string;
  asset_type: 'PUMP' | 'VALVE' | 'TANK' | 'SENSOR';
  status: 'RUNNING' | 'STOPPED' | 'STANDBY' | 'OPEN' | 'CLOSED' | 'FAULT';
  value: number;
  unit: string;
  min_val: number;
  max_val: number;
  risk_score: number;
  last_updated: string;
}

export interface TrustFactors {
  identity_verified: boolean;
  role_authorized: boolean;
  device_trusted: boolean;
  ip_internal: boolean;
  time_normal: boolean;
  location_expected: boolean;
  command_allowed: boolean;
  ml_behavior_normal: boolean;
}

export interface RiskScoreBreakdown {
  identity_risk: number;
  device_risk: number;
  ip_risk: number;
  time_risk: number;
  role_risk: number;
  command_sensitivity_risk: number;
  behavior_anomaly_risk: number;
  total_score: number;
  risk_category: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface ZeroTrustDecision {
  decision: 'ALLOW' | 'BLOCK' | 'REQUIRE_VERIFICATION';
  risk_score: number;
  risk_category: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  factors: TrustFactors;
  risk_breakdown: RiskScoreBreakdown;
  ml_result: string;
  ml_confidence: number;
  reasons: string[];
  requires_mfa: boolean;
}

export interface SCADACommandResponse {
  success: boolean;
  message: string;
  command_code: string;
  decision: ZeroTrustDecision;
  scada_state_changed: boolean;
  timestamp: string;
}

export interface SecurityEvent {
  id: number;
  event_code: string;
  timestamp: string;
  user_name: string;
  role: string;
  device_name: string;
  ip_address: string;
  command: string;
  risk_score: number;
  ml_result: string;
  zta_decision: 'ALLOW' | 'BLOCK' | 'REQUIRE_VERIFICATION';
  status: string;
  severity: 'INFO' | 'WARNING' | 'HIGH' | 'CRITICAL';
  category: string;
}

export interface SecurityAlert {
  id: number;
  alert_code: string;
  timestamp: string;
  severity: 'INFO' | 'WARNING' | 'HIGH' | 'CRITICAL';
  title: string;
  description: string;
  user_name: string;
  device_name: string;
  ip_address: string;
  action_taken: string;
  risk_score: number;
  is_resolved: boolean;
}

export interface AttackSimulationResponse {
  attack_type: string;
  title: string;
  description: string;
  simulated_request: {
    user: string;
    device: string;
    ip: string;
    command: string;
    timestamp: string;
  };
  decision: ZeroTrustDecision;
  automated_response: string[];
  alert_generated: SecurityAlert;
}

export interface MLMetrics {
  total_events_analyzed: number;
  normal_events_count: number;
  anomalies_count: number;
  attack_events_count: number;
  detection_rate: number;
  active_model: string;
  model_confidence: number;
  model_comparison: Array<{
    model_name: string;
    accuracy: number;
    precision: number;
    recall: number;
    f1_score: number;
    latency_ms: number;
    is_active: boolean;
  }>;
  feature_importances: Array<{
    feature: string;
    importance: number;
  }>;
}

export interface Vulnerability {
  id: number;
  cve_id: string;
  title: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  cvss_score: number;
  affected_component: string;
  status: string;
  recommendation: string;
  publish_date: string;
}

export interface DashboardSummary {
  system_status: string;
  scada_status: string;
  zero_trust_status: string;
  ml_status: string;
  security_score: number;
  total_requests: number;
  allowed_count: number;
  blocked_count: number;
  active_threats: number;
  active_alerts: number;
  trusted_devices_count: number;
  isolated_devices_count: number;
  scada_assets: SCADAAsset[];
  recent_events: SecurityEvent[];
  recent_alerts: SecurityAlert[];
}
