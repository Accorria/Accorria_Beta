/**
 * Google Apps Script to integrate Google Forms with Accorria CRM
 * This script automatically sends form submissions to your CRM API
 *
 * SECURITY: Never commit this file with real SENDGRID_API_KEY or other secrets.
 * Use placeholders only in repo; add real keys only in Google Apps Script (Script Properties).
 */

// Configuration - Using your live Vercel deployment
const CRM_API_URL = 'https://accorria.com/api/leads'; // Your live Vercel deployment
const LOCAL_CRM_URL = 'http://localhost:3002/api/leads'; // For local testing (not used by Google Apps Script)

// SendGrid Configuration - use placeholder in repo; set real key in Apps Script Properties only
const SENDGRID_API_KEY = 'YOUR_SENDGRID_API_KEY_HERE'; // Replace in Apps Script only, never commit real key
const SENDGRID_FROM_EMAIL = 'noreply@accorria.com';
const SENDGRID_TEMPLATE_ID = 'd-REPLACE_WITH_YOUR_TEMPLATE_ID'; // You'll need to create this template
const SENDGRID_FOLLOWUP_TEMPLATE_ID = 'd-b371da7e588146fcb2d62d08aa28faed'; // Dealer Follow-Up Email template
const FORM_LINK = 'https://forms.gle/6FHda3Y5q8y4vs5D6'; // Accorria Dealer Early Access form
const CRM_WEBHOOK_URL = 'https://accorria.com/api/email-events'; // For tracking email engagement

// Function that runs when form is submitted
function onFormSubmit(e) {
  try {
    console.log('Form submission received:', e);
    
    // Check if event object exists
    if (!e || !e.response) {
      console.log('No form event data received, trying alternative method...');
      // Try to get the latest response from the form
      const form = FormApp.getActiveForm();
      const responses = form.getResponses();
      if (responses.length === 0) {
        throw new Error('No form responses found');
      }
      const latestResponse = responses[responses.length - 1];
      return processFormResponse(latestResponse);
    }
    
    // Get form responses from event
    const responses = e.response.getItemResponses();
    
    // Process the form response
    return processFormResponse(e.response);
  } catch (error) {
    console.error('Error processing form submission:', error);
    sendErrorNotification(error, e);
    return false;
  }
}

// Process form response (works with both event and direct response)
function processFormResponse(response) {
  try {
    console.log('Processing form response:', response);
    
    // Get form responses
    const responses = response.getItemResponses();
    
    // Extract form data
    const formData = extractFormData(responses);
    
    // Calculate lead score based on form responses
    const leadScore = calculateLeadScore(formData);
    
    // Prepare data for CRM API
    const leadData = {
      name: formData.name || formData.dealershipName,
      email: formData.email,
      phone: formData.phone,
      source: 'google_forms',
      utm_campaign: 'dealer_early_access',
      utm_source: 'google_forms',
      utm_medium: 'form',
      score: leadScore,
      notes: `Dealership: ${formData.dealershipName}, City: ${formData.city}, Volume: ${formData.volume}, Budget: ${formData.budget}`,
      survey_responses: {
        dealership_name: formData.dealershipName,
        role: formData.role,
        city: formData.city,
        monthly_volume: formData.volume,
        platforms_used: formData.platforms,
        biggest_pain_point: formData.painPoint,
        willingness_to_pay: formData.budget,
        interest_confirmed: formData.interestConfirmed
      },
      qualifications: {
        wants_notifications: true, // They filled out the form, so they want updates
        wants_demo: formData.interestConfirmed && formData.interestConfirmed.includes('Yes'),
        wants_beta_access: formData.interestConfirmed && formData.interestConfirmed.includes('Yes'),
        wants_early_access: formData.interestConfirmed && formData.interestConfirmed.includes('Yes'),
        signup_type: 'dealer_early_access',
        interest_level: formData.interestConfirmed && formData.interestConfirmed.includes('Yes') ? 'high' : 'medium',
        budget_range: formData.budget,
        timeline: 'asap', // They're filling out early access form
        volume: formData.volume,
        pain_points: formData.painPoint ? [formData.painPoint] : []
      },
      status: leadScore >= 70 ? 'hot' : leadScore >= 40 ? 'warm' : 'cold'
    };
    
    // Send to CRM API
    sendToCRM(leadData);
    
    // Send confirmation email to dealer
    sendDealerConfirmationEmail(leadData);
    
    console.log('Lead data processed successfully:', leadData);
    
  } catch (error) {
    console.error('Error processing form response:', error);
    
    // Send error notification email
    sendErrorNotification(error, response);
    return false;
  }
}

