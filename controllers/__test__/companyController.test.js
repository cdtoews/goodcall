const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const companyController = require('../companyController');
const Company = require('../../model/Company');

// let mongoServer;
const app = express();
app.use(bodyParser.json());
app.get('/companies', companyController.getAllCompanies);
app.post('/companies', companyController.createNewCompany);
app.put('/companies', companyController.updateCompany);
app.get('/companies/all', companyController.getAllAllCompanies);
app.get('/companies/:id', companyController.getCompany);



describe('Company Controller', () => {
    beforeEach(async () => {
        await Company.deleteMany({});
    });

    it('should create a new company', async () => {
        const res = await request(app)
            .post('/companies')
            .send({ label: 'Test Company' });
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('_id');
        expect(res.body.label).toBe('Test Company');
    });

    it('should get all active companies', async () => {
        await Company.create({ label: 'Active Company' });
        await Company.create({ label: 'inactive Company', active: false });
        const res = await request(app).get('/companies');
        expect(res.statusCode).toEqual(200);
        expect(res.body.length).toBe(1);
        expect(res.body[0].label).toBe('Active Company');
    });

    it('should get all companies', async () => {
        await Company.create({ label: 'Company 1', active: true });
        await Company.create({ label: 'Company 2', active: false });
        const res = await request(app).get('/companies/all');
        expect(res.statusCode).toEqual(200);
        expect(res.body.length).toBe(2);
    });

    it('should update a company', async () => {
        const company = await Company.create({ label: 'Old Label', active: true });
        const res = await request(app)
            .put('/companies')
            .send({ id: company._id, label: 'New Label', active: false });
        expect(res.statusCode).toEqual(200);
        expect(res.body.label).toBe('New Label');
        expect(res.body.active).toBe(false);
    });


    it('should get a company by ID', async () => {
        const company = await Company.create({ label: 'Company to Get', active: true });
        const res = await request(app).get(`/companies/${company._id}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.label).toBe('Company to Get');
    });
});