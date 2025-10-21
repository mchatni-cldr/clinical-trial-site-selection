/**
 * SiteRecommendationTable Component
 * Displays top 10 recommended sites with rankings and details
 */

import React, { useState } from 'react';
import { 
  MapPin, 
  TrendingUp, 
  Users, 
  AlertTriangle, 
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Star
} from 'lucide-react';

interface SiteRecommendationTableProps {
  report: string;
}

export default function SiteRecommendationTable({ report }: SiteRecommendationTableProps) {
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  // Mock data parser - in production, parse actual JSON from crew output
  const mockSites = [
    {
      rank: 1,
      site_id: 'Site-047',
      site_name: 'Nebraska Regional Cancer Center',
      city: 'Omaha',
      state: 'NE',
      composite_score: 0.912,
      historical_enrollment_rate: 0.95,
      eligible_patients: 380,
      competing_trials: 0,
      classification: 'hidden_gem',
      strengths: [
        'Outstanding 95% historical enrollment rate',
        'Zero competing trials in oncology',
        'Excellent data quality (0.98)',
        'Fast patient startup (22 days avg)'
      ],
      concerns: []
    },
    {
      rank: 2,
      site_id: 'Site-156',
      site_name: 'Nashville Medical Center',
      city: 'Nashville',
      state: 'TN',
      composite_score: 0.887,
      historical_enrollment_rate: 0.89,
      eligible_patients: 450,
      competing_trials: 1,
      classification: 'safe_choice',
      strengths: [
        'Strong 89% enrollment rate',
        'High patient density (450 eligible)',
        'Low competition (1 trial)'
      ],
      concerns: []
    },
    {
      rank: 3,
      site_id: 'Site-234',
      site_name: 'Phoenix Cancer Institute',
      city: 'Phoenix',
      state: 'AZ',
      composite_score: 0.865,
      historical_enrollment_rate: 0.86,
      eligible_patients: 520,
      competing_trials: 2,
      classification: 'safe_choice',
      strengths: [
        'Good enrollment history (86%)',
        'Very high patient density'
      ],
      concerns: ['Moderate competition (2 trials)']
    },
    {
      rank: 4,
      site_id: 'Site-089',
      site_name: 'Atlanta Regional Hospital',
      city: 'Atlanta',
      state: 'GA',
      composite_score: 0.842,
      historical_enrollment_rate: 0.84,
      eligible_patients: 410,
      competing_trials: 3,
      classification: 'safe_choice',
      strengths: ['Solid track record', 'Good patient access'],
      concerns: ['Higher competition (3 trials)']
    },
    {
      rank: 5,
      site_id: 'Site-311',
      site_name: 'Denver Health Center',
      city: 'Denver',
      state: 'CO',
      composite_score: 0.829,
      historical_enrollment_rate: 0.82,
      eligible_patients: 390,
      competing_trials: 2,
      classification: 'acceptable',
      strengths: ['Reliable performance'],
      concerns: []
    },
    {
      rank: 6,
      site_id: 'Site-178',
      site_name: 'Seattle Medical Center',
      city: 'Seattle',
      state: 'WA',
      composite_score: 0.815,
      historical_enrollment_rate: 0.81,
      eligible_patients: 470,
      competing_trials: 4,
      classification: 'acceptable',
      strengths: ['High patient density'],
      concerns: ['Significant competition (4 trials)']
    },
    {
      rank: 7,
      site_id: 'Site-412',
      site_name: 'Miami Cancer Center',
      city: 'Miami',
      state: 'FL',
      composite_score: 0.801,
      historical_enrollment_rate: 0.79,
      eligible_patients: 440,
      competing_trials: 3,
      classification: 'acceptable',
      strengths: ['Good patient pool'],
      concerns: []
    },
    {
      rank: 8,
      site_id: 'Site-267',
      site_name: 'Portland Regional Hospital',
      city: 'Portland',
      state: 'OR',
      composite_score: 0.795,
      historical_enrollment_rate: 0.77,
      eligible_patients: 360,
      competing_trials: 2,
      classification: 'acceptable',
      strengths: ['Steady performance'],
      concerns: []
    },
    {
      rank: 9,
      site_id: 'Site-145',
      site_name: 'Minneapolis Cancer Institute',
      city: 'Minneapolis',
      state: 'MN',
      composite_score: 0.788,
      historical_enrollment_rate: 0.76,
      eligible_patients: 400,
      competing_trials: 3,
      classification: 'acceptable',
      strengths: ['Adequate patient access'],
      concerns: []
    },
    {
      rank: 10,
      site_id: 'Site-022',
      site_name: 'Boston Medical Center',
      city: 'Boston',
      state: 'MA',
      composite_score: 0.781,
      historical_enrollment_rate: 0.78,
      eligible_patients: 720,
      competing_trials: 8,
      classification: 'risky',
      strengths: ['Very high patient density', 'Prestigious institution'],
      concerns: [
        'High competition (8 competing trials)',
        'High screen fail rate (28%)',
        'Risk: PI availability concerns'
      ]
    }
  ];

  const getClassificationBadge = (classification: string) => {
    switch (classification) {
      case 'hidden_gem':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-900/30 border border-purple-700 text-purple-300 rounded-full text-xs font-semibold">
            <Star className="w-3 h-3" />
            Hidden Gem
          </span>
        );
      case 'safe_choice':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-900/30 border border-green-700 text-green-300 rounded-full text-xs font-semibold">
            <CheckCircle className="w-3 h-3" />
            Safe Choice
          </span>
        );
      case 'risky':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-900/30 border border-yellow-700 text-yellow-300 rounded-full text-xs font-semibold">
            <AlertTriangle className="w-3 h-3" />
            Exercise Caution
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 bg-gray-700 text-gray-300 rounded-full text-xs">
            Acceptable
          </span>
        );
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 p-6 border-b border-gray-700">
        <h3 className="text-2xl font-bold text-white mb-2">
          Top 10 Site Recommendations
        </h3>
        <p className="text-gray-300 text-sm">
          AI-selected sites ranked by composite score (performance, patient access, quality, logistics)
        </p>
      </div>

      {/* Highlight Box for #1 Site */}
      <div className="p-6 bg-purple-900/10 border-b border-purple-800/30">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-purple-600 rounded-lg">
            <Star className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl font-bold text-purple-400">#1</span>
              <h4 className="text-xl font-bold text-white">
                {mockSites[0].site_name}
              </h4>
              {getClassificationBadge(mockSites[0].classification)}
            </div>
            <p className="text-gray-300 text-sm mb-3">
              <MapPin className="w-4 h-4 inline mr-1" />
              {mockSites[0].city}, {mockSites[0].state} • Score: {mockSites[0].composite_score.toFixed(3)}
            </p>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-400">Enrollment Rate</p>
                <p className="text-green-400 font-semibold text-lg">
                  {(mockSites[0].historical_enrollment_rate * 100).toFixed(0)}%
                </p>
              </div>
              <div>
                <p className="text-gray-400">Eligible Patients</p>
                <p className="text-white font-semibold text-lg">{mockSites[0].eligible_patients}</p>
              </div>
              <div>
                <p className="text-gray-400">Competing Trials</p>
                <p className="text-green-400 font-semibold text-lg">{mockSites[0].competing_trials}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-900/50 border-b border-gray-700 text-left">
              <th className="px-6 py-3 text-xs font-semibold text-gray-400 uppercase">Rank</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-400 uppercase">Site</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-400 uppercase">Location</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-400 uppercase text-right">Score</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-400 uppercase text-right">Enroll Rate</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-400 uppercase text-right">Patients</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-400 uppercase text-center">Competition</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-400 uppercase">Classification</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {mockSites.map((site) => (
              <React.Fragment key={site.rank}>
                <tr 
                  className={`border-b border-gray-700 hover:bg-gray-750 cursor-pointer transition-colors ${
                    site.rank === 1 ? 'bg-purple-900/5' : ''
                  }`}
                  onClick={() => setExpandedRow(expandedRow === site.rank ? null : site.rank)}
                >
                  <td className="px-6 py-4">
                    <span className="text-2xl font-bold text-gray-300">#{site.rank}</span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-white text-sm">{site.site_name}</p>
                    <p className="text-xs text-gray-500">{site.site_id}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-300">{site.city}, {site.state}</p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm font-semibold text-white">{site.composite_score.toFixed(3)}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`text-sm font-semibold ${
                      site.historical_enrollment_rate > 0.85 ? 'text-green-400' : 'text-gray-300'
                    }`}>
                      {(site.historical_enrollment_rate * 100).toFixed(0)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm text-gray-300">{site.eligible_patients}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                      site.competing_trials === 0 
                        ? 'bg-green-900/30 text-green-400'
                        : site.competing_trials <= 3
                        ? 'bg-yellow-900/30 text-yellow-400'
                        : 'bg-red-900/30 text-red-400'
                    }`}>
                      {site.competing_trials}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {getClassificationBadge(site.classification)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {expandedRow === site.rank ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </td>
                </tr>
                
                {/* Expanded Details */}
                {expandedRow === site.rank && (
                  <tr className="bg-gray-900/50">
                    <td colSpan={9} className="px-6 py-4">
                      <div className="grid grid-cols-2 gap-6">
                        {/* Strengths */}
                        <div>
                          <h4 className="text-sm font-semibold text-green-400 mb-2 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            Strengths
                          </h4>
                          <ul className="space-y-1">
                            {site.strengths.map((strength, idx) => (
                              <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                                <span className="text-green-400 mt-1">•</span>
                                <span>{strength}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        {/* Concerns */}
                        <div>
                          <h4 className="text-sm font-semibold text-yellow-400 mb-2 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" />
                            Concerns {site.concerns.length === 0 && <span className="text-xs text-gray-500">(None identified)</span>}
                          </h4>
                          {site.concerns.length > 0 ? (
                            <ul className="space-y-1">
                              {site.concerns.map((concern, idx) => (
                                <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                                  <span className="text-yellow-400 mt-1">•</span>
                                  <span>{concern}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-gray-500 italic">No concerns identified</p>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}