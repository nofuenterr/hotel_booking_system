const axios = require('axios');

const fetchWeatherForDate = async (date) => {
  try {
    const response = await axios.get('https://api.open-meteo.com/v1/forecast', {
      params: {
        latitude: 51.5074,
				longitude: -0.1278,
        current: 'temperature_2m,weather_code',
        daily: 'temperature_2m_min,temperature_2m_max,weather_code',
        hourly: 'temperature_2m,weather_code',
        timezone: 'auto',
        start_date: date,
        end_date: date
      }
    });
    return response.data;
  } catch(err) {
    console.error('Weather API error:', err.message);
    return null; 
  }
};

module.exports = { fetchWeatherForDate };