const express = require("express");
const mongoose = require('mongoose');
const app = express();
const connectToMongoDB = require('./database/connection');


const bcrypt = require('bcryptjs');
const User = require('./models/user');

const path = require('path');
const routes = require('./routes/routes');

const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);

require('dotenv').config();

const store = new MongoDBStore({
     uri:process.env.MONGODB_URI,
     collection: 'sessions'  
});     
     
app.use(session({
       secret: 'keyboard cat',
       resave: false,
       saveUninitialized: true,
       cookie: { secure: true }

}));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use('/css', express.static(__dirname + '/public/css'));
app.use('/img/avatars', express.static(__dirname + '/public/img/avatars'));

app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: 'secret key',
    resave: false,
    saveUnintialized: false,
}));



app.use('/', routes);

async function start() {
    const uri = await connectToMongoDB();
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    app.listen(3000, () => {
        console.log('Сервер запущен на порту 3000');
    });
}

start();
// Parol: 12345 login: Sobakoed1337@gmail.com