const Dependencies = {
    jwt : require('jsonwebtoken'),
    bcrypt : require('bcrypt'),
    validator : require('validator'),
    dotenv : require('dotenv').config(),
    messages: require('../config/locales/en.json')
}

const ResCodes = {
    unAuth : 401,
    notFound : 404,
    conflict:409,
    ok:200
}

module.exports.constants={
    Dependencies,
    ResCodes
}