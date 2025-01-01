const request = require('supertest');
const express = require('express');
const callTypeController = require('../callTypeController');
const CallType = require('../../model/CallType');
const logger = require('../../middleware/logger');

const app = express();
app.use(express.json());
app.get('/calltypes', callTypeController.getAllCallTypes);

jest.mock('../../model/CallType');
jest.mock('../../middleware/logger');

describe('callTypeController', () => {
    describe('getAllCallTypes', () => {
        it('should return all call types sorted by label', async () => {
            const mockCallTypes = [{ label: 'Type1' }, { label: 'Type2' }];
            CallType.find.mockResolvedValue(mockCallTypes);

            const response = await request(app).get('/calltypes');

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockCallTypes);
            expect(logger.trace).toHaveBeenCalledWith('getAllCallTypes');
        });

        it('should return 204 if no call types are found', async () => {
            CallType.find.mockResolvedValue(null);

            const response = await request(app).get('/calltypes');

            expect(response.status).toBe(204);
            expect(response.body).toEqual({ message: 'No CallType found.' });
            expect(logger.trace).toHaveBeenCalledWith('getAllCallTypes');
        });

        it('should handle errors', async () => {
            const errorMessage = 'Error fetching call types';
            CallType.find.mockRejectedValue(new Error(errorMessage));

            const response = await request(app).get('/calltypes');

            expect(response.status).toBe(500);
            expect(logger.error).toHaveBeenCalledWith(new Error(errorMessage), 'getAllCallTypes');
        });
    });
});