"""
Flask API for Clinical Trial Site Selection Demo
Provides REST endpoints for site selection and trial monitoring
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import os
from dotenv import load_dotenv
import uuid

from services.orchestration_service import orchestrator
from services.data_generator import ClinicalTrialDataGenerator

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for frontend

# ============================================================================
# STARTUP: GENERATE DATA
# ============================================================================

@app.before_request
def initialize_data():
    """Generate synthetic data on first request if not exists"""
    if not os.path.exists('data/sites_and_investigators.csv'):
        print("🔧 Generating synthetic data on first request...")
        generator = ClinicalTrialDataGenerator()
        generator.generate_all()
        print("✅ Data generation complete")


# ============================================================================
# HEALTH CHECK
# ============================================================================

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'service': 'Clinical Trial Site Selection API'
    })


# ============================================================================
# PART 1: SITE SELECTION ENDPOINTS
# ============================================================================

@app.route('/api/site-analysis/start', methods=['POST'])
def start_site_analysis():
    """
    Start Part 1: Site Selection Analysis
    
    Request body:
    {
        "phase": "Phase III",
        "indication": "Oncology",
        "target_enrollment": 200,
        "duration_months": 18
    }
    
    Returns:
    {
        "analysis_id": "uuid",
        "trial_id": "uuid",
        "status": "running",
        "message": "Site analysis started"
    }
    """
    try:
        data = request.get_json() or {}
        
        # Default trial parameters
        trial_params = {
            'phase': data.get('phase', 'Phase III'),
            'indication': data.get('indication', 'Oncology'),
            'target_enrollment': data.get('target_enrollment', 200),
            'duration_months': data.get('duration_months', 18),
            'target_sites': data.get('target_sites', 10)
        }
        
        # Start analysis
        analysis_id = orchestrator.start_site_analysis(trial_params)
        trial_id = orchestrator.get_trial_id_from_analysis(analysis_id)
        
        return jsonify({
            'analysis_id': analysis_id,
            'trial_id': trial_id,
            'status': 'running',
            'message': 'Site analysis started successfully',
            'trial_params': trial_params
        }), 201
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'message': 'Failed to start site analysis'
        }), 500


@app.route('/api/site-analysis/<analysis_id>/status', methods=['GET'])
def get_site_analysis_status(analysis_id: str):
    """
    Get status of ongoing site analysis
    
    Returns:
    {
        "investigation_id": "uuid",
        "status": "running|complete|error",
        "agents": [...],
        "started_at": "timestamp",
        "completed_at": "timestamp",
        "final_report": "..."
    }
    """
    try:
        status = orchestrator.get_site_analysis_status(analysis_id)
        
        if not status:
            return jsonify({
                'error': 'Analysis not found',
                'analysis_id': analysis_id
            }), 404
        
        # Convert to dict for JSON serialization
        return jsonify(status.model_dump()), 200
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'message': 'Failed to get analysis status'
        }), 500


@app.route('/api/site-analysis/<analysis_id>/results', methods=['GET'])
def get_site_analysis_results(analysis_id: str):
    """
    Get final results from completed site analysis
    
    Returns:
    {
        "analysis_id": "uuid",
        "trial_id": "uuid",
        "status": "complete",
        "recommendations": [...],
        "final_report": "..."
    }
    """
    try:
        status = orchestrator.get_site_analysis_status(analysis_id)
        
        if not status:
            return jsonify({
                'error': 'Analysis not found',
                'analysis_id': analysis_id
            }), 404
        
        if status.status != 'complete':
            return jsonify({
                'error': 'Analysis not yet complete',
                'current_status': status.status
            }), 400
        
        trial_id = orchestrator.get_trial_id_from_analysis(analysis_id)
        
        return jsonify({
            'analysis_id': analysis_id,
            'trial_id': trial_id,
            'status': status.status,
            'final_report': status.final_report,
            'completed_at': status.completed_at.isoformat() if status.completed_at else None
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'message': 'Failed to get analysis results'
        }), 500


# ============================================================================
# PART 2: TRIAL MONITORING ENDPOINTS
# ============================================================================

@app.route('/api/trial-monitoring/start', methods=['POST'])
def start_trial_monitoring():
    """
    Start Part 2: Trial Monitoring
    
    Request body:
    {
        "trial_id": "uuid"
    }
    
    Returns:
    {
        "monitor_id": "uuid",
        "trial_id": "uuid",
        "status": "running",
        "message": "Trial monitoring started"
    }
    """
    try:
        data = request.get_json()
        
        if not data or 'trial_id' not in data:
            return jsonify({
                'error': 'trial_id is required',
                'message': 'Please provide a trial_id from Part 1 analysis'
            }), 400
        
        trial_id = data['trial_id']
        
        # Start monitoring
        monitor_id = orchestrator.start_trial_monitoring(trial_id)
        
        return jsonify({
            'monitor_id': monitor_id,
            'trial_id': trial_id,
            'status': 'running',
            'message': 'Trial monitoring started successfully'
        }), 201
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'message': 'Failed to start trial monitoring'
        }), 500


@app.route('/api/trial-monitoring/<monitor_id>/status', methods=['GET'])
def get_trial_monitoring_status(monitor_id: str):
    """
    Get status of ongoing trial monitoring
    
    Returns:
    {
        "investigation_id": "uuid",
        "status": "running|complete|error",
        "agents": [...],
        "started_at": "timestamp",
        "completed_at": "timestamp",
        "final_report": "..."
    }
    """
    try:
        status = orchestrator.get_trial_monitoring_status(monitor_id)
        
        if not status:
            return jsonify({
                'error': 'Monitoring session not found',
                'monitor_id': monitor_id
            }), 404
        
        # Convert to dict for JSON serialization
        return jsonify(status.model_dump()), 200
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'message': 'Failed to get monitoring status'
        }), 500


@app.route('/api/trial-monitoring/<monitor_id>/forecast', methods=['GET'])
def get_trial_monitoring_forecast(monitor_id: str):
    """
    Get forecast data from completed trial monitoring
    
    Returns:
    {
        "monitor_id": "uuid",
        "status": "complete",
        "forecast_data": {...},
        "alerts": [...],
        "final_report": "..."
    }
    """
    try:
        status = orchestrator.get_trial_monitoring_status(monitor_id)
        
        if not status:
            return jsonify({
                'error': 'Monitoring session not found',
                'monitor_id': monitor_id
            }), 404
        
        if status.status != 'complete':
            return jsonify({
                'error': 'Monitoring not yet complete',
                'current_status': status.status
            }), 400
        
        return jsonify({
            'monitor_id': monitor_id,
            'status': status.status,
            'final_report': status.final_report,
            'completed_at': status.completed_at.isoformat() if status.completed_at else None
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'message': 'Failed to get forecast data'
        }), 500


@app.route('/api/trial-monitoring/what-if', methods=['POST'])
def run_what_if_scenario():
    """
    Run a what-if scenario analysis
    
    Request body:
    {
        "monitor_id": "uuid",
        "intervention_type": "add_budget|replace_site|extend_duration|increase_support",
        "target_site_id": "Site-022",
        "budget_amount": 50000,
        "replacement_site_id": "Site-047",
        "extension_weeks": 8,
        "support_level": "high"
    }
    
    Returns:
    {
        "scenario_id": "uuid",
        "intervention_description": "...",
        "projected_impact": {...},
        "recommendation": "..."
    }
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data or 'intervention_type' not in data or 'target_site_id' not in data:
            return jsonify({
                'error': 'intervention_type and target_site_id are required'
            }), 400
        
        # For demo, return mock what-if results
        # In production, this would trigger another agent workflow
        scenario_id = str(uuid.uuid4())
        
        intervention_type = data['intervention_type']
        target_site = data['target_site_id']
        
        # Mock response based on intervention type
        if intervention_type == 'add_budget':
            budget = data.get('budget_amount', 50000)
            result = {
                'scenario_id': scenario_id,
                'intervention_type': intervention_type,
                'intervention_description': f"Add ${budget:,} recruitment budget to {target_site}",
                'baseline_projected_enrollment': 165,
                'scenario_projected_enrollment': 178,
                'enrollment_improvement': 13,
                'probability_improvement': 0.15,
                'estimated_cost': budget,
                'patients_per_dollar': round(13 / budget, 6),
                'roi_assessment': 'good',
                'recommendation': f"Adding ${budget:,} to {target_site} could yield ~13 additional patients. However, redirecting this budget to Site-047 (Omaha) may yield 2.3x more patients per dollar."
            }
        else:
            result = {
                'scenario_id': scenario_id,
                'intervention_type': intervention_type,
                'intervention_description': f"Apply {intervention_type} to {target_site}",
                'recommendation': "Scenario analysis in progress..."
            }
        
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'message': 'Failed to run what-if scenario'
        }), 500


