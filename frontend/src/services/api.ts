/**
 * API Service for Clinical Trial Site Selection
 * Handles all backend communication with polling support
 */

import axios, { AxiosInstance } from 'axios';
import { InvestigationStatus } from '../types/agent.types';
import { 
  TrialParameters, 
  SiteAnalysisResult,
  TrialMonitoringResult,
  WhatIfScenario,
  WhatIfResult
} from '../types/clinical.types';

// API Base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

interface StartAnalysisResponse {
  analysis_id: string;
  trial_id: string;
  status: string;
  message: string;
  trial_params: TrialParameters;
}

interface StartMonitoringResponse {
  monitor_id: string;
  trial_id: string;
  status: string;
  message: string;
}

interface ErrorResponse {
  error: string;
  message: string;
}

// ============================================================================
// PART 1: SITE SELECTION API
// ============================================================================

export const apiService = {
  
  /**
   * Start site selection analysis
   */
  startSiteAnalysis: async (trialParams?: Partial<TrialParameters>): Promise<StartAnalysisResponse> => {
    try {
      const response = await apiClient.post<StartAnalysisResponse>('/api/site-analysis/start', {
        phase: trialParams?.phase || 'Phase III',
        indication: trialParams?.indication || 'Oncology',
        target_enrollment: trialParams?.target_enrollment || 200,
        duration_months: trialParams?.duration_months || 18,
        target_sites: trialParams?.target_sites || 10
      });
      return response.data;
    } catch (error) {
      console.error('Error starting site analysis:', error);
      throw error;
    }
  },

  /**
   * Get current status of site analysis
   */
  getSiteAnalysisStatus: async (analysisId: string): Promise<InvestigationStatus> => {
    try {
      const response = await apiClient.get<InvestigationStatus>(
        `/api/site-analysis/${analysisId}/status`
      );
      return response.data;
    } catch (error) {
      console.error('Error getting site analysis status:', error);
      throw error;
    }
  },

  /**
   * Get final results from completed site analysis
   */
  getSiteAnalysisResults: async (analysisId: string): Promise<SiteAnalysisResult> => {
    try {
      const response = await apiClient.get<SiteAnalysisResult>(
        `/api/site-analysis/${analysisId}/results`
      );
      return response.data;
    } catch (error) {
      console.error('Error getting site analysis results:', error);
      throw error;
    }
  },

  /**
   * Poll site analysis status until complete
   * Calls onUpdate callback on each status change
   */
  pollSiteAnalysisStatus: async (
    analysisId: string,
    onUpdate: (status: InvestigationStatus) => void,
    intervalMs: number = 2000
  ): Promise<void> => {
    const poll = async () => {
      try {
        const status = await apiService.getSiteAnalysisStatus(analysisId);
        onUpdate(status);

        // Continue polling if still running
        if (status.status === 'running' || status.status === 'pending') {
          setTimeout(poll, intervalMs);
        }
      } catch (error) {
        console.error('Error polling site analysis status:', error);
        // Continue polling on error (backend might be processing)
        setTimeout(poll, intervalMs);
      }
    };

    await poll();
  },

  // ============================================================================
  // PART 2: TRIAL MONITORING API
  // ============================================================================

  /**
   * Start trial monitoring
   */
  startTrialMonitoring: async (trialId: string): Promise<StartMonitoringResponse> => {
    try {
      const response = await apiClient.post<StartMonitoringResponse>(
        '/api/trial-monitoring/start',
        { trial_id: trialId }
      );
      return response.data;
    } catch (error) {
      console.error('Error starting trial monitoring:', error);
      throw error;
    }
  },

  /**
   * Get current status of trial monitoring
   */
  getTrialMonitoringStatus: async (monitorId: string): Promise<InvestigationStatus> => {
    try {
      const response = await apiClient.get<InvestigationStatus>(
        `/api/trial-monitoring/${monitorId}/status`
      );
      return response.data;
    } catch (error) {
      console.error('Error getting trial monitoring status:', error);
      throw error;
    }
  },

  /**
   * Get forecast data from completed trial monitoring
   */
  getTrialMonitoringForecast: async (monitorId: string): Promise<TrialMonitoringResult> => {
    try {
      const response = await apiClient.get<TrialMonitoringResult>(
        `/api/trial-monitoring/${monitorId}/forecast`
      );
      return response.data;
    } catch (error) {
      console.error('Error getting trial monitoring forecast:', error);
      throw error;
    }
  },

  /**
   * Poll trial monitoring status until complete
   * Calls onUpdate callback on each status change
   */
  pollTrialMonitoringStatus: async (
    monitorId: string,
    onUpdate: (status: InvestigationStatus) => void,
    intervalMs: number = 2000
  ): Promise<void> => {
    const poll = async () => {
      try {
        const status = await apiService.getTrialMonitoringStatus(monitorId);
        onUpdate(status);

        // Continue polling if still running
        if (status.status === 'running' || status.status === 'pending') {
          setTimeout(poll, intervalMs);
        }
      } catch (error) {
        console.error('Error polling trial monitoring status:', error);
        // Continue polling on error
        setTimeout(poll, intervalMs);
      }
    };

    await poll();
  },

  /**
   * Run what-if scenario analysis
   */
  runWhatIfScenario: async (scenario: WhatIfScenario): Promise<WhatIfResult> => {
    try {
      const response = await apiClient.post<WhatIfResult>(
        '/api/trial-monitoring/what-if',
        scenario
      );
      return response.data;
    } catch (error) {
      console.error('Error running what-if scenario:', error);
      throw error;
    }
  },

  // ============================================================================
  // UTILITY API
  // ============================================================================

  /**
   * Health check
   */
  healthCheck: async (): Promise<{ status: string; timestamp: string }> => {
    try {
      const response = await apiClient.get('/api/health');
      return response.data;
    } catch (error) {
      console.error('Error checking health:', error);
      throw error;
    }
  },

  /**
   * Regenerate synthetic data (development only)
   */
  regenerateData: async (): Promise<{ message: string; timestamp: string }> => {
    try {
      const response = await apiClient.post('/api/data/generate');
      return response.data;
    } catch (error) {
      console.error('Error regenerating data:', error);
      throw error;
    }
  },

  /**
   * Reset orchestrator state (development only)
   */
  resetState: async (): Promise<{ message: string; timestamp: string }> => {
    try {
      const response = await apiClient.post('/api/reset');
      return response.data;
    } catch (error) {
      console.error('Error resetting state:', error);
      throw error;
    }
  }
};

// ============================================================================
// CUSTOM HOOKS (Optional - for easier React integration)
// ============================================================================

/**
 * Helper to check if error is an API error
 */
export const isApiError = (error: any): error is ErrorResponse => {
  return error && typeof error.error === 'string';
};

/**
 * Format error message for display
 */
export const formatErrorMessage = (error: any): string => {
  if (isApiError(error)) {
    return error.message || error.error;
  }
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
};