const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username:{
        type: String,
        required: [true, 'Username cannot ba blank']
    },
    password: {//해시된 비밀번호가 저장됨
        type: String,
        required: [true, 'Password cannot ba blank']
    }
});

module.exports = mongoose.model('User', userSchema);