// Extract data from form responses
function extractFormData(responses) {
  const data = {};
  
  responses.forEach(response => {
    const question = response.getItem().getTitle().toLowerCase();
    const answer = response.getResponse();
    
    // Map form questions to data fields
    if (question.includes('email')) {
      data.email = answer;
    } else if (question.includes('dealership name')) {
      data.dealershipName = answer;
    } else if (question.includes('name/role')) {
      data.role = answer;
    } else if (question.includes('phone')) {
      data.phone = answer;
    } else if (question.includes('city')) {
      data.city = answer;
    } else if (question.includes('monthly listing volume')) {
      data.volume = answer;
    } else if (question.includes('platforms you currently use')) {
      data.platforms = Array.isArray(answer) ? answer : [answer];
    } else if (question.includes('biggest pain point')) {
      data.painPoint = answer;
    } else if (question.includes('willingness to pay')) {
      data.budget = answer;
    } else if (question.includes('dealer interest confirmation')) {
      data.interestConfirmed = answer;
    }
  });
  
  // Use email as name if no specific name field
  if (!data.name && data.email) {
    data.name = data.email.split('@')[0];
  }
  
  return data;
}

// Calculate lead score based on form responses
function calculateLeadScore(data) {
  let score = 50; // Base score
  
  // Volume scoring
  if (data.volume === '50+') score += 25;
  else if (data.volume === '25-50') score += 20;
  else if (data.volume === '10-25') score += 15;
  else if (data.volume === 'Under 10') score += 5;
  
  // Budget scoring
  if (data.budget === '$1,000+') score += 25;
  else if (data.budget === '$750') score += 20;
  else if (data.budget === '$500') score += 15;
  else if (data.budget === '$250') score += 10;
  
  // Pain point scoring (high-value problems)
  if (data.painPoint === 'Posting across multiple platforms takes too long') score += 15;
  else if (data.painPoint === 'Handling buyer inquiries is a hassle') score += 10;
  else if (data.painPoint === 'Fraud / scam risk') score += 10;
  else if (data.painPoint === 'Too many "Is it still available?"') score += 5;
  
  // Interest confirmation
  if (data.interestConfirmed === 'Yes — I want to reserve early access to Accorria and receive updates about pricing, launch, and next steps.') {
    score += 15;
  }
  
  // Multiple platforms (indicates complexity)
  if (data.platforms && data.platforms.length > 3) score += 10;
  
  // Cap score at 100
  return Math.min(100, score);
}

// Send data to CRM API
function sendToCRM(leadData) {
  const url = CRM_API_URL; // Use live URL when deployed
  
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    payload: JSON.stringify(leadData)
  };
  
  try {
    const response = UrlFetchApp.fetch(url, options);
    const responseData = JSON.parse(response.getContentText());
    
    console.log('CRM API response:', responseData);
    
    // Send success notification
    sendSuccessNotification(leadData, responseData);
    
  } catch (error) {
    console.error('Error sending to CRM:', error);
    
    // Try local URL as fallback for testing
    if (url === CRM_API_URL) {
      console.log('Trying local URL as fallback...');
      sendToLocalCRM(leadData);
    }
  }
}

// Fallback to local CRM for testing
function sendToLocalCRM(leadData) {
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    payload: JSON.stringify(leadData)
  };
  
  try {
    const response = UrlFetchApp.fetch(LOCAL_CRM_URL, options);
    const responseData = JSON.parse(response.getContentText());
    console.log('Local CRM response:', responseData);
  } catch (error) {
    console.error('Error sending to local CRM:', error);
  }
}

