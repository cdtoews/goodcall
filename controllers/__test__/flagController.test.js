const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const flagController = require('../flagController');
const Flag = require('../../model/Flag');

const app = express();
app.use(bodyParser.json());
app.get('/flags', flagController.getAllFlags);

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
    await Flag.deleteMany({});
});

describe('GET /flags', () => {
    it('should return all flags', async () => {
        const flag1 = new Flag({ label: 'Flag 1' });
        const flag2 = new Flag({ label: 'Flag 2' });
        await flag1.save();
        await flag2.save();

        const res = await request(app).get('/flags');
        expect(res.status).toBe(200);
        expect(res.body.length).toBe(2);
        expect(res.body[0].label).toBe('Flag 1');
        expect(res.body[1].label).toBe('Flag 2');
    });

    it('should return 204 if no flags found', async () => {
        const res = await request(app).get('/flags');
        //console.log(res);
        expect(res.status).toBe(204);
        //expect(res.body.message).toBe('No Flags found.');
    });
});