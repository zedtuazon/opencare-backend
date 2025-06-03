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
  const logoUrl = 'https://opencare-frontend.onrender.com/Opencare-Logo-Sage.png';

  return `
    <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; width: 100%;">

      <!-- Centered bigger logo -->
      <div style="text-align: center; margin-bottom: 8px;">
        <img src="${logoUrl}" alt="Opencare Logo" style="height: 80px;" />
      </div>

      <!-- Bold separation line (thickness reduced to 2px) -->
      <hr style="border: none; border-top: 2px solid #003366; margin: 0 0 16px 0;" />

      <!-- Add 1 space above Survey Responses -->
      <div style="height: 8px;"></div>

      <!-- Survey Responses Title -->
      <h2 style="color: #003366; padding-bottom: 4px; margin: 0 0 8px 0;">Survey Responses</h2>

      <!-- Left aligned content with tighter spacing -->
      <div style="text-align: left;">
        <p style="margin: 2px 0;"><strong>Practice Name:</strong> ${formData.practice_name}</p>
        <p style="margin: 2px 0;"><strong>Top Priority:</strong> ${formData.top_priority}${formData.top_priority === 'Something else' ? ` - ${formData.priority_detail}` : ''}</p>
        <p style="margin: 2px 0;"><strong>Login Access:</strong> ${formData.login_access}</p>
        <p style="margin: 2px 0;"><strong>Getting Started:</strong> ${formData.reviewed_content}</p>
        <p style="margin: 2px 0;"><strong>Platform Confidence:</strong> ${formData.confidence}</p>
        <p style="margin: 2px 0;"><strong>Billing Concerns:</strong> ${formData.billing_concerns}</p>
      </div>

      <!-- Recommended Training Materials Title -->
      <h2 style="color: #003366; padding-top: 12px; margin: 20px 0 8px 0;">Recommended Training Materials</h2>

      <!-- Training links -->
      <div style="text-align: left;">
        ${resources.includes('login') ? `<p style="margin: 2px 0;"><a href="https://opencarepractice.zendesk.com/hc/en-us/articles/34764947028628-How-to-Login-to-my-Opencare-Account" style="color:#007BFF; text-decoration: none;">How to Log In to Opencare</a></p>` : ''}
        ${resources.includes('getting_started') ? `<p style="margin: 2px 0;"><a href="https://opencarepractice.zendesk.com/hc/en-us/categories/34649397171220" style="color:#007BFF; text-decoration: none;">Getting Started with Opencare</a></p>` : ''}
        ${resources.includes('dashboard') ? `<p style="margin: 2px 0;"><a href="https://opencarepractice.zendesk.com/hc/en-us/articles/18554516947732-Navigating-the-Opencare-Dashboard" style="color:#007BFF; text-decoration: none;">Navigating the Opencare Dashboard</a></p>` : ''}
        ${resources.includes('billing') ? `<p style="margin: 2px 0;"><a href="https://opencarepractice.zendesk.com/hc/en-us/sections/18554146776468-Module-3-Billing" style="color:#007BFF; text-decoration: none;">Billing at Opencare</a></p>` : ''}
      </div>

      <hr style="border: none; border-top: 1px solid #ddd; margin-top: 20px;" />

      <!-- Footer -->
      <p style="text-align: left; margin: 10px 0 0 0;">If you have any questions, please don't hesitate to respond to this email.</p>
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
    bcc: 'enablement@opencare.com',        // Added BCC
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
