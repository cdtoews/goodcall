const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Company = require('../Company'); // Adjust the path as necessary

// let mongoServer;

// beforeAll(async () => {
//     mongoServer = await MongoMemoryServer.create();
//     const uri = mongoServer.getUri();
//     await mongoose.connect(uri, {
//         useNewUrlParser: true,
//         useUnifiedTopology: true,
//     });
// });

// afterAll(async () => {
//     await mongoose.disconnect();
//     await mongoServer.stop();
// });

afterEach(async () => {
    await Company.deleteMany({});
});

describe('Company Model Test', () => {
    it('create & save company successfully', async () => {
        const companyData = { label: 'Test Company', active: true };
        const validCompany = new Company(companyData);
        const savedCompany = await validCompany.save();

        expect(savedCompany._id).toBeDefined();
        expect(savedCompany.label).toBe(companyData.label);
        expect(savedCompany.active).toBe(companyData.active);
    });

    it('insert company successfully, but the field not defined in schema should be undefined', async () => {
        const companyData = { label: 'Test Company', active: true, extraField: 'This field is not defined in schema' };
        const companyWithInvalidField = new Company(companyData);
        const savedCompany = await companyWithInvalidField.save();

        expect(savedCompany._id).toBeDefined();
        expect(savedCompany.extraField).toBeUndefined();
    });

    it('create company without required field, should default to true', async () => {
        const companyWithoutRequiredField = new Company({ label: 'Test Company' });
        await companyWithoutRequiredField.save();
        expect(companyWithoutRequiredField.active).toBe(true);
        
    });
});