const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_KEY = 'DOOFALICIOUSBABY';

var UserSchema = new mongoose.Schema({
    username:{
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        lowercase: true,
        validate: value => {
            if(!validator.isEmail(value)){
                throw new Error({error: 'Invalid Email address'})
            }
        }
    },
    password: {
        type: String,
        required: true,
        minLength: 7
    },
    tokens:[{
        token: {
            type: String,
            required: true
        }
    }]
});

UserSchema.pre('save', async function (next){
    //Hash pwd before saving
    const user = this;
    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8);
    }
    console.log('Password hashed');   
    next();
});

UserSchema.methods.generateAuthToken = async function() {
    //Create auth token
    const user = this;
    const token = jwt.sign({_id: user._id}, JWT_KEY);
    user.tokens = user.tokens.concat({token});
    console.log(user.tokens);
    await user.save();
    console.log('User saved');
    return token;
}

UserSchema.statics.findByCredentials = async (email, password) => {
    //Search by email and pwd
    const user = await User.findOne({email});
    if(!user){
        throw new Error({error: 'Invalid login credentials'});
    }
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if(!isPasswordMatch){
        throw new Error({error: 'Invalid login credentials'});
    }
    return user;
}

var User = mongoose.model('User', UserSchema);
module.exports = User;