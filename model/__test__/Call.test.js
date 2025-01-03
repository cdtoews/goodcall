const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Call = require('../Call');

// let mongoServer;

// beforeAll(async () => {
//     mongoServer = await MongoMemoryServer.create();
//     const uri = mongoServer.getUri();
//     await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
// });

// afterAll(async () => {
//     await mongoose.disconnect();
//     await mongoServer.stop();
// });

afterEach(async () => {
    await Call.deleteMany({});
});

describe('Call Model Test', () => {
    it('create & save call successfully', async () => {
        const validCall = new Call({
            contact_id: new mongoose.Types.ObjectId(),
            user_id: new mongoose.Types.ObjectId(),
            call_date: new Date(),
            notes: 'Test note',
            call_type: 'Inbound',
            call_flag: 'Important'
        });
        const savedCall = await validCall.save();
        expect(savedCall._id).toBeDefined();
        expect(savedCall.contact_id).toBe(validCall.contact_id);
        expect(savedCall.user_id).toBe(validCall.user_id);
        expect(savedCall.notes).toBe(validCall.notes);
        expect(savedCall.call_type).toBe(validCall.call_type);
        expect(savedCall.call_flag).toBe(validCall.call_flag);
    });

    it('insert call successfully, but the field not defined in schema should be undefined', async () => {
        const callWithInvalidField = new Call({
            contact_id: new mongoose.Types.ObjectId(),
            user_id: new mongoose.Types.ObjectId(),
            call_date: new Date(),
            notes: 'Test note',
            call_type: 'Inbound',
            call_flag: 'Important',
            invalidField: 'Invalid'
        });
        const savedCall = await callWithInvalidField.save();
        expect(savedCall._id).toBeDefined();
        expect(savedCall.invalidField).toBeUndefined();
    });

    it('create call without required field should fail', async () => {
        const callWithoutRequiredField = new Call({
            contact_id: new mongoose.Types.ObjectId(),
            notes: 'Test note'
        });
        let err;
        try {
            await callWithoutRequiredField.save();
        } catch (error) {
            err = error;
        }
        expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
        expect(err.errors.user_id).toBeDefined();
        expect(err.errors.call_type).toBeDefined();
        expect(err.errors.call_flag).toBeDefined();
    });

    it('should return friendly date and time', async () => {
        const callDate = new Date('2023-11-10T09:12:13Z');
        const call = new Call({
            contact_id: new mongoose.Types.ObjectId(),
            user_id: new mongoose.Types.ObjectId(),
            call_date: callDate,
            notes: 'Test note',
            call_type: 'Inbound',
            call_flag: 'Important'
        });
        await call.save();
        const foundCall = await Call.findById(call._id);
        expect(foundCall.friendly_date).toBe('11-10-2023');
        expect(foundCall.friendly_time).toBe('09:12');
    });
});