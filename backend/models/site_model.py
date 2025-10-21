"""
Pydantic models for clinical trial site selection
Defines data structures for sites, recommendations, and analysis results
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from datetime import datetime


class Site(BaseModel):
    """Individual clinical trial site"""
    site_id: str
    site_name: str
    city: str
    state: str
    site_type: str  # 'academic' or 'community'
    therapeutic_areas: str
    pi_name: str
    pi_experience_years: int
    beds: int


class HistoricalPerformance(BaseModel):
    """Historical performance metrics for a site"""
    site_id: str
    trials_completed: int
    avg_enrollment_rate: float
    avg_screen_fail_rate: float
    avg_dropout_rate: float
    data_quality_score: float
    avg_days_to_first_patient: int
    protocol_deviations_per_trial: float


class PatientDensity(BaseModel):
    """Patient availability and geographic data"""
    site_id: str
    eligible_patients_30mi: int
    competing_trials_same_indication: int
    median_household_income: int
    travel_burden_score: float
    accessibility_index: float


class SiteScore(BaseModel):
    """Composite score for a site with breakdown"""
    site_id: str
    composite_score: float
    performance_score: float  # 40% weight
    patient_access_score: float  # 30% weight
    data_quality_score: float  # 20% weight
    logistics_score: float  # 10% weight
    
    # Metadata for reasoning
    strengths: List[str] = Field(default_factory=list)
    concerns: List[str] = Field(default_factory=list)


class SiteRecommendation(BaseModel):
    """Recommended site with full details and reasoning"""
    rank: int
    site_id: str
    site_name: str
    city: str
    state: str
    composite_score: float
    
    # Key metrics (for table display)
    historical_enrollment_rate: float
    eligible_patients: int
    competing_trials: int
    data_quality_score: float
    
    # Detailed reasoning
    reasoning: str
    strengths: List[str]
    concerns: List[str]
    
    # Supporting data
    performance: HistoricalPerformance
    patient_data: PatientDensity
    
    # Classification
    site_classification: str  # 'hidden_gem', 'safe_choice', 'risky', 'avoid'


class SiteAnalysisResult(BaseModel):
    """Complete result from Part 1: Site Selection"""
    analysis_id: str
    top_recommendations: List[SiteRecommendation]
    total_sites_analyzed: int
    sites_filtered_out: int
    filter_reasons: Dict[str, int]  # reason -> count
    analysis_timestamp: datetime
    trial_params: Dict[str, any]


class TrialParameters(BaseModel):
    """Input parameters for trial"""
    phase: str = "Phase III"
    indication: str = "Oncology"
    target_enrollment: int = 200
    duration_months: int = 18
    target_sites: int = 10