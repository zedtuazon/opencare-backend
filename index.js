const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS only for your frontend domain
app.use(cors({
  origin: 'https://opencare-frontend.onrender.com'
}));

app.use(express.json());
app.use(express.static('public'));

// Generate the email HTML body
function generateEmailHtml(formData, resources) {
  const backendUrl = process.env.BACKEND_URL || `http://localhost:${PORT}`;
  const logoUrl = `${backendUrl}/Opencare-Logo-Sage.png`;

  return `
    <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto;">
      <!-- Centered logo -->
      <div style="text-align: center; margin-bottom: 12px;">
        <img src="${logoUrl}" alt="Opencare Logo" style="height: 60px;" />
      </div>
      <!-- Separation line -->
      <hr style="border: none; border-top: 1px solid #ccc; margin-bottom: 20px;" />

      <!-- Left aligned content -->
      <div style="text-align: left;">
        <h2 style="color: #007BFF; border-bottom: 1px solid #eee; padding-bottom: 8px; margin-top: 0;">Survey Responses</h2>
        <p><strong>Practice Name:</strong> ${formData.practice_name}</p>
        <p><strong>Top Priority:</strong> ${formData.top_priority}${formData.top_priority === 'Something else' ? ` - ${formData.priority_detail}` : ''}</p>
        <p><strong>Login Access:</strong> ${formData.login_access}</p>
        <p><strong>Getting Started:</strong> ${formData.reviewed_content}</p>
        <p><strong>Platform Confidence:</strong> ${formData.confidence}</p>
        <p><strong>Billing Concerns:</strong> ${formData.billing_concerns}</p>

        <h2 style="color: #007BFF; margin-top: 24px; margin-bottom: 12px;">Recommended Training Materials</h2>
        <ul style="padding-left: 20px; margin-top: 0; margin-bottom: 24px;">
          ${resources.includes('login') ? `<li><a href="https://opencarepractice.zendesk.com/hc/en-us/articles/34764947028628-How-to-Login-to-my-Opencare-Account" style="color:#007BFF;">How to Log In to Opencare</a></li>` : ''}
          ${resources.includes('getting_started') ? `<li><a href="https://opencarepractice.zendesk.com/hc/en-us/categories/34649397171220" style="color:#007BFF;">Getting Started with Opencare</a></li>` : ''}
          ${resources.includes('dashboard') ? `<li><a href="https://opencarepractice.zendesk.com/hc/en-us/articles/18554516947732-Navigating-the-Opencare-Dashboard" style="color:#007BFF;">Navigating the Opencare Dashboard</a></li>` : ''}
          ${resources.includes('billing') ? `<li><a href="https://opencarepractice.zendesk.com/hc/en-us/sections/18554146776468-Module-3-Billing" style="color:#007BFF;">Billing at Opencare</a></li>` : ''}
        </ul>

        <hr style="border: none; border-top: 1px solid #eee; margin-bottom: 12px;" />
        
        <p>If you have any questions, please don't hesitate to respond to this email.</p>
      </div>
    </div>
  `;
}

// Route: handle POST /submit
app.post('/submit', async (req, res) => {
  const formData = req.body;

  if (!formData.results_emails || !Array.isArray(formData.results_emails) || formData.results_emails.length === 0) {
    return res.status(400).json({ error: 'No recipient emails provided' });
  }

  // Determine which resources to include
  const resources = [];
  if (formData.login_access === 'No') resources.push('login');
  if (formData.reviewed_content === 'No') resources.push('getting_started');
  if (formData.confidence === 'No') resources.push('dashboard');
  if (formData.billing_concerns === 'Yes') resources.push('billing');

  // Generate email HTML
  const emailHtml = generateEmailHtml(formData, resources);

  // Create mail transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    }
  });

  const mailOptions = {
    from: `"Opencare Training" <${process.env.EMAIL_USER}>`,
    to: formData.results_emails.join(','), // comma-separated string
    subject: 'Opencare Pre-Onboarding Survey Summary & Training Materials',
    html: emailHtml
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

// GET / - health check
app.get('/', (req, res) => {
  res.send('Opencare Backend is Running!');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
