const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Branch = require('../Branch');

describe('Branch Model Test', () => {


    it('create & save branch successfully', async () => {
        const validBranch = new Branch({ label: 'Main Branch', company_id: new mongoose.Types.ObjectId(), active: true });
        const savedBranch = await validBranch.save();
        expect(savedBranch._id).toBeDefined();
        expect(savedBranch.label).toBe('Main Branch');
        expect(savedBranch.company_id).toBeDefined();
        expect(savedBranch.active).toBe(true);
    });

    it('insert branch successfully, but the field not defined in schema should be undefined', async () => {
        const branchWithInvalidField = new Branch({ label: 'Main Branch', company_id: new mongoose.Types.ObjectId(), active: true, extraField: 'extra' });
        const savedBranch = await branchWithInvalidField.save();
        expect(savedBranch._id).toBeDefined();
        expect(savedBranch.extraField).toBeUndefined();
    });

    it('create branch without required field should fail', async () => {
        const branchWithoutRequiredField = new Branch({ company_id: new mongoose.Types.ObjectId() });
        let err;
        try {
            await branchWithoutRequiredField.save();
        } catch (error) {
            err = error;
        }
        expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
        expect(err.errors.label).toBeDefined();
    });
});