jest.mock('axios');

const axios = require('axios');
const { fetchWeatherForDate } = require('../../../helpers/services/weatherService.js');

describe('Weather Service', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should return weather data on success', async () => {
    const mockData = { daily: { temperature_2m_max: [25], weather_code: [1] } };
    axios.get.mockResolvedValueOnce({ data: mockData });

    const result = await fetchWeatherForDate('2026-04-26');

    expect(result).toEqual(mockData);
    expect(axios.get).toHaveBeenCalled();
  });

  it('should return null when API call fails', async () => {
    axios.get.mockRejectedValueOnce(new Error('Network error'));

    const result = await fetchWeatherForDate('2026-04-26');

    expect(result).toBeNull();
  });
});