import { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Trash2, 
  ChevronRight, 
  DollarSign, 
  Activity, 
  TrendingUp, 
  Loader2, 
  AlertTriangle,
  BookOpen,
  BarChart3,
  PieChart
} from 'lucide-react';
import axios from 'axios';

const api = {
  checkHealth: async () => {
    try {
      const response = await axios.get(`${FLASK_API_URL}/health`);
      return response.data.status === 'healthy';
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  },
  
  analyzePDF: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await axios.post(`${FLASK_API_URL}/analyze-pdf`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000, // 60 second timeout
      });
      
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.details || error.message;
      throw new Error(`Analysis failed: ${errorMessage}`);
    }
  }
};

const FLASK_API_URL = 'http://localhost:5001';

// Error Alert Component
const ErrorAlert = ({ message }) => (
  <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
    <div className="flex items-start">
      <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
      <div>
        <h3 className="text-sm font-medium text-red-800">Analysis Error</h3>
        <p className="mt-1 text-sm text-red-700">{message}</p>
      </div>
    </div>
  </div>
);

// Insight Card Component
const InsightCard = ({ title, items, onItemClick, icon: Icon, activeInsight }) => (
  <div className="bg-white rounded-lg p-4 mb-4 shadow-sm border border-gray-100">
    <div className="flex items-center mb-3">
      <div className="p-2 bg-blue-50 rounded-lg">
        <Icon className="w-5 h-5 text-blue-600" />
      </div>
      <h3 className="ml-2 text-lg font-semibold text-gray-800">{title}</h3>
    </div>
    <div className="space-y-2">
      {items.map((item, idx) => (
        <button
          key={idx}
          onClick={() => onItemClick(item)}
          className={`w-full text-left p-3 rounded-lg transition-all duration-200
            ${activeInsight === item 
              ? 'bg-blue-50 ring-2 ring-blue-200' 
              : 'hover:bg-gray-50 hover:shadow-sm'
            }
          `}
        >
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium text-gray-900">{item.title}</p>
              <p className="text-sm text-gray-600 mt-1">{item.value}</p>
            </div>
            <div className="flex items-center text-sm text-gray-400">
              <BookOpen className="w-4 h-4 mr-1" />
              <span>Page {item.page}</span>
              <ChevronRight className="w-4 h-4 ml-2" />
            </div>
          </div>
        </button>
      ))}
    </div>
  </div>
);

// Stats Display Component
const StatsDisplay = ({ stats }) => (
  <div className="grid grid-cols-3 gap-4 mb-6">
    {stats.map((stat, idx) => (
      <div key={idx} className="bg-white p-4 rounded-lg border border-gray-100">
        <div className="flex items-center">
          {stat.icon}
          <span className="text-sm text-gray-600 ml-2">{stat.label}</span>
        </div>
        <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
      </div>
    ))}
  </div>
);

