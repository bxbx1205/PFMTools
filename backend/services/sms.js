const axios = require('axios');

function assertEnv(name, value) {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
}

async function sendWithTwilio(phone, code) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM; 
  const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID; 
  assertEnv('TWILIO_ACCOUNT_SID', accountSid);
  assertEnv('TWILIO_AUTH_TOKEN', authToken);
  if (!messagingServiceSid) assertEnv('TWILIO_FROM', from);

  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  const params = new URLSearchParams();
  params.append('To', phone);
  if (messagingServiceSid) {
    params.append('MessagingServiceSid', messagingServiceSid);
  } else {
    params.append('From', from);
  }
  params.append('Body', `Your OTP is ${code}. It is valid for 5 minutes.`);

  await axios.post(url, params.toString(), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    auth: { username: accountSid, password: authToken },
    timeout: 10000,
  });
}

async function sendWithMsg91(phone, code) {
  
  const mobile = phone.replace(/\+/g, '');
  const authkey = process.env.MSG91_AUTH_KEY; 
  const templateId = process.env.MSG91_TEMPLATE_ID; 
  assertEnv('MSG91_AUTH_KEY', authkey);
  assertEnv('MSG91_TEMPLATE_ID', templateId);

  const url = 'https://api.msg91.com/api/v5/otp';
  await axios.post(url, {
    template_id: templateId,
    mobile,
    otp: code,
  }, {
    headers: {
      authkey,
      'Content-Type': 'application/json',
    },
    timeout: 10000,
  });
}

async function sendWithMock(phone, code) {
  console.log(`[SMS MOCK] OTP ${code} sent to ${phone}`);
}

async function sendOtpSms(phone, code) {
  const provider = (process.env.SMS_PROVIDER || '').toLowerCase();
  try {
    if (provider === 'twilio') return await sendWithTwilio(phone, code);
    if (provider === 'msg91') return await sendWithMsg91(phone, code);
    
    return await sendWithMock(phone, code);
  } catch (err) {
    
    console.error('SMS send error:', err.response?.data || err.message);
    throw err;
  }
}

module.exports = { sendOtpSms };