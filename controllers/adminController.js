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


        //console.log(data);
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

        // //followup with making "totals" row
        // //anything with 0, set to -1 for table formatting
        // for (const [key, value] of Object.entries(totalRow)) {
        //     if (value < 1){
        //         totalRow[key] = -1;
        //     }

        //   }
        // table.push(totalRow);

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

//#region Popup
const getPopupTableData = async (req, res) => {
    //let's parse params, shall we
    if (!req?.query?.user_id) return res.status(400).json({ 'message': 'user_id required' });
    if (!req?.query?.callFlag) return res.status(400).json({ 'message': 'callFlag required' });
    if (!req?.query?.month) return res.status(400).json({ 'message': 'month required' });
    if (!req?.query?.year) return res.status(400).json({ 'message': 'year required' });

    const thisMonth = req.query.month;
    const thisYear = req.query.year;
    const user_id = req.query.user_id;

    //monthly summary report
    //going to set to last month (nov)

    // let gtDate = new Date();
    // // ltDate.setMonth(10); //months are 0 to 11
    // // ltDate.setDate(1);//day of month
    // gtDate.setFullYear(thisYear, thisMonth, 1);
    // gtDate.setHours(0);
    // gtDate.setMinutes(0);
    // //console.log(gtDate);

    // let ltDate = new Date();
    // ltDate.setTime(gtDate.getTime());
    // ltDate.setMonth(ltDate.getMonth() + 1);



    if (!req?.query?.weekOfMonth) {
        getMSRPopupData(req, res);
    } else {
        ///we have a week of month, this is from the other SCFR
        getSCFRpopupData(req, res);
    }

}

const getMSRPopupData = async (req, res) => {
    //     header A (Architect)
    //    user_id: 673eae4d604dc6a026a9cca4
    //    Month: 11
    //  year: 2024
   // /admin/pop/?month=11&year=2024&user_id=673eae4d604dc6a026a9cca4&callFlag=A%20%28Architect%29


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
    searchParams.user_id =   new mongoose.Types.ObjectId(user_id);
  
    if(call_flag !== "ALL"){
        searchParams.call_flag = call_flag;
    }
    

    // console.log("popup search")
    // console.log(searchParams);


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
        res.json(calls);

}

const getSCFRpopupData = async (req, res, matchObject) => {




}


module.exports = {
    getMonthlySummeryReport,
    getSalesCallFreqReport,
    getPopupTableData
}