const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static files in public folder
app.use(express.static('public'));

// Helper function to generate HTML email
function generateEmailHtml(formData, resources) {
  // Use your deployed backend URL here
  const backendUrl = process.env.BACKEND_URL || `http://localhost:${PORT}`;
  const logoUrl = `${backendUrl}/Opencare-Logo-Sage.png`;

  return `
    <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto;">
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="${logoUrl}" alt="Opencare Logo" style="height: 60px;" />
      </div>

      <h2 style="color: #007BFF; border-bottom: 1px solid #eee; padding-bottom: 8px;">Survey Responses</h2>
      <p><strong>Practice Name:</strong> ${formData.practice_name}</p>
      <p><strong>Top Priority:</strong> ${formData.top_priority}${formData.top_priority === 'Something else' ? ` - ${formData.priority_detail}` : ''}</p>
      <p><strong>Login Access:</strong> ${formData.login_access}</p>
      <p><strong>Getting Started:</strong> ${formData.reviewed_content}</p>
      <p><strong>Platform Confidence:</strong> ${formData.confidence}</p>
      <p><strong>Billing Concerns:</strong> ${formData.billing_concerns}</p>

      <h2 style="color: #007BFF; border-top: 1px solid #eee; padding-top: 16px; margin-top: 24px;">Recommended Training Materials</h2>
      <ul>
        ${resources.includes('login') ? `<li><a href="https://opencarepractice.zendesk.com/hc/en-us/articles/34764947028628-How-to-Login-to-my-Opencare-Account" style="color:#007BFF;">How to Log In to Opencare</a></li>` : ''}
        ${resources.includes('getting_started') ? `<li><a href="https://opencarepractice.zendesk.com/hc/en-us/categories/34649397171220" style="color:#007BFF;">Getting Started with Opencare</a></li>` : ''}
        ${resources.includes('dashboard') ? `<li><a href="https://opencarepractice.zendesk.com/hc/en-us/articles/18554516947732-Navigating-the-Opencare-Dashboard" style="color:#007BFF;">Navigating the Opencare Dashboard</a></li>` : ''}
        ${resources.includes('billing') ? `<li><a href="https://opencarepractice.zendesk.com/hc/en-us/sections/18554146776468-Module-3-Billing" style="color:#007BFF;">Billing at Opencare</a></li>` : ''}
      </ul>

      <p style="margin-top: 24px;">If you have any questions, please don't hesitate to respond to this email.</p>
    </div>
  `;
}

// Email route
app.post('/submit', async (req, res) => {
  const formData = req.body;

  // Determine which training links to include based on answers
  const resources = [];
  if (formData.login_access === 'No') resources.push('login');
  if (formData.reviewed_content === 'No') resources.push('getting_started');
  if (formData.confidence === 'No') resources.push('dashboard');
  if (formData.billing_concerns === 'Yes') resources.push('billing');

  // Create HTML email body
  const emailHtml = generateEmailHtml(formData, resources);

  // Nodemailer transporter config
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,      // your Gmail address
      pass: process.env.EMAIL_PASS       // your Gmail app password
    }
  });

  const mailOptions = {
    from: `"Opencare Training" <${process.env.EMAIL_USER}>`,
    to: formData.recipient_emails,
    subject: 'Your Opencare Pre-Onboarding Survey Results',
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

// Simple test endpoint
app.get('/', (req, res) => {
  res.send('Opencare Backend is Running!');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
