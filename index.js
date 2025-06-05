/* ==== DEPRECATED CODE: Survey email backend ====
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for frontend
app.use(cors({
  origin: 'https://opencare-preonboardingsurvey.onrender.com'
}));

app.use(express.json());
app.use(express.static('public'));

// Generate the email HTML
function generateEmailHtml(formData, resources) {
  const logoUrl = 'https://opencare-preonboardingsurvey.onrender.com/Opencare-Logo-Sage.png';

  return `
    <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; width: 100%;">

      <!-- Logo centered -->
      <div style="text-align: center; margin-bottom: 8px;">
        <img src="${logoUrl}" alt="Opencare Logo" style="height: 90px;" />
      </div>

      <!-- Thinner, darker separation line -->
      <hr style="border: none; border-top: 2px solid #003366; margin: 0 0 16px 0;" />

      <!-- 1 space before survey response -->
      <div style="height: 10px;"></div>

      <h2 style="color: #003366; padding-bottom: 4px; margin: 0 0 8px 0;">Survey Responses</h2>

      <div style="text-align: left;">
        <p style="margin: 2px 0;"><strong>Practice Name:</strong> ${formData.practice_name}</p>
        <p style="margin: 2px 0;"><strong>Top Priority:</strong> ${formData.top_priority}${formData.top_priority === 'Something else' ? ` - ${formData.priority_detail}` : ''}</p>
        <p style="margin: 2px 0;"><strong>Login Access:</strong> ${formData.login_access}</p>
        <p style="margin: 2px 0;"><strong>Getting Started:</strong> ${formData.reviewed_content}</p>
        <p style="margin: 2px 0;"><strong>Platform Confidence:</strong> ${formData.confidence}</p>
        <p style="margin: 2px 0;"><strong>Billing Concerns:</strong> ${formData.billing_concerns}</p>
      </div>

      <h2 style="color: #003366; padding-top: 12px; margin: 20px 0 8px 0;">Recommended Training Materials</h2>

      <div style="text-align: left;">
        ${resources.includes('login') ? `<p style="margin: 2px 0;"><a href="https://opencarepractice.zendesk.com/hc/en-us/articles/34764947028628-How-to-Login-to-my-Opencare-Account" style="color:#007BFF; text-decoration: none;">How to Log In to Opencare</a></p>` : ''}
        ${resources.includes('getting_started') ? `<p style="margin: 2px 0;"><a href="https://opencarepractice.zendesk.com/hc/en-us/categories/34649397171220" style="color:#007BFF; text-decoration: none;">Getting Started with Opencare</a></p>` : ''}
        ${resources.includes('dashboard') ? `<p style="margin: 2px 0;"><a href="https://opencarepractice.zendesk.com/hc/en-us/articles/18554516947732-Navigating-the-Opencare-Dashboard" style="color:#007BFF; text-decoration: none;">Navigating the Opencare Dashboard</a></p>` : ''}
        ${resources.includes('billing') ? `<p style="margin: 2px 0;"><a href="https://opencarepractice.zendesk.com/hc/en-us/sections/18554146776468-Module-3-Billing" style="color:#007BFF; text-decoration: none;">Billing at Opencare</a></p>` : ''}
      </div>

      <hr style="border: none; border-top: 1px solid #ddd; margin-top: 20px;" />

      <p style="text-align: left; margin: 10px 0 0 0;">If you have any questions, please don't hesitate to respond to this email.</p>
    </div>
  `;
}

// Handle form submission
app.post('/submit', async (req, res) => {
  const formData = req.body;

  if (!formData.results_emails || !Array.isArray(formData.results_emails) || formData.results_emails.length === 0) {
    return res.status(400).json({ error: 'No recipient emails provided' });
  }

  const resources = [];
  if (formData.login_access === 'No') resources.push('login');
  if (formData.reviewed_content === 'No') resources.push('getting_started');
  if (formData.confidence === 'No') resources.push('dashboard');
  if (formData.billing_concerns === 'Yes') resources.push('billing');

  const emailHtml = generateEmailHtml(formData, resources);

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,  // your real Gmail
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: '"Opencare Training" <enablement@opencare.com>', // alias
    to: formData.results_emails.join(','),
    bcc: 'enablement@opencare.com', // keep copy
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

// Health check
app.get('/', (req, res) => {
  res.send('Opencare Backend is Running!');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
==== END DEPRECATED CODE ==== */

