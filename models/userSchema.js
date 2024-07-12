const mongose = require('mongoose');
const schema = mongose.Schema({
    name: {
        type: 'string',
        required: true,
        trim: 'true'
    },
    email: {
        type: 'string',
        required: true,
        unique: true
    },
    password: {
        type: 'string',
    },
    contact: {
        type: 'string'
    },
    address: {
        type: 'string',
    },
    role: {
        type: 'string',
        default: 0
    },
    petName: {
        type: 'string',
    },
    token: {
        type: 'string'
    },
    photo:
    {
        type: 'string'
    }
}, { timestamps: true });
module.exports = mongose.model('users', schema);