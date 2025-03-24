require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Configure Google Calendar API
const serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT_JSON);
const jwtClient = new google.auth.JWT(
    serviceAccount.client_email,
    null,
    serviceAccount.private_key,
    ['https://www.googleapis.com/auth/calendar']
);
const calendar = google.calendar({ version: 'v3', auth: jwtClient });

// Routes
app.post('/api/appointments', async (req, res) => {
    try {
        const { name, email, phone, date, time, service } = req.body;
        
        // Create event in Google Calendar
        const event = {
            summary: `Dental Appointment - ${name}`,
            description: `Service: ${service}\nPhone: ${phone}\nEmail: ${email}`,
            start: {
                dateTime: `${date}T${time}:00`,
                timeZone: 'Asia/Kolkata',
            },
            end: {
                dateTime: `${date}T${time.split(':')[0]}:${(parseInt(time.split(':')[1]) + 30).toString().padStart(2, '0')}:00`,
                timeZone: 'Asia/Kolkata',
            },
        };

        const response = await calendar.events.insert({
            calendarId: 'primary',
            resource: event,
        });

        res.json({
            success: true,
            message: 'Appointment scheduled successfully',
            eventId: response.data.id
        });
    } catch (error) {
        console.error('Error scheduling appointment:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to schedule appointment',
            error: error.message
        });
    }
});

app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, message } = req.body;
        
        // Here you would typically implement email sending logic
        // For now, we'll just log the message and return success
        console.log('Contact form submission:', { name, email, message });
        
        res.json({
            success: true,
            message: 'Message received successfully'
        });
    } catch (error) {
        console.error('Error processing contact form:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process contact form',
            error: error.message
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'healthy' });
});

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});