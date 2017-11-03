const User = require('./models/User');
const bcrypt = require('bcrypt-nodejs');
const jwt = require('jwt-simple');
const express = require('express');
const router = express.Router();

router.post('/register',(req, res) => {
        const userData = req.body;
    
        const user = new User(userData);
        console.log(userData);
    
        user.save((err, newUser) => {
            if(err)
                return res.status(500).send({message: 'Error Saving User'});
    
            createSendToken(res, newUser);
        
        });    
    });

    router.post('/login', async (req, res) => {
        const loginData = req.body;
        
        const user = await User.findOne({email: loginData.email});
    
        if(!user)
            return res.status(401).send({message: 'Email or password invalid'});
    
        bcrypt.compare(loginData.pwd, user.pwd, (err, isMatch) => {
            if(!isMatch)
                return res.status(401).send({message: 'Email or password invalid'})
    
            createSendToken(res, user);
                
        }); 
        
    });

function createSendToken(res, user) {
    const payload = { sub: user._id };
    
    const token = jwt.encode(payload, '123');

    res.status(200).send({token});
}   

const auth = {
    router,
    checkAuthenticated: (req, res, next) => {
        if(!req.header('authorization'))
            return res.status(401).send({message: 'Unauthorized. Missing Auth Header'});
    
        const token = req.header('authorization').split(' ')[1];
        
        const payload = jwt.decode(token, '123');
    
        if(!payload)    
            return res.status(401).send({message: 'Unauthorized. Auth Header invalid'});
    
        req.userId = payload.sub;
    
        next();
    }
}

module.exports = auth;