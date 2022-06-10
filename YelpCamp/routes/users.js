const express = require('express');
const  passport  = require('passport');
const catchAsync = require('../helpers/CatchAsyncError'); 
const router = express.Router();
const users = require('../controllers/users.js')
router.route('/register')
    .get(users.showRegisterForm)
    .post(catchAsync(users.createAccount));

router.route('/login')
    .get(users.showLoginForm)
    .post(passport.authenticate('local', 
    {
        failureFlash: true, 
        failureRedirect: '/login',
        keepSessionInfo: true 
    }), 
    users.loginCheck
);

router.get('/logout', users.logout);
module.exports = router;