/**
 * TypeScript types for clinical trial domain models
 * Mirrors backend site_model.py and trial_model.py
 */

// ============================================================================
// PART 1: SITE SELECTION TYPES
// ============================================================================

export interface TrialParameters {
  phase: string;
  indication: string;
  target_enrollment: number;
  duration_months: number;
  target_sites: number;
}

export interface Site {
  site_id: string;
  site_name: string;
  city: string;
  state: string;
  site_type: 'academic' | 'community';
  therapeutic_areas: string;
  pi_name: string;
  pi_experience_years: number;
  beds: number;
}

export interface HistoricalPerformance {
  site_id: string;
  trials_completed: number;
  avg_enrollment_rate: number;
  avg_screen_fail_rate: number;
  avg_dropout_rate: number;
  data_quality_score: number;
  avg_days_to_first_patient: number;
  protocol_deviations_per_trial: number;
}

export interface PatientDensity {
  site_id: string;
  eligible_patients_30mi: number;
  competing_trials_same_indication: number;
  median_household_income: number;
  travel_burden_score: number;
  accessibility_index: number;
}

export interface SiteScore {
  site_id: string;
  composite_score: number;
  performance_score: number;
  access_score: number;
  quality_score: number;
  logistics_score: number;
  strengths: string[];
  concerns: string[];
}

export interface SiteRecommendation {
  rank: number;
  site_id: string;
  site_name: string;
  city: string;
  state: string;
  composite_score: number;
  historical_enrollment_rate: number;
  eligible_patients: number;
  competing_trials: number;
  data_quality_score: number;
  reasoning: string;
  strengths: string[];
  concerns: string[];
  site_classification: 'hidden_gem' | 'safe_choice' | 'acceptable' | 'risky';
}

export interface SiteAnalysisResult {
  analysis_id: string;
  trial_id: string;
  top_recommendations: SiteRecommendation[];
  total_sites_analyzed: number;
  sites_filtered_out: number;
  analysis_timestamp: string;
  trial_params: TrialParameters;
}

// ============================================================================
// PART 2: TRIAL MONITORING TYPES
// ============================================================================

export interface WeeklyEnrollment {
  week: number;
  week_ending_date: string;
  site_id: string;
  patients_screened: number;
  patients_enrolled: number;
  screen_fail_reasons: string;
}

export interface SiteEnrollmentStatus {
  site_id: string;
  site_name: string;
  city: string;
  state: string;
  total_enrolled: number;
  total_screened: number;
  weeks_active: number;
  current_enrollment_rate: number;
  weekly_average: number;
  trend: 'improving' | 'stable' | 'declining' | 'flatlined';
  target_enrollment: number;
  percent_to_target: number;
  projected_final_enrollment: number;
  is_underperforming: boolean;
  weeks_since_last_enrollment: number;
}

export interface ForecastDataPoint {
  week: number;
  date: string;
  actual_enrollment?: number;
  p10: number; // 10th percentile (pessimistic)
  p50: number; // 50th percentile (median)
  p90: number; // 90th percentile (optimistic)
}

export interface EnrollmentForecast {
  trial_id: string;
  forecast_date: string;
  weeks_elapsed: number;
  total_weeks: number;
  current_total_enrolled: number;
  target_total_enrollment: number;
  forecast_curve: ForecastDataPoint[];
  projected_completion_date: string;
  probability_of_meeting_target: number;
  expected_final_enrollment: number;
  best_case_enrollment: number;
  worst_case_enrollment: number;
}

export type AlertSeverity = 'info' | 'warning' | 'critical';

export interface SiteAlert {
  alert_id: string;
  site_id: string;
  site_name: string;
  severity: AlertSeverity;
  alert_type: string;
  message: string;
  details: string;
  weeks_since_last_enrollment?: number;
  current_enrollment: number;
  target_enrollment: number;
  shortfall_percent: number;
  recommended_actions: string[];
  estimated_impact?: string;
  created_at: string;
}

export type InterventionType = 
  | 'add_recruitment_budget'
  | 'replace_site'
  | 'extend_trial_duration'
  | 'increase_site_support';

export interface WhatIfScenario {
  scenario_id: string;
  intervention_type: InterventionType;
  target_site_id: string;
  budget_amount?: number;
  replacement_site_id?: string;
  extension_weeks?: number;
  support_level?: string;
}

export interface WhatIfResult {
  scenario_id: string;
  intervention_type: InterventionType;
  intervention_description: string;
  baseline_projected_enrollment: number;
  baseline_probability_meeting_target: number;
  scenario_projected_enrollment: number;
  scenario_probability_meeting_target: number;
  enrollment_improvement: number;
  probability_improvement: number;
  estimated_cost: number;
  patients_per_dollar: number;
  roi_assessment: 'excellent' | 'good' | 'poor';
  scenario_forecast_curve?: ForecastDataPoint[];
  recommendation: string;
}

export interface TrialMonitoringResult {
  monitor_id: string;
  trial_id: string;
  site_statuses: SiteEnrollmentStatus[];
  enrollment_forecast: EnrollmentForecast;
  alerts: SiteAlert[];
  total_enrolled: number;
  total_screened: number;
  on_track_sites: number;
  at_risk_sites: number;
  critical_sites: number;
  analysis_timestamp: string;
}