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
const { be } = require('date-fns/locale');


const app = express();
app.use(express.json());
app.get('/calls', callController.getCall);
app.post('/calls', callController.createNewCall);

app.get('/calls/mine', callController.getMyCalls);
app.get('/calls/all', callController.getAllCalls);



afterEach(async () => {
    await Call.deleteMany({});
    await Company.deleteMany({});
    await Branch.deleteMany({});
    await Contact.deleteMany({});   
    await User.deleteMany({});
});

describe('Call Controller', () => {
    it('should create a new call', async () => {
        const company1 = await Company.create({ label: 'Company 1' });
        const company2 = await Company.create({ label: 'Company 1' });

        const branch1 = await Branch.create({ label: 'Branch 1', company_id: company1._id });
        const branch2 = await Branch.create({ label: 'Branch 2', company_id: company2._id });

        const contact1 = await Contact.create({ firstname: 'Jimmy', branch_id: branch1._id });
        const contact2 = await Contact.create({ firstname: 'Charlie', branch_id: branch2._id });

        const user1 = await User.create({ username: 'john@doe.com', password: 'SomeLongPasswordHash' });
        const user2 = await User.create({ username: 'jane@doe.com', password: 'SomeLongPasswordHash' });

        const note1 = 'This is a note';
        const callDate = new Date('2023-11-10T09:12:13Z');

        const newCall = {
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
        //console.log(`response: ${JSON.stringify(response.body)}`);

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


    it('should get only my calls', async () => {
        const company1 = await Company.create({ label: 'Company 1' });
        const company2 = await Company.create({ label: 'Company 2' });
        const company3 = await Company.create({ label: 'Company 3' });


        const branch1 = await Branch.create({ label: 'Branch 1', company_id: company1._id });
        const branch2 = await Branch.create({ label: 'Branch 2', company_id: company2._id });
        const branch2a = await Branch.create({ label: 'Branch 2a', company_id: company2._id });
        const branch3 = await Branch.create({ label: 'Branch 3', company_id: company3._id });
        const branch3a = await Branch.create({ label: 'Branch 3a', company_id: company3._id });
        const branch3b = await Branch.create({ label: 'Branch 3b', company_id: company3._id });


        const contact1 = await Contact.create({ firstname: 'Jimmy1', branch_id: branch1._id });
        const contact2 = await Contact.create({ firstname: 'Jimmy2', branch_id: branch2._id });
        const contact2a = await Contact.create({ firstname: 'Jimmy2a', branch_id: branch2a._id });
        const contact3 = await Contact.create({ firstname: 'Jimmy3', branch_id: branch3._id });
        const contact3a = await Contact.create({ firstname: 'Jimmy3a', branch_id: branch3._id });
        const contact3b = await Contact.create({ firstname: 'Jimmy3b', branch_id: branch3._id });


        const user1 = await User.create({ username: 'john@doe.com', password: 'SomeLongPasswordHash' });
        const user2 = await User.create({ username: 'jim@doe.com', password: 'someotherLongPwHash' });
        const user3 = await User.create({ username: 'joe@doe.com', password: 'cornedBeefHash' });



        const call1 = await Call.create({
            contact_id: contact1._id,
            user_id: user1._id,
            call_date: new Date(),
            call_type: 'sales',
            call_flag: 'architect',
            notes: 'This is a note'
        });

        const call2 = await Call.create({
            contact_id: contact2._id,
            user_id: user2._id,
            call_date: new Date(),
            call_type: 'other type',
            call_flag: 'plumbing',
            notes: 'insert not here'
        });

        const call2a = await Call.create({
            contact_id: contact2._id,
            user_id: user2._id,
            call_date: new Date(),
            call_type: 'anohter type',
            call_flag: 'who knows',
            notes: 'insert not a note here'
        });




        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'user': user1.username,
            'Authorization': 'Basic cGstWjBPU3pMdkljT0kyVUl2RGhkVEdWVmZSU1NlaUdTdG5jZXF3VUU3bjBBaDo='
        };

        const response = await request(app)
            .get('/calls/mine')
            .set(headers);

        expect(response.statusCode).toEqual(200);
        expect(response.body).toHaveLength(1);
        expect(response.body[0].contact_id._id).toBe(call1.contact_id.toString());
        expect(response.body[0].user_id._id).toBe(call1.user_id.toString());
        expect(response.body[0].call_type).toBe(call1.call_type);
        expect(response.body[0].call_flag).toBe(call1.call_flag);
        expect(response.body[0].notes).toBe(call1.notes);
        expect(response.body[0].call_date).toBe(call1.call_date.toISOString());
    });

    // Add more tests as needed

    it('should get all calls', async () => {
        const company1 = await Company.create({ label: 'Company 1' });
        const company2 = await Company.create({ label: 'Company 2' });

        const branch1 = await Branch.create({ label: 'Branch 1', company_id: company1._id });
        const branch2 = await Branch.create({ label: 'Branch 2', company_id: company2._id });

        const contact1 = await Contact.create({ firstname: 'Jimmy', branch_id: branch1._id });
        const contact2 = await Contact.create({ firstname: 'Charlie', branch_id: branch2._id });

        const user1 = await User.create({ username: 'john@doe.com', password: 'SomeLongPasswordHash' });
        const user2 = await User.create({ username: 'jane@doe.com', password: 'SomeLongPasswordHash' });

        const call1 = await Call.create({
            contact_id: contact1._id,
            user_id: user1._id,
            call_date: new Date(),
            call_type: 'sales',
            call_flag: 'architect',
            notes: 'This is a note'
        });

        const call2 = await Call.create({
            contact_id: contact2._id,
            user_id: user2._id,
            call_date: new Date(),
            call_type: 'support',
            call_flag: 'engineer',
            notes: 'This is another note'
        });

        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'user': user1.username,
            'Authorization': 'Basic cGstWjBPU3pMdkljT0kyVUl2RGhkVEdWVmZSU1NlaUdTdG5jZXF3VUU3bjBBaDo='
        };

        const response = await request(app)
            .get('/calls/all')
            .set(headers);

        expect(response.statusCode).toEqual(200);
        expect(response.body).toHaveLength(2);

        const call1Response = response.body.find(call => call._id === call1._id.toString());
        expect(call1Response).not.toBeNull();
        expect(call1Response.contact_id._id).toBe(call1.contact_id.toString());
        expect(call1Response.user_id._id).toBe(call1.user_id.toString());
        expect(call1Response.call_type).toBe(call1.call_type);
        expect(call1Response.call_flag).toBe(call1.call_flag);
        expect(call1Response.notes).toBe(call1.notes);
        expect(call1Response.call_date).toBe(call1.call_date.toISOString());

        const call2Response = response.body.find(call => call._id === call2._id.toString());
        expect(call2Response).not.toBeNull();
        expect(call2Response.contact_id._id).toBe(call2.contact_id.toString());
        expect(call2Response.user_id._id).toBe(call2.user_id.toString());
        expect(call2Response.call_type).toBe(call2.call_type);
        expect(call2Response.call_flag).toBe(call2.call_flag);
        expect(call2Response.notes).toBe(call2.notes);
        expect(call2Response.call_date).toBe(call2.call_date.toISOString());
    });





});