import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase-config';
import { signOut } from 'firebase/auth';
import { 
  Search,
  UserCircle,
  Settings,
  LogOut,
  Loader2,
  Bell,
  ChevronDown,
  Upload
} from 'lucide-react';

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
  const [isDragging, setIsDragging] = useState(false);
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

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      const fileData = {
        name: file.name,
        size: file.size,
        lastModified: file.lastModified,
        data: file
      };

      sessionStorage.setItem('currentPDF', JSON.stringify({
        name: file.name,
        timestamp: new Date().getTime()
      }));

      navigate('/chatbot', { 
        state: { 
          pdfFile: fileData 
        }
      });
    } else {
      setError('Please upload a valid PDF file.');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      const fileData = {
        name: file.name,
        size: file.size,
        lastModified: file.lastModified,
        data: file
      };

      sessionStorage.setItem('currentPDF', JSON.stringify({
        name: file.name,
        timestamp: new Date().getTime()
      }));

      navigate('/chatbot', { 
        state: { 
          pdfFile: fileData 
        }
      });
    } else {
      setError('Please upload a valid PDF file.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navigation */}
      <nav className="bg-white backdrop-blur-lg bg-opacity-80 sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                StockPro
              </span>
            </div>

            <div className="flex items-center space-x-6">
              <button className="p-2 text-gray-500 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-all duration-200">
                <Bell className="h-5 w-5" />
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-3 focus:outline-none hover:bg-gray-50 rounded-full px-3 py-2 transition-all duration-200"
                >
                  {userPhoto ? (
                    <img
                      className="h-8 w-8 rounded-full object-cover ring-2 ring-white shadow-sm"
                      src={userPhoto}
                      alt={userName}
                    />
                  ) : (
                    <UserCircle className="h-8 w-8 text-gray-400" />
                  )}
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-gray-700">{userName}</p>
                    <p className="text-xs text-gray-500">{userEmail}</p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl shadow-lg bg-white ring-1 ring-black ring-opacity-5 p-2">
                    <div className="p-3">
                      <p className="text-sm font-medium text-gray-700">{userName}</p>
                      <p className="text-xs text-gray-500">{userEmail}</p>
                    </div>
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
            <h1 className="text-4xl font-bold text-gray-900 text-center mb-4">
              Search Indian Stock Market
            </h1>
            <p className="text-gray-500 text-center text-lg mb-8">
              Get real-time information about stocks listed on BSE and NSE
            </p>
          
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                {isLoading ? (
                  <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
                ) : (
                  <Search className="h-5 w-5 text-gray-400" />
                )}
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearch}
                className="block w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl bg-white/50 backdrop-blur-sm text-gray-900 text-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm"
                placeholder="Search Indian stocks by company name or symbol..."
              />
            
              {(searchQuery || error) && (
                <div className="absolute w-full mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
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
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      {searchQuery.length < 2 ? 'Type at least 2 characters to search' : 'No results found'}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Upload Section */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Upload Financial Report
            </h2>
            <p className="text-gray-500 mb-8">
              Drag and drop your PDF file or click to browse
            </p>
            
            <div 
              className={`max-w-xl mx-auto border-2 border-dashed rounded-2xl p-8 transition-all duration-200 ${
                isDragging 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300 bg-gray-50/50'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center">
                <Upload className={`h-12 w-12 mb-4 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} />
                <label className="flex flex-col items-center cursor-pointer">
                  <span className="text-sm text-gray-500">
                    Drop your PDF here, or{' '}
                    <span className="text-blue-600 hover:text-blue-700">browse</span>
                  </span>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                {error && (
                  <p className="mt-2 text-sm text-red-600">{error}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}