/**
 * SiteSelectionView Component
 * Part 1: Site Selection UI with agent tracking and results display
 */

import React, { useState, useEffect } from 'react';
import { PlayCircle, CheckCircle2, AlertCircle } from 'lucide-react';
import { apiService } from '../services/api';
import { InvestigationStatus, StatusEnum, SITE_SELECTION_AGENTS } from '../types/agent.types';
import AgentStatusCard from './AgentStatusCard';
import SiteRecommendationTable from './SiteRecommendationTable';

interface SiteSelectionViewProps {
  onAnalysisComplete: (trialId: string) => void;
}

export default function SiteSelectionView({ onAnalysisComplete }: SiteSelectionViewProps) {
  const [status, setStatus] = useState<InvestigationStatus | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const [trialId, setTrialId] = useState<string | null>(null);
  const [finalReport, setFinalReport] = useState<string | null>(null);

  const handleStartAnalysis = async () => {
    try {
      setError(null);
      setIsRunning(true);
      setStatus(null);
      setFinalReport(null);

      // Start analysis
      const response = await apiService.startSiteAnalysis({
        phase: 'Phase III',
        indication: 'Oncology',
        target_enrollment: 200,
        duration_months: 18,
        target_sites: 10
      });

      setAnalysisId(response.analysis_id);
      setTrialId(response.trial_id);

      // Start polling for status updates
      await apiService.pollSiteAnalysisStatus(
        response.analysis_id,
        (currentStatus) => {
          setStatus(currentStatus);

          // If complete, notify parent and get results
          if (currentStatus.status === StatusEnum.COMPLETE) {
            setIsRunning(false);
            setFinalReport(currentStatus.final_report || null);
            if (response.trial_id) {
              onAnalysisComplete(response.trial_id);
            }
          }

          // If error, stop
          if (currentStatus.status === StatusEnum.ERROR) {
            setIsRunning(false);
            setError(currentStatus.error || 'Analysis failed');
          }
        }
      );

    } catch (err: any) {
      setError(err.message || 'Failed to start analysis');
      setIsRunning(false);
    }
  };

  // Parse final report to extract recommendations
  const parseRecommendations = () => {
    if (!finalReport) return null;
    
    // The final report is a string from Claude - for demo, we'll show it as-is
    // In production, you'd parse JSON from the crew output
    return finalReport;
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 backdrop-blur-sm">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Site Selection Analysis
            </h2>
            <p className="text-gray-400 max-w-2xl">
              AI agents will analyze 500 potential sites, evaluate historical performance, 
              assess patient availability, and recommend the top 10 sites for your Phase III oncology trial.
            </p>
          </div>

          {!isRunning && !status && (
            <button
              onClick={handleStartAnalysis}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl"
            >
              <PlayCircle className="w-5 h-5" />
              Analyze Sites
            </button>
          )}
        </div>

        {/* Trial Parameters */}
        {(isRunning || status) && (
          <div className="mt-4 p-4 bg-gray-900/50 rounded-lg border border-gray-700/50">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Phase</p>
                <p className="text-white font-semibold">Phase III</p>
              </div>
              <div>
                <p className="text-gray-500">Indication</p>
                <p className="text-white font-semibold">Oncology</p>
              </div>
              <div>
                <p className="text-gray-500">Target Enrollment</p>
                <p className="text-white font-semibold">200 patients</p>
              </div>
              <div>
                <p className="text-gray-500">Duration</p>
                <p className="text-white font-semibold">18 months</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-300 font-semibold">Analysis Failed</p>
            <p className="text-red-400 text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      {status && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Agent Status */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50 backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                AI Co-Pilot Status
                {status.status === StatusEnum.COMPLETE && (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                )}
              </h3>
              
              <div className="space-y-3">
                {status.agents.map((agent, index) => {
                  const config = SITE_SELECTION_AGENTS[index];
                  return (
                    <AgentStatusCard
                      key={agent.agent_id}
                      agent={agent}
                      color={config?.color || 'blue'}
                    />
                  );
                })}
              </div>

              {/* Overall Progress */}
              <div className="mt-4 pt-4 border-t border-gray-700/50">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-400">Overall Progress</span>
                  <span className="text-white font-semibold">
                    {status.agents.filter(a => a.status === StatusEnum.COMPLETE).length} / {status.agents.length}
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${(status.agents.filter(a => a.status === StatusEnum.COMPLETE).length / status.agents.length) * 100}%`
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Content - Results (WIDER) */}
          <div className="lg:col-span-3">
            {status.status === StatusEnum.COMPLETE && finalReport ? (
              <SiteRecommendationTable report={finalReport} />
            ) : (
              <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 flex flex-col items-center justify-center text-center min-h-[400px]">
                <div className="animate-pulse">
                  <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mb-4">
                    <PlayCircle className="w-8 h-8 text-blue-400" />
                  </div>
                  <p className="text-gray-300 text-lg font-semibold mb-2">
                    Analysis in Progress
                  </p>
                  <p className="text-gray-500 text-sm max-w-md">
                    AI agents are analyzing 500 sites, evaluating performance metrics, 
                    and generating recommendations. This typically takes 45-90 seconds.
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
            <div className="w-20 h-20 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <PlayCircle className="w-10 h-10 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">
              Ready to Select Trial Sites
            </h3>
            <p className="text-gray-400 mb-6">
              Click "Analyze Sites" to start the AI-powered site selection process. 
              Our agents will evaluate 500 potential sites and recommend the optimal 
              10 sites based on historical performance, patient availability, and logistics.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              {SITE_SELECTION_AGENTS.map((agent) => (
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