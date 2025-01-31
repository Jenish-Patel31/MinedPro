import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Lottie from 'lottie-react';
import loadingAnimation from '../assets/loading.json';
import FinancialDashboard from '../components/FinancialDashboard';
import {
  ArrowLeft,
  BarChart,
  Wallet,
  PieChart,
  Banknote,
  CalendarDays,
  Clock,
  Loader2,
  DollarSign,
  LayoutDashboard
} from 'lucide-react';

const LoadingAnimation = () => {
  return (
    <div className="w-64 h-64"> {/* Adjust size as needed */}
      <Lottie
        animationData={loadingAnimation}
        loop={true}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};

export default function CompanyPage() {
  const { symbol } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [companyData, setCompanyData] = useState(null);

  // Icons for different sections
  const sectionIcons = {
    core_financials: <BarChart className="w-6 h-6 mr-3 text-blue-500" />,
    per_share_metrics: <Wallet className="w-6 h-6 mr-3 text-green-500" />,
    key_components: <PieChart className="w-6 h-6 mr-3 text-purple-500" />,
    balance_sheet: <Banknote className="w-6 h-6 mr-3 text-orange-500" />
  };

  // Section titles
  const sectionTitles = {
    core_financials: "Core Financials",
    per_share_metrics: "Per Share Metrics",
    key_components: "Key Components",
    balance_sheet: "Balance Sheet"
  };

  useEffect(() => {
    const fetchCompanyData = async () => {
      setLoading(true);
      setError(null);

      try {
        const stockName = location.state?.companyData?.url
          ?.split('/')
          ?.filter(Boolean)[1] || symbol;

        const response = await fetch('https://new-reat.onrender.com/api/analyze-stock', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ stockName }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setCompanyData(data);
      } catch (err) {
        console.error("Error fetching company data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyData();
  }, [symbol, location.state]);

  // Format values with proper units
  const formatValue = (value, unit) => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'number') {
      if (unit?.includes('Crores')) {
        return `₹${value.toLocaleString('en-IN')} Cr`;
      }
      if (unit === '%') {
        return `${value.toFixed(2)}%`;
      }
      if (unit === 'INR') {
        return `₹${value.toFixed(2)}`;
      }
      return value.toLocaleString('en-IN');
    }
    return value;
  };

  const renderMetricsSection = (sectionKey, metrics) => {
    if (!metrics) return null;
  
    // Filter out metrics with null values
    const validMetrics = Object.entries(metrics).filter(([_, metric]) => {
      return metric.value !== null && metric.value !== undefined;
    });
  
    if (validMetrics.length === 0) return null;
  
    return (
      <div key={sectionKey} className="bg-white rounded-2xl shadow-lg p-8 mb-8">
        <div className="flex items-center mb-6">
          {sectionIcons[sectionKey]}
          <h2 className="text-2xl font-bold text-gray-900">
            {sectionTitles[sectionKey]}
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {validMetrics.map(([metricKey, metric]) => (
            <div
              key={`${sectionKey}-${metricKey}`}
              className="bg-gray-50 rounded-xl p-5 hover:bg-gray-100 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div className="w-full">
                  <h4 className="font-medium text-gray-700 mb-1 capitalize">
                    {metricKey.replace(/_/g, ' ')}
                  </h4>
                  <div className="flex justify-between items-baseline">
                    <p className="text-2xl font-semibold text-gray-900">
                      {formatValue(metric.value, metric.unit)}
                    </p>
                    {metric.unit && metric.unit !== 'INR in Crores' && (
                      <span className="text-sm text-gray-500 ml-2">
                        {metric.unit}
                      </span>
                    )}
                  </div>
                  {/* Add trend or comparison if available */}
                  {metric.value && metric.unit === '%' && (
                    <div className="mt-3">
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-400 to-blue-600"
                          style={{ width: `${Math.min(Math.abs(metric.value), 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <LoadingAnimation />
        <h2 className="text-lg text-gray-600 mt-4">Loading company data...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Data</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!companyData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-700">No data available</h2>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
        >
          <ArrowLeft className="h-6 w-6" />
          <span className="text-lg font-medium">Back to Search</span>
        </button>
  
        {/* Company Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-blue-100">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {companyData.stock_name}
                {symbol && (
                  <span className="ml-4 text-2xl font-semibold text-blue-600 bg-blue-50 px-4 py-1 rounded-full">
                    {symbol}
                  </span>
                )}
              </h1>
              <div className="flex flex-wrap gap-3">
                {companyData.quarter && (
                  <span className="px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium flex items-center">
                    <CalendarDays className="w-4 h-4 mr-2" />
                    {companyData.quarter}
                  </span>
                )}
                {companyData.date && (
                  <span className="px-4 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    {new Date(companyData.date).toLocaleDateString()}
                  </span>
                )}
                <span className="px-4 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm flex items-center">
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Quarterly Results
                </span>
              </div>
            </div>
          </div>
        </div>
  
        {/* Metrics Sections */}
        {Object.entries(companyData.metrics).map(([sectionKey, metrics]) => (
          <div key={sectionKey}>
            {renderMetricsSection(sectionKey, metrics)}
          </div>
        ))}

        
        <div className="mb-8">
          <FinancialDashboard symbol={companyData.stock_name} />
        </div>

      </div>
    </div>
  );
}