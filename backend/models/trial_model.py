"""
Pydantic models for trial monitoring and forecasting (Part 2)
Defines data structures for enrollment tracking, forecasts, and alerts
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from datetime import datetime
from enum import Enum


class AlertSeverity(str, Enum):
    """Alert severity levels"""
    INFO = "info"
    WARNING = "warning"
    CRITICAL = "critical"


class InterventionType(str, Enum):
    """Types of site interventions"""
    ADD_BUDGET = "add_recruitment_budget"
    REPLACE_SITE = "replace_site"
    EXTEND_DURATION = "extend_trial_duration"
    INCREASE_SITE_SUPPORT = "increase_site_support"


class WeeklyEnrollment(BaseModel):
    """Weekly enrollment data for a site"""
    week: int
    week_ending_date: str
    site_id: str
    patients_screened: int
    patients_enrolled: int
    screen_fail_reasons: str


class SiteEnrollmentStatus(BaseModel):
    """Current enrollment status for a site"""
    site_id: str
    site_name: str
    city: str
    state: str
    
    # Cumulative metrics
    total_enrolled: int
    total_screened: int
    weeks_active: int
    
    # Performance metrics
    current_enrollment_rate: float  # actual vs target
    weekly_average: float
    trend: str  # 'improving', 'stable', 'declining', 'flatlined'
    
    # Target tracking
    target_enrollment: int
    percent_to_target: float
    projected_final_enrollment: int
    
    # Flags
    is_underperforming: bool
    weeks_since_last_enrollment: int


class ForecastDataPoint(BaseModel):
    """Single data point in probabilistic forecast"""
    week: int
    date: str
    
    # Actual data (if available)
    actual_enrollment: Optional[int] = None
    
    # Forecast percentiles
    p10: float  # 10th percentile (pessimistic)
    p50: float  # 50th percentile (median)
    p90: float  # 90th percentile (optimistic)


class EnrollmentForecast(BaseModel):
    """Complete probabilistic enrollment forecast"""
    trial_id: str
    forecast_date: datetime
    weeks_elapsed: int
    total_weeks: int
    
    # Current status
    current_total_enrolled: int
    target_total_enrollment: int
    
    # Forecast data
    forecast_curve: List[ForecastDataPoint]
    
    # Projections
    projected_completion_date: str
    probability_of_meeting_target: float
    expected_final_enrollment: int
    
    # Confidence intervals
    best_case_enrollment: int  # P90
    worst_case_enrollment: int  # P10


class SiteAlert(BaseModel):
    """Alert for underperforming or problematic site"""
    alert_id: str
    site_id: str
    site_name: str
    severity: AlertSeverity
    
    # Alert details
    alert_type: str  # 'flatlined', 'underperforming', 'high_screen_fail', etc.
    message: str
    details: str
    
    # Metrics
    weeks_since_last_enrollment: Optional[int] = None
    current_enrollment: int
    target_enrollment: int
    shortfall_percent: float
    
    # Recommendations
    recommended_actions: List[str]
    estimated_impact: Optional[str] = None
    
    created_at: datetime


class WhatIfScenario(BaseModel):
    """What-if scenario input"""
    scenario_id: str
    intervention_type: InterventionType
    
    # Intervention details
    target_site_id: str
    
    # Intervention parameters
    budget_amount: Optional[int] = None  # For ADD_BUDGET
    replacement_site_id: Optional[str] = None  # For REPLACE_SITE
    extension_weeks: Optional[int] = None  # For EXTEND_DURATION
    support_level: Optional[str] = None  # For INCREASE_SITE_SUPPORT


class WhatIfResult(BaseModel):
    """Result of what-if scenario analysis"""
    scenario_id: str
    intervention_type: InterventionType
    intervention_description: str
    
    # Original forecast (baseline)
    baseline_projected_enrollment: int
    baseline_probability_meeting_target: float
    
    # Scenario forecast
    scenario_projected_enrollment: int
    scenario_probability_meeting_target: float
    
    # Impact
    enrollment_improvement: int
    probability_improvement: float
    
    # Cost-benefit
    estimated_cost: int
    patients_per_dollar: float
    roi_assessment: str  # 'excellent', 'good', 'poor'
    
    # Updated forecast curve
    scenario_forecast_curve: List[ForecastDataPoint]
    
    # Recommendation
    recommendation: str


class TrialMonitoringResult(BaseModel):
    """Complete result from Part 2: Trial Monitoring"""
    monitor_id: str
    trial_id: str
    
    # Site statuses
    site_statuses: List[SiteEnrollmentStatus]
    
    # Forecast
    enrollment_forecast: EnrollmentForecast
    
    # Alerts
    alerts: List[SiteAlert]
    
    # Summary
    total_enrolled: int
    total_screened: int
    on_track_sites: int
    at_risk_sites: int
    critical_sites: int
    
    # Timestamp
    analysis_timestamp: datetime