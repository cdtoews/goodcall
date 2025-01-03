const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const branchController = require('../branchController');
const Branch = require('../../model/Branch');
const Company = require('../../model/Company');

const app = express();
app.use(bodyParser.json());
app.get('/branches/allbycompany/:id', branchController.getAllBranchesByCompany);
app.get('/branches/bycompany/:id', branchController.getBranchesByCompany);
app.post('/branches', branchController.createNewBranch);
app.put('/branches', branchController.updateBranch);
app.get('/branches/:id', branchController.getBranch);


afterEach(async () => {
    await Branch.deleteMany({});
});

describe('Branch Controller', () => {
    it('should create a new branch', async () => {
        const company1 = await Company.create({ label: 'Company 1' });
        const res = await request(app)
            .post('/branches')
            .send({ label: 'Branch 1', company_id: company1._id })
            //.send({ label: 'Branch 1' })
            .set('Content-Type', 'application/json');;
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('_id');
        expect(res.body.label).toBe('Branch 1');
    });

    it('should get branches by company', async () => {
        const company1 = await Company.create({ label: 'Company 1' });
        await Branch.create({ label: 'Branch 1', company_id: company1._id, active: true });
        const res = await request(app).get(`/branches/bycompany/${company1._id}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.length).toBe(1);
        expect(res.body[0].label).toBe('Branch 1');
    });

    it('should get all ACTIVE branches by company', async () => {
        const company1 = await Company.create({ label: 'Company 1' });
        const company2 = await Company.create({ label: 'Company 2' });
        await Branch.create({ label: 'Branch 1', company_id: company1._id });
        await Branch.create({ label: 'Branch 2', company_id: company1._id});
        await Branch.create({ label: 'Branch 2a', company_id: company1._id, active: false });
        await Branch.create({ label: 'Branch 3', company_id: company2._id});
        const res = await request(app).get(`/branches/bycompany/${company1._id}`);

        //console.log(`res.body: ${JSON.stringify(res.body)}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.length).toBe(2);
    });

    it('should get all active/inactive branches by company', async () => {
        const company1 = await Company.create({ label: 'Company 1' });
        const company2 = await Company.create({ label: 'Company 2' });
        await Branch.create({ label: 'Branch 1', company_id: company1._id });
        await Branch.create({ label: 'Branch 2', company_id: company1._id});
        await Branch.create({ label: 'Branch 2a', company_id: company1._id, active: false });
        await Branch.create({ label: 'Branch 3', company_id: company2._id});
        await Branch.create({ label: 'Branch 4', company_id: company2._id});
        await Branch.create({ label: 'Branch 5', company_id: company2._id});
        await Branch.create({ label: 'Branch 6', company_id: company2._id});
        const res = await request(app).get(`/branches/allbycompany/${company1._id}`);

        //console.log(`res.body: ${JSON.stringify(res.body)}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.length).toBe(3);
    });


    it('should update a branch', async () => {
        const company1 = await Company.create({ label: 'Company 1' });
        const branch = await Branch.create({ label: 'Branch 1', company_id: company1._id, active: true });
        const res = await request(app)
            .put('/branches')
            .send({ id: branch._id, label: 'Updated Branch', active: false });

        expect(res.statusCode).toEqual(200);
        expect(res.body.label).toBe('Updated Branch');
        expect(res.body.active).toBe(false);
    });

    it('should get a branch by id', async () => {
        const company1 = await Company.create({ label: 'Company 1' });
        const branch = await Branch.create({ label: 'Branch 1', company_id: company1._id });
        const res = await request(app).get(`/branches/${branch._id}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.label).toBe('Branch 1');
    });
});