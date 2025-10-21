"""
Status tracking models for investigation workflows
Defines data structures for tracking agent and task status
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum


class StatusEnum(str, Enum):
    """Status enumeration for agents and investigations"""
    PENDING = "pending"
    RUNNING = "running"
    COMPLETE = "complete"
    ERROR = "error"


class TaskInfo(BaseModel):
    """Information about a completed task"""
    name: str
    output: str
    completed_at: Optional[datetime] = None


class AgentStatus(BaseModel):
    """Status of an individual agent"""
    agent_id: str
    agent_name: str
    status: StatusEnum
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    tasks: List[Dict[str, Any]] = Field(default_factory=list)
    error: Optional[str] = None


class InvestigationStatus(BaseModel):
    """Overall status of an investigation (site analysis or trial monitoring)"""
    investigation_id: str
    status: StatusEnum
    started_at: datetime
    completed_at: Optional[datetime] = None
    agents: List[AgentStatus]
    final_report: Optional[str] = None
    error: Optional[str] = None
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None
        }