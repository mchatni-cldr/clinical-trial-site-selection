/**
 * EnrollmentCurveChart Component
 * Displays probabilistic enrollment forecast with Recharts
 */

import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Area,
  ComposedChart
} from 'recharts';
import { TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

interface EnrollmentCurveChartProps {
  report: string;
}

export default function EnrollmentCurveChart({ report }: EnrollmentCurveChartProps) {
  // Mock forecast data - in production, parse from crew output
  const mockForecastData = [
    // Historical data (weeks 1-13)
    { week: 1, actual: 12, p10: null, p50: null, p90: null },
    { week: 2, actual: 25, p10: null, p50: null, p90: null },
    { week: 3, actual: 38, p10: null, p50: null, p90: null },
    { week: 4, actual: 52, p10: null, p50: null, p90: null },
    { week: 5, actual: 64, p10: null, p50: null, p90: null },
    { week: 6, actual: 77, p10: null, p50: null, p90: null },
    { week: 7, actual: 89, p10: null, p50: null, p90: null },
    { week: 8, actual: 98, p10: null, p50: null, p90: null },
    { week: 9, actual: 108, p10: null, p50: null, p90: null },
    { week: 10, actual: 116, p10: null, p50: null, p90: null },
    { week: 11, actual: 122, p10: null, p50: null, p90: null },
    { week: 12, actual: 128, p10: null, p50: null, p90: null },
    { week: 13, actual: 132, p10: null, p50: null, p90: null },
    // Forecast (weeks 14-52)
    { week: 14, actual: null, p10: 135, p50: 140, p90: 145 },
    { week: 18, actual: null, p10: 145, p50: 155, p90: 165 },
    { week: 22, actual: null, p10: 152, p50: 167, p90: 182 },
    { week: 26, actual: null, p10: 158, p50: 178, p90: 198 },
    { week: 30, actual: null, p10: 163, p50: 187, p90: 211 },
    { week: 34, actual: null, p10: 167, p50: 195, p90: 223 },
    { week: 38, actual: null, p10: 170, p50: 202, p90: 234 },
    { week: 42, actual: null, p10: 173, p50: 208, p90: 243 },
    { week: 46, actual: null, p10: 175, p50: 213, p90: 251 },
    { week: 50, actual: null, p10: 177, p50: 217, p90: 257 },
    { week: 52, actual: null, p10: 178, p50: 219, p90: 260 }
  ];

  const targetEnrollment = 200;
  const currentEnrolled = 132;
  const projectedFinal = 219;
  const probabilityMeetingTarget = 0.68;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl">
          <p className="text-white font-semibold mb-2">Week {label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: <span className="font-semibold">{entry.value}</span> patients
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-900/50 to-cyan-900/50 p-6 border-b border-gray-700">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
              <TrendingUp className="w-6 h-6" />
              Enrollment Forecast
            </h3>
            <p className="text-gray-300 text-sm">
              Probabilistic projection based on actual site performance (P10 = pessimistic, P50 = median, P90 = optimistic)
            </p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-4 p-6 border-b border-gray-700 bg-gray-900/30">
        <div>
          <p className="text-xs text-gray-400 uppercase mb-1">Current Enrolled</p>
          <p className="text-2xl font-bold text-white">{currentEnrolled}</p>
          <p className="text-xs text-gray-500 mt-1">Week 13 of 52</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 uppercase mb-1">Projected Final (P50)</p>
          <p className={`text-2xl font-bold ${projectedFinal >= targetEnrollment ? 'text-green-400' : 'text-yellow-400'}`}>
            {projectedFinal}
          </p>
          <p className="text-xs text-gray-500 mt-1">Median forecast</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 uppercase mb-1">Target Enrollment</p>
          <p className="text-2xl font-bold text-gray-300">{targetEnrollment}</p>
          <p className="text-xs text-gray-500 mt-1">Trial goal</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 uppercase mb-1">Probability of Success</p>
          <p className={`text-2xl font-bold ${probabilityMeetingTarget >= 0.7 ? 'text-green-400' : 'text-yellow-400'}`}>
            {(probabilityMeetingTarget * 100).toFixed(0)}%
          </p>
          <p className="text-xs text-gray-500 mt-1">Meeting target</p>
        </div>
      </div>

      {/* Chart */}
      <div className="p-6">
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={mockForecastData}>
            <defs>
              {/* Gradient for confidence interval */}
              <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.05}/>
              </linearGradient>
            </defs>
            
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="week" 
              stroke="#9CA3AF"
              label={{ value: 'Week', position: 'insideBottom', offset: -5, fill: '#9CA3AF' }}
            />
            <YAxis 
              stroke="#9CA3AF"
              label={{ value: 'Patients Enrolled', angle: -90, position: 'insideLeft', fill: '#9CA3AF' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="line"
            />
            
            {/* Target line */}
            <Line 
              type="monotone" 
              dataKey={() => targetEnrollment}
              stroke="#EF4444" 
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              name="Target (200)"
            />
            
            {/* Confidence interval area (P10 to P90) - FILLED GRADIENT */}
            <Area
              type="monotone"
              dataKey="p90"
              stroke="none"
              fill="url(#confidenceGradient)"
            />
            
            {/* P90 line (Optimistic) - BRIGHT CYAN */}
            <Line 
              type="monotone" 
              dataKey="p90" 
              stroke="#06B6D4" 
              strokeWidth={2}
              strokeDasharray="3 3"
              dot={false}
              name="P90 (Optimistic)"
            />
            
            {/* P10 line (Pessimistic) - ORANGE */}
            <Line 
              type="monotone" 
              dataKey="p10" 
              stroke="#F97316" 
              strokeWidth={2}
              strokeDasharray="3 3"
              dot={false}
              name="P10 (Pessimistic)"
            />
            
            {/* Actual enrollment - BRIGHT GREEN */}
            <Line 
              type="monotone" 
              dataKey="actual" 
              stroke="#10B981" 
              strokeWidth={4}
              dot={{ fill: '#10B981', r: 5, strokeWidth: 2, stroke: '#fff' }}
              name="Actual Enrollment"
            />
            
            {/* Median forecast - VIBRANT PURPLE */}
            <Line 
              type="monotone" 
              dataKey="p50" 
              stroke="#8B5CF6" 
              strokeWidth={3}
              strokeDasharray="5 5"
              dot={{ fill: '#8B5CF6', r: 4 }}
              name="Forecast (P50)"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Interpretation */}
      <div className="px-6 pb-6">
        <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
          <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            {probabilityMeetingTarget >= 0.7 ? (
              <>
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-green-400">On Track</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4 text-yellow-400" />
                <span className="text-yellow-400">At Risk</span>
              </>
            )}
          </h4>
          <p className="text-sm text-gray-300">
            Based on current performance, the trial has a <strong className="text-white">{(probabilityMeetingTarget * 100).toFixed(0)}%</strong> probability 
            of meeting the 200-patient target. The median forecast projects <strong className="text-white">{projectedFinal}</strong> total 
            enrollments by week 52. The confidence interval ranges from {mockForecastData[mockForecastData.length - 1].p10} (pessimistic) 
            to {mockForecastData[mockForecastData.length - 1].p90} (optimistic).
          </p>
        </div>
      </div>
    </div>
  );
}