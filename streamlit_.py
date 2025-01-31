import streamlit as st
from PyPDF2 import PdfReader
import os
import json
import google.generativeai as genai

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (X11; Windows; Windows x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.5060.114 Safari/537.36'
}

# Set up Gemini API key
GEMINI_API_KEY = "AIzaSyBbhY5dG1OgIzHwS5sK4TVvxS7pjFYyRQI"
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-1.5-flash-latest')

# Set page config with light theme
st.set_page_config(
    page_title="Financial Report Analyzer",
    page_icon="📊",
    layout="wide",
    initial_sidebar_state="expanded"
)

def get_uploaded_pdf():
    """Retrieve uploaded PDF file path and return it."""
    if 'pdf_content' in st.session_state:
        pdf_path = f"temp_{st.session_state.pdf_content['name']}"
        with open(pdf_path, "wb") as f:
            f.write(st.session_state.pdf_content['file'].getbuffer())
        return pdf_path
    return None

# Custom CSS for enhanced UI
st.markdown("""
    <style>
        .header {font-size: 24px !important; color: #2a3f5f !important; font-weight: bold;}
        .metric-card {padding: 20px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin: 10px 0;}
        .positive {background-color: #e6f4ea; border-left: 5px solid #34B233;}
        .negative {background-color: #fce8e6; border-left: 5px solid #EA4335;}
        .highlight {color: #2a3f5f; font-weight: 600;}
        .section-title {font-size: 20px !important; color: #2a3f5f !important; border-bottom: 2px solid #2a3f5f; padding-bottom: 5px;}
    </style>
""", unsafe_allow_html=True)

def display_financial_data(data):
    """Display financial data in Streamlit with proper formatting."""
    try:
        st.markdown("## 📊 Extracted Financial Metrics")

        # Core Financials
        if 'core_financials' in data:
            st.markdown("### Core Financial Performance")
            cols = st.columns(2)
            for i, (key, value) in enumerate(data['core_financials'].items()):
                with cols[i % 2]:
                    st.metric(label=key.replace('_', ' ').title(), 
                            value=f"{value['value'] if isinstance(value, dict) else value if value is not None else '-'} {value.get('unit', '') if isinstance(value, dict) else ''}")

        # Per Share Metrics
        if 'per_share_metrics' in data:
            st.markdown("### Per Share Metrics")
            cols = st.columns(2)
            for i, (key, value) in enumerate(data['per_share_metrics'].items()):
                with cols[i % 2]:
                    st.metric(label=key.replace('_', ' ').title(), 
                            value=f"{value['value'] if isinstance(value, dict) else value if value is not None else '-'} {value.get('unit', '') if isinstance(value, dict) else ''}")

        # Balance Sheet
        if 'balance_sheet' in data:
            st.markdown("### Balance Sheet Highlights")
            cols = st.columns(2)
            for i, (key, value) in enumerate(data['balance_sheet'].items()):
                with cols[i % 2]:
                    st.metric(label=key.replace('_', ' ').title(), 
                            value=f"{value['value'] if isinstance(value, dict) else value if value is not None else '-'} {value.get('unit', '') if isinstance(value, dict) else ''}")

    except Exception as e:
        st.error(f"Error displaying data: {str(e)}")

def analyze_quarterly_result():
    """Analyze the latest quarterly result focusing on consolidated financial data."""
    pdf_path = get_uploaded_pdf()
    if not pdf_path or not os.path.exists(pdf_path):
        st.error("Latest quarterly result PDF not found")
        return

    try:
        prompt = """Analyze this quarterly result PDF and extract the consolidated financial metrics from the section titled "STATEMENT OF CONSOLIDATED UNAUDITED FINANCIAL RESULTS FOR THE QUARTER" or similar consolidated results table.

            Focus specifically on these financial metrics from the CONSOLIDATED table (not standalone):
            1. Core Financial Performance:
                - Total Revenue/Income from Operations
                - Total Income (including other income)
                - Total Expenses
                - EBIT (Earnings Before Interest & Tax)
                - Profit Before Tax (PBT)
                - Tax Expenses
                - Net Profit/Loss (Profit After Tax)

            2. Per Share & Margin Metrics:
                - Basic EPS
                - Diluted EPS
                - Operating Profit Margin (%)
                - Net Profit Margin (%)

            4. Balance Sheet Highlights:
                - Total Assets
                - Total Liabilities
                - Net Worth
                - Debt

            Important Instructions:
            Focus specifically on these financial metrics from the CONSOLIDATED table (not standalone):
            1. Core Financial Performance Metrics: Total Revenue/Income from Operations, Total Income, Total Expenses, EBITDA, EBIT, Profit Before Tax, Tax Expenses, Net Profit
            2. Per Share Metrics: Basic EPS, Diluted EPS, Operating Profit Margin (%), Net Profit Margin (%)
            3. Balance Sheet Highlights: Total Assets, Total Liabilities, Net Worth, Debt

            Return the result in JSON format with keys 'core_financials', 'per_share_metrics', and 'balance_sheet', containing relevant metrics, and ignore any unavailable values.            
            }"""

        with open(pdf_path, 'rb') as pdf_file:
            pdf_content = pdf_file.read()

        response = model.generate_content(
            contents=[prompt, {"mime_type": "application/pdf", "data": pdf_content}],
            generation_config={"temperature": 0.1, "max_output_tokens": 2000}
        )

        # Debug: Show raw response
        st.subheader("Raw API Response")
        st.code(response.text, language='json')

        # Parse JSON from response
        json_str = response.text.replace('```json', '').replace('```', '').strip()
        financial_data = json.loads(json_str)

        # Display parsed data
        display_financial_data(financial_data)

    except json.JSONDecodeError as e:
        st.error("Failed to parse JSON response from Gemini")
        st.code(f"Error details: {str(e)}\nResponse text: {response.text}", language='text')
    except Exception as e:
        st.error(f"Analysis failed: {str(e)}")
        if 'response' in locals():
            st.code(f"API Response: {response.text}", language='text')

def main():
    st.title("📊 Financial Report Analyzer")
    st.markdown("Upload a financial report PDF to extract key financial metrics")

    if 'pdf_content' not in st.session_state:
        st.session_state.pdf_content = None

    with st.sidebar:
        st.header("Upload Document")
        uploaded_file = st.file_uploader("Choose a PDF file", type="pdf")

        if uploaded_file:
            with st.spinner("Processing document..."):
                pdf_reader = PdfReader(uploaded_file)
                num_pages = len(pdf_reader.pages)
                st.session_state.pdf_content = {
                    'name': uploaded_file.name,
                    'num_pages': num_pages,
                    'file': uploaded_file
                }
            st.success("Document processed successfully!")

    if st.session_state.pdf_content:
        analyze_quarterly_result()
        if st.button("Clear Document"):
            st.session_state.pdf_content = None
            st.rerun()

if __name__ == "__main__":
    main()