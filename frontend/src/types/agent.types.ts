/**
 * TypeScript types for agent status tracking
 * Mirrors backend status_model.py Pydantic models
 */

export enum StatusEnum {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETE = 'complete',
  ERROR = 'error'
}

export interface TaskInfo {
  name: string;
  output: string;
  completed_at?: string;
}

export interface AgentStatus {
  agent_id: string;
  agent_name: string;
  status: StatusEnum;
  started_at?: string;
  completed_at?: string;
  tasks: Array<{
    name: string;
    output: string;
  }>;
  error?: string;
}

export interface InvestigationStatus {
  investigation_id: string;
  status: StatusEnum;
  started_at: string;
  completed_at?: string;
  agents: AgentStatus[];
  final_report?: string;
  error?: string;
}

// Agent configuration for UI display
export interface AgentConfig {
  id: string;
  name: string;
  icon: string; // lucide-react icon name
  color: string; // tailwind color class
  description: string;
}

// Part 1: Site Selection Agent Configs
export const SITE_SELECTION_AGENTS: AgentConfig[] = [
  {
    id: 'performance_analyst',
    name: 'Site Performance Analyst',
    icon: 'BarChart3',
    color: 'blue',
    description: 'Analyzing historical site performance data'
  },
  {
    id: 'patient_analyst',
    name: 'Patient Availability Analyst',
    icon: 'Users',
    color: 'green',
    description: 'Assessing patient density and competition'
  },
  {
    id: 'strategist',
    name: 'Site Selection Strategist',
    icon: 'Target',
    color: 'purple',
    description: 'Generating final site recommendations'
  }
];

// Part 2: Trial Monitoring Agent Configs
export const TRIAL_MONITORING_AGENTS: AgentConfig[] = [
  {
    id: 'enrollment_monitor',
    name: 'Enrollment Monitor',
    icon: 'Activity',
    color: 'orange',
    description: 'Tracking real-time enrollment data'
  },
  {
    id: 'forecaster',
    name: 'Predictive Forecaster',
    icon: 'TrendingUp',
    color: 'cyan',
    description: 'Generating probabilistic forecasts'
  },
  {
    id: 'advisor',
    name: 'Strategic Advisor',
    icon: 'Lightbulb',
    color: 'amber',
    description: 'Recommending interventions and what-if scenarios'
  }
];