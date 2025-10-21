"""
Orchestration Service for Clinical Trial Site Selection
Manages workflow state and coordinates crew execution
"""

import uuid
import threading
from datetime import datetime
from typing import Dict, Optional
from models.status_model import StatusEnum, InvestigationStatus, AgentStatus
from agents.crew_setup import (
    create_site_selection_crew,
    create_trial_monitoring_crew,
    get_agent_display_names
)


class ClinicalTrialOrchestrator:
    """
    Orchestrates clinical trial site selection and monitoring workflows
    Manages state for both Part 1 (Site Selection) and Part 2 (Trial Monitoring)
    """
    
    def __init__(self):
        # Part 1: Site Selection analyses
        self.site_analyses: Dict[str, InvestigationStatus] = {}
        
        # Part 2: Trial monitoring sessions
        self.trial_monitors: Dict[str, InvestigationStatus] = {}
        
        # Trial ID mapping (links Part 1 to Part 2)
        self.trial_ids: Dict[str, str] = {}  # analysis_id -> trial_id
        
        self.agent_display_names = get_agent_display_names()
    
    # ========================================================================
    # PART 1: SITE SELECTION
    # ========================================================================
    
    def start_site_analysis(self, trial_params: Dict) -> str:
        """
        Start Part 1: Site Selection analysis
        
        Args:
            trial_params: Trial parameters (phase, indication, target_enrollment, etc.)
            
        Returns:
            analysis_id: Unique identifier for this analysis
        """
        analysis_id = str(uuid.uuid4())
        trial_id = str(uuid.uuid4())  # Also generate trial_id for Part 2
        
        # Store trial_id mapping
        self.trial_ids[analysis_id] = trial_id
        
        # Initialize status with 1 agent (simplified)
        investigation = InvestigationStatus(
            investigation_id=analysis_id,
            status=StatusEnum.RUNNING,
            started_at=datetime.now(),
            agents=[
                AgentStatus(
                    agent_id='strategist',
                    agent_name=self.agent_display_names['strategist'],
                    status=StatusEnum.RUNNING,  # Start as running immediately
                    tasks=[]
                )
            ]
        )
        
        self.site_analyses[analysis_id] = investigation
        
        # Run crew in background thread
        def run_analysis():
            try:
                # Mark first agent as running
                self._update_agent_status(analysis_id, 'performance_analyst', StatusEnum.RUNNING)
                
                # Create and execute crew
                crew = create_site_selection_crew(
                    analysis_id=analysis_id,
                    update_callback=self._update_site_analysis_status
                )
                
                result = crew.kickoff(inputs=trial_params)
                
                # Store results
                self.site_analyses[analysis_id].final_report = str(result)
                self.site_analyses[analysis_id].status = StatusEnum.COMPLETE
                self.site_analyses[analysis_id].completed_at = datetime.now()
                
                print(f"✅ Site analysis {analysis_id} completed successfully")
                
            except Exception as e:
                print(f"❌ Error in site analysis {analysis_id}: {str(e)}")
                self.site_analyses[analysis_id].status = StatusEnum.ERROR
                self.site_analyses[analysis_id].error = str(e)
        
        thread = threading.Thread(target=run_analysis, daemon=True)
        thread.start()
        
        return analysis_id
    
    def _update_site_analysis_status(self, analysis_id: str, agent_id: str, 
                                     status: str, data: Dict):
        """
        Callback function called by crew when tasks complete
        Updates agent status in the investigation
        """
        if analysis_id not in self.site_analyses:
            return
        
        investigation = self.site_analyses[analysis_id]
        
        # Find and update the agent
        for agent in investigation.agents:
            if agent.agent_id == agent_id:
                agent.status = StatusEnum.COMPLETE
                agent.completed_at = datetime.now()
                
                # Add task info
                if 'task_description' in data:
                    agent.tasks.append({
                        'name': data['task_description'],
                        'output': data.get('output_preview', '')
                    })
                
                # Mark next agent as running (if not last)
                agent_ids = ['performance_analyst', 'patient_analyst', 'strategist']
                current_idx = agent_ids.index(agent_id)
                if current_idx < len(agent_ids) - 1:
                    next_agent_id = agent_ids[current_idx + 1]
                    self._update_agent_status(analysis_id, next_agent_id, StatusEnum.RUNNING)
                
                break
    
    def get_site_analysis_status(self, analysis_id: str) -> Optional[InvestigationStatus]:
        """Get current status of site analysis"""
        return self.site_analyses.get(analysis_id)
    
    def get_trial_id_from_analysis(self, analysis_id: str) -> Optional[str]:
        """Get the trial_id associated with an analysis (for Part 2)"""
        return self.trial_ids.get(analysis_id)
    
    # ========================================================================
    # PART 2: TRIAL MONITORING
    # ========================================================================
    
    def start_trial_monitoring(self, trial_id: str) -> str:
        """
        Start Part 2: Trial Monitoring
        
        Args:
            trial_id: Trial ID from Part 1 analysis
            
        Returns:
            monitor_id: Unique identifier for this monitoring session
        """
        monitor_id = str(uuid.uuid4())
        
        # Initialize status with 3 agents (pending)
        investigation = InvestigationStatus(
            investigation_id=monitor_id,
            status=StatusEnum.RUNNING,
            started_at=datetime.now(),
            agents=[
                AgentStatus(
                    agent_id='enrollment_monitor',
                    agent_name=self.agent_display_names['enrollment_monitor'],
                    status=StatusEnum.PENDING,
                    tasks=[]
                ),
                AgentStatus(
                    agent_id='forecaster',
                    agent_name=self.agent_display_names['forecaster'],
                    status=StatusEnum.PENDING,
                    tasks=[]
                ),
                AgentStatus(
                    agent_id='advisor',
                    agent_name=self.agent_display_names['advisor'],
                    status=StatusEnum.PENDING,
                    tasks=[]
                )
            ]
        )
        
        self.trial_monitors[monitor_id] = investigation
        
        # Run crew in background thread
        def run_monitoring():
            try:
                # Mark first agent as running
                self._update_agent_status(monitor_id, 'enrollment_monitor', StatusEnum.RUNNING)
                
                # Create and execute crew
                crew = create_trial_monitoring_crew(
                    monitor_id=monitor_id,
                    update_callback=self._update_trial_monitoring_status
                )
                
                result = crew.kickoff(inputs={'trial_id': trial_id})
                
                # Store results
                self.trial_monitors[monitor_id].final_report = str(result)
                self.trial_monitors[monitor_id].status = StatusEnum.COMPLETE
                self.trial_monitors[monitor_id].completed_at = datetime.now()
                
                print(f"✅ Trial monitoring {monitor_id} completed successfully")
                
            except Exception as e:
                print(f"❌ Error in trial monitoring {monitor_id}: {str(e)}")
                self.trial_monitors[monitor_id].status = StatusEnum.ERROR
                self.trial_monitors[monitor_id].error = str(e)
        
        thread = threading.Thread(target=run_monitoring, daemon=True)
        thread.start()
        
        return monitor_id
    
    def _update_trial_monitoring_status(self, monitor_id: str, agent_id: str,
                                        status: str, data: Dict):
        """
        Callback function called by crew when tasks complete
        Updates agent status in the monitoring session
        """
        if monitor_id not in self.trial_monitors:
            return
        
        investigation = self.trial_monitors[monitor_id]
        
        # Find and update the agent
        for agent in investigation.agents:
            if agent.agent_id == agent_id:
                agent.status = StatusEnum.COMPLETE
                agent.completed_at = datetime.now()
                
                # Add task info
                if 'task_description' in data:
                    agent.tasks.append({
                        'name': data['task_description'],
                        'output': data.get('output_preview', '')
                    })
                
                # Mark next agent as running (if not last)
                agent_ids = ['enrollment_monitor', 'forecaster', 'advisor']
                current_idx = agent_ids.index(agent_id)
                if current_idx < len(agent_ids) - 1:
                    next_agent_id = agent_ids[current_idx + 1]
                    self._update_agent_status(monitor_id, next_agent_id, StatusEnum.RUNNING)
                
                break
    
    def get_trial_monitoring_status(self, monitor_id: str) -> Optional[InvestigationStatus]:
        """Get current status of trial monitoring"""
        return self.trial_monitors.get(monitor_id)
    
    # ========================================================================
    # UTILITY METHODS
    # ========================================================================
    
    def _update_agent_status(self, investigation_id: str, agent_id: str, 
                            new_status: StatusEnum):
        """Helper to update agent status directly"""
        # Check both site analyses and trial monitors
        investigation = (self.site_analyses.get(investigation_id) or 
                        self.trial_monitors.get(investigation_id))
        
        if investigation:
            for agent in investigation.agents:
                if agent.agent_id == agent_id:
                    agent.status = new_status
                    if new_status == StatusEnum.RUNNING:
                        agent.started_at = datetime.now()
                    break
    
    def reset(self):
        """Clear all state (useful for testing)"""
        self.site_analyses.clear()
        self.trial_monitors.clear()
        self.trial_ids.clear()


# Global orchestrator instance
orchestrator = ClinicalTrialOrchestrator()