"""
Crew Setup for Clinical Trial Site Selection
Creates and configures CrewAI crews with task_callback integration
"""

from crewai import Crew, Process
from typing import Callable

# ============================================================================
# TASK-TO-AGENT MAPPING
# ============================================================================

# Part 1: Site Selection (simplified to 1 agent)
SITE_SELECTION_TASK_AGENT_MAP = {
    'Use AnalyzeAndRankSitesTool': 'strategist'
}

# Part 2: Trial Monitoring
TRIAL_MONITORING_TASK_AGENT_MAP = {
    'Read weekly enrollment feed': 'enrollment_monitor',
    'Use MonteCarloSimulationTool': 'forecaster',
    'Review alerts and forecast': 'advisor'
}


# ============================================================================
# PART 1: SITE SELECTION CREW (SIMPLIFIED)
# ============================================================================

def create_site_selection_crew(analysis_id: str, update_callback: Callable) -> Crew:
    """
    Creates the Site Selection Crew (Part 1) with task callback integration
    SIMPLIFIED: 1 agent, 1 task, tool does all the work
    """
    
    # Initialize tools - just need the one that does everything
    from agents.tools import AnalyzeAndRankSitesTool
    from agents.agent_definitions import create_site_selection_strategist_simple
    
    part1_tools = [AnalyzeAndRankSitesTool()]
    
    # Create single agent
    strategist = create_site_selection_strategist_simple(part1_tools)
    
    # Create single task directly here
    from crewai import Task
    task = Task(
        description="""Use AnalyzeAndRankSitesTool to get the top 10 sites. 
        Then provide a 1-2 sentence explanation for each site's ranking. 
        Highlight Site-047 (Omaha) if it's in the top 10.""",
        agent=strategist,
        expected_output="Top 10 sites with brief explanations (max 2 sentences each)",
        tools=part1_tools
    )
    
    # Create callback handler
    def task_callback(task_output):
        """Called by CrewAI when task completes"""
        try:
            if update_callback:
                update_callback(
                    analysis_id=analysis_id,
                    agent_id='strategist',
                    status='completed',
                    data={
                        'task_description': 'Site analysis complete',
                        'output_preview': str(task_output.raw)[:500]
                    }
                )
        except Exception as e:
            print(f"Error in task_callback: {str(e)}")
    
    # Create crew with task_callback
    crew = Crew(
        agents=[strategist],
        tasks=[task],
        process=Process.sequential,
        verbose=True,
        task_callback=task_callback
    )
    
    return crew


# ============================================================================
# PART 2: TRIAL MONITORING CREW
# ============================================================================

def create_trial_monitoring_crew(monitor_id: str, update_callback: Callable) -> Crew:
    """
    Creates the Trial Monitoring Crew (Part 2) with task callback integration
    """
    
    # Initialize tools
    from agents.tools import (
        ReadEnrollmentFeedTool,
        DetectAnomaliesToolSchema,
        MonteCarloSimulationTool
    )
    part2_tools = [
        ReadEnrollmentFeedTool(),
        DetectAnomaliesToolSchema(),
        MonteCarloSimulationTool()
    ]
    
    # Create agents
    from agents.agent_definitions import (
        create_enrollment_monitor,
        create_predictive_forecaster,
        create_strategic_advisor,
        create_monitor_enrollment_task,
        create_forecast_enrollment_task,
        create_generate_recommendations_task
    )
    
    enrollment_monitor = create_enrollment_monitor(part2_tools)
    forecaster = create_predictive_forecaster(part2_tools)
    advisor = create_strategic_advisor(part2_tools)
    
    # Create tasks with context dependencies
    task4 = create_monitor_enrollment_task(enrollment_monitor, part2_tools)
    task5 = create_forecast_enrollment_task(forecaster, part2_tools, context=[task4])
    task6 = create_generate_recommendations_task(advisor, part2_tools, context=[task4, task5])
    
    # Create callback handler
    def task_callback(task_output):
        """Called by CrewAI when each task completes"""
        try:
            task_desc = str(task_output.description)[:50]
            task_result = str(task_output.raw)[:500] if task_output.raw else ""
            
            # Map task to agent ID
            agent_id = None
            for key, value in TRIAL_MONITORING_TASK_AGENT_MAP.items():
                if key.lower() in task_desc.lower():
                    agent_id = value
                    break
            
            if agent_id and update_callback:
                update_callback(
                    monitor_id=monitor_id,
                    agent_id=agent_id,
                    status='completed',
                    data={
                        'task_description': task_desc,
                        'output_preview': task_result
                    }
                )
        except Exception as e:
            print(f"Error in task_callback: {str(e)}")
    
    # Create crew with task_callback
    crew = Crew(
        agents=[enrollment_monitor, forecaster, advisor],
        tasks=[task4, task5, task6],
        process=Process.sequential,
        verbose=True,
        task_callback=task_callback
    )
    
    return crew


# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def get_site_selection_agent_ids():
    """Returns list of agent IDs for Part 1 (for frontend initialization)"""
    return ['strategist']  # Simplified to 1 agent


def get_trial_monitoring_agent_ids():
    """Returns list of agent IDs for Part 2 (for frontend initialization)"""
    return list(TRIAL_MONITORING_TASK_AGENT_MAP.values())


def get_agent_display_names():
    """Returns human-readable names for all agents"""
    return {
        # Part 1 (simplified)
        'strategist': 'Site Selection Strategist',
        # Part 2
        'enrollment_monitor': 'Enrollment Monitor',
        'forecaster': 'Predictive Forecaster',
        'advisor': 'Strategic Advisor'
    }