const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Flag = require('../Flag'); // Adjust the path as necessary


afterEach(async () => {
    await Flag.deleteMany({});
});

describe('Flag model test', () => {
    it('should create and save a flag successfully', async () => {
        const flagData = { label: 'Test Flag' };
        const flag = new Flag(flagData);
        const savedFlag = await flag.save();

        expect(savedFlag._id).toBeDefined();
        expect(savedFlag.label).toBe(flagData.label);
    });

    it('should fail to create a flag without required fields', async () => {
        const flag = new Flag();

        let err;
        try {
            await flag.save();
        } catch (error) {
            err = error;
        }

        expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
        //expect(err.errors.name).toBeDefined();
    });
});