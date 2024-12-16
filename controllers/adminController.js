const mongoose = require('mongoose');
require('dotenv').config();
// const connectDB = require('./config/dbConn');
const Call = require('../model/Call');
const User = require('../model/User');
const Flag = require('../model/Flag');
const { ObjectId } = mongoose.Types;


// #region Utilities
const getBlankMonthlySummaryData = async () => {
    var table = [];

    //get all flags:
    const flags = await Flag.find().sort({ label: 1 });
    const users = await User.find().sort({ username: 1 });

    users.forEach(function (user) {
        var thisRow = {};
        thisRow.username = user.username;
        thisRow.rowLabel = user.short_username
        flags.forEach(function (flag) {
            //console.log(`${user.username} -- ${flag.label}`);
            thisRow[flag.label] = 0;
            //thisRow.flag = 0;
        });

        table.push(thisRow);

    });

    return table;
    //console.log(table);

}

// #region MSR
const getMonthlySummeryReport = async (req, res) => {
    console.log("MSR");
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

        console.log(ltDate);
        console.log(gtDate);

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

        var table = await getBlankMonthlySummaryData();

        data.forEach(function (eachCall) {
            var thisUsername = eachCall.call_user[0].username;

            //let's look through empty table for username
            var thisRow = table.find((element) => element.username === thisUsername);
            var thisKey = eachCall._id.flag;
            thisRow[thisKey] = eachCall.count;

            eachCall.flag = eachCall._id.flag;
            delete eachCall._id;
            delete eachCall.call_user;

        });


        // console.log(JSON.stringify(data));
        //console.log(table);

        res.json(table);

    } catch (err) {
        console.error(err);
        res.status(500).json({ 'message': 'trouble getting monthly summary report' });
    }

}


// #region SCR
const getSalesCallFreqReport = async (req, res) => {



}



module.exports = {
    getMonthlySummeryReport,
    getSalesCallFreqReport
}