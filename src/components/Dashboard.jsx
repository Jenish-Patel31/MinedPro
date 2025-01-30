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
  ChevronDown
} from 'lucide-react';

// Custom debounce hook
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
          // Filter out the "Search everywhere" result
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-xl font-semibold text-blue-600">StockPro</span>
            </div>

            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-500 rounded-full hover:bg-gray-100">
                <Bell className="h-5 w-5" />
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-3 focus:outline-none z-30 bg-gray-50 hover:bg-gray-100 rounded-full px-3 py-2 transition-colors duration-200"
                >
                  {userPhoto ? (
                    <img
                      className="h-8 w-8 rounded-full object-cover border-2 border-white shadow-sm"
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
                  <div className="absolute right-0 mt-2 w-64 z-50 rounded-xl shadow-lg bg-white ring-1 ring-black ring-opacity-5 p-1">
                    <div className="p-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-700">{userName}</p>
                      <p className="text-xs text-gray-500">{userEmail}</p>
                    </div>
                    <div className="py-1">
                      <button className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg flex items-center transition-colors duration-200">
                        <Settings className="h-4 w-4 mr-3" />
                        Settings
                      </button>
                      <button
                        onClick={handleSignOut}
                        className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg flex items-center transition-colors duration-200"
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-3xl mx-auto mb-12">
          <h1 className="text-3xl font-bold text-gray-900 text-center mb-3">
            Search Indian Stock Market
          </h1>
          <p className="text-gray-500 text-center mb-8">
            Get real-time information about stocks listed on BSE and NSE
          </p>
          
          <div className="relative">
            <div className="absolute z-20 inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
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
              className="block w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl bg-white text-gray-900 text-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              placeholder="Search Indian stocks by company name or symbol..."
            />
            
            {(searchQuery || error) && (
              <div className="absolute w-full mt-2 bg-white rounded-xl shadow-lg border border-gray-100 z-50 max-h-96 overflow-y-auto">
                {error ? (
                  <div className="p-4 text-center text-gray-500">{error}</div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((company) => (
                    <button
                      key={company.id}
                      onClick={() => handleCompanyClick(company)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center justify-between group border-b border-gray-100 last:border-0 transition-colors duration-200"
                    >
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600">
                            {company.name}
                          </p>
                          <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                            {company.symbol}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    {searchQuery.length < 2 ? 'Type at least 2 characters to search' : 'No results found'}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}