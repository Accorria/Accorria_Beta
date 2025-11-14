/**
 * Simple Google Apps Script for Accorria CRM Integration
 * This script captures Google Form submissions and sends them to your CRM
 */

// Your CRM API endpoint
const CRM_API_URL = 'https://accorria.com/api/leads';

// Main function that runs when form is submitted
function onFormSubmit(e) {
  try {
    console.log('=== FORM SUBMISSION TRIGGERED ===');
    console.log('Event object:', e);
    
    // Get the form and latest response
    const form = FormApp.getActiveForm();
    const responses = form.getResponses();
    
    if (responses.length === 0) {
      console.log('No responses found in form');
      return;
    }
    
    // Get the most recent response
    const latestResponse = responses[responses.length - 1];
    console.log('Latest response:', latestResponse);
    
    // Extract the form data
    const formData = extractFormData(latestResponse);
    console.log('Extracted form data:', formData);
    
    // Create lead data for CRM
    const leadData = {
      name: formData.name || formData.dealershipName || 'Unknown',
      email: formData.email,
      phone: formData.phone || '',
      source: 'google_forms',
      utm_source: 'google_forms',
      utm_medium: 'form',
      utm_campaign: 'dealer_early_access',
      score: calculateSimpleScore(formData),
      notes: `Google Form submission - Dealership: ${formData.dealershipName || 'N/A'}, Volume: ${formData.volume || 'N/A'}, Pain Point: ${formData.painPoint || 'N/A'}`,
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
      status: 'warm'
    };
    
    console.log('Lead data to send:', leadData);
    
    // Send to CRM
    const result = sendToCRM(leadData);
    console.log('CRM API result:', result);
    
    if (result.success) {
      console.log('✅ Lead successfully sent to CRM!');
    } else {
      console.log('❌ Failed to send lead to CRM:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Error in onFormSubmit:', error);
    console.error('Error details:', error.toString());
  }
}

// Extract form data from response
function extractFormData(response) {
  const data = {};
  const responses = response.getItemResponses();
  
  responses.forEach(itemResponse => {
    const question = itemResponse.getItem().getTitle().toLowerCase();
    const answer = itemResponse.getResponse();
    
    console.log(`Question: "${question}" -> Answer: "${answer}"`);
    
    // Map questions to data fields
    if (question.includes('email')) {
      data.email = answer;
    } else if (question.includes('dealership') || question.includes('business')) {
      data.dealershipName = answer;
    } else if (question.includes('name') && !question.includes('dealership')) {
      data.name = answer;
    } else if (question.includes('role') || question.includes('position')) {
      data.role = answer;
    } else if (question.includes('phone')) {
      data.phone = answer;
    } else if (question.includes('city')) {
      data.city = answer;
    } else if (question.includes('volume') || question.includes('listings')) {
      data.volume = answer;
    } else if (question.includes('platform') || question.includes('currently use')) {
      data.platforms = Array.isArray(answer) ? answer.join(', ') : answer;
    } else if (question.includes('pain') || question.includes('challenge') || question.includes('problem')) {
      data.painPoint = answer;
    } else if (question.includes('budget') || question.includes('pay') || question.includes('willing')) {
      data.budget = answer;
    } else if (question.includes('interest') || question.includes('confirm')) {
      data.interestConfirmed = answer;
    }
  });
  
  return data;
}

// Simple scoring function
function calculateSimpleScore(formData) {
  let score = 50; // Base score
  
  // Increase score based on volume
  if (formData.volume) {
    if (formData.volume.includes('50+') || formData.volume.includes('25-50')) {
      score += 30;
    } else if (formData.volume.includes('10-25')) {
      score += 20;
    } else {
      score += 10;
    }
  }
  
  // Increase score based on budget
  if (formData.budget) {
    if (formData.budget.includes('$1000') || formData.budget.includes('$750')) {
      score += 25;
    } else if (formData.budget.includes('$500')) {
      score += 15;
    } else {
      score += 5;
    }
  }
  
  // Increase score if they have pain points
  if (formData.painPoint && formData.painPoint !== '') {
    score += 15;
  }
  
  return Math.min(score, 100); // Cap at 100
}

// Send data to CRM API
function sendToCRM(leadData) {
  try {
    const payload = JSON.stringify(leadData);
    console.log('Sending payload to CRM:', payload);
    
    const response = UrlFetchApp.fetch(CRM_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      payload: payload
    });
    
    const responseText = response.getContentText();
    console.log('CRM API response:', responseText);
    
    if (response.getResponseCode() === 200) {
      return { success: true, data: JSON.parse(responseText) };
    } else {
      return { success: false, error: `HTTP ${response.getResponseCode()}: ${responseText}` };
    }
    
  } catch (error) {
    console.error('Error sending to CRM:', error);
    return { success: false, error: error.toString() };
  }
}

// Test function to manually trigger
function testFormSubmission() {
  console.log('=== TESTING FORM SUBMISSION ===');
  onFormSubmit(null);
}
