const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Contact = require('../Contact'); // Adjust the path as necessary

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
    await Contact.deleteMany({});
});

describe('Contact Model Test', () => {
    it('create & save contact successfully', async () => {
        const validContact = new Contact(
            { 
                firstname: 'John', 
                lastname: 'Doe',
                email: 'john.doe@example.com',
                phone: '234-776-0987',
                notes: 'Test note',
                branch_id: new mongoose.Types.ObjectId(),
                active: false
            }
        );
        const savedContact = await validContact.save();
        expect(savedContact._id).toBeDefined();
        expect(savedContact.firstname).toBe('John');
        expect(savedContact.lastname).toBe('Doe');
        expect(savedContact.phone).toBe('234-776-0987');
        expect(savedContact.notes).toBe('Test note');
        expect(savedContact.branch_id).toBeDefined();
       expect(savedContact.email).toBe('john.doe@example.com');
        expect(savedContact.active).toBe(false);
        expect(savedContact.fullName).toBe('John Doe');
    });

    it('insert contact successfully, but the field not defined in schema should be undefined', async () => {
        const contactWithInvalidField = new Contact({ firstname: 'Jane', email: 'jane.doe@example.com', nickname: 'JD' ,branch_id: new mongoose.Types.ObjectId()});
        const savedContact = await contactWithInvalidField.save();
        expect(savedContact._id).toBeDefined();
        expect(savedContact.nickname).toBeUndefined();
    });

    it('create contact without required field, firstname, should fail', async () => {
        const contactWithoutRequiredField = new Contact({ lastname: 'Doe', email: "jane@example.com" ,branch_id: new mongoose.Types.ObjectId()});
        let err;
        try {
            await contactWithoutRequiredField.save();
        } catch (error) {
            err = error;
        }
        expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
       
    });

    
    it('create contact without required field, branch_id, should fail', async () => {
        const contactWithoutRequiredField = new Contact({ firstname: 'Jane',email: "jane@example.com" });
        let err;
        try {
            await contactWithoutRequiredField.save();
        } catch (error) {
            err = error;
        }
        expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
       
    });
});