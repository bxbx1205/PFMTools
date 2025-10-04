// Quick test to verify nodemailer is working
const nodemailer = require('nodemailer');

console.log('Testing nodemailer...');
console.log('nodemailer.createTransport:', typeof nodemailer.createTransport);
console.log('nodemailer.createTransporter:', typeof nodemailer.createTransporter);

// Test creating a transporter
try {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'test@gmail.com',
      pass: 'testpass'
    }
  });
  console.log('✅ createTransport works correctly');
  console.log('Transporter created:', !!transporter);
} catch (error) {
  console.log('❌ Error with createTransport:', error.message);
}

// Test the wrong method name
try {
  const transporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: 'test@gmail.com', 
      pass: 'testpass'
    }
  });
  console.log('❌ createTransporter should not work');
} catch (error) {
  console.log('✅ Confirmed: createTransporter is not a function:', error.message);
}