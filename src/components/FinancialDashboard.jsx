import React, { useState, useEffect, useMemo } from 'react';
import { 
  LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart,
  Scatter, ReferenceLine, RadarChart, PolarGrid, PolarAngleAxis, 
  PolarRadiusAxis, Radar, PieChart, Pie, Cell, RadialBarChart, RadialBar,
  Treemap
} from 'recharts';
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';

// const COLORS = {
//   primary: '#2563eb',
//   secondary: '#6366f1',
//   success: '#10b981',
//   warning: '#f59e0b',
//   danger: '#dc2626',
//   purple: '#6366f1',
//   cyan: '#06b6d4',
//   pink: '#ec4899',
// };

const COLORS = {
  primary: '#9cbbff',
  secondary: '#9cbbff',
  success: '#9cbbff',
  warning: '#9cbbff',
  danger: '#9cbbff',
  purple: '#9cbbff',
  cyan: '#9cbbff',
  pink: '#9cbbff',
};

const TIME_PERIODS = [
  { label: '1M', months: 1 },
  { label: '3M', months: 3 },
  { label: '6M', months: 6 },
  { label: '1Y', months: 12 },
  { label: 'ALL', months: 999 }
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 shadow-lg rounded-lg border">
        <p className="font-medium">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: ₹{Number(entry.value).toLocaleString('en-IN')}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const TimeFilter = ({ selectedPeriod, onChange }) => (
  <div className="flex space-x-2 bg-gray-50 rounded-lg p-1">
    {TIME_PERIODS.map(({ label }) => (
      <button
        key={label}
        onClick={() => onChange(label)}
        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors
          ${selectedPeriod === label 
            ? 'bg-blue-600 text-white' 
            : 'text-gray-600 hover:bg-gray-200'}`}
      >
        {label}
      </button>
    ))}
  </div>
);

const filterDataByTime = (data, period) => {
  if (!data || !data.length) return [];
  
  const months = TIME_PERIODS.find(p => p.label === period)?.months || 12;
  if (months === 999) return data;

  const sortedData = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));
  return sortedData.slice(-months);
};

const MiniChart = ({ data, type, color, title }) => {
  const chartHeight = 50;
  const chartWidth = 120;

  const CustomMiniBar = (props) => {
    const { x, y, width, height, value } = props;
    const fill = value < 0 ? '#ef4444' : color;
    const yPos = value >= 0 ? y : y + height;
    const barHeight = Math.abs(height);
    
    return <rect x={x} y={yPos} width={width} height={barHeight} fill={fill} />;
  };

  const renderMiniChart = () => {
    const commonProps = {
      data,
      width: chartWidth,
      height: chartHeight
    };

    // Special handling for combined metrics
    if (data && data[0] && ('metric1' in data[0] || 'metric2' in data[0])) {
      if (title === 'Profitability Comparison') {
        return (
          <ComposedChart {...commonProps}>
            <Bar 
              dataKey="metric1" 
              fill={COLORS.primary} 
              strokeWidth={0}
              barSize={4}
            />
            <Line 
              type="monotone" 
              dataKey="metric2" 
              stroke={COLORS.success} 
              dot={false}
              strokeWidth={1.5}
            />
          </ComposedChart>
        );
      }
      return (
        <ComposedChart {...commonProps}>
          <Area 
            type="monotone" 
            dataKey="metric1" 
            fill={COLORS.success} 
            stroke={COLORS.success} 
            fillOpacity={0.3}
          />
          <Area 
            type="monotone" 
            dataKey="metric2" 
            fill={COLORS.danger} 
            stroke={COLORS.danger} 
            fillOpacity={0.3}
          />
        </ComposedChart>
      );
    }

    switch (type) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={color} 
              dot={false} 
              strokeWidth={2}
            />
          </LineChart>
        );
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <Area 
              type="monotone" 
              dataKey="value" 
              fill={color} 
              stroke={color} 
              fillOpacity={0.3} 
            />
          </AreaChart>
        );
        case 'bar':
          return (
            <BarChart {...commonProps}>
              <Bar 
                dataKey="value" 
                shape={<CustomMiniBar />}
              />
            </BarChart>
          );
      case 'composed':
        return (
          <ComposedChart {...commonProps}>
            <Bar dataKey="value" fill={color} />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={color} 
              dot={false} 
              strokeWidth={2}
            />
          </ComposedChart>
        );
      default:
        return (
          <LineChart {...commonProps}>
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={color} 
              dot={false} 
              strokeWidth={2}
            />
          </LineChart>
        );
    }
  };

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <div className="text-gray-400 text-xs">No data</div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center">
      {renderMiniChart()}
    </div>
  );
};

const renderExpandedChart = (metric, data) => {
  const commonProps = {
    data,
    margin: { top: 10, right: 30, left: 20, bottom: 0 }
  };

  
  if (metric.customRender) {
    return metric.customRender(data);
  }

  const CustomBar = (props) => {
    const { x, y, width, height, value } = props;
    const fill = value < 0 ? '#ef4444' : metric.color; // Red for negative values
    const yPos = value >= 0 ? y : y + height;
    const barHeight = Math.abs(height);
    
    return <rect x={x} y={yPos} width={width} height={barHeight} fill={fill} />;
  };

  switch (metric.type) {
    case 'line':
      return (
        <LineChart {...commonProps}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line type="monotone" dataKey="value" stroke={metric.color} name={metric.title} />
        </LineChart>
      );
      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar 
              dataKey="value" 
              name={metric.title}
              shape={<CustomBar />}
            />
          </BarChart>
        );
    case 'area':
      return (
        <AreaChart {...commonProps}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Area 
            type="monotone" 
            dataKey="value" 
            fill={metric.color} 
            stroke={metric.color} 
            name={metric.title} 
          />
        </AreaChart>
      );
    case 'radar':
      return (
        <RadarChart {...commonProps} outerRadius={90}>
          <PolarGrid />
          <PolarAngleAxis dataKey="date" />
          <PolarRadiusAxis />
          <Radar 
            dataKey="value" 
            stroke={metric.color} 
            fill={metric.color} 
            fillOpacity={0.6} 
            name={metric.title} 
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
        </RadarChart>
      );
    case 'treemap':
      return (
        <Treemap
          data={data.map(item => ({
            name: item.date,
            size: item.value,
          }))}
          dataKey="size"
          stroke="#fff"
          fill={metric.color}
        >
          <Tooltip content={<CustomTooltip />} />
        </Treemap>
      );
    default:
      return (
        <ComposedChart {...commonProps}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar dataKey="value" fill={metric.color} name={metric.title} />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke={metric.color} 
            name={`${metric.title} Trend`} 
          />
        </ComposedChart>
      );
  }
};

const MetricsList = ({ metrics, sectionTitle }) => {
  const [expandedItem, setExpandedItem] = useState(null);
  const [timePeriod, setTimePeriod] = useState('1Y');

  const toggleExpanded = (index) => {
    setExpandedItem(expandedItem === index ? null : index);
  };

  const getGrowthRate = (data) => {
    if (!data || data.length < 2) return 0;
    
    const getValue = (item) => {
      if (item.metric1 !== undefined) return item.metric1;
      if (item.value !== undefined) return item.value;
      return 0;
    };

    const latest = getValue(data[data.length - 1]);
    const previous = getValue(data[data.length - 2]);
    return previous !== 0 ? ((latest - previous) / previous) * 100 : 0;
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold">{sectionTitle}</h2>
      </div>
      <div className="divide-y">
        {metrics.map((metric, index) => {
          const isExpanded = expandedItem === index;
          const filteredData = filterDataByTime(metric.data || [], timePeriod);
          const growthRate = getGrowthRate(filteredData);
          
          const latestValue = filteredData[filteredData.length - 1]?.metric1 || 
                             filteredData[filteredData.length - 1]?.value || 0;
                             
          const avgValue = filteredData.length > 0 
            ? filteredData.reduce((acc, curr) => {
                const val = curr.metric1 !== undefined ? curr.metric1 : curr.value;
                return acc + (val || 0);
              }, 0) / filteredData.length 
            : 0;

          return (
            <div key={metric.title} className="transition-all duration-300">
              <div 
                onClick={() => toggleExpanded(index)}
                className="p-4 hover:bg-gray-50 cursor-pointer grid grid-cols-12 items-center gap-4"
              >
                <div className="col-span-3">
                  <h3 className="font-semibold">{metric.title}</h3>
                  <div className={`flex items-center text-sm ${growthRate >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {growthRate >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                    <span className="ml-1">{Math.abs(growthRate).toFixed(2)}%</span>
                  </div>
                </div>
                
                <div className="col-span-2">
                  <MiniChart 
                    data={filteredData.slice(-12)} 
                    type={metric.type} 
                    color={metric.color}
                    title={metric.title}
                  />
                </div>

                <div className="col-span-6">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Latest</p>
                      <p className="font-medium">₹{latestValue.toLocaleString('en-IN', {
                        maximumFractionDigits: 2,
                        minimumFractionDigits: 0
                      })}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Average</p>
                      <p className="font-medium">₹{avgValue.toLocaleString('en-IN', {
                        maximumFractionDigits: 2,
                        minimumFractionDigits: 0
                      })}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">YoY Change</p>
                      <p className="font-medium">{growthRate.toFixed(2)}%</p>
                    </div>
                  </div>
                </div>

                <div className="col-span-1 text-right">
                  {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              </div>

              {isExpanded && (
                <div className="p-4 bg-gray-50">
                  <div className="mb-4 flex justify-end">
                    <TimeFilter selectedPeriod={timePeriod} onChange={setTimePeriod} />
                  </div>
                  <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      {renderExpandedChart(metric, filteredData)}
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const FinancialDashboard = ({ symbol }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stockData, setStockData] = useState(null);

  const transformData = (data, metricName) => {
    if (!data) return [];
    
    const metricRow = data.find(row => row.row_name === metricName || row[''] === metricName);
    if (!metricRow) return [];

    return Object.entries(metricRow)
      .filter(([key]) => key !== '' && key !== 'row_name' && !key.includes('TTM'))
      .map(([date, value]) => ({
        date,
        value: parseFloat(String(value).replace(/,/g, '')) || 0
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!symbol) return;
      
      try {
        setLoading(true);
        const response = await fetch('https://graphhplz.onrender.com/api/stock-data', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          credentials: 'include',  // Add this line
          body: JSON.stringify({ stockName: symbol }),
        });
    
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
    
        const data = await response.json();
        setStockData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [symbol]);

  const profitLossMetrics = useMemo(() => {
    if (!stockData?.data?.profit_loss) return [];
    
    return [
      {
        title: 'Revenue',
        data: transformData(stockData.data.profit_loss, 'Sales+'),
        type: 'bar',
        color: COLORS.primary
      },
      {
        title: 'Net Profit',
        data: transformData(stockData.data.profit_loss, 'Net Profit+'),
        type: 'bar',
        color: COLORS.success
      },
      {
        title: 'Operating Profit',
        data: transformData(stockData.data.profit_loss, 'Operating Profit'),
        type: 'bar',
        color: COLORS.warning
      },
      {
        title: 'Profit Before Tax',
        data: transformData(stockData.data.profit_loss, 'Profit before tax'),
        type: 'bar',
        color: COLORS.warning
      }
    ];
  }, [stockData]);

  const balanceSheetMetrics = useMemo(() => {
    if (!stockData?.data?.balance_sheet) return [];
    
    return [
      { 
        title: 'Total Assets',
        data: transformData(stockData.data.balance_sheet, 'Total Assets'),
        type: 'bar',
        color: COLORS.primary
      },
      {
        title: 'Investments',
        data: transformData(stockData.data.balance_sheet, 'Investments'),
        type: 'bar',
        color: COLORS.success
      },
      {
        title: 'Total Liabilities',
        data: transformData(stockData.data.balance_sheet, 'Total Liabilities'),
        type: 'bar',
        color: COLORS.danger
      },
      {
        title: 'Fixed Assets Growth',
        data: transformData(stockData.data.balance_sheet, 'Fixed Assets+'),
        type: 'composed',
        color: COLORS.pink
      }
    ];
  }, [stockData]);

  const cashFlowMetrics = useMemo(() => {
    if (!stockData?.data?.cash_flow) return [];
    
    return [
      {
        title: 'Operating Cash Flow',
        data: transformData(stockData.data.cash_flow, 'Cash from Operating Activity+'),
        type: 'bar',
        color: COLORS.success
      },
      {
        title: 'Investing Cash Flow',
        data: transformData(stockData.data.cash_flow, 'Cash from Investing Activity+'),
        type: 'bar',
        color: COLORS.warning
      },
      {
        title: 'Financing Cash Flow',
        data: transformData(stockData.data.cash_flow, 'Cash from Financing Activity+'),
        type: 'bar',
        color: COLORS.purple
      },
      {
        title: 'Net Cash Flow',
        data: transformData(stockData.data.cash_flow, 'Net Cash Flow'),
        type: 'bar',
        color: COLORS.primary
      }
    ];
  }, [stockData]);

  const comparisonMetrics = useMemo(() => {
    if (!stockData?.data?.profit_loss || !stockData?.data?.balance_sheet) return [];

    const combineMetrics = (metric1, metric2) => {
      const data1 = transformData(stockData.data.profit_loss, metric1) || [];
      const data2 = transformData(stockData.data.profit_loss, metric2) || [];
      
      return data1.map((item, index) => ({
        date: item.date,
        metric1: item.value || 0,
        metric2: data2[index]?.value || 0
      })).filter(item => item.date && (item.metric1 !== 0 || item.metric2 !== 0));
    };

    const calculateAssetUtilization = () => {
      const sales = transformData(stockData.data.profit_loss, 'Sales+') || [];
      const assets = transformData(stockData.data.balance_sheet, 'Total Assets') || [];
      
      const salesMap = new Map(sales.map(item => [item.date, item.value]));
      
      return assets
        .filter(item => item && item.value && salesMap.get(item.date))
        .map(item => ({
          date: item.date,
          value: salesMap.get(item.date) ? (salesMap.get(item.date) / item.value) * 100 : 0
        }))
        .filter(item => !isNaN(item.value));
    };

    return [
      {
        title: 'Profitability Comparison',
        data: combineMetrics('Operating Profit', 'Net Profit+'),
        type: 'custom',
        color: COLORS.primary,
        customRender: (data) => (
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar 
              dataKey="metric1" 
              fill={COLORS.primary} 
              name="Operating Profit"
              strokeWidth={0}
            />
            <Line 
              type="monotone" 
              dataKey="metric2" 
              stroke={COLORS.success} 
              name="Net Profit" 
              strokeWidth={2}
              dot={false}
            />
          </ComposedChart>
        )
      },
      {
        title: 'Revenue vs Expenses',
        data: combineMetrics('Sales+', 'Expenses+'),
        type: 'custom',
        color: COLORS.success,
        customRender: (data) => (
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="metric1" 
              fill={COLORS.success} 
              stroke={COLORS.success} 
              name="Revenue" 
              fillOpacity={0.3}
            />
            <Area 
              type="monotone" 
              dataKey="metric2" 
              fill={COLORS.danger} 
              stroke={COLORS.danger} 
              name="Expenses" 
              fillOpacity={0.3}
            />
          </ComposedChart>
        )
      },
      {
        title: 'Asset Utilization',
        data: calculateAssetUtilization(),
        type: 'custom',
        color: COLORS.cyan,
        customRender: (data) => (
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="value" fill={COLORS.cyan} name="Asset Turnover Ratio" />
            <Line type="monotone" dataKey="value" stroke={COLORS.cyan} name="Trend" strokeWidth={2} />
          </ComposedChart>
        )
      }
    ];
  }, [stockData]);

  if (loading) {
    return (
      <div className="w-full h-96 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="text-gray-600">Loading financial analysis...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Error Loading Data</h3>
          <p className="text-red-600 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (!stockData) return null;

  return (
    <div className="space-y-8">
      {profitLossMetrics.length > 0 && (
        <MetricsList metrics={profitLossMetrics} sectionTitle="Profit & Loss Analysis" />
      )}
      {balanceSheetMetrics.length > 0 && (
        <MetricsList metrics={balanceSheetMetrics} sectionTitle="Balance Sheet Analysis" />
      )}
      {cashFlowMetrics.length > 0 && (
        <MetricsList metrics={cashFlowMetrics} sectionTitle="Cash Flow Analysis" />
      )}
      {comparisonMetrics.length > 0 && (
        <MetricsList metrics={comparisonMetrics} sectionTitle="Financial Analysis & Comparisons" />
      )}
    </div>
  );
};

export default FinancialDashboard;