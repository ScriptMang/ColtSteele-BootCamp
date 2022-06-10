const User = require('../models/user');

module.exports.showRegisterForm = (req, resp) => {
    resp.render('users/register');
}

module.exports.createAccount = async(req, resp) => {
    try {
        const {email, username, password} = req.body;
        const user = new User({email, username, password});
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) return next(err)
            req.flash('success', 'Welcome to YelpCamp');
            resp.redirect('/campgrounds');
        })    
    } catch(e) {
        req.flash('error', e.message);
        resp.redirect('register');
    }
}

module.exports.showLoginForm = (req, resp) => {
    resp.render('users/login');
}

module.exports.loginCheck = (req, resp) => {
    req.flash('success', "Welcome Back!");
    // console.log("After Login User.req...", req.session.redirect);
    const lastUrl = req.session.redirect || '/campgrounds';
    delete req.session.redirect;
    resp.redirect(lastUrl);
}

module.exports.logout = (req, resp, next) => {
    req.logout(err => {
        if (err){
            return next(err);
        }
    });
    req.flash('success', "Goodbye!");
    resp.redirect('/campgrounds');
} 