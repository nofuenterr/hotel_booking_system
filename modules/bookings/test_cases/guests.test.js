jest.mock('../../../includes/db/db.js', () => ({
	query: jest.fn()
}));

const db = require('../../../includes/db/db.js');
const { processCreateGuest } = require('../functions/guests.js');

describe('Guest Management', () => {
	beforeEach(() => {
		jest.resetAllMocks();
	});

	it('should create a room successfully', async () => {
		db.query.mockResolvedValueOnce({ 
      rows: [{ 
        id: 1, 
        first_name: 'John', 
        last_name: 'Doe', 
        email: 'johndoe@mail.com',
				phone: '09876543210'
      }] 
    });

		const result = await processCreateGuest({
			first_name: 'John', 
			last_name: 'Doe', 
			email: 'johndoe@mail.com',
			phone: '09876543210'
		});

		expect(result).toEqual({
      id: 1, 
			first_name: 'John', 
			last_name: 'Doe', 
			email: 'johndoe@mail.com',
			phone: '09876543210'
    });
		expect(db.query).toHaveBeenCalled();
	});
});