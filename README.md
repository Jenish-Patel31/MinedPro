# 🚀 StockPro – Stock Search & Analysis Web App  

Welcome to **StockPro**! This is a **stock search and analysis web application** that allows users to retrieve real-time stock data, visualize market trends, and gain insights into various stocks.  

<!--🔗 **Live Demo** – [StockPro on Vercel](https://stockpro-seven.vercel.app/)  -->
🔗 **GitHub Repository** – [MinedPro](https://github.com/Jenish-Patel31/MinedPro)  

## 🌟 **Project Overview**  

StockPro is a web application designed to provide users with comprehensive tools for searching and analyzing stock data. It offers real-time insights, interactive visualizations, and detailed financial information, empowering users to make informed investment decisions. A standout feature of StockPro is its ability to extract financial insights from uploaded PDF reports, enhancing the depth of analysis available to users.


## Features

- **PDF Upload for Financial Insights**: Upload financial reports in PDF format to extract and analyze key financial metrics such as Revenue/Sales, Operating Profit, and Net Profit.
- **Stock Search by Name**: Quickly find stocks by entering the company name or ticker symbol.
- **Real-Time Data Retrieval**: Access up-to-date stock information through integrated APIs.
- **Interactive Charts**: Visualize stock performance over various time frames with dynamic charting tools.
- **Responsive Design**: Enjoy a consistent experience across devices, including desktops, tablets, and smartphones.

## 📌 Project Structure

```
MinedPro/
├── public/
├── src/
│   ├── components/
│   ├── pages/
│   ├── App.jsx
│   └── index.jsx
├── .env
├── .gitignore
├── README.md
├── app.py
├── streamlit_.py
├── package.json
├── vite.config.js
└── vercel.json
```

## Usage Guide
Once the application is running:

- **Stock Search**:  
  Use the search bar to find stocks by entering the company name or ticker symbol. The application will display real-time data and interactive charts for the selected stock.
  
- **PDF Upload for Financial Insights**:  
  1. Navigate to the **"Financial Report Analysis"** section.  
  2. Upload a financial report in **PDF format**.  
  3. The application will extract key financial metrics such as **Revenue/Sales, Operating Profit, and Net Profit** from the report and display them for analysis.

## 🛠 **Tech Stack** 
### Frontend:
- **React**: JavaScript library for building user interfaces.  
- **Vite**: Next-generation frontend tooling for rapid development.  
- **Tailwind CSS**: Utility-first CSS framework for styling.  

### Backend:
- **Streamlit**: Framework for creating interactive web applications in Python.  
- **Python**: Programming language used for backend processing and PDF data extraction.  

### Deployment
The project is deployed on the following platforms:

- **Frontend:** Hosted on [Vercel](https://vercel.com/) for fast and scalable deployment.
- **Backend:** APIs are deployed on [Render](https://render.com/) to ensure reliable backend processing and PDF data extraction.

Both services work together to provide a seamless experience for stock analysis and financial data extraction.

### APIs and Libraries:
- **Financial Data API**: Integrated API for fetching real-time stock data.  
- **PDF Processing Libraries**: Tools for extracting data from PDF financial reports.  


## 🚀 **Setup & Run Locally**

###  **1. Clone the Repository**  

```
git clone https://github.com/Jenish-Patel31/MinedPro.git
cd MinedPro
```

###  **2. Install Frontend Dependencies:**  
```
npm install
```

###  **3. Set Up Environment Variables:** 

- Create a ``.env`` file in the root directory.
- Add necessary environment variables (e.g., API keys) as specified in .env.example.

  
###  **4. Start the Frontend Application:**  
```
npm run dev
```

🚀 **Happy Investing & Data Analysis!** 📈  