# ============================================================================
# UTILITY ENDPOINTS
# ============================================================================

@app.route('/api/data/generate', methods=['POST'])
def regenerate_data():
    """
    Regenerate synthetic CSV data (development only)
    """
    try:
        generator = ClinicalTrialDataGenerator()
        generator.generate_all()
        
        return jsonify({
            'message': 'Data regenerated successfully',
            'timestamp': datetime.now().isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'message': 'Failed to regenerate data'
        }), 500


@app.route('/api/reset', methods=['POST'])
def reset_state():
    """
    Reset orchestrator state (development only)
    """
    try:
        orchestrator.reset()
        
        return jsonify({
            'message': 'State reset successfully',
            'timestamp': datetime.now().isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'message': 'Failed to reset state'
        }), 500


# ============================================================================
# ERROR HANDLERS
# ============================================================================

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'error': 'Not found',
        'message': 'The requested resource was not found'
    }), 404


@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        'error': 'Internal server error',
        'message': 'An unexpected error occurred'
    }), 500


# ============================================================================
# MAIN
# ============================================================================

if __name__ == '__main__':
    # Check for API key
    if not os.getenv('ANTHROPIC_API_KEY'):
        print("⚠️  Warning: ANTHROPIC_API_KEY not found in environment")
        print("   Please set it in .env file or export it")
    
    print("\n🚀 Clinical Trial Site Selection API")
    print("=" * 50)
    print("📍 Server: http://localhost:5000")
    print("🏥 Health: http://localhost:5000/api/health")
    print("=" * 50)
    print("\n✨ Ready to analyze sites!\n")
    
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=True
    )