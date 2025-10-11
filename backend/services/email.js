const nodemailer = require('nodemailer');
require('dotenv').config();

const createTransporter = () => {
  
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('Email not configured - using console log simulation');
    return null; 
  }

  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, 
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

const generateWeeklyReportHTML = (userData) => {
  const {
    userName,
    weeklyExpenses,
    weeklyPredictions,
    totalSpent,
    totalPredicted,
    categoryBreakdown,
    insights
  } = userData;

  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Weekly Financial Report - PFM Tools</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
        }
        .header {
            background: linear-gradient(135deg, #8b5cf6, #06b6d4);
            color: white;
            padding: 30px 20px;
            border-radius: 12px;
            text-align: center;
            margin-bottom: 30px;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
        }
        .header p {
            margin: 10px 0 0 0;
            opacity: 0.9;
            font-size: 16px;
        }
        .card {
            background: white;
            border-radius: 12px;
            padding: 25px;
            margin-bottom: 20px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            border: 1px solid #e5e7eb;
        }
        .card h2 {
            color: #1f2937;
            margin-top: 0;
            margin-bottom: 20px;
            font-size: 22px;
            font-weight: 600;
            border-bottom: 2px solid #f3f4f6;
            padding-bottom: 10px;
        }
        .summary-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 25px;
        }
        .summary-item {
            text-align: center;
            padding: 20px;
            background: linear-gradient(135deg, #f8fafc, #f1f5f9);
            border-radius: 10px;
            border: 1px solid #e2e8f0;
        }
        .summary-label {
            font-size: 14px;
            color: #64748b;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .summary-value {
            font-size: 24px;
            font-weight: 700;
            color: #1e293b;
            margin-top: 5px;
        }
        .expense-item, .prediction-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 0;
            border-bottom: 1px solid #f3f4f6;
        }
        .expense-item:last-child, .prediction-item:last-child {
            border-bottom: none;
        }
        .expense-date, .prediction-date {
            font-weight: 600;
            color: #374151;
        }
        .expense-amount {
            font-weight: 700;
            color: #dc2626;
        }
        .prediction-amount {
            font-weight: 700;
            color: #059669;
        }
        .category-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
            margin-top: 20px;
        }
        .category-item {
            background: #f8fafc;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
            border: 1px solid #e2e8f0;
        }
        .category-name {
            font-size: 12px;
            color: #64748b;
            text-transform: uppercase;
            font-weight: 600;
            letter-spacing: 0.5px;
        }
        .category-amount {
            font-size: 16px;
            font-weight: 700;
            color: #1e293b;
            margin-top: 5px;
        }
        .insights {
            background: linear-gradient(135deg, #fef3c7, #fbbf24);
            border: 1px solid #f59e0b;
            border-radius: 10px;
            padding: 20px;
            margin-top: 20px;
        }
        .insights h3 {
            margin: 0 0 15px 0;
            color: #92400e;
            font-size: 18px;
        }
        .insights ul {
            margin: 0;
            padding-left: 20px;
        }
        .insights li {
            color: #92400e;
            margin-bottom: 8px;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding: 25px;
            background: #1f2937;
            color: white;
            border-radius: 12px;
        }
        .footer p {
            margin: 0;
            font-size: 14px;
            opacity: 0.8;
        }
        .logo {
            font-size: 24px;
            font-weight: 800;
            background: linear-gradient(135deg, #8b5cf6, #06b6d4);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 10px;
        }
        @media (max-width: 600px) {
            .summary-grid {
                grid-template-columns: 1fr;
            }
            .category-grid {
                grid-template-columns: 1fr 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>📊 Weekly Financial Report</h1>
        <p>Your personalized expense analysis and predictions</p>
    </div>

    <div class="card">
        <h2>👋 Hello ${userName}!</h2>
        <p>Here's your comprehensive weekly financial report with AI-powered insights and predictions.</p>
        
        <div class="summary-grid">
            <div class="summary-item">
                <div class="summary-label">Week Total Spent</div>
                <div class="summary-value">${formatCurrency(totalSpent)}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Next Week Predicted</div>
                <div class="summary-value">${formatCurrency(totalPredicted)}</div>
            </div>
        </div>
    </div>

    ${weeklyExpenses && weeklyExpenses.length > 0 ? `
    <div class="card">
        <h2>📈 Past Week Expenses</h2>
        ${weeklyExpenses.map(expense => `
            <div class="expense-item">
                <span class="expense-date">${new Date(expense.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
                <span class="expense-amount">${formatCurrency(expense.amount)}</span>
            </div>
        `).join('')}
    </div>
    ` : ''}

    ${weeklyPredictions && weeklyPredictions.length > 0 ? `
    <div class="card">
        <h2>🔮 Next Week Predictions</h2>
        ${weeklyPredictions.map(prediction => `
            <div class="prediction-item">
                <span class="prediction-date">${new Date(prediction.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
                <span class="prediction-amount">${formatCurrency(prediction.predicted_spend)}</span>
            </div>
        `).join('')}
    </div>
    ` : ''}

    ${categoryBreakdown ? `
    <div class="card">
        <h2>🏷️ Category Breakdown</h2>
        <div class="category-grid">
            ${Object.entries(categoryBreakdown).map(([category, amount]) => `
                <div class="category-item">
                    <div class="category-name">${category}</div>
                    <div class="category-amount">${formatCurrency(amount)}</div>
                </div>
            `).join('')}
        </div>
    </div>
    ` : ''}

    ${insights && insights.length > 0 ? `
    <div class="insights">
        <h3>💡 AI Insights & Recommendations</h3>
        <ul>
            ${insights.map(insight => `<li>${insight}</li>`).join('')}
        </ul>
    </div>
    ` : ''}

    <div class="footer">
        <div class="logo">PFM Tools</div>
        <p>Powered by AI • Your Financial Future, Simplified</p>
        <p style="margin-top: 10px; font-size: 12px;">This report was generated automatically. Please do not reply to this email.</p>
    </div>
</body>
</html>
  `;
};

const sendWeeklyReport = async (userEmail, reportData) => {
  try {
    const transporter = createTransporter();

    if (!transporter) {
      console.log('='.repeat(60));
      console.log('📧 EMAIL SIMULATION - Weekly Report');
      console.log('='.repeat(60));
      console.log(`To: ${userEmail}`);
      console.log(`Subject: Weekly Financial Report - ${new Date().toLocaleDateString()}`);
      console.log('\nReport Data:');
      console.log(`- User: ${reportData.userName}`);
      console.log(`- Total Spent: ${formatCurrency(reportData.totalSpent)}`);
      console.log(`- Predicted Next Week: ${formatCurrency(reportData.totalPredicted)}`);
      console.log(`- Expenses Count: ${reportData.weeklyExpenses?.length || 0}`);
      console.log(`- Predictions Count: ${reportData.weeklyPredictions?.length || 0}`);
      console.log('\nInsights:');
      reportData.insights?.forEach((insight, i) => console.log(`${i + 1}. ${insight}`));
      console.log('='.repeat(60));
      console.log('✅ Email would be sent successfully (simulation mode)');
      console.log('Configure EMAIL_USER and EMAIL_PASS in .env for real email sending');
      console.log('='.repeat(60));
      
      return { 
        success: true, 
        messageId: 'simulated-' + Date.now(),
        simulation: true
      };
    }
    
    const mailOptions = {
      from: `"PFM Tools" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `📊 Your Weekly Financial Report - ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`,
      html: generateWeeklyReportHTML(reportData),
      text: `Weekly Financial Report for ${reportData.userName}
      
Total Spent This Week: ${formatCurrency(reportData.totalSpent)}
Predicted Next Week: ${formatCurrency(reportData.totalPredicted)}

${reportData.insights ? reportData.insights.join('\n') : ''}

Best regards,
PFM Tools Team`
    };

    const result = await Promise.race([
      transporter.sendMail(mailOptions),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Email timeout after 15 seconds')), 15000)
      )
    ]);

    console.log('Email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
    
  } catch (error) {
    console.error('Email sending error:', error);

    if (error.code === 'ESOCKET' || error.code === 'ETIMEDOUT' || error.message.includes('timeout')) {
      console.log('='.repeat(60));
      console.log('📧 EMAIL FALLBACK - Network Issue Detected');
      console.log('='.repeat(60));
      console.log('🔥 Could not connect to Gmail SMTP server.');
      console.log('🔥 This might be due to firewall/network restrictions.');
      console.log('📊 Falling back to simulation mode...');
      console.log('='.repeat(60));
      console.log(`To: ${userEmail}`);
      console.log(`Subject: Weekly Financial Report - ${new Date().toLocaleDateString()}`);
      console.log('\nReport Data:');
      console.log(`- User: ${reportData.userName}`);
      console.log(`- Total Spent: ${formatCurrency(reportData.totalSpent)}`);
      console.log(`- Predicted Next Week: ${formatCurrency(reportData.totalPredicted)}`);
      console.log(`- Expenses Count: ${reportData.weeklyExpenses?.length || 0}`);
      console.log(`- Predictions Count: ${reportData.weeklyPredictions?.length || 0}`);
      console.log('\nInsights:');
      reportData.insights?.forEach((insight, i) => console.log(`${i + 1}. ${insight}`));
      console.log('='.repeat(60));
      console.log('✅ Report generated successfully (network fallback mode)');
      console.log('💡 To enable real emails, check your network/firewall settings');
      console.log('='.repeat(60));
      
      return { 
        success: true, 
        messageId: 'fallback-' + Date.now(),
        simulation: true,
        networkFallback: true
      };
    }
    
    return { success: false, error: error.message };
  }
};

const testEmailConnection = async () => {
  try {
    const transporter = createTransporter();
    
    if (!transporter) {
      return { 
        success: true, 
        message: 'Email simulation mode - no configuration required',
        simulation: true 
      };
    }
    
    await transporter.verify();
    console.log('Email server connection successful');
    return { success: true };
  } catch (error) {
    console.error('Email server connection failed:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendWeeklyReport,
  testEmailConnection,
  formatCurrency
};