// Send success notification email
function sendSuccessNotification(leadData, responseData) {
  const subject = `🎉 New High-Value Lead: ${leadData.name} (Score: ${leadData.score})`;
  const body = `
    <h2>New Lead Captured from Google Forms!</h2>
    
    <h3>Lead Details:</h3>
    <ul>
      <li><strong>Name:</strong> ${leadData.name}</li>
      <li><strong>Email:</strong> ${leadData.email}</li>
      <li><strong>Phone:</strong> ${leadData.phone || 'Not provided'}</li>
      <li><strong>Dealership:</strong> ${leadData.survey_responses.dealership_name}</li>
      <li><strong>City:</strong> ${leadData.survey_responses.city}</li>
      <li><strong>Monthly Volume:</strong> ${leadData.survey_responses.monthly_volume}</li>
      <li><strong>Budget:</strong> ${leadData.survey_responses.willingness_to_pay}</li>
      <li><strong>Pain Point:</strong> ${leadData.survey_responses.biggest_pain_point}</li>
    </ul>
    
    <h3>Lead Scoring:</h3>
    <ul>
      <li><strong>Score:</strong> ${leadData.score}/100</li>
      <li><strong>Status:</strong> ${leadData.status.toUpperCase()}</li>
      <li><strong>Lead ID:</strong> ${responseData.leadId || 'N/A'}</li>
    </ul>
    
    <p><strong>Next Steps:</strong> This lead has been automatically added to your CRM system and scored based on their responses.</p>
  `;
  
  // Send email to admin (you)
  GmailApp.sendEmail(
    'preston@accorria.com', // Your email
    subject,
    '',
    {
      htmlBody: body
    }
  );
}

// Send error notification email
function sendErrorNotification(error, formData) {
  const subject = `⚠️ Google Forms Integration Error`;
  const body = `
    <h2>Error in Google Forms Integration</h2>
    
    <p><strong>Error:</strong> ${error.toString()}</p>
    
    <p><strong>Form Data:</strong></p>
    <pre>${JSON.stringify(formData, null, 2)}</pre>
    
    <p>Please check the Google Apps Script logs for more details.</p>
  `;
  
  GmailApp.sendEmail(
    'preston@accorria.com', // Your email
    subject,
    '',
    {
      htmlBody: body
    }
  );
}

// Send confirmation email to dealer using SendGrid
function sendDealerConfirmationEmail(leadData) {
  try {
    console.log('Sending confirmation email to dealer:', leadData.email);
    
    const emailData = {
      personalizations: [{
        to: [{ email: leadData.email }],
        dynamic_template_data: {
          dealer_name: leadData.survey_responses.dealership_name || leadData.name,
          form_link: FORM_LINK,
          website_url: 'https://accorria.com',
          pain_point: leadData.survey_responses.biggest_pain_point,
          volume: leadData.survey_responses.monthly_volume,
          budget: leadData.survey_responses.willingness_to_pay
        }
      }],
      from: { 
        email: SENDGRID_FROM_EMAIL, 
        name: 'Preston at Accorria' 
      },
      template_id: SENDGRID_TEMPLATE_ID,
      categories: ['accorria', 'dealer-confirmation'],
      custom_args: {
        source: 'google_form',
        lead_id: leadData.id || 'unknown',
        score: leadData.score,
        dealership: leadData.survey_responses.dealership_name || 'Unknown',
        email: leadData.email
      }
    };
    
    const response = UrlFetchApp.fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + SENDGRID_API_KEY,
        'Content-Type': 'application/json'
      },
      payload: JSON.stringify(emailData)
    });
    
    if (response.getResponseCode() === 202) {
      console.log('Confirmation email sent successfully to:', leadData.email);
    } else {
      console.error('Failed to send confirmation email:', response.getContentText());
    }
    
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    // Don't throw error - we don't want email failures to break the lead capture
  }
}

// Test function to manually trigger the script
function testIntegration() {
  // Create a mock form submission event
  const mockEvent = {
    response: {
      getItemResponses: function() {
        return [
          {
            getItem: function() {
              return { getTitle: function() { return 'Email'; } };
            },
            getResponse: function() { return 'test@example.com'; }
          },
          {
            getItem: function() {
              return { getTitle: function() { return 'Dealership Name'; } };
            },
            getResponse: function() { return 'Test Dealership'; }
          },
          {
            getItem: function() {
              return { getTitle: function() { return 'Monthly Listing Volume'; } };
            },
            getResponse: function() { return '50+'; }
          },
          {
            getItem: function() {
              return { getTitle: function() { return 'Willingness to Pay'; } };
            },
            getResponse: function() { return '$1,000+'; }
          },
          {
            getItem: function() {
              return { getTitle: function() { return 'Biggest Pain Point'; } };
            },
            getResponse: function() { return 'Posting across multiple platforms takes too long'; }
          },
          {
            getItem: function() {
              return { getTitle: function() { return 'Dealer Interest Confirmation'; } };
            },
            getResponse: function() { return 'Yes — I want to reserve early access to Accorria and receive updates about pricing, launch, and next steps.'; }
          }
        ];
      }
    }
  };
  
  onFormSubmit(mockEvent);
}

