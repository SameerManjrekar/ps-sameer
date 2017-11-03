const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const jwt = require('jwt-simple');
const app = express();

// User Model
const User = require('./models/User');
// Post Model
const Post = require('./models/Post');
// Auth Model
const auth = require('./auth');

mongoose.Promise = Promise;

// CORS Middleware
app.use(cors());

// Body-Parser Middleware
app.use(bodyParser.json());

app.get('/posts/:id', async (req, res) => {
    const author = req.params.id;
    const post = await Post.find({author});
    res.send(post);
});

app.post('/post', auth.checkAuthenticated, (req, res) => {

    const postData = req.body;
    postData.author = req.userId;
    const post = new Post(postData);

    post.save((err, result) => {
        if(err) {
            console.error('Error in saving Post message');
            res.sendStatus(500).send({message: 'Error in saving Post message'});
        }

        res.sendStatus(200);
    });
});

app.get('/users', async (req, res) => {
    try {        
        const users = await User.find({}, '-pwd -__v');
        res.send(users);
    } catch(err) {
        console.error(err);
        res.sendStatus(500);
    }    
});

app.get('/profile/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id, '-pwd -__v');
        res.send(user);
    } catch(err) {
        console.error(err);
        res.sendStatus(500);
    }    
});

mongoose.connect('mongodb://sammy:sammy@ds117311.mlab.com:17311/sammysocial', { useMongoClient: true },  (err) => {
    if(!err)
        console.log('Connected to Mongo');
});

app.use('/auth', auth.router);

app.listen(process.env.PORT || 3000);