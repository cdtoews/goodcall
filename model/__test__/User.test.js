const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('../User'); // Adjust the path as necessary



afterEach(async () => {
    await User.deleteMany({});
});

describe('User Model Test', () => {
    it('create & save user successfully', async () => {
        const pwResetDate = new Date('2023-11-10T09:12:13Z');
        const userData = 
        { 
            username: 'john.doe@doe.com',
            pw_reset_timeout: pwResetDate,
             password: 'SomeLongPasswordHash' ,
             temp_password: 'someOtherLongPasswordHash'
            };
        const validUser = new User(userData);
        const savedUser = await validUser.save();

        expect(savedUser._id).toBeDefined();
        expect(savedUser.username).toBe(userData.username);
        expect(savedUser.password).toBe(userData.password);
        expect(savedUser.temp_password).toBe(userData.temp_password);
        expect(savedUser.active).toBe(true);
        expect(savedUser.receive_emails).toBe(false);
        expect(savedUser.roles.User).toBe(2001);
        expect(savedUser.pw_reset_timeout).toBe(pwResetDate);

        //let's check virtual fields
        expect(savedUser.short_username).toBe('john.doe');
        expect(savedUser.admin).toBe(false);
    });

    it('create & save user successfully, testing admin virtual', async () => {
        const userData = 
        { 
            username: 'john_doe@doe.com', 
            password: 'SomeLongPasswordHash',
            roles: { Admin: 5150 }

        };
        const validUser = new User(userData);
        const savedUser = await validUser.save();

        expect(savedUser._id).toBeDefined();
        expect(savedUser.username).toBe(userData.username);
        expect(savedUser.password).toBe(userData.password);

        //let's check virtual fields
        expect(savedUser.short_username).toBe('john_doe');
        expect(savedUser.roles.Admin).toBe(5150);
        expect(savedUser.admin).toBe(true);
    });


    it('insert user successfully, but the field not defined in schema should be undefined', async () => {
        const userData = { username: 'john@doe.com', password: 'SomeLongPasswordHash', nickname: 'Johnny' };
        const userWithInvalidField = new User(userData);
        const savedUser = await userWithInvalidField.save();

        expect(savedUser._id).toBeDefined();
        expect(savedUser.nickname).toBeUndefined();
    });

    it('create user without required field, username, should fail', async () => {
        const userWithoutRequiredField = new User({ password: 'SomeLongPasswordHash' });
        let err;
        try {
            await userWithoutRequiredField.save();
        } catch (error) {
            err = error;
        }
        expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
       
    });

    it('create user without required field, password, should fail', async () => {
        const userWithoutRequiredField = new User({  username: 'john@doe.com' });
        let err;
        try {
            await userWithoutRequiredField.save();
        } catch (error) {
            err = error;
        }
        expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
       
    });
});