const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Allow CORS from frontend
app.use(cors({
  origin: 'https://opencare-preonboardingsurvey.onrender.com'
}));

app.use(express.json());
app.use(express.static('public'));

// Email HTML generator
function generateEmailHtml(formData) {
  const logoUrl = 'https://opencare-preonboardingsurvey.onrender.com/Opencare-Logo-Sage.png';

  return `
    <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; width: 100%;">

      <!-- Logo -->
      <div style="text-align: center; margin-bottom: 8px;">
        <img src="${logoUrl}" alt="Opencare Logo" style="height: 90px;" />
      </div>

      <!-- Thin line -->
      <hr style="border: none; border-top: 2px solid #003366; margin: 0 0 16px 0;" />

      <!-- Space before responses -->
      <div style="height: 10px;"></div>

      <h2 style="color: #003366; font-size: 20px; margin-bottom: 10px;">Survey Responses</h2>

      <div style="text-align: left; font-size: 15px;">
        <p style="margin: 4px 0;"><strong>Practice Name:</strong> ${formData.practice_name}</p>
        <p style="margin: 4px 0;"><strong>Top Priority:</strong> ${formData.top_priority}${formData.top_priority === 'Something else' ? ` - ${formData.priority_detail}` : ''}</p>
        <p style="margin: 4px 0;"><strong>Login Access:</strong> ${formData.login_access}</p>
        <p style="margin: 4px 0;"><strong>Getting Started:</strong> ${formData.reviewed_content}</p>
        <p style="margin: 4px 0;"><strong>Platform Confidence:</strong> ${formData.confidence}</p>
        <p style="margin: 4px 0;"><strong>Billing Concerns:</strong> ${formData.billing_concerns}</p>
      </div>

      <h2 style="color: #003366; font-size: 20px; margin: 24px 0 10px 0;">Recommended Training Materials</h2>

      <div style="text-align: left; font-size: 15px; line-height: 1.5;">
        <p style="margin: 8px 0;"><strong>⭐ Start Here:</strong> Complete the 
        <a href="http://training.opencare.com/" style="color:#007BFF; text-decoration: none;"><strong>“How to Use Opencare”</strong></a> Course</p>
        
        <p style="margin: 8px 0;">
          <strong>This is the most important step you can take to prepare for success with Opencare.</strong><br />
          Before your onboarding call, we highly recommend going through our training course for new practices.
          This short, self-guided experience walks you through everything you need to succeed — from setting up your profile to understanding how to get the most value out of Opencare.
        </p>
      </div>

      <hr style="border: none; border-top: 1px solid #ddd; margin-top: 20px;" />

      <p style="text-align: left; margin: 10px 0 0 0;">If you have any questions, please don't hesitate to respond to this email.</p>
    </div>
  `;
}

// Email handler
app.post('/submit', async (req, res) => {
  const formData = req.body;

  if (!formData.results_emails || !Array.isArray(formData.results_emails) || formData.results_emails.length === 0) {
    return res.status(400).json({ error: 'No recipient emails provided' });
  }

  const emailHtml = generateEmailHtml(formData);

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,  // Gmail address used to authenticate
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: '"Opencare Training" <enablement@opencare.com>',
    to: formData.results_emails.join(','),
    bcc: 'enablement@opencare.com',
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

// Health check
app.get('/', (req, res) => {
  res.send('Opencare Backend is Running!');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

