
const boolVerifyRoles = (roles, ...allowedRoles) => {

    
    const rolesArray = [...allowedRoles];
    const result = roles.map(role => rolesArray.includes(role)).find(val => val === true);
    return result? result: false;
    

}

module.exports = boolVerifyRoles
