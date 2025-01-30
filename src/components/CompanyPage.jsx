import { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import axios from 'axios';

export default function CompanyPage() {
  const { symbol } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [companyData, setCompanyData] = useState(null);
  const [balanceSheetData, setBalanceSheetData] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState(0);
  const [expandedSections, setExpandedSections] = useState({
    assets: true,
    liabilities: true,
    equity: true
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (location.state?.companyData) {
          setCompanyData(location.state.companyData);
        }
        
        // Replace YOUR_API_KEY with actual key
        const response = await axios.get(
          `https://financialmodelingprep.com/api/v3/balance-sheet-statement/${symbol}?period=quarter&apikey=25kbLf0l2JETaxIybKzw6EQ8cD3UQQFz`
        );
        setBalanceSheetData(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [symbol, location.state]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const formatValue = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(value);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  const currentReport = balanceSheetData[selectedPeriod] || {};

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Search
        </button>

        {/* Company Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {companyData?.name}
          </h1>
          <div className="flex flex-wrap gap-3">
            <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-medium">
              {companyData?.symbol}
            </span>
            <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
              {companyData?.region}
            </span>
            <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
              {companyData?.currency}
            </span>
          </div>
        </div>

        {/* Balance Sheet Section */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Balance Sheet</h2>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(Number(e.target.value))}
              className="rounded-lg border-gray-300 text-sm"
            >
              {balanceSheetData.map((report, index) => (
                <option key={report.date} value={index}>
                  {new Date(report.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </option>
              ))}
            </select>
          </div>

          {/* Assets Section */}
          <div className="mb-6">
            <button
              onClick={() => toggleSection('assets')}
              className="w-full flex justify-between items-center py-2 px-4 bg-gray-50 rounded-lg hover:bg-gray-100"
            >
              <span className="font-semibold text-gray-900">Assets</span>
              {expandedSections.assets ? <ChevronUp /> : <ChevronDown />}
            </button>
            {expandedSections.assets && (
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600">Total Assets</p>
                    <p className="text-lg font-semibold text-blue-900">
                      {formatValue(currentReport.totalAssets)}
                    </p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600">Current Assets</p>
                    <p className="text-lg font-semibold text-blue-900">
                      {formatValue(currentReport.totalCurrentAssets)}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Cash & Equivalents</span>
                    <span className="font-medium">{formatValue(currentReport.cashAndCashEquivalents)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Short Term Investments</span>
                    <span className="font-medium">{formatValue(currentReport.shortTermInvestments)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Net Receivables</span>
                    <span className="font-medium">{formatValue(currentReport.netReceivables)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Inventory</span>
                    <span className="font-medium">{formatValue(currentReport.inventory)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Liabilities Section */}
          <div className="mb-6">
            <button
              onClick={() => toggleSection('liabilities')}
              className="w-full flex justify-between items-center py-2 px-4 bg-gray-50 rounded-lg hover:bg-gray-100"
            >
              <span className="font-semibold text-gray-900">Liabilities</span>
              {expandedSections.liabilities ? <ChevronUp /> : <ChevronDown />}
            </button>
            {expandedSections.liabilities && (
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600">Total Liabilities</p>
                    <p className="text-lg font-semibold text-blue-900">
                      {formatValue(currentReport.totalLiabilities)}
                    </p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600">Current Liabilities</p>
                    <p className="text-lg font-semibold text-blue-900">
                      {formatValue(currentReport.totalCurrentLiabilities)}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Accounts Payable</span>
                    <span className="font-medium">{formatValue(currentReport.accountPayables)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Short Term Debt</span>
                    <span className="font-medium">{formatValue(currentReport.shortTermDebt)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Long Term Debt</span>
                    <span className="font-medium">{formatValue(currentReport.longTermDebt)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Equity Section */}
          <div>
            <button
              onClick={() => toggleSection('equity')}
              className="w-full flex justify-between items-center py-2 px-4 bg-gray-50 rounded-lg hover:bg-gray-100"
            >
              <span className="font-semibold text-gray-900">Shareholders' Equity</span>
              {expandedSections.equity ? <ChevronUp /> : <ChevronDown />}
            </button>
            {expandedSections.equity && (
              <div className="mt-4 space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">Total Shareholders' Equity</p>
                  <p className="text-lg font-semibold text-blue-900">
                    {formatValue(currentReport.totalStockholdersEquity)}
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Common Stock</span>
                    <span className="font-medium">{formatValue(currentReport.commonStock)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Retained Earnings</span>
                    <span className="font-medium">{formatValue(currentReport.retainedEarnings)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}