const mongoose = require('mongoose');
require('dotenv').config();
const logger = require('../middleware/logger');
// const connectDB = require('./config/dbConn');
const Call = require('../model/Call');
const User = require('../model/User');
const Flag = require('../model/Flag');
const { ObjectId } = mongoose.Types;


// #region Utilities
const getBlankMonthlySummaryData = async () => {
    var table = [];
    logger.trace("getBlankMonthlySummaryData");
    //get all flags:
    const flags = await Flag.find().sort({ label: 1 });
    const users = await User.find({ active: true }).sort({ username: 1 });

    users.forEach(function (user) {
        var thisRow = {};
        thisRow.username = user.username;
        thisRow.rowLabel = user.short_username
        thisRow["total"] = -1; //for totals... kinda obvious??
        flags.forEach(function (flag) {
            //console.log(`${user.username} -- ${flag.label}`);
            thisRow[flag.label.split(" ")[0]] = -1;
            //thisRow.flag = 0;
        });
        thisRow.user_id = user._id.toString();
        table.push(thisRow);

    });
    logger.trace(table);
    return table;
}

// #region MSR
const getMonthlySummeryReport = async (req, res) => {
    logger.trace("getMonthlySummeryReport");
    try {
        if (!req?.query?.month) return res.status(400).json({ 'message': 'month required.' }); //months are 0-11
        if (!req?.query?.year) return res.status(400).json({ 'message': 'year required.' });



        const thisMonth = req.query.month;
        const thisYear = req.query.year;

        //monthly summary report
        //going to set to last month (nov)

        let gtDate = new Date();
        // ltDate.setMonth(10); //months are 0 to 11
        // ltDate.setDate(1);//day of month
        gtDate.setFullYear(thisYear, thisMonth, 1);
        gtDate.setHours(0);
        gtDate.setMinutes(0);
        //console.log(gtDate);

        let ltDate = new Date();
        ltDate.setTime(gtDate.getTime());
        ltDate.setMonth(ltDate.getMonth() + 1);

        // console.log(ltDate);
        // console.log(gtDate);

        var data = await Call.aggregate([
            { $match: { call_date: { $gt: gtDate, $lt: ltDate } } },
            {
                $group: {
                    _id: {
                        user_id: "$user_id",
                        flag: "$call_flag"
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: {
                    _id: 1
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id.user_id",
                    foreignField: "_id",
                    as: "call_user",
                    // select: "_id username"
                }
            }
        ]);

        // //get flags and populate a "Total row"
        // const flags = await Flag.find().sort({ label: 1 });
        // //populate totals row
        // var totalRow = {};
        // totalRow.rowLabel = "_Total";
        // flags.forEach(function (flag) {
        //     //console.log(`${user.username} -- ${flag.label}`);
        //     totalRow[flag.label.split(" ")[0]] = 0;

        // });

        logger.trace(data);
        var table = await getBlankMonthlySummaryData();

        data.forEach(function (eachCall) {
            //each item in data is a user/flag combo
            var thisUsername = eachCall.call_user[0].username;

            //let's look through empty table for username
            var thisRow = table.find((element) => element.username === thisUsername);
            var thisKey = eachCall._id.flag.split(" ")[0];
            thisRow[thisKey] = eachCall.count;
            if (thisRow["total"] === -1) thisRow["total"] = 0;
            thisRow["total"] += eachCall.count; //update totals for this user

            //let's
            // //gotta update flag totals
            // totalRow[thisKey] += eachCall.count;

        });

        logger.trace(JSON.stringify(table));
        res.json(table);

    } catch (err) {
        logger.error(err, "trouble getting monthy summary report");
        res.status(500).json({ 'message': 'trouble getting monthly summary report' });
    }

}


// #region SCFR

const getBlankSFCRSummaryData = async () => {
    var table = [];

    //get all flags:
    const flags = await Flag.find().sort({ label: 1 });

    for (let i = 1; i <= 5; i++) {
        var thisRow = {};
        thisRow.weekNum = i
        thisRow.rowLabel = i
        thisRow["total"] = -1; //for totals... kinda obvious??
        flags.forEach(function (flag) {
            //console.log(`${user.username} -- ${flag.label}`);
            thisRow[flag.label.split(" ")[0]] = -1;
            //thisRow.flag = 0;
        });

        table.push(thisRow);

    };
    logger.trace(JSON.stringify(table));
    return table;


}

function getWeekOfMonth(date) {
    const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const firstDayWeekNumber = firstDayOfMonth.getDay(); // 0 for Sunday, 1 for Monday, etc.
    const dayOfMonth = date.getDate();
    return Math.ceil((dayOfMonth + firstDayWeekNumber) / 7);
}


function getLetterFromFlag(flagName) {
    return flagName.split(" ")[0];
}

const getSalesCallFreqReport = async (req, res) => {
    try {
        logger.trace("getSalesCallFreqReport");
        if (!req?.query?.month) return res.status(400).json({ 'message': 'month required.' }); //months are 0-11
        if (!req?.query?.year) return res.status(400).json({ 'message': 'year required.' });
        if (!req?.query?.user_id) return res.status(400).json({ 'message': 'user_id required.' });


        const thisMonth = req.query.month;
        const thisYear = req.query.year;
        const user_id = req.query.user_id;



        let gtDate = new Date();
        // ltDate.setMonth(10); //months are 0 to 11
        // ltDate.setDate(1);//day of month
        gtDate.setFullYear(thisYear, thisMonth, 1);
        gtDate.setHours(0);
        gtDate.setMinutes(0);
        //console.log(gtDate);

        let ltDate = new Date();
        ltDate.setTime(gtDate.getTime());
        ltDate.setMonth(ltDate.getMonth() + 1);


        //userid; 673eae4d604dc6a026a9cca4
        var data = await Call.aggregate([
            { $match: { user_id: new mongoose.Types.ObjectId(user_id), call_date: { $gt: gtDate, $lt: ltDate } } },
            {
                $project: {
                    call_date: 1,
                    call_flag: 1,
                    short_flag: {
                        $function: {
                            body: getLetterFromFlag,
                            args: ["$call_flag"],
                            lang: "js"
                        }
                    },
                    weekOfMonth: {
                        $function: {
                            body: getWeekOfMonth,
                            args: ["$call_date"],
                            lang: "js"
                        }
                    }
                }
            }
            ,
            {
                $group: {
                    _id: {
                        weekOfMonth: "$weekOfMonth",
                        flag: "$short_flag"
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: {
                    "_id.weekOfMonth": 1,
                    "_id.flag": 1
                }
            }
        ]);

        logger.trace(JSON.stringify(data));

        //now get empty table data
        var table = await getBlankSFCRSummaryData();

        data.forEach(function (eachCall) {

            var thisWeekNum = eachCall._id.weekOfMonth;

            //let's look through empty table for username
            var thisRow = table.find((element) => element.weekNum === thisWeekNum);
            var thisKey = eachCall._id.flag.split(" ")[0];
            thisRow[thisKey] = eachCall.count;
            if (thisRow["total"] === -1) thisRow["total"] = 0;
            thisRow["total"] += eachCall.count; //update totals for this user
            thisRow["user_id"] = user_id;

        });


        logger.trace(JSON.stringify(table));
        res.json(table);



    } catch (err) {
        logger.error(err, "touble getting SCFR");
        res.status(500).json({ 'message': 'trouble getting SCFR' });
    }
}

//#region Popup
const getPopupTableData = async (req, res) => {
    //return;
    try {

        //console.log(req.query);

        //let's parse params, shall we
        if (!req?.query?.user_id) return res.status(400).json({ 'message': 'user_id required' });
        if (!req?.query?.callFlag) return res.status(400).json({ 'message': 'callFlag required' });
        if (!req?.query?.month) return res.status(400).json({ 'message': 'month required' });
        if (!req?.query?.year) return res.status(400).json({ 'message': 'year required' });
        if (!req?.query?.weekNumber) return res.status(400).json({ 'message': 'weekNumber required' });

        const thisMonth = req.query.month;
        const thisYear = req.query.year;
        const user_id = req.query.user_id;

        if (req.query.weekNumber === 'null') {
            logger.debug("MSR Popup");
            getMSRPopupData(req, res);
        } else {
            ///we have a week of month, this is from the other SCFR
            logger.debug("SCFR popup");
            getSCFRpopupData(req, res);
        }

    } catch (err) {
        logger.error(err,"trouble getting admin report popup");
        return res.status(404).json({ "message": 'something went sideways, in' });
    }

}

const getMSRPopupData = async (req, res) => {
    
    try {

        const thisMonth = req.query.month;
        const thisYear = req.query.year;
        const user_id = req.query.user_id;
        const call_flag = req.query.callFlag;

        //monthly summary report
        //going to set to last month (nov)

        let gtDate = new Date();
        // ltDate.setMonth(10); //months are 0 to 11
        // ltDate.setDate(1);//day of month
        gtDate.setFullYear(thisYear, thisMonth, 1);
        gtDate.setHours(0);
        gtDate.setMinutes(0);
        //console.log(gtDate);

        let ltDate = new Date();
        ltDate.setTime(gtDate.getTime());
        ltDate.setMonth(ltDate.getMonth() + 1);

        searchParams = {};
        var gtlt = {};
        gtlt.$gt = gtDate;
        gtlt.$lt = ltDate;

        searchParams.call_date = gtlt;
        searchParams.user_id = new mongoose.Types.ObjectId(user_id);

        if (call_flag !== "ALL") {
            searchParams.call_flag = call_flag;
        }

        const calls = await Call.find(searchParams)
            .populate([{
                path: 'contact_id',
                model: 'Contact',
                select: { '_id': 1, 'firstname': 1, 'lastname': 1 },
                populate: {
                    path: 'branch_id',
                    model: 'Branch',
                    select: { '_id': 1, 'label': 1 },
                    populate: {
                        path: 'company_id',
                        model: 'Company',
                        select: { '_id': 1, 'label': 1 },
                    }
                }
            },
            {
                path: 'user_id',
                model: 'User',
                select: { 'username': 1, 'short_username': 1 },
            }

            ]
            ).exec();


        if (!calls) return res.status(204).json({ 'message': 'No calls found' });
        // console.log(calls);
        logger.trace(calls);
        res.json(calls);
    } catch (err) {
        logger.error(err,"trouble in getMSRPopupData");
        return res.status(404).json({ "message": 'something went sideways, in' });
    }
}

const getSCFRpopupData = async (req, res, matchObject) => {
    try {
        //console.log("inside GSPD");
        const thisMonth = req.query.month;
        const thisYear = req.query.year;
        const user_id = req.query.user_id;
        const call_flag = req.query.callFlag;
        const weekNumber = req.query.weekNumber;
        //monthly summary report
        //going to set to last month (nov)

        let gtDate = new Date();
        // ltDate.setMonth(10); //months are 0 to 11
        // ltDate.setDate(1);//day of month
        gtDate.setFullYear(thisYear, thisMonth, 1);
        gtDate.setHours(0);
        gtDate.setMinutes(0);
        //console.log(gtDate);

        let ltDate = new Date();
        ltDate.setTime(gtDate.getTime());
        ltDate.setMonth(ltDate.getMonth() + 1);

        searchParams = {};
        var gtlt = {};
        gtlt.$gt = gtDate;
        gtlt.$lt = ltDate;

        searchParams.call_date = gtlt;
        searchParams.user_id = new mongoose.Types.ObjectId(user_id);

        if (call_flag !== "ALL") {
            searchParams.call_flag = call_flag;
        }

        // console.log(searchParams);

        //userid; 673eae4d604dc6a026a9cca4
        var data = await Call.find(searchParams)
            .populate([
                {
                    path: 'contact_id',
                    model: 'Contact',
                    select: { '_id': 1, 'firstname': 1, 'lastname': 1 },
                    populate: {
                        path: 'branch_id',
                        model: 'Branch',
                        select: { '_id': 1, 'label': 1 },
                        populate: {
                            path: 'company_id',
                            model: 'Company',
                            select: { '_id': 1, 'label': 1 },
                        }
                    }
                }
                ,
                {
                    path: 'user_id',
                    model: 'User',
                    select: { 'username': 1, 'short_username': 1 },
                }

            ]).exec();

        if (!data) {
            logger.trace("SFCR popup no calls found");
            return res.status(204).json({ 'message': 'No calls found' });
        }

        filteredData = [];
        //iterate data
        data.forEach(datum => {

            var thisDate = new Date(datum.call_date);
            var thisWeekNumber = getWeekOfMonth(thisDate);

            if (thisWeekNumber == weekNumber) {
                filteredData.push(datum);
            }
        });




        logger.trace(JSON.stringify(filteredData));
        res.json(filteredData);
    } catch (err) {
        logger.error(err,"problem in getSCFRpopupData")
        return res.status(404).json({ "message": 'something went sideways' });
    }



}


module.exports = {
    getMonthlySummeryReport,
    getSalesCallFreqReport,
    getPopupTableData
}