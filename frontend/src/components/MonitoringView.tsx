/**
 * MonitoringView Component
 * Part 2: Trial Monitoring UI with enrollment curves, alerts, and what-if scenarios
 */

import React, { useState } from 'react';
import { PlayCircle, Calendar, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { apiService } from '../services/api';
import { InvestigationStatus, StatusEnum, TRIAL_MONITORING_AGENTS } from '../types/agent.types';
import AgentStatusCard from './AgentStatusCard';
import EnrollmentCurveChart from './EnrollmentCurveChart';
import AlertDashboard from './AlertDashboard';

interface MonitoringViewProps {
  trialId: string;
}

export default function MonitoringView({ trialId }: MonitoringViewProps) {
  const [status, setStatus] = useState<InvestigationStatus | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [monitorId, setMonitorId] = useState<string | null>(null);
  const [finalReport, setFinalReport] = useState<string | null>(null);

  const handleStartMonitoring = async () => {
    try {
      setError(null);
      setIsRunning(true);
      setStatus(null);
      setFinalReport(null);

      // Start monitoring
      const response = await apiService.startTrialMonitoring(trialId);
      setMonitorId(response.monitor_id);

      // Start polling for status updates
      await apiService.pollTrialMonitoringStatus(
        response.monitor_id,
        (currentStatus) => {
          setStatus(currentStatus);

          // If complete, get results
          if (currentStatus.status === StatusEnum.COMPLETE) {
            setIsRunning(false);
            setFinalReport(currentStatus.final_report || null);
          }

          // If error, stop
          if (currentStatus.status === StatusEnum.ERROR) {
            setIsRunning(false);
            setError(currentStatus.error || 'Monitoring failed');
          }
        }
      );

    } catch (err: any) {
      setError(err.message || 'Failed to start monitoring');
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
              Trial Monitoring
              <span className="text-sm font-normal text-gray-400">
                (3 months into trial)
              </span>
            </h2>
            <p className="text-gray-400 max-w-2xl">
              Fast forward 3 months: The trial is now live with 10 active sites. 
              AI agents will analyze weekly enrollment data, generate probabilistic forecasts, 
              and recommend interventions for underperforming sites.
            </p>
          </div>

          {!isRunning && !status && (
            <button
              onClick={handleStartMonitoring}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors shadow-lg hover:shadow-xl"
            >
              <PlayCircle className="w-5 h-5" />
              Start Monitoring
            </button>
          )}
        </div>

        {/* Timeline Indicator */}
        {(isRunning || status) && (
          <div className="mt-4 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
            <div className="flex items-center gap-4">
              <Calendar className="w-5 h-5 text-green-400" />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Trial Progress</span>
                  <span className="text-sm text-white font-semibold">Week 13 of 52</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '25%' }} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-300 font-semibold">Monitoring Failed</p>
            <p className="text-red-400 text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      {status && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar - Agent Status */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                AI Co-Pilot Status
                {status.status === StatusEnum.COMPLETE && (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                )}
              </h3>
              
              <div className="space-y-3">
                {status.agents.map((agent, index) => {
                  const config = TRIAL_MONITORING_AGENTS[index];
                  return (
                    <AgentStatusCard
                      key={agent.agent_id}
                      agent={agent}
                      color={config?.color || 'green'}
                    />
                  );
                })}
              </div>

              {/* Overall Progress */}
              <div className="mt-4 pt-4 border-t border-gray-700">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-400">Overall Progress</span>
                  <span className="text-white font-semibold">
                    {status.agents.filter(a => a.status === StatusEnum.COMPLETE).length} / {status.agents.length}
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${(status.agents.filter(a => a.status === StatusEnum.COMPLETE).length / status.agents.length) * 100}%`
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Content - Results */}
          <div className="lg:col-span-2 space-y-6">
            {status.status === StatusEnum.COMPLETE && finalReport ? (
              <>
                {/* Enrollment Curve Chart */}
                <EnrollmentCurveChart report={finalReport} />

                {/* Alert Dashboard */}
                <AlertDashboard report={finalReport} />

              </>
            ) : (
              <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 flex flex-col items-center justify-center text-center min-h-[400px]">
                <div className="animate-pulse">
                  <div className="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center mb-4">
                    <PlayCircle className="w-8 h-8 text-green-400" />
                  </div>
                  <p className="text-gray-300 text-lg font-semibold mb-2">
                    Monitoring in Progress
                  </p>
                  <p className="text-gray-500 text-sm max-w-md">
                    AI agents are analyzing enrollment data, running Monte Carlo simulations, 
                    and generating actionable recommendations. This typically takes 45-90 seconds.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Initial State */}
      {!status && !isRunning && !error && (
        <div className="bg-gray-800 rounded-lg p-12 border border-gray-700 text-center">
          <div className="max-w-2xl mx-auto">
            <div className="w-20 h-20 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <PlayCircle className="w-10 h-10 text-green-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">
              Ready to Monitor Trial Progress
            </h3>
            <p className="text-gray-400 mb-6">
              Click "Start Monitoring" to analyze the latest enrollment data from your 10 active sites. 
              Our agents will detect anomalies, generate probabilistic forecasts, and recommend 
              interventions for underperforming sites.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              {TRIAL_MONITORING_AGENTS.map((agent) => (
                <div key={agent.id} className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                  <p className="text-white font-semibold text-sm mb-1">{agent.name}</p>
                  <p className="text-gray-500 text-xs">{agent.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}