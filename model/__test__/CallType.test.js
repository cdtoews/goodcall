const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const CallType = require('../CallType');


afterEach(async () => {
    await CallType.deleteMany({});
});

describe('CallType model test', () => {
    it('should create and save a CallType successfully', async () => {
        const validCallType = new CallType({ label: 'Support' });
        const savedCallType = await validCallType.save();

        expect(savedCallType._id).toBeDefined();
        expect(savedCallType.label).toBe('Support');
    });

    it('should fail to create a CallType without required field', async () => {
        const invalidCallType = new CallType({});

        let err;
        try {
            await invalidCallType.save();
        } catch (error) {
            err = error;
        }

        expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
        expect(err.errors.label).toBeDefined();
    });
});