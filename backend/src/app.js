const express = require('express');
const cors = require('cors');
const accommodationRoutes = require('./routes/accommodation.routes');
const adminAuthRoutes = require('./routes/adminAuth.routes');
const blogRoutes = require('./routes/blog.routes');
const dayTourRoutes = require('./routes/dayTour.routes');
const discoverRoutes = require('./routes/discover.routes');
const itineraryCategoryRoutes = require('./routes/itineraryCategory.routes');
const itineraryDayRoutes = require('./routes/itineraryDay.routes');
const itineraryPlanRoutes = require('./routes/itineraryPlan.routes');
const inquiryRoutes = require('./routes/inquiry.routes');
const locationRoutes = require('./routes/location.routes');
const publicItineraryRoutes = require('./routes/publicItinerary.routes');
const travelThemeRoutes = require('./routes/travelTheme.routes');
const errorHandler = require('./middleware/errorHandler');
const { sendTestEmail } = require('./services/email.service');

const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/accommodations', accommodationRoutes);
app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/day-tours', dayTourRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/travel-themes', travelThemeRoutes);
app.use('/api/itineraries', publicItineraryRoutes);
app.use('/api/discover', discoverRoutes);
app.use('/api/itinerary-categories', itineraryCategoryRoutes);
app.use('/api/itinerary-plans', itineraryPlanRoutes);
app.use('/api/itinerary-days', itineraryDayRoutes);
app.use('/api/inquiries', inquiryRoutes);

app.get('/api/test-email', async (req, res) => {
  try {
    await sendTestEmail();

    res.status(200).json({
      success: true,
      message: 'Test email sent',
    });
  } catch (error) {
    console.error('Test email failed:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

app.use(errorHandler);

module.exports = app;
