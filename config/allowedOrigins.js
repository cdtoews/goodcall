require('dotenv').config();

const allowedOrigins = () => {
    if (process.env.MY_ENV === "PROD") {
        return ['https://callreports-48ccd3554305.herokuapp.com'];
    }else if(process.env.MY_ENV === "STG"){
        return [
            'https://callreports-stg-81ce23a9d77e.herokuapp.com',
            'https://callreports.up.railway.app'
        ];
    }else if(process.env.MY_ENV === "DEV"){
        return  [
            'http://127.0.0.1:5500',
            'http://localhost:3500',
            'http://localhost:3000',
            'http://localhost',
            'http://toelap4:3000',
            'http://toelap4',
            'http://192.168.68.132:3000'
        ];
    }

}



module.exports = allowedOrigins;