export default function ChatbotPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [pdfUrl, setPdfUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const [insights, setInsights] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [activeInsight, setActiveInsight] = useState(null);
  const [analysisError, setAnalysisError] = useState('');
  const pdfContainerRef = useRef(null);
  const insightsPanelRef = useRef(null);

  const stats = insights ? [
    {
      label: "Total Pages",
      value: insights.totalPages.toString(),
      icon: <BookOpen className="w-4 h-4 text-blue-500" />
    },
    {
      label: "Key Metrics",
      value: insights.keyMetrics.length.toString(),
      icon: <BarChart3 className="w-4 h-4 text-green-500" />
    },
    {
      label: "Insights",
      value: (
        insights.financialHighlights.length + 
        insights.futureOutlook.length
      ).toString(),
      icon: <PieChart className="w-4 h-4 text-purple-500" />
    }
  ] : [];

  useEffect(() => {
    const analyzePDF = async (file) => {
      try {
        setIsLoading(true);
        setAnalysisError('');
        
        // Check server health
        const isHealthy = await api.checkHealth();
        if (!isHealthy) {
          throw new Error('Analysis server is not responding. Please try again in a few moments.');
        }
        
        // Validate file
        if (!(file instanceof File)) {
          throw new Error('Invalid file provided');
        }
        
        if (file.type !== 'application/pdf') {
          throw new Error('Please provide a PDF file');
        }
        
        // Analyze PDF
        const result = await api.analyzePDF(file);
        
        if (result.success && result.insights) {
          setInsights({ ...result.insights, totalPages: result.totalPages });
        } else {
          throw new Error('Invalid response from analysis server');
        }
      } catch (error) {
        console.error('Analysis error:', error);
        setAnalysisError(error.message);
        setInsights(null);
      } finally {
        setIsLoading(false);
      }
    };

    const loadPDF = async () => {
      try {
        const stateFile = location.state?.pdfFile?.data;
        
        if (stateFile) {
          const url = URL.createObjectURL(stateFile);
          setPdfUrl(url);
          setFileName(stateFile.name);
          
          // Analyze PDF
          await analyzePDF(stateFile);
          
          sessionStorage.setItem('currentPDF', JSON.stringify({
            name: stateFile.name,
            timestamp: new Date().getTime()
          }));
        } else {
          const sessionData = sessionStorage.getItem('currentPDF');
          if (sessionData) {
            const { name } = JSON.parse(sessionData);
            setFileName(name);
            setError('PDF needs to be re-uploaded after page refresh');
          } else {
            navigate('/dashboard');
          }
        }
      } catch (err) {
        console.error('PDF load error:', err);
        setError('Failed to load PDF document');
      }
    };

    loadPDF();

    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [location, navigate]);

  const handleInsightClick = (insight) => {
    setCurrentPage(insight.page);
    setActiveInsight(insight);
    
    // Update PDF viewer to highlight text
    const viewer = document.querySelector('iframe');
    if (viewer && viewer.contentWindow) {
      viewer.contentWindow.postMessage({
        type: 'highlightText',
        keyword: insight.keyword,
        page: insight.page
      }, '*');
    }
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this PDF?')) {
      sessionStorage.removeItem('currentPDF');
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="border-b bg-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Dashboard
          </button>
          <h1 className="text-xl font-semibold text-gray-900">{fileName}</h1>
          <button
            onClick={handleDelete}
            className="flex items-center text-red-600 hover:text-red-900 transition-colors"
          >
            <Trash2 className="h-5 w-5 mr-2" />
            Delete PDF
          </button>
        </div>
      </div>

      {/* Main Content */}
      {error ? (
        <div className="text-center py-12">
          <div className="inline-block p-4 rounded-lg bg-red-50 text-red-600">
            {error}
          </div>
        </div>
      ) : (
        <div className="flex flex-1 overflow-hidden">
          {/* PDF Viewer - Fixed width */}
          <div className="w-2/3 p-6" ref={pdfContainerRef}>
            <div className="bg-white rounded-lg shadow-sm h-full border border-gray-200">
              <iframe
                src={`${pdfUrl}#page=${currentPage}`}
                width="100%"
                height="100%"
                title="PDF Viewer"
                className="rounded-lg"
              />
            </div>
          </div>

          {/* Insights Panel - Scrollable */}
          <div 
            className="w-1/3 p-6 overflow-y-auto border-l bg-gray-50"
            ref={insightsPanelRef}
          >
            {analysisError && <ErrorAlert message={analysisError} />}
            
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <span className="mt-4 text-gray-600">Analyzing document...</span>
                <p className="mt-2 text-sm text-gray-500">This may take a few moments</p>
              </div>
            ) : insights ? (
              <>
                <StatsDisplay stats={stats} />
                <div className="space-y-4">
                  <InsightCard
                    title="Financial Highlights"
                    items={insights.financialHighlights}
                    onItemClick={handleInsightClick}
                    icon={DollarSign}
                    activeInsight={activeInsight}
                  />
                  <InsightCard
                    title="Key Metrics"
                    items={insights.keyMetrics}
                    onItemClick={handleInsightClick}
                    icon={Activity}
                    activeInsight={activeInsight}
                  />
                  <InsightCard
                    title="Future Outlook"
                    items={insights.futureOutlook}
                    onItemClick={handleInsightClick}
                    icon={TrendingUp}
                    activeInsight={activeInsight}
                  />
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}