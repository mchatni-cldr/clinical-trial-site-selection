/**
 * Dashboard Component
 * Main container with tabs for Part 1 (Site Selection) and Part 2 (Trial Monitoring)
 */

import React, { useState } from 'react';
import { Building2, Activity, Lock } from 'lucide-react';
import SiteSelectionView from './SiteSelectionView';
import MonitoringView from './MonitoringView';

type TabType = 'selection' | 'monitoring';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('selection');
  const [trialId, setTrialId] = useState<string | null>(null);
  const [analysisComplete, setAnalysisComplete] = useState(false);

  // Callback when Part 1 completes - enables Part 2
  const handleAnalysisComplete = (completedTrialId: string) => {
    setTrialId(completedTrialId);
    setAnalysisComplete(true);
  };

  // Reset for new analysis
  const handleReset = () => {
    setActiveTab('selection');
    setTrialId(null);
    setAnalysisComplete(false);
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800/80 backdrop-blur-sm border-b border-gray-700/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Clinical Trial Site Selection Co-Pilot
                </h1>
                <p className="text-sm text-gray-400 mt-0.5">
                  AI-powered site selection and enrollment monitoring
                </p>
              </div>
            </div>

            {/* Reset button (only show when analysis complete) */}
            {analysisComplete && (
              <button
                onClick={handleReset}
                className="px-5 py-2.5 bg-gray-700/50 hover:bg-gray-600/50 text-white text-sm font-medium rounded-lg transition-all border border-gray-600/50"
              >
                New Analysis
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1">
            {/* Part 1: Site Selection Tab */}
            <button
              onClick={() => setActiveTab('selection')}
              className={`
                flex items-center gap-2 px-6 py-4 text-sm font-semibold transition-all
                ${activeTab === 'selection'
                  ? 'text-white border-b-2 border-blue-400 bg-gray-800/70'
                  : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800/30'
                }
              `}
            >
              <Building2 className="w-4 h-4" />
              <span>Part 1: Site Selection</span>
            </button>

            {/* Part 2: Trial Monitoring Tab */}
            <button
              onClick={() => analysisComplete && setActiveTab('monitoring')}
              disabled={!analysisComplete}
              className={`
                flex items-center gap-2 px-6 py-4 text-sm font-semibold transition-all
                ${!analysisComplete && 'cursor-not-allowed'}
                ${activeTab === 'monitoring' && analysisComplete
                  ? 'text-white border-b-2 border-green-400 bg-gray-800/70'
                  : analysisComplete
                    ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-800/30'
                    : 'text-gray-600'
                }
              `}
            >
              <Activity className="w-4 h-4" />
              <span>Part 2: Trial Monitoring</span>
              {!analysisComplete && (
                <Lock className="w-3 h-3" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Tab unlock hint */}
      {!analysisComplete && activeTab === 'selection' && (
        <div className="bg-blue-500/10 border-b border-blue-500/20">
          <div className="max-w-7xl mx-auto px-6 py-3">
            <p className="text-sm text-blue-300/90 flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Complete Part 1 to unlock Part 2: Trial Monitoring
            </p>
          </div>
        </div>
      )}

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'selection' && (
          <SiteSelectionView onAnalysisComplete={handleAnalysisComplete} />
        )}

        {activeTab === 'monitoring' && analysisComplete && trialId && (
          <MonitoringView trialId={trialId} />
        )}

        {activeTab === 'monitoring' && !analysisComplete && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="p-6 bg-gray-800 rounded-full mb-4">
              <Lock className="w-12 h-12 text-gray-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-400 mb-2">
              Trial Monitoring Locked
            </h2>
            <p className="text-gray-500 text-center max-w-md">
              Complete the site selection analysis in Part 1 to access trial monitoring features.
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900/50 border-t border-gray-800 mt-12">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <p>
              Powered by Cloudera
            </p>
            <p>
              {analysisComplete && trialId && (
                <span className="text-gray-600">
                  Trial ID: <span className="font-mono text-xs">{trialId.slice(0, 8)}</span>
                </span>
              )}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}