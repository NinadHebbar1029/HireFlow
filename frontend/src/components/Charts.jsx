import React from 'react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export const LineChartComponent = ({ data, dataKeys, xAxisKey = 'date', height = 300, colors = COLORS }) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey={xAxisKey} stroke="#6b7280" />
        <YAxis stroke="#6b7280" />
        <Tooltip 
          contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
        />
        <Legend />
        {dataKeys.map((key, index) => (
          <Line
            key={key}
            type="monotone"
            dataKey={key}
            stroke={colors[index % colors.length]}
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

export const AreaChartComponent = ({ data, dataKeys, xAxisKey = 'date', height = 300, colors = COLORS }) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <defs>
          {dataKeys.map((key, index) => (
            <linearGradient key={key} id={`color${key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colors[index % colors.length]} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={colors[index % colors.length]} stopOpacity={0.1}/>
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey={xAxisKey} stroke="#6b7280" />
        <YAxis stroke="#6b7280" />
        <Tooltip 
          contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
        />
        <Legend />
        {dataKeys.map((key, index) => (
          <Area
            key={key}
            type="monotone"
            dataKey={key}
            stroke={colors[index % colors.length]}
            fillOpacity={1}
            fill={`url(#color${key})`}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
};

export const BarChartComponent = ({ data, dataKeys, xAxisKey = 'name', height = 300, colors = COLORS }) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey={xAxisKey} stroke="#6b7280" />
        <YAxis stroke="#6b7280" />
        <Tooltip 
          contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
        />
        <Legend />
        {dataKeys.map((key, index) => (
          <Bar 
            key={key} 
            dataKey={key} 
            fill={colors[index % colors.length]}
            radius={[8, 8, 0, 0]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};

export const PieChartComponent = ({ data, dataKey = 'value', nameKey = 'name', height = 300, colors = COLORS }) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey={dataKey}
          nameKey={nameKey}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export const FunnelChart = ({ data }) => {
  const maxValue = Math.max(...data.map(d => d.value));
  
  return (
    <div className="space-y-2">
      {data.map((item, index) => {
        const percentage = (item.value / maxValue) * 100;
        return (
          <div key={index} className="relative">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">{item.name}</span>
              <span className="text-sm font-bold text-gray-900">{item.value}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-8 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 flex items-center justify-end px-3 text-white text-sm font-medium`}
                style={{
                  width: `${percentage}%`,
                  backgroundColor: COLORS[index % COLORS.length],
                }}
              >
                {percentage > 20 && `${percentage.toFixed(0)}%`}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
