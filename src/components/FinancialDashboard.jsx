import React, { useState, useEffect, useMemo } from 'react';
import { 
  LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart,
  Scatter, ReferenceLine, RadarChart, PolarGrid, PolarAngleAxis, 
  PolarRadiusAxis, Radar, PieChart, Pie, Cell, RadialBarChart, RadialBar,
  Treemap
} from 'recharts';
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';

const COLORS = {
  primary: '#2563eb',
  secondary: '#6366f1',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#dc2626',
  purple: '#6366f1',
  cyan: '#06b6d4',
  pink: '#ec4899',
};

const TIME_PERIODS = [
  { label: '1M', months: 1 },
  { label: '3M', months: 3 },
  { label: '6M', months: 6 },
  { label: '1Y', months: 12 },
  { label: 'ALL', months: 999 }
];

const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-lg shadow-sm ${className}`}>
    {children}
  </div>
);

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
  return sortedData.slice(0, months);
};

const ChartCard = ({ title, data, type = 'line', color = COLORS.primary, height = 300, customRender }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [timePeriod, setTimePeriod] = useState('1Y');
  
  const filteredData = useMemo(() => 
    filterDataByTime(data, timePeriod), 
    [data, timePeriod]
  );

  const renderChart = () => {
    const commonProps = {
      data: filteredData,
      margin: { top: 10, right: 30, left: 20, bottom: 0 },
    };


    // If customRender is provided, use it
    if (customRender) {
      return customRender(filteredData, isExpanded);
    }

    switch (type) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis dataKey="date" angle={-45} textAnchor="end" height={60} />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={color} 
              strokeWidth={2}
              dot={isExpanded}
              name={title}
            />
          </LineChart>
        );
      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis dataKey="date" angle={-45} textAnchor="end" height={60} />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="value" fill={color} name={title} />
          </BarChart>
        );
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis dataKey="date" angle={-45} textAnchor="end" height={60} />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area
              type="monotone"
              dataKey="value"
              fill={color}
              stroke={color}
              fillOpacity={0.3}
              name={title}
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
              stroke={color}
              fill={color}
              fillOpacity={0.6}
              name={title}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
          </RadarChart>
        );

      case 'radialBar':
        return (
          <RadialBarChart
            {...commonProps}
            innerRadius="30%"
            outerRadius="100%"
            barSize={10}
            startAngle={180}
            endAngle={0}
          >
            <RadialBar
              dataKey="value"
              fill={color}
              name={title}
              label={{ position: 'insideStart', fill: '#fff' }}
            />
            <Legend />
            <Tooltip content={<CustomTooltip />} />
          </RadialBarChart>
        );

      

      case 'pie':
        return (
          <PieChart {...commonProps}>
            <Pie
              data={filteredData}
              dataKey="value"
              nameKey="date"
              cx="50%"
              cy="50%"
              fill={color}
              label
            >
              {filteredData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[Object.keys(COLORS)[index % Object.keys(COLORS).length]]} 
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend />
          </PieChart>
        );

      case 'treemap':
        return (
          <Treemap
            data={filteredData.map(item => ({
              name: item.date,
              size: item.value,
            }))}
            dataKey="size"
            stroke="#fff"
            fill={color}
          >
            <Tooltip content={<CustomTooltip />} />
          </Treemap>
        );
        
      case 'composed':
        return (
          <ComposedChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis dataKey="date" angle={-45} textAnchor="end" height={60} />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="value" fill={color} name={title} />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={color} 
              strokeWidth={2}
              dot={isExpanded}
              name={`${title} Trend`}
            />
          </ComposedChart>
        );
      
      default:
        return null;
    }
  };

  const getGrowthRate = () => {
    if (!filteredData || filteredData.length < 2) return 0;
    
    // Handle both standard and custom data structures
    const getValue = (item) => {
      if (item.value !== undefined) return item.value;
      if (item.metric1 !== undefined) return item.metric1;
      return 0;
    };

    const latest = getValue(filteredData[filteredData.length - 1]);
    const previous = getValue(filteredData[filteredData.length - 2]);
    return previous !== 0 ? ((latest - previous) / previous) * 100 : 0;
  };

  const growthRate = getGrowthRate();

  return (
    <Card className={`transition-all duration-300 ${isExpanded ? 'col-span-full' : ''}`}>
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <div className={`flex items-center text-sm ${growthRate >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {growthRate >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              <span className="ml-1">{Math.abs(growthRate).toFixed(2)}% vs previous period</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <TimeFilter selectedPeriod={timePeriod} onChange={setTimePeriod} />
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
          </div>
        </div>
        <div style={{ height: isExpanded ? 500 : height }} className="transition-all duration-300">
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
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
          body: JSON.stringify({ stockName: symbol }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('API Response:', data);
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
        type: 'area',
        color: COLORS.primary
      },
      {
        title: 'Net Profit',
        data: transformData(stockData.data.profit_loss, 'Net Profit+'),
        type: 'line',
        color: COLORS.success
      },
      {
        title: 'Operating Profit',
        data: transformData(stockData.data.profit_loss, 'Operating Profit'),
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
        type: 'line',
        color: COLORS.primary
      },
      {
        title: 'Investments',
        data: transformData(stockData.data.balance_sheet, 'Investments'),
        type: 'area',
        color: COLORS.success
      },
      {
        title: 'Total Liabilities',
        data: transformData(stockData.data.balance_sheet, 'Total Liabilities'),
        type: 'line',
        color: COLORS.danger
      },
      {
        title: 'Capital Work in Progress',
        data: transformData(stockData.data.balance_sheet, 'CWIP'),
        type: 'bar',
        color: COLORS.purple
      },
      {
        title: 'Fixed Assets Growth',
        data: transformData(stockData.data.balance_sheet, 'Fixed Assets+'),
        type: 'composed',
        color: COLORS.pink
      },
      {
        title: 'Other Assets',
        data: transformData(stockData.data.balance_sheet, 'Other Assets+'),
        type: 'area',
        color: COLORS.cyan
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
        type: 'radar',
        color: COLORS.purple
      },
      {
        title: 'Net Cash Flow',
        data: transformData(stockData.data.cash_flow, 'Net Cash Flow'),
        type: 'treemap',
        color: COLORS.primary
      }
    ];
  }, [stockData]);


  const comparisonMetrics = useMemo(() => {
    if (!stockData?.data?.profit_loss || !stockData?.data?.balance_sheet) return [];

    // Function to calculate year-over-year growth
    const calculateGrowth = (data) => {
        return data.map((item, index, arr) => ({
            date: item.date,
            value: index > 0 ? ((item.value - arr[index-1].value) / arr[index-1].value) * 100 : 0,
            originalValue: item.value
        }));
    };

    // Function to combine multiple metrics
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
        
        // Create a map of dates to sales values
        const salesMap = new Map(sales.map(item => [item.date, item.value]));
        
        return assets
            .filter(item => item && item.value && salesMap.get(item.date))
            .map(item => ({
                date: item.date,
                value: salesMap.get(item.date) ? (salesMap.get(item.date) / item.value) * 100 : 0
            }))
            .filter(item => !isNaN(item.value));
    };

    // Function to calculate ratios
    const calculateRatio = (numerator, denominator) => {
      const num = transformData(stockData.data.profit_loss, numerator) || [];
      const den = transformData(stockData.data.profit_loss, denominator) || [];
      
      // Create a map of dates to denominator values for easy lookup
      const denMap = new Map(den.map(item => [item.date, item.value]));
      
      return num
          .filter(item => item && item.value !== undefined && denMap.get(item.date))
          .map(item => ({
              date: item.date,
              value: denMap.get(item.date) ? (item.value / denMap.get(item.date)) * 100 : 0
          }))
          .filter(item => !isNaN(item.value));
  };

  return [
    {
        title: 'Profitability Comparison',
        data: combineMetrics('Operating Profit', 'Net Profit+'),
        render: (data, isExpanded) => (
            <ComposedChart height={isExpanded ? 500 : 300} data={data}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="date" angle={-45} textAnchor="end" height={60} />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="metric1" fill={COLORS.primary} name="Operating Profit" />
                <Line type="monotone" dataKey="metric2" stroke={COLORS.success} name="Net Profit" strokeWidth={2} />
                <ReferenceLine y={0} stroke="#666" />
            </ComposedChart>
        )
    },
    {
        title: 'Revenue vs Expenses Growth',
        data: combineMetrics('Sales+', 'Expenses+'),
        render: (data, isExpanded) => (
            <ComposedChart height={isExpanded ? 500 : 300} data={data}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="date" angle={-45} textAnchor="end" height={60} />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area type="monotone" dataKey="metric1" fill={COLORS.success} stroke={COLORS.success} name="Revenue" fillOpacity={0.3} />
                <Area type="monotone" dataKey="metric2" fill={COLORS.danger} stroke={COLORS.danger} name="Expenses" fillOpacity={0.3} />
            </ComposedChart>
        )
    },
    {
      title: 'Asset Utilization',
      data: calculateAssetUtilization(),
      render: (data, isExpanded) => (
          <ComposedChart height={isExpanded ? 500 : 300} data={data}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="date" angle={-45} textAnchor="end" height={60} />
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
      <div className="w-full h-96 flex items-center justify-center bg-white rounded-lg shadow-sm">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="text-gray-600">Loading financial data...</p>
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
      <section>
        <h2 className="text-2xl font-bold mb-4">Profit & Loss Analysis</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {profitLossMetrics.map((metric) => (
            <ChartCard key={metric.title} {...metric} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Balance Sheet Analysis</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {balanceSheetMetrics.map((metric) => (
            <ChartCard key={metric.title} {...metric} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Balance Sheet Analysis</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cashFlowMetrics.map((metric) => (
            <ChartCard key={metric.title} {...metric} />
          ))}
        </div>
      </section>

      <section>
            <h2 className="text-2xl font-bold mb-4">Financial Analysis & Comparisons</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {comparisonMetrics.map((metric, index) => (
                    <ChartCard
                        key={index}
                        title={metric.title}
                        data={metric.data}
                        type="custom"
                        customRender={metric.render}
                    />
                ))}
            </div>
        </section>

    </div>
  );
};

export default FinancialDashboard;