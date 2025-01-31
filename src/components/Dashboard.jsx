import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase-config';
import { signOut } from 'firebase/auth';
import Lottie from 'lottie-react';
import loadingAnimation from '../assets/loading.json';
import {
  Search,
  UserCircle,
  Settings,
  LogOut,
  Bell,
  ChevronDown,
  ExternalLink,
  FileText,
  TrendingUp,
  BarChart3,
  ArrowRight,
  ChevronRight
} from 'lucide-react';

const LoadingAnimation = () => {
  return (
    <div className="w-5 h-5">
      <Lottie
        animationData={loadingAnimation}
        loop={true}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function Dashboard() {
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPhoto, setUserPhoto] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  const debouncedSearchTerm = useDebounce(searchQuery, 500);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserName(user.displayName || 'User');
        setUserEmail(user.email);
        setUserPhoto(user.photoURL || '');
        
        if (!user.displayName) {
          user.updateProfile({
            displayName: user.email.split('@')[0]
          }).catch(error => console.error('Error updating profile:', error));
        }
      } else {
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const searchStocks = async () => {
      if (!debouncedSearchTerm || debouncedSearchTerm.length < 2) {
        setSearchResults([]);
        setError('');
        return;
      }

      setIsLoading(true);
      setError('');

      try {
        const response = await fetch(`/api/screener/api/company/search/?q=${encodeURIComponent(debouncedSearchTerm)}&v=3&fts=1`);
        
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        
        const data = await response.json();
        
        if (Array.isArray(data)) {
          const filteredResults = data.filter(item => item.id !== null);
          
          const formattedResults = filteredResults.map(company => ({
            symbol: company.url.replace('/company/', '').replace('/', ''),
            name: company.name,
            id: company.id,
            url: company.url
          }));
          
          setSearchResults(formattedResults);
          
          if (formattedResults.length === 0) {
            setError('No stocks found matching your search');
          }
        } else {
          setSearchResults([]);
          setError('Invalid response format');
        }
      } catch (error) {
        console.error('Error fetching stocks:', error);
        setError('Failed to fetch results. Please try again.');
        setSearchResults([]);
      }
      setIsLoading(false);
    };

    searchStocks();
  }, [debouncedSearchTerm]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleCompanyClick = (company) => {
    navigate(`/company/${company.symbol}`, { state: { companyData: company } });
  };

  const handleStreamlitRedirect = () => {
    window.open('http://localhost:8501', '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-white">
      {/* Navigation Bar */}
      <nav className="bg-white/20 backdrop-blur-lg sticky top-0 z-50 border-b border-white shadow-lg shadow-neutral-800/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-blue-900 bg-clip-text text-transparent">
                StockPro
              </span>
            </div>

            {/* Right Navigation Items */}
            <div className="flex items-center space-x-6">
              {/* Notifications */}
              <button 
                className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-blue-50 transition-all duration-200"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
              </button>

              {/* Profile Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-3 focus:outline-none hover:bg-blue-50 rounded-full px-3 py-2 transition-all duration-200"
                >
                  {userPhoto ? (
                    <img
                      className="h-8 w-8 rounded-full object-cover ring-2 ring-white shadow-sm"
                      src={userPhoto}
                      alt={userName}
                    />
                  ) : (
                    <UserCircle className="h-8 w-8 text-blue-600" />
                  )}
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-gray-900">{userName}</p>
                    <p className="text-xs text-gray-500">{userEmail}</p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-4 w-64 rounded-2xl shadow-lg bg-sky-100/5 ring-1 ring-white ring-opacity-5 p-2">
                    
                    <div className="p-1">
                      <button className="w-full px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-xl flex items-center transition-all duration-200">
                        <Settings className="h-4 w-4 mr-3" />
                        Settings
                      </button>
                      <button
                        onClick={handleSignOut}
                        className="w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl flex items-center transition-all duration-200"
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-3xl mx-auto space-y-16">
          {/* Search Section */}
          <div>
            <h1 className="text-4xl font-bold text-center mb-4 bg-gradient-to-r from-blue-700 to-blue-900 bg-clip-text text-transparent">
              Indian Stock Market Analytics
            </h1>
            <p className="text-gray-600 text-center text-lg mb-8">
              Access real-time market data and comprehensive financial analysis
            </p>

            {/* Search Bar */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                {isLoading ? (
                  <LoadingAnimation />
                ) : (
                  <Search className="h-5 w-5 text-blue-600" />
                )}
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearch}
                className="block w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl bg-white/50 backdrop-blur-sm text-gray-900 text-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm hover:border-blue-300"
                placeholder="Search stocks by company name or symbol..."
              />

              {/* Search Results */}
              {(searchQuery || error) && (
                <div className="absolute w-full mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-10">
                  {error ? (
                    <div className="p-4 text-center text-gray-500">{error}</div>
                  ) : searchResults.length > 0 ? (
                    <div className="max-h-96 overflow-y-auto">
                      {searchResults.map((company) => (
                        <button
                          key={company.id}
                          onClick={() => handleCompanyClick(company)}
                          className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center justify-between group transition-all duration-200"
                        >
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600">
                                {company.name}
                              </p>
                              <span className="text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                                {company.symbol}
                              </span>
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 ml-2" />
                        </button>
                      ))}
                    </div>
                  ) : searchQuery.length < 2 ? (
                    <div className="p-4 text-center text-gray-500">
                      Type at least 2 characters to search
                    </div>
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      No results found
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Financial Analysis Tool Card */}
            <button
              onClick={handleStreamlitRedirect}
              className="group p-6 bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-200 transition-all duration-200 text-left"
            >
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors duration-200">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Financial Report Analysis</h3>
                  <p className="text-gray-600">Upload and analyze quarterly reports with AI-powered insights</p>
                </div>
              </div>
            </button>

            {/* Market Analysis Card */}
            <button className="group p-6 bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-200 transition-all duration-200 text-left">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors duration-200">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Market Analytics</h3>
                  <p className="text-gray-600">Track market trends and get real-time stock performance insights</p>
                </div>
              </div>
            </button>
          </div>

          {/* Market Overview */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Market Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {['NIFTY 50', 'SENSEX', 'BANK NIFTY'].map((index, i) => (
                <div key={index} className="p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-200 transition-all duration-200">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-sm font-medium text-gray-500">{index}</span>
                    <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                      +{(1.2 + i * 0.3).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl font-bold text-gray-900">
                      {(19425.12 + i * 1000).toFixed(2)}
                    </span>
                    <span className="text-sm text-gray-500">INR</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button className="flex items-center justify-between p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-all duration-200 group">
                <div className="flex items-center space-x-3">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-gray-900 group-hover:text-blue-700">View Portfolio</span>
                </div>
                <ArrowRight className="h-5 w-5 text-blue-600" />
              </button>
              
              <button className="flex items-center justify-between p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-all duration-200 group">
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-gray-900 group-hover:text-blue-700">Market Reports</span>
                </div>
                <ArrowRight className="h-5 w-5 text-blue-600" />
              </button>
            </div>
          </div>

          {/* Latest Market News */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Latest Market News</h2>
            <div className="space-y-4">
              {[
                {
                  title: "Q3 Results Impact Analysis",
                  time: "2h ago",
                  description: "Comprehensive analysis of the latest quarterly results from top Indian companies"
                },
                {
                  title: "Market Sentiment Update",
                  time: "4h ago",
                  description: "Current market trends and investor sentiment analysis for Indian markets"
                },
                {
                  title: "Sectoral Performance Review",
                  time: "6h ago",
                  description: "Detailed review of sector-wise performance and future outlook"
                }
              ].map((news, index) => (
                <button 
                  key={index}
                  className="w-full p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-200 transition-all duration-200 text-left group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-gray-900 group-hover:text-blue-700">{news.title}</h3>
                    <span className="text-xs text-gray-500">{news.time}</span>
                  </div>
                  <p className="text-sm text-gray-600">{news.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Market Insights */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Market Insights</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Top Gainers */}
              <div className="p-6 bg-white rounded-2xl border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Gainers</h3>
                <div className="space-y-3">
                  {[
                    { symbol: 'TATASTEEL', change: '+5.2%' },
                    { symbol: 'HDFCBANK', change: '+3.8%' },
                    { symbol: 'RELIANCE', change: '+3.1%' }
                  ].map((stock, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-900">{stock.symbol}</span>
                      <span className="text-sm font-medium text-green-600">{stock.change}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Losers */}
              <div className="p-6 bg-white rounded-2xl border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Losers</h3>
                <div className="space-y-3">
                  {[
                    { symbol: 'INFY', change: '-2.8%' },
                    { symbol: 'WIPRO', change: '-2.3%' },
                    { symbol: 'TCS', change: '-1.9%' }
                  ].map((stock, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-900">{stock.symbol}</span>
                      <span className="text-sm font-medium text-red-600">{stock.change}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Coming Soon Features */}
          <div className="rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 p-8 text-white">
            <h2 className="text-2xl font-bold mb-4">Coming Soon</h2>
            <p className="text-blue-100 mb-6">We're working on exciting new features to enhance your stock market analysis experience.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/10 rounded-lg">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <span>Advanced Portfolio Analytics</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/10 rounded-lg">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <span>Real-time Price Alerts</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
