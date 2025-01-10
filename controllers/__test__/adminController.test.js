const mongoose = require('mongoose');
const { getMSRPopupData, getMonthlySummeryReport, getSalesCallFreqReport, getPopupTableData } = require('../adminController');
const adminController = require('../adminController');
const Call = require('../../model/Call');
const User = require('../../model/User');
const Flag = require('../../model/Flag');
const logger = require('../../middleware/logger');
const { MongoMemoryServer } = require('mongodb-memory-server');


jest.mock('../../model/Call');
jest.mock('../../model/User');
jest.mock('../../model/Flag');
jest.mock('../../middleware/logger');

describe('adminController', () => {


    beforeEach(async () => {
        jest.clearAllMocks();
        await Call.deleteMany({});
        await User.deleteMany({});
        await Flag.deleteMany({});
    });

    describe('getMonthlySummeryReport', () => {

        it('should return 200 and the correct data', async () => {
            const req = { query: { month: 5, year: 2023 } };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

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


            //TODO: set dates correctly, and verify sorting of data
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



            await getMonthlySummeryReport(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.any(Array));
        });

        it('should return 400 if month is not provided', async () => {
            const req = { query: { year: 2023 } };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            await getMonthlySummeryReport(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ 'message': 'month required.' });
        });

        it('should return 400 if year is not provided', async () => {
            const req = { query: { month: 5 } };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            await getMonthlySummeryReport(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ 'message': 'year required.' });
        });

        it('should return 500 if there is an error', async () => {
            const req = { query: { month: 5, year: 2023 } };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            Call.aggregate.mockImplementationOnce(() => {
                throw new Error('Database error');
            });

            await getMonthlySummeryReport(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ 'message': 'trouble getting monthly summary report' });
        });
    });

    describe('getSalesCallFreqReport', () => {

        it('should return 200 and the correct data', async () => {
            const req = { query: { month: 5, year: 2023, user_id: '123' } };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            const user = await User.create({ username: 'testuser', short_username: 'tu', active: true });
            const flag = await Flag.create({ label: 'Test Flag' });
            await Call.create({ user_id: user._id, call_flag: flag.label, call_date: new Date(2023, 5, 15) });

            req.query.user_id = user._id.toString();

            await getSalesCallFreqReport(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.any(Array));
        });



        it('should return 400 if month is not provided', async () => {
            const req = { query: { year: 2023, user_id: '123' } };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            await getSalesCallFreqReport(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ 'message': 'month required.' });
        });

        it('should return 400 if year is not provided', async () => {
            const req = { query: { month: 5, user_id: '123' } };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            await getSalesCallFreqReport(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ 'message': 'year required.' });
        });

        it('should return 400 if user_id is not provided', async () => {
            const req = { query: { month: 5, year: 2023 } };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            await getSalesCallFreqReport(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ 'message': 'user_id required.' });
        });

        it('should return 500 if there is an error', async () => {
            const req = { query: { month: 5, year: 2023, user_id: '123' } };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            Call.aggregate.mockImplementationOnce(() => {
                throw new Error('Database error');
            });

            await getSalesCallFreqReport(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ 'message': 'trouble getting SCFR' });
        });
    });

    describe('getPopupTableData', () => {

        it('should return 200 and the correct data for MSR', async () => {
            const req = { query: { user_id: '123', callFlag: 'Test Flag', month: 5, year: 2023, weekNumber: 'null' } };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            const user = await User.create({ username: 'testuser', short_username: 'tu', active: true });
            const flag = await Flag.create({ label: 'Test Flag' });
            await Call.create({ user_id: user._id, call_flag: flag.label, call_date: new Date(2023, 5, 15) });

            req.query.user_id = user._id.toString();

            await getPopupTableData(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.any(Array));
        });

        it('should return 200 and the correct data for SCFR', async () => {
            const req = { query: { user_id: '123', callFlag: 'Test Flag', month: 5, year: 2023, weekNumber: 1 } };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            const user = await User.create({ username: 'testuser', short_username: 'tu', active: true });
            const flag = await Flag.create({ label: 'Test Flag' });
            await Call.create({ user_id: user._id, call_flag: flag.label, call_date: new Date(2023, 5, 1) });

            req.query.user_id = user._id.toString();

            await getPopupTableData(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.any(Array));
        });



        it('should return 400 if user_id is not provided', async () => {
            const req = { query: { callFlag: 'flag', month: 5, year: 2023, weekNumber: 1 } };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            await getPopupTableData(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ 'message': 'user_id required' });
        });

        it('should return 400 if callFlag is not provided', async () => {
            const req = { query: { user_id: '123', month: 5, year: 2023, weekNumber: 1 } };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            await getPopupTableData(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ 'message': 'callFlag required' });
        });

        it('should return 400 if month is not provided', async () => {
            const req = { query: { user_id: '123', callFlag: 'flag', year: 2023, weekNumber: 1 } };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            await getPopupTableData(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ 'message': 'month required' });
        });

        it('should return 400 if year is not provided', async () => {
            const req = { query: { user_id: '123', callFlag: 'flag', month: 5, weekNumber: 1 } };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            await getPopupTableData(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ 'message': 'year required' });
        });

        it('should return 400 if weekNumber is not provided', async () => {
            const req = { query: { user_id: '123', callFlag: 'flag', month: 5, year: 2023 } };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            await getPopupTableData(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ 'message': 'weekNumber required' });
        });

        it('SCFR should return 500 if there is an error', async () => {
            const req = { query: { user_id: '123', callFlag: 'flag', month: 5, year: 2023, weekNumber: 1 } };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };


            adminController.getSCFRpopupData = jest.fn().mockResolvedValue(() => {
                throw new Error('Database error');
            });
            // Call.find.mockImplementationOnce(() => {
            //     throw new Error('Database error');
            // });

            await getPopupTableData(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ 'message': 'SCFR something went sideways' });
        });


        it('MSR should return 500 if there is an error', async () => {
            const req = { query: { user_id: '123', callFlag: 'flag', month: 5, year: 2023, weekNumber: 'null' } };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };


            adminController.getMSRPopupData = jest.fn().mockResolvedValue(() => {
                throw new Error('Database error');
            });
            // Call.find.mockImplementationOnce(() => {
            //     throw new Error('Database error');
            // });

            await getPopupTableData(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ 'message': 'MSR something went sideways' });
        });


    });
});