// Send follow-up email after phone call using SendGrid
function sendDealerFollowUpEmail(leadData) {
  try {
    console.log('Sending follow-up email to dealer after phone call:', leadData.email);
    
    const emailData = {
      personalizations: [{
        to: [{ email: leadData.email }],
        dynamic_template_data: {
          dealer_name: leadData.survey_responses.dealership_name || leadData.name,
          form_link: FORM_LINK,
          website_url: 'https://accorria.com',
          pain_point: leadData.survey_responses.biggest_pain_point,
          volume: leadData.survey_responses.monthly_volume,
          budget: leadData.survey_responses.willingness_to_pay
        }
      }],
      from: { 
        email: SENDGRID_FROM_EMAIL, 
        name: 'Preston at Accorria' 
      },
      template_id: SENDGRID_FOLLOWUP_TEMPLATE_ID, // New template for follow-up emails
      categories: ['accorria', 'dealer-followup'],
      custom_args: {
        source: 'phone_call_followup',
        lead_id: leadData.id || 'unknown',
        score: leadData.score,
        dealership: leadData.survey_responses.dealership_name || 'Unknown',
        email: leadData.email
      }
    };
    
    const response = UrlFetchApp.fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + SENDGRID_API_KEY,
        'Content-Type': 'application/json'
      },
      payload: JSON.stringify(emailData)
    });
    
    if (response.getResponseCode() === 202) {
      console.log('Follow-up email sent successfully to:', leadData.email);
      
      // Send notification to admin about follow-up email sent
      sendFollowUpNotification(leadData);
      
    } else {
      console.error('Failed to send follow-up email:', response.getContentText());
    }
    
  } catch (error) {
    console.error('Error sending follow-up email:', error);
    // Don't throw error - we don't want email failures to break the process
  }
}

// Send notification to admin when follow-up email is sent
function sendFollowUpNotification(leadData) {
  const subject = `📞 Follow-up Email Sent: ${leadData.name} (Score: ${leadData.score})`;
  const body = `
    <h2>Follow-up Email Sent After Phone Call</h2>
    
    <h3>Dealer Details:</h3>
    <ul>
      <li><strong>Name:</strong> ${leadData.name}</li>
      <li><strong>Email:</strong> ${leadData.email}</li>
      <li><strong>Phone:</strong> ${leadData.phone || 'Not provided'}</li>
      <li><strong>Dealership:</strong> ${leadData.survey_responses.dealership_name}</li>
      <li><strong>City:</strong> ${leadData.survey_responses.city}</li>
      <li><strong>Monthly Volume:</strong> ${leadData.survey_responses.monthly_volume}</li>
      <li><strong>Budget:</strong> ${leadData.survey_responses.willingness_to_pay}</li>
      <li><strong>Pain Point:</strong> ${leadData.survey_responses.biggest_pain_point}</li>
    </ul>
    
    <h3>Lead Status:</h3>
    <ul>
      <li><strong>Score:</strong> ${leadData.score}/100</li>
      <li><strong>Status:</strong> ${leadData.status.toUpperCase()}</li>
      <li><strong>Follow-up Sent:</strong> ${new Date().toLocaleString()}</li>
    </ul>
    
    <p><strong>Next Steps:</strong> The dealer has received the follow-up email with early access confirmation. Monitor their form completion and engagement.</p>
  `;
  
  // Send email to admin (you)
  GmailApp.sendEmail(
    'preston@accorria.com', // Your email
    subject,
    '',
    {
      htmlBody: body
    }
  );
}

// Test function specifically for SendGrid email
function testSendGridEmail() {
  const testLeadData = {
    email: 'preston@accorria.com', // Send to yourself for testing
    name: 'Test Dealer',
    score: 85,
    survey_responses: {
      dealership_name: 'House of Hardtops',
      biggest_pain_point: 'Posting across multiple platforms takes too long',
      monthly_volume: '50+',
      willingness_to_pay: '$1,000+'
    }
  };
  
  console.log('Testing SendGrid email...');
  sendDealerConfirmationEmail(testLeadData);
}

// Test function for follow-up email
function testFollowUpEmail() {
  const testLeadData = {
    email: 'preston@accorria.com', // Send to yourself for testing
    name: 'Test Dealer',
    score: 85,
    survey_responses: {
      dealership_name: 'House of Hardtops',
      biggest_pain_point: 'Posting across multiple platforms takes too long',
      monthly_volume: '50+',
      willingness_to_pay: '$1,000+'
    }
  };
  
  console.log('Testing follow-up email...');
  sendDealerFollowUpEmail(testLeadData);
}
