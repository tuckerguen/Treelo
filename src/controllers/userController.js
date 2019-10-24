//Handle new account creation
exports.new = async function (req, res) {
    User = require('../models/userModel');
    try{
        console.log('Received request to create user');
        const user = new User(req.body);
        const token = await user.generateAuthToken();
        console.log('Auth token made');
        res.status(201).send({user, token});
    } catch (error) {
        console.log(error);
        res.status(400).send(error);
    }
}

exports.view = async function (req, res){
    User = require('../models/userModel');

    try{
        const {email, password} = req.body;
        const user = await User.findByCredentials(email, password);
        if(!user){
            console.log('User not found');
            return res.status(401).send({error: 'Login failed! Please check that your username and password are correct'});
        }
        const token = await user.generateAuthToken();
        console.log('done logging in');
        res.status(200).send({user, token});
    } catch (error) {
        console.log(error);
        res.status(400).send(error);
    }
}