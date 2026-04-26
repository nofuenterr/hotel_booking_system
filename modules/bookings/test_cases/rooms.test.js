jest.mock('../../../includes/db/db.js', () => ({
	query: jest.fn()
}));

const db = require('../../../includes/db/db.js');
const { processCreateRoom } = require('../functions/rooms.js');

describe('Room Management', () => {
	beforeEach(() => {
		jest.resetAllMocks();
	});

	it('should create a room successfully', async () => {
		db.query.mockResolvedValueOnce({ 
      rows: [{ 
        id: 1, 
        room_number: '101', 
        room_type: 'double', 
        price_per_night: 150.00 
      }] 
    });

		const result = await processCreateRoom({
			room_number: '101',
			room_type: 'double',
			price_per_night: 150.00
		});

		expect(result).toEqual({
      id: 1,
      room_number: '101',
      room_type: 'double',
      price_per_night: 150.00
    });
		expect(db.query).toHaveBeenCalled();
	});
});