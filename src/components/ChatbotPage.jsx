// ChatbotPage.jsx
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2 } from 'lucide-react';

export default function ChatbotPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [pdfUrl, setPdfUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const loadPDF = async () => {
      try {
        // Check for PDF in navigation state first
        const stateFile = location.state?.pdfFile?.data;
        
        if (stateFile) {
          // Create object URL from the File object
          const url = URL.createObjectURL(stateFile);
          setPdfUrl(url);
          setFileName(stateFile.name);
          
          // Store reference in sessionStorage
          sessionStorage.setItem('currentPDF', JSON.stringify({
            name: stateFile.name,
            timestamp: new Date().getTime()
          }));
          return;
        }

        // If no state, check sessionStorage
        const sessionData = sessionStorage.getItem('currentPDF');
        if (sessionData) {
          const { name } = JSON.parse(sessionData);
          setFileName(name);
          setError('PDF needs to be re-uploaded after page refresh');
        } else {
          navigate('/dashboard');
        }
      } catch (err) {
        console.error('PDF load error:', err);
        setError('Failed to load PDF document');
        navigate('/dashboard');
      }
    };

    loadPDF();

    // Cleanup object URL
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, []);

  const handleDelete = () => {
    // Clear all PDF references
    sessionStorage.removeItem('currentPDF');
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    navigate('/dashboard');
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Navigation Header */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={handleBack}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Dashboard
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center text-red-600 hover:text-red-900"
          >
            <Trash2 className="h-5 w-5 mr-2" />
            Delete PDF
          </button>
        </div>

        {/* Main Content */}
        {error ? (
          <div className="text-center py-12 text-red-600">{error}</div>
        ) : pdfUrl ? (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">PDF Chat Interface</h1>
            <div className="mb-6">
              <p className="text-lg font-medium text-gray-700">
                Active Document: <span className="text-blue-600">{fileName}</span>
              </p>
            </div>
            <div className="mt-6 h-[70vh]">
              <iframe
                src={pdfUrl}
                width="100%"
                height="100%"
                title="PDF Viewer"
                className="border rounded-lg"
              />
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            Loading PDF document...
          </div>
        )}
      </div>
    </div>
  );
}