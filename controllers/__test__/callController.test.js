const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const express = require('express');
const callController = require('../callController'); // Adjust the path as necessary
const Call = require('../../model/Call'); // Adjust the path as necessary
const User = require('../../model/User'); // Adjust the path as necessary
const Branch = require('../../model/Branch'); // Adjust the path as necessary
const Company = require('../../model/Company'); // Adjust the path as necessary
const Contact = require('../../model/Contact'); // Adjust the path as necessary


const app = express();
app.use(express.json());
app.get('/calls', callController.getCall);
app.post('/calls', callController.createNewCall);

app.get('/calls/mine', callController.getMyCalls);
app.get('/calls/all', callController.getAllCalls);
afterEach(async () => {
    await Call.deleteMany({});
});

describe('Call Controller', () => {
    it('should create a new call', async () => {
        const company1 = await Company.create({ label: 'Company 1' });
        const company2 = await Company.create({ label: 'Company 1' });

        const branch1 = await Branch.create({ label: 'Branch 1', company_id: company1._id });
        const branch2 = await Branch.create({ label: 'Branch 2', company_id: company2._id });

        const contact1 = await Contact.create({ firstname: 'Jimmy', branch_id: branch1._id });
        const contact2 = await Contact.create({ firstname: 'Charlie', branch_id: branch2._id });

        const user1 = await User.create({ username: 'john@doe.com', password: 'SomeLongPasswordHash'});
        const user2 = await User.create({ username: 'jane@doe.com', password: 'SomeLongPasswordHash'});
        
        const note1 = 'This is a note';
        const callDate = new Date('2023-11-10T09:12:13Z');

        const newCall ={
            contact_id: contact1._id,
            user_id: user1._id,
            call_date: callDate,
            call_type: 'sales',
            call_flag: 'architect',
            notes: note1,
        };

        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'user': user1.username,
            'Authorization': 'Basic cGstWjBPU3pMdkljT0kyVUl2RGhkVEdWVmZSU1NlaUdTdG5jZXF3VUU3bjBBaDo='
          };

        const response = await request(app)
            .post('/calls')
            .set(headers)
            .send(newCall);
        console.log(`response: ${JSON.stringify(response.body)}`);

        expect(response.statusCode).toEqual(201);
        expect(response.body.caller).toBe(newCall.caller);
        expect(response.body.recipient).toBe(newCall.recipient);
        expect(response.body.duration).toBe(newCall.duration);

        const call = await Call.findOne({ caller: 'John Doe' });
        expect(call).not.toBeNull();
        expect(call.caller).toBe(newCall.caller);
        expect(call.recipient).toBe(newCall.recipient);
        expect(call.duration).toBe(newCall.duration);
    });

    // Add more tests as needed
});