jest.mock('../../../includes/db/db.js', () => ({
	query: jest.fn()
}));

const db = require('../../../includes/db/db.js');
const { validateCreateBookingRequest } = require('../controllers/validations/bookingRequest.js');
const { processCreateBooking, processGetAllGuestBookings } = require('../functions/bookings.js');

describe('Booking Management', () => {
	beforeEach(() => {
		jest.resetAllMocks();
	});

	it('should create a booking successfully', async () => {
    db.query.mockResolvedValueOnce({ rows: [] });
		db.query.mockResolvedValueOnce({ 
      rows: [{ 
        id: 1, 
        guest_id: 5, 
        room_id: 8, 
        check_in_date: '2026-04-26', 
        check_out_date: '2026-04-28',
        weather: null
      }] 
    });

		const result = await processCreateBooking({
			guest_id: 5, 
      room_id: 8, 
      check_in_date: '2026-04-26', 
      check_out_date: '2026-04-28',
      weather: null
    });

		expect(result).toEqual({
      id: 1, 
      guest_id: 5, 
      room_id: 8, 
      check_in_date: '2026-04-26', 
      check_out_date: '2026-04-28',
      weather: null
    });
		expect(db.query).toHaveBeenCalled();
	});

  it('should return bookings for a specific guest', async () => {
    db.query.mockResolvedValueOnce({ rows: [{ id: 5 }] });
    db.query.mockResolvedValueOnce({ 
      rows: [{ 
        id: 1, 
        guest_id: 5, 
        room_id: 8, 
        check_in_date: '2026-04-26', 
        check_out_date: '2026-04-28',
        status: 'pending',
        weather: null,
      }] 
    });

    const result = await processGetAllGuestBookings({ guest_id: 5 });

		expect(result).toEqual({
      data: [{
        id: 1, 
        guest_id: 5, 
        room_id: 8, 
        check_in_date: '2026-04-26', 
        check_out_date: '2026-04-28',
        status: 'pending',
        weather: null,
      }],
      nextCursor: null,
      hasNextPage: false,
    });
		expect(db.query).toHaveBeenCalled();
  });
});

describe('Booking Validation', () => {
	beforeEach(() => {
		jest.resetAllMocks();
	});

  it('should reject when check_in_date is after check_out_date', async () => {
    await expect(validateCreateBookingRequest({
      guest_id: 1,
      room_id: 1,
      check_in_date: '2026-04-28',
      check_out_date: '2026-04-26'
    })).rejects.toThrow();
  });

  it('should reject invalid date format', async () => {
    await expect(validateCreateBookingRequest({
      guest_id: 1,
      room_id: 1,
      check_in_date: '26-04-2026',
      check_out_date: '2026-04-28'
    })).rejects.toThrow();
  });

  it('should reject invalid date values like month 99', async () => {
    await expect(validateCreateBookingRequest({
      guest_id: 1,
      room_id: 1,
      check_in_date: '2026-99-01',
      check_out_date: '2026-04-28'
    })).rejects.toThrow();
  });

  it('should pass with valid data', async () => {
    await expect(validateCreateBookingRequest({
      guest_id: 1,
      room_id: 1,
      check_in_date: '2026-04-26',
      check_out_date: '2026-04-28'
    })).resolves.toBeDefined();
  });
});