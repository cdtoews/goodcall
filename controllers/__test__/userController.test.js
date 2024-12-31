const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const express = require('express');
const userController = require('../userController');
const User = require('../../models/user');

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
        const newUser = { username: 'john@example.com', password: 'LongHashedPassword' };

        const response = await request(app).post('/users/newuser').send(newUser);

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('_id');
        expect(response.body.name).toBe(newUser.name);
        expect(response.body.email).toBe(newUser.email);
    });

    it('should get all users', async () => {
        const user1 = new User({ name: 'John Doe', email: 'john@example.com', password: 'password123' });
        const user2 = new User({ name: 'Jane Doe', email: 'jane@example.com', password: 'password123' });
        await user1.save();
        await user2.save();

        const response = await request(app).get('/users');

        expect(response.status).toBe(200);
        expect(response.body.length).toBe(2);
        expect(response.body[0].name).toBe(user1.name);
        expect(response.body[1].name).toBe(user2.name);
    });
});