const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const express = require('express');
const userController = require('../usersController');
const User = require('../../model/User');
//const { sendEmail } = require('../../services/emailService');

// let mongoServer;
const app = express();
app.use(express.json());
app.get('/users', userController.getAllUsers);
app.post('/users', userController.updateUser);
app.get('/users/list', userController.getUserList);
app.get('/users/myinfo', userController.getMyUser);
app.post('/users/newuser', userController.createNewUser);
app.get('/users/:id', userController.getUser);


afterEach(async () => {
    await User.deleteMany({});
});

describe('User Controller', () => {


    it('should create a new user', async () => {
        //sendEmail: jest.fn().mockResolvedValue(true);
        //jestConfig.mock('sendEmail', jest.fn().mockResolvedValue(true));
        const sendEmail = jest.fn().mockResolvedValue(true);
        //const mockedSendEmail = jest.spyOn(utils, "getData").mockImplementation((name) => "Hello !!! " + name);

        const newUser = { username: 'john@example.com', password: 'LongHashedPassword' };
        const response = await request(app).post('/users/newuser').send(newUser);
        expect(response.status).toBe(201);
    });

    it('should get all users with passwords stripped', async () => {
        const user1 = new User({ username: 'john@example.com', password: 'password123' });
        const user2 = new User({ username: 'jane@example.com', password: 'password123' });
        await user1.save();
        await user2.save();

        const response = await request(app).get('/users');

        expect(response.status).toBe(200);
        expect(response.body.length).toBe(2);
        expect(response.body[0].name).toBe(user1.name);
        expect(response.body[1].name).toBe(user2.name);
        expect(response.body[0].password).toBe("");
        expect(response.body[1].password).toBe("");

    });


    it('should get user list', async () => {
        const user1 = new User({ username: 'john@example.com', password: 'password123' });
        const user2 = new User({ username: 'jane@example.com', password: 'password123' });
        await user1.save();
        await user2.save();

        const response = await request(app).get('/users/list');

        expect(response.status).toBe(200);
        expect(response.body.length).toBe(2);
        expect(response.body[0].username).toBe(user1.username);
        expect(response.body[1].username).toBe(user2.username);
    });


        //TODO:  Fix this test
        it('should get my user info', async () => {
            const user = new User({ username: 'john3@example.com', password: 'password123' });
            await user.save();

            const headers = {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'user': user.username,
                'Authorization': 'Basic cGstWjBPU3pMdkljT0kyVUl2RGhkVEdWVmZSU1NlaUdTdG5jZXF3VUU3bjBBaDo='
              };

            const response = await request(app).get('/users/myinfo')
            .set( headers );

            //console.log(`response: ${JSON.stringify(response.body)}`);

            expect(response.status).toBe(200);
            expect(response.body.username).toBe(user.username);
            expect(response.body.password).toBe("");
        });

    it('should get a user by id', async () => {
        const user = new User({ username: 'john@example.com', password: 'password123' });
        await user.save();

        const response = await request(app).get(`/users/${user._id}`);

        expect(response.status).toBe(200);
        expect(response.body.username).toBe(user.username);
        expect(response.body.password).toBe("");
        expect(response.body._id).toBe(user._id.toString());
        expect(response.body.admin).toBe(false);
        expect(response.body.short_username).toBe('john');
        expect(response.body.receive_emails).toBe(false);
        expect(response.body.active).toBe(true);
    });


    it('should get a user by id who is admin', async () => {
        const user = new User({ username: 'john@example.com', password: 'password123', roles: { Admin: 5150 }, receive_emails: true });
        await user.save();

        const response = await request(app).get(`/users/${user._id}`);

        expect(response.status).toBe(200);
        expect(response.body.username).toBe(user.username);
        expect(response.body.password).toBe("");
        expect(response.body._id).toBe(user._id.toString());
        expect(response.body.admin).toBe(true);
        expect(response.body.short_username).toBe('john');
        expect(response.body.receive_emails).toBe(true);
        expect(response.body.active).toBe(true);
    });



});