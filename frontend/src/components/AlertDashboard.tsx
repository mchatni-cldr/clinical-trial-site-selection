/**
 * AlertDashboard Component
 * Displays site alerts with severity levels
 */

import React from 'react';
import { AlertTriangle, AlertCircle, Info, TrendingDown, XCircle } from 'lucide-react';

interface AlertDashboardProps {
  report: string;
}

export default function AlertDashboard({ report }: AlertDashboardProps) {
  // Mock alerts data - in production, parse from crew output
  const mockAlerts = [
    {
      alert_id: '1',
      site_id: 'Site-022',
      site_name: 'Boston Medical Center',
      severity: 'critical',
      alert_type: 'flatlined',
      message: 'Site has reported 0 enrollments for the past 3 weeks',
      details: 'Last enrollment recorded in week 10. PI may be unavailable. Immediate intervention required.',
      current_enrollment: 18,
      target_enrollment: 20,
      shortfall_percent: 65,
      weeks_since_last_enrollment: 3,
      recommended_actions: [
        'Contact site coordinator immediately',
        'Assess PI availability',
        'Consider adding recruitment budget or site replacement'
      ]
    },
    {
      alert_id: '2',
      site_id: 'Site-178',
      site_name: 'Seattle Medical Center',
      severity: 'warning',
      alert_type: 'underperforming',
      message: 'Site enrolled 11 patients vs expected 20 (45% shortfall)',
      details: 'Enrollment rate declining over past 4 weeks. High competition from 4 concurrent trials.',
      current_enrollment: 11,
      target_enrollment: 20,
      shortfall_percent: 45,
      weeks_since_last_enrollment: 0,
      recommended_actions: [
        'Increase site support and training',
        'Review patient screening criteria',
        'Consider additional recruitment budget'
      ]
    },
    {
      alert_id: '3',
      site_id: 'Site-267',
      site_name: 'Portland Regional Hospital',
      severity: 'info',
      alert_type: 'declining_trend',
      message: 'Enrollment rate declining but still on track',
      details: 'Weekly enrollment dropped from 2.5 to 1.8 patients. Monitor closely.',
      current_enrollment: 14,
      target_enrollment: 20,
      shortfall_percent: 30,
      weeks_since_last_enrollment: 0,
      recommended_actions: [
        'Monitor weekly performance',
        'Schedule check-in call with site'
      ]
    }
  ];

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-400" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-900/30 border border-red-700 text-red-300 rounded-full text-xs font-semibold uppercase">
            Critical
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-900/30 border border-yellow-700 text-yellow-300 rounded-full text-xs font-semibold uppercase">
            Warning
          </span>
        );
      case 'info':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-900/30 border border-blue-700 text-blue-300 rounded-full text-xs font-semibold uppercase">
            Info
          </span>
        );
      default:
        return null;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'border-red-700 bg-red-900/10';
      case 'warning':
        return 'border-yellow-700 bg-yellow-900/10';
      case 'info':
        return 'border-blue-700 bg-blue-900/10';
      default:
        return 'border-gray-700 bg-gray-900/10';
    }
  };

  const criticalCount = mockAlerts.filter(a => a.severity === 'critical').length;
  const warningCount = mockAlerts.filter(a => a.severity === 'warning').length;

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-900/50 to-orange-900/50 p-6 border-b border-gray-700">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6" />
              Site Alerts
            </h3>
            <p className="text-gray-300 text-sm">
              Real-time alerts for underperforming or problematic sites requiring intervention
            </p>
          </div>
          <div className="flex gap-3">
            {criticalCount > 0 && (
              <div className="flex items-center gap-2 px-3 py-2 bg-red-900/30 border border-red-700 rounded-lg">
                <XCircle className="w-4 h-4 text-red-400" />
                <span className="text-red-300 font-semibold text-sm">{criticalCount} Critical</span>
              </div>
            )}
            {warningCount > 0 && (
              <div className="flex items-center gap-2 px-3 py-2 bg-yellow-900/30 border border-yellow-700 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-yellow-400" />
                <span className="text-yellow-300 font-semibold text-sm">{warningCount} Warning</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="p-6 space-y-4">
        {mockAlerts.map((alert) => (
          <div 
            key={alert.alert_id}
            className={`rounded-lg border-2 p-5 ${getSeverityColor(alert.severity)}`}
          >
            {/* Alert Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-3">
                <div className="mt-0.5">{getSeverityIcon(alert.severity)}</div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-lg font-semibold text-white">
                      {alert.site_name}
                    </h4>
                    {getSeverityBadge(alert.severity)}
                  </div>
                  <p className="text-sm text-gray-400">{alert.site_id}</p>
                </div>
              </div>
              
              {/* Shortfall Indicator */}
              {alert.severity !== 'info' && (
                <div className="text-right">
                  <p className="text-xs text-gray-400 uppercase mb-1">Shortfall</p>
                  <p className={`text-2xl font-bold ${
                    alert.severity === 'critical' ? 'text-red-400' : 'text-yellow-400'
                  }`}>
                    {alert.shortfall_percent}%
                  </p>
                </div>
              )}
            </div>

            {/* Alert Message */}
            <div className="mb-3 p-3 bg-gray-900/50 rounded-lg">
              <p className="text-white font-semibold text-sm mb-1">{alert.message}</p>
              <p className="text-gray-400 text-xs">{alert.details}</p>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-4 mb-3 pb-3 border-b border-gray-700">
              <div>
                <p className="text-xs text-gray-400 uppercase mb-1">Current Enrolled</p>
                <p className="text-white font-semibold">{alert.current_enrollment}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase mb-1">Target</p>
                <p className="text-white font-semibold">{alert.target_enrollment}</p>
              </div>
              {alert.weeks_since_last_enrollment > 0 && (
                <div>
                  <p className="text-xs text-gray-400 uppercase mb-1">Weeks Flatlined</p>
                  <p className="text-red-400 font-semibold flex items-center gap-1">
                    <TrendingDown className="w-4 h-4" />
                    {alert.weeks_since_last_enrollment}
                  </p>
                </div>
              )}
            </div>

            {/* Recommended Actions */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase mb-2">
                Recommended Actions:
              </p>
              <ul className="space-y-1.5">
                {alert.recommended_actions.map((action, idx) => (
                  <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                    <span className={`mt-1 ${
                      alert.severity === 'critical' ? 'text-red-400' :
                      alert.severity === 'warning' ? 'text-yellow-400' : 'text-blue-400'
                    }`}>→</span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Footer */}
      <div className="bg-gray-900/50 border-t border-gray-700 p-4">
        <p className="text-sm text-gray-400 text-center">
          {mockAlerts.length} alert{mockAlerts.length !== 1 ? 's' : ''} detected • 
          Last updated: Week 13 • 
          {criticalCount > 0 ? (
            <span className="text-red-400 font-semibold"> Immediate action required</span>
          ) : (
            <span className="text-green-400"> No critical issues</span>
          )}
        </p>
      </div>
    </div>
  );
}