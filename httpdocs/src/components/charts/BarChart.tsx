import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface BarChartData {
  label: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  title: string;
  data: BarChartData[];
  height?: number;
  showValues?: boolean;
  className?: string;
}

const BarChart: React.FC<BarChartProps> = ({
  title,
  data,
  height = 300,
  showValues = true,
  className = ''
}) => {
  const maxValue = Math.max(...data.map(item => item.value));

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4" style={{ height: `${height}px` }}>
          {data.map((item, index) => {
            const percentage = (item.value / maxValue) * 100;
            const color = item.color || `hsl(${(index * 137.5) % 360}, 70%, 50%)`;

            return (
              <div key={index} className="flex items-center gap-4">
                <div className="w-24 text-sm font-medium text-gray-700 truncate">
                  {item.label}
                </div>
                <div className="flex-1">
                  <div className="relative">
                    <div
                      className="h-8 rounded-md transition-all duration-500 ease-out"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: color,
                        minWidth: '8px'
                      }}
                    />
                    {showValues && (
                      <div className="absolute -top-6 left-0 text-xs font-medium text-gray-600">
                        {item.value.toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default BarChart;