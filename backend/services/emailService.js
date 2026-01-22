const nodemailer = require('nodemailer');

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

// Send OTP email
exports.sendOTPEmail = async (email, name, otp) => {
  try {
    const transporter = createTransporter();

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f9;
          }
          .header {
            background: linear-gradient(135deg, #dc2626 0%, #ea580c 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: white;
            padding: 30px;
            border-radius: 0 0 10px 10px;
          }
          .otp-box {
            background-color: #fee2e2;
            border: 2px solid #dc2626;
            padding: 20px;
            text-align: center;
            margin: 20px 0;
            border-radius: 8px;
          }
          .otp-code {
            font-size: 36px;
            font-weight: bold;
            color: #dc2626;
            letter-spacing: 8px;
            font-family: 'Courier New', monospace;
          }
          .warning {
            background-color: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            color: #666;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">🔐 Verify Your Account</h1>
          </div>
          <div class="content">
            <h2>Hello ${name}!</h2>
            <p>Thank you for signing up with Bus Booking System. To complete your registration, please use the following One-Time Password (OTP):</p>
            
            <div class="otp-box">
              <p style="margin: 0 0 10px 0; color: #666;">Your OTP Code</p>
              <div class="otp-code">${otp}</div>
              <p style="margin: 10px 0 0 0; color: #666; font-size: 14px;">Valid for 10 minutes</p>
            </div>

            <div class="warning">
              <strong>⚠️ Security Notice:</strong>
              <ul style="margin: 10px 0 0 0;">
                <li>Never share this OTP with anyone</li>
                <li>Our team will never ask for your OTP</li>
                <li>This OTP expires in 10 minutes</li>
              </ul>
            </div>

            <p>If you didn't request this OTP, please ignore this email or contact our support team.</p>
          </div>
          <div class="footer">
            <p>© 2026 Bus Booking System. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Verify Your Account - OTP Code',
      html: htmlContent
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('\n📧 OTP Email sent to:', email);
    console.log('🔐 OTP Code:', otp);
    console.log('✅ Email sent successfully!\n');

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending OTP email:', error);
    throw new Error('Failed to send OTP email');
  }
};

// Send booking confirmation email
exports.sendBookingConfirmationEmail = async (booking, passengerDetails) => {
  try {
    const transporter = createTransporter();

    // Format journey date
    const journeyDate = new Date(booking.journeyDate).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Format booking date
    const bookingDate = new Date(booking.bookingDate).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Get seat numbers
    const seatNumbers = booking.seats.map(s => s.seatNumber).join(', ');

    // Email HTML template
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f9;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: white;
            padding: 30px;
            border-radius: 0 0 10px 10px;
          }
          .booking-id {
            background-color: #f0f0f0;
            padding: 15px;
            border-left: 4px solid #667eea;
            margin: 20px 0;
            font-size: 18px;
            font-weight: bold;
          }
          .details-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          .details-table td {
            padding: 12px;
            border-bottom: 1px solid #eee;
          }
          .details-table td:first-child {
            font-weight: bold;
            width: 40%;
            color: #666;
          }
          .total-fare {
            background-color: #667eea;
            color: white;
            padding: 15px;
            text-align: center;
            font-size: 20px;
            font-weight: bold;
            border-radius: 5px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            color: #666;
            font-size: 12px;
          }
          .success-icon {
            font-size: 48px;
            margin-bottom: 10px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="success-icon">✓</div>
            <h1>Booking Confirmed!</h1>
            <p>Your bus ticket has been successfully booked</p>
          </div>
          
          <div class="content">
            <div class="booking-id">
              Booking ID: ${booking.bookingId}
            </div>
            
            <p>Dear ${passengerDetails.name},</p>
            
            <p>Thank you for choosing our bus booking service. Your booking has been confirmed and payment has been processed successfully.</p>
            
            <h3>Journey Details</h3>
            <table class="details-table">
              <tr>
                <td>From:</td>
                <td>${booking.route.from}</td>
              </tr>
              <tr>
                <td>To:</td>
                <td>${booking.route.to}</td>
              </tr>
              <tr>
                <td>Journey Date:</td>
                <td>${journeyDate}</td>
              </tr>
              <tr>
                <td>Departure Time:</td>
                <td>${booking.schedule.departureTime}</td>
              </tr>
              <tr>
                <td>Arrival Time:</td>
                <td>${booking.schedule.arrivalTime}</td>
              </tr>
            </table>
            
            <h3>Bus Details</h3>
            <table class="details-table">
              <tr>
                <td>Bus Name:</td>
                <td>${booking.bus.busName}</td>
              </tr>
              <tr>
                <td>Bus Number:</td>
                <td>${booking.bus.busNumber}</td>
              </tr>
              <tr>
                <td>Bus Type:</td>
                <td>${booking.bus.busType}</td>
              </tr>
              <tr>
                <td>Seat Number(s):</td>
                <td>${seatNumbers}</td>
              </tr>
            </table>
            
            <h3>Passenger Details</h3>
            <table class="details-table">
              <tr>
                <td>Name:</td>
                <td>${passengerDetails.name}</td>
              </tr>
              <tr>
                <td>Email:</td>
                <td>${passengerDetails.email}</td>
              </tr>
              <tr>
                <td>Phone:</td>
                <td>${passengerDetails.phone}</td>
              </tr>
            </table>
            
            <div class="total-fare">
              Total Fare: ₹${booking.totalFare}
            </div>
            
            <h3>Important Information</h3>
            <ul>
              <li>Please reach the boarding point 15 minutes before departure time</li>
              <li>Carry a valid ID proof for verification</li>
              <li>Keep this booking confirmation email for reference</li>
              <li>Contact us for any queries or cancellations</li>
            </ul>
            
            <p><strong>Booking Date:</strong> ${bookingDate}</p>
            
            <div class="footer">
              <p>Thank you for choosing our service!</p>
              <p>For any assistance, please contact our customer support.</p>
              <p>&copy; ${new Date().getFullYear()} Bus Booking System. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: passengerDetails.email,
      subject: `Bus Booking Confirmation - ${booking.bookingId}`,
      html: htmlContent
    };

    await transporter.sendMail(mailOptions);

    console.log('Booking confirmation email sent to:', passengerDetails.email);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

// Send test email
exports.sendTestEmail = async (toEmail) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: toEmail,
      subject: 'Test Email from Bus Booking System',
      html: '<h1>Email Service is Working!</h1><p>This is a test email from the bus booking system.</p>'
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending test email:', error);
    throw error;
  }
};
