"""
CrewAI Tools for Clinical Trial Site Selection
Provides tools for agents to read data, calculate scores, and run simulations
"""

from crewai.tools import BaseTool
from typing import Type, Union, Dict, Any
from pydantic import BaseModel, Field
import pandas as pd
import numpy as np
from scipy import stats
import json
import os


# ============================================================================
# PART 1 TOOLS: Site Selection (SIMPLIFIED)
# ============================================================================

class AnalyzeAndRankSitesInput(BaseModel):
    """Input schema for AnalyzeAndRankSitesTool - no parameters needed"""
    pass


class AnalyzeAndRankSitesTool(BaseTool):
    name: str = "Analyze And Rank Sites"
    description: str = "Analyzes ALL 500 sites internally and returns ONLY the top 10 ranked sites with scores. LLM doesn't see raw data."
    args_schema: Type[BaseModel] = AnalyzeAndRankSitesInput
    
    def _run(self) -> str:
        try:
            # Load all data (tool does this, not LLM)
            sites_df = pd.read_csv('data/sites_and_investigators.csv')
            perf_df = pd.read_csv('data/historical_performance.csv')
            density_df = pd.read_csv('data/patient_density.csv')
            
            # Merge everything
            merged = sites_df.merge(perf_df, on='site_id').merge(density_df, on='site_id')
            
            # Filter: quality >= 0.65
            merged = merged[merged['data_quality_score'] >= 0.65]
            
            # Calculate composite scores for ALL qualified sites
            scores = []
            for _, row in merged.iterrows():
                perf_score = (row['avg_enrollment_rate'] * 0.6 + (1 - row['avg_screen_fail_rate']) * 0.4)
                access_score = ((row['eligible_patients_30mi'] / 1000) * 0.6 + 
                               (1 - min(row['competing_trials_same_indication'] / 10, 1.0)) * 0.4)
                quality_score = row['data_quality_score']
                logistics_score = ((1 - min(row['avg_days_to_first_patient'] / 90, 1.0)) * 0.6 +
                                  (1 - min(row['protocol_deviations_per_trial'] / 10, 1.0)) * 0.4)
                
                composite = (perf_score * 0.40 + access_score * 0.30 + 
                            quality_score * 0.20 + logistics_score * 0.10)
                
                scores.append({
                    'site_id': row['site_id'],
                    'site_name': row['site_name'],
                    'city': row['city'],
                    'state': row['state'],
                    'composite_score': round(composite, 3),
                    'enrollment_rate': round(row['avg_enrollment_rate'], 3),
                    'eligible_patients': int(row['eligible_patients_30mi']),
                    'competing_trials': int(row['competing_trials_same_indication']),
                    'data_quality': round(row['data_quality_score'], 3)
                })
            
            # Sort and return ONLY top 10
            scores.sort(key=lambda x: x['composite_score'], reverse=True)
            top_10 = scores[:10]
            
            result = {
                'message': f'Analyzed {len(merged)} qualified sites (out of 500 total)',
                'top_10_sites': top_10
            }
            
            return json.dumps(result, indent=2)
        except Exception as e:
            return f"Error analyzing sites: {str(e)}"


# ============================================================================
# PART 2 TOOLS: Trial Monitoring
# ============================================================================

class ReadEnrollmentFeedInput(BaseModel):
    """Input schema for reading enrollment feed"""
    site_ids: str = Field(
        default="",
        description="Optional: Comma-separated site IDs to filter (empty = all sites)"
    )


class ReadEnrollmentFeedTool(BaseTool):
    name: str = "Read Weekly Enrollment Feed"
    description: str = "Reads weekly_enrollment_feed.csv with actual enrollment data from the ongoing trial."
    args_schema: Type[BaseModel] = ReadEnrollmentFeedInput
    
    def _run(self, site_ids: str = "") -> str:
        try:
            df = pd.read_csv('data/weekly_enrollment_feed.csv')
            
            if site_ids:
                site_id_list = [s.strip() for s in site_ids.split(',')]
                df = df[df['site_id'].isin(site_id_list)]
            
            # Calculate summary by site
            site_summary = df.groupby('site_id').agg({
                'patients_screened': 'sum',
                'patients_enrolled': 'sum',
                'week': 'max'
            }).reset_index()
            
            site_summary.columns = ['site_id', 'total_screened', 'total_enrolled', 'weeks_active']
            
            # Detect flatlined sites (0 enrollments in last 3 weeks)
            latest_week = df['week'].max()
            recent_df = df[df['week'] > latest_week - 3]
            recent_enrollments = recent_df.groupby('site_id')['patients_enrolled'].sum()
            
            flatlined_sites = recent_enrollments[recent_enrollments == 0].index.tolist()
            
            # Return ONLY summary, not all weekly data
            result = {
                'total_weeks': int(df['week'].max()),
                'site_summary': site_summary.to_dict('records'),
                'flatlined_sites': flatlined_sites
            }
            
            return json.dumps(result, indent=2)
        except Exception as e:
            return f"Error reading enrollment feed: {str(e)}"


class DetectAnomaliesInput(BaseModel):
    """Input schema for anomaly detection"""
    enrollment_data_json: Union[str, Dict[str, Any]] = Field(
        description="JSON string OR dict from ReadEnrollmentFeedTool"
    )


class DetectAnomaliesToolSchema(BaseTool):
    name: str = "Detect Enrollment Anomalies"
    description: str = "Analyzes enrollment data to detect underperforming sites, flatlined enrollment, and other issues."
    args_schema: Type[BaseModel] = DetectAnomaliesInput
    
    def _run(self, enrollment_data_json: Union[str, Dict]) -> str:
        try:
            # Handle both string and dict input
            if isinstance(enrollment_data_json, str):
                data = json.loads(enrollment_data_json)
            else:
                data = enrollment_data_json
            site_summary = data['site_summary']
            
            anomalies = []
            
            for site in site_summary:
                site_id = site['site_id']
                enrolled = site['total_enrolled']
                weeks = site['weeks_active']
                
                # Expected enrollment (rough target: 2-3 per week)
                expected = weeks * 2.5
                
                # Flatlined (in the flatlined_sites list)
                if site_id in data.get('flatlined_sites', []):
                    anomalies.append({
                        'site_id': site_id,
                        'anomaly_type': 'flatlined',
                        'severity': 'critical',
                        'message': f"Site has reported 0 enrollments in the past 3 weeks",
                        'enrolled': enrolled,
                        'expected': int(expected)
                    })
                
                # Underperforming (< 50% of expected)
                elif enrolled < expected * 0.5:
                    shortfall = int(expected - enrolled)
                    anomalies.append({
                        'site_id': site_id,
                        'anomaly_type': 'underperforming',
                        'severity': 'warning',
                        'message': f"Site enrolled {enrolled} patients vs expected {int(expected)} ({shortfall} shortfall)",
                        'enrolled': enrolled,
                        'expected': int(expected)
                    })
            
            result = {
                'total_anomalies': len(anomalies),
                'critical_count': len([a for a in anomalies if a['severity'] == 'critical']),
                'warning_count': len([a for a in anomalies if a['severity'] == 'warning']),
                'anomalies': anomalies
            }
            
            return json.dumps(result, indent=2)
        except Exception as e:
            return f"Error detecting anomalies: {str(e)}"


class MonteCarloSimulationInput(BaseModel):
    """Input schema for Monte Carlo simulation"""
    enrollment_data_json: Union[str, Dict[str, Any]] = Field(
        description="JSON string OR dict from ReadEnrollmentFeedTool with historical data"
    )
    weeks_remaining: int = Field(
        default=39,
        description="Number of weeks remaining in the trial"
    )


class MonteCarloSimulationTool(BaseTool):
    name: str = "Run Monte Carlo Enrollment Forecast"
    description: str = "Runs Monte Carlo simulation to generate probabilistic enrollment forecasts (P10, P50, P90) based on actual site performance."
    args_schema: Type[BaseModel] = MonteCarloSimulationInput
    
    def _run(self, enrollment_data_json: str, weeks_remaining: int = 39) -> str:
        try:
            # Handle both string and dict input
            if isinstance(enrollment_data_json, str):
                data = json.loads(enrollment_data_json)
            else:
                data = enrollment_data_json
            
            # Get total enrolled from site summaries
            site_summary = data['site_summary']
            current_total = sum(s['total_enrolled'] for s in site_summary)
            
            # Calculate average weekly rate per site
            site_rates = {s['site_id']: s['total_enrolled'] / s['weeks_active'] for s in site_summary}
            
            # Monte Carlo simulation (simplified)
            n_simulations = 500  # Reduced from 1000
            simulations = []
            
            for sim in range(n_simulations):
                cumulative = 0
                for week in range(weeks_remaining):
                    week_enrollment = 0
                    for site_id, avg_rate in site_rates.items():
                        rate_with_noise = max(0, avg_rate + np.random.normal(0, 0.3))
                        week_enrollment += np.random.poisson(rate_with_noise)
                    cumulative += week_enrollment
                simulations.append(cumulative)
            
            simulations = np.array(simulations)
            
            # Calculate final projections only (not weekly)
            p10_final = int(current_total + np.percentile(simulations, 10))
            p50_final = int(current_total + np.percentile(simulations, 50))
            p90_final = int(current_total + np.percentile(simulations, 90))
            
            # Probability of meeting target
            prob_meeting_target = (simulations + current_total >= 200).sum() / n_simulations
            
            result = {
                'current_enrolled': int(current_total),
                'weeks_elapsed': 13,
                'weeks_remaining': weeks_remaining,
                'projected_final_enrollment': p50_final,
                'best_case': p90_final,
                'worst_case': p10_final,
                'probability_meeting_target': round(prob_meeting_target, 3)
            }
            
            return json.dumps(result, indent=2)
        except Exception as e:
            return f"Error running simulation: {str(e)}"


class CalculateROIInput(BaseModel):
    """Input schema for ROI calculation"""
    site_id: str = Field(description="Site ID for intervention")
    intervention_type: str = Field(description="Type: 'add_budget', 'replace_site', 'extend_duration'")
    intervention_amount: int = Field(description="Budget in dollars or extension in weeks")


class CalculateROITool(BaseTool):
    name: str = "Calculate Intervention ROI"
    description: str = "Calculates return on investment for site interventions (budget, replacement, extension)."
    args_schema: Type[BaseModel] = CalculateROIInput
    
    def _run(self, site_id: str, intervention_type: str, intervention_amount: int) -> str:
        try:
            # Simplified ROI model
            if intervention_type == 'add_budget':
                # Assume $50K budget yields 10-15 additional patients
                additional_patients = np.random.randint(10, 16)
                cost = intervention_amount
                patients_per_dollar = additional_patients / cost
                roi = 'good' if patients_per_dollar > 0.0002 else 'poor'
                
            elif intervention_type == 'replace_site':
                # Replacing costs ~$100K but could yield 20-30 patients
                additional_patients = np.random.randint(20, 31)
                cost = 100000
                patients_per_dollar = additional_patients / cost
                roi = 'excellent' if patients_per_dollar > 0.0002 else 'good'
                
            elif intervention_type == 'extend_duration':
                # Extension costs time but minimal budget
                additional_patients = intervention_amount * 2  # 2 patients per week
                cost = intervention_amount * 5000  # $5K per week overhead
                patients_per_dollar = additional_patients / cost
                roi = 'good'
            
            else:
                return json.dumps({'error': 'Unknown intervention type'})
            
            result = {
                'site_id': site_id,
                'intervention_type': intervention_type,
                'estimated_cost': cost,
                'additional_patients': additional_patients,
                'patients_per_dollar': round(patients_per_dollar, 6),
                'roi_assessment': roi,
                'recommendation': f"This intervention would yield approximately {additional_patients} additional patients at ${cost:,} cost."
            }
            
            return json.dumps(result, indent=2)
        except Exception as e:
            return f"Error calculating ROI: {str(e)}"