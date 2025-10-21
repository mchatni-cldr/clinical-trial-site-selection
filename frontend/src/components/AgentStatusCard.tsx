/**
 * AgentStatusCard Component
 * Displays individual agent status with animations
 */

import React from 'react';
import { 
  CheckCircle, 
  Clock, 
  Loader2,
  AlertCircle,
  BarChart3,
  Users,
  Target,
  Activity,
  TrendingUp,
  Lightbulb
} from 'lucide-react';
import { AgentStatus, StatusEnum } from '../types/agent.types';

interface AgentStatusCardProps {
  agent: AgentStatus;
  color?: string;
}

// Icon mapping
const iconMap: Record<string, React.ElementType> = {
  BarChart3,
  Users,
  Target,
  Activity,
  TrendingUp,
  Lightbulb
};

export default function AgentStatusCard({ agent, color = 'blue' }: AgentStatusCardProps) {
  
  // Determine icon based on agent_id
  const getIcon = () => {
    const iconMapping: Record<string, string> = {
      'performance_analyst': 'BarChart3',
      'patient_analyst': 'Users',
      'strategist': 'Target',
      'enrollment_monitor': 'Activity',
      'forecaster': 'TrendingUp',
      'advisor': 'Lightbulb'
    };
    
    const iconName = iconMapping[agent.agent_id] || 'BarChart3';
    return iconMap[iconName];
  };

  const Icon = getIcon();

  // Dynamic styling based on status
  const getCardClasses = () => {
    const baseClasses = 'rounded-lg border-2 p-4 transition-all duration-300';
    
    if (agent.status === StatusEnum.PENDING) {
      return `${baseClasses} bg-gray-50 border-gray-200 opacity-60`;
    } else if (agent.status === StatusEnum.RUNNING) {
      return `${baseClasses} bg-${color}-50 border-${color}-300 shadow-xl animate-pulse-glow`;
    } else if (agent.status === StatusEnum.COMPLETE) {
      return `${baseClasses} bg-white border-${color}-200 shadow-md`;
    } else if (agent.status === StatusEnum.ERROR) {
      return `${baseClasses} bg-red-50 border-red-300 shadow-md`;
    }
    return baseClasses;
  };

  const getIconClasses = () => {
    const baseClasses = 'w-6 h-6';
    
    if (agent.status === StatusEnum.PENDING) {
      return `${baseClasses} text-gray-400`;
    } else if (agent.status === StatusEnum.RUNNING) {
      return `${baseClasses} text-${color}-600 animate-bounce-slow`;
    } else if (agent.status === StatusEnum.COMPLETE) {
      return `${baseClasses} text-${color}-600`;
    } else if (agent.status === StatusEnum.ERROR) {
      return `${baseClasses} text-red-600`;
    }
    return baseClasses;
  };

  const getStatusBadge = () => {
    if (agent.status === StatusEnum.PENDING) {
      return (
        <div className="flex items-center gap-1.5 text-gray-500 text-sm">
          <Clock className="w-4 h-4" />
          <span>Pending</span>
        </div>
      );
    } else if (agent.status === StatusEnum.RUNNING) {
      return (
        <div className={`flex items-center gap-1.5 text-${color}-600 text-sm font-semibold`}>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Running...</span>
        </div>
      );
    } else if (agent.status === StatusEnum.COMPLETE) {
      return (
        <div className={`flex items-center gap-1.5 text-${color}-600 text-sm font-semibold`}>
          <CheckCircle className="w-4 h-4" />
          <span>Complete</span>
        </div>
      );
    } else if (agent.status === StatusEnum.ERROR) {
      return (
        <div className="flex items-center gap-1.5 text-red-600 text-sm font-semibold">
          <AlertCircle className="w-4 h-4" />
          <span>Error</span>
        </div>
      );
    }
  };

  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  const getDuration = () => {
    if (!agent.started_at) return null;
    
    const start = new Date(agent.started_at);
    const end = agent.completed_at ? new Date(agent.completed_at) : new Date();
    const duration = Math.floor((end.getTime() - start.getTime()) / 1000);
    
    return `${duration}s`;
  };

  return (
    <div className={getCardClasses()}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-${color}-100`}>
            <Icon className={getIconClasses()} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">
              {agent.agent_name}
            </h3>
            {agent.started_at && (
              <p className="text-xs text-gray-500 mt-0.5">
                Started: {formatTimestamp(agent.started_at)}
              </p>
            )}
          </div>
        </div>
        {getStatusBadge()}
      </div>

      {/* Duration (if completed) */}
      {agent.completed_at && (
        <div className="mb-3 px-3 py-1.5 bg-gray-100 rounded text-xs text-gray-600">
          Duration: {getDuration()}
        </div>
      )}

      {/* Tasks */}
      {agent.tasks && agent.tasks.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
            Tasks Completed:
          </p>
          <div className="space-y-1.5">
            {agent.tasks.map((task, idx) => (
              <div 
                key={idx} 
                className="text-xs text-gray-600 pl-3 border-l-2 border-gray-300 py-1"
              >
                <div className="flex items-start gap-2">
                  <CheckCircle className={`w-3 h-3 text-${color}-600 mt-0.5 flex-shrink-0`} />
                  <span className="line-clamp-2">{task.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error message */}
      {agent.error && (
        <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
          <strong>Error:</strong> {agent.error}
        </div>
      )}

      {/* Running indicator */}
      {agent.status === StatusEnum.RUNNING && (
        <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
          <div className="flex gap-1">
            <div className={`w-2 h-2 rounded-full bg-${color}-600 animate-pulse`}></div>
            <div className={`w-2 h-2 rounded-full bg-${color}-600 animate-pulse delay-75`}></div>
            <div className={`w-2 h-2 rounded-full bg-${color}-600 animate-pulse delay-150`}></div>
          </div>
          <span>Processing...</span>
        </div>
      )}
    </div>
  );
}