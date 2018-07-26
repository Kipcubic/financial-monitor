var express = require('express');
var passport = require('passport');
var router = express.Router();
var csrf = require('csurf');
var csrfProtection = csrf();
router.use(csrfProtection);
var Order = require('../models/bought_items');
var User=require('../models/user');
var Cart = require('../models/cart');
var moment = require('helper-moment');
var handlebars = require('handlebars');
handlebars.registerHelper('moment', require('helper-moment'));

router.get('/profile', isLoggedIn, function (req, res, next) {
  Order.find({ user: req.user }, function (err, orders) {
    if (err) {
      return res.write('Error');
    }
    var cart;
    orders.forEach(function (order) {
      cart = new Cart(order.cart);
      order.items = cart.generateArray();
    });
    res.render('user/profile', { orders: orders });
    
  
  }).sort({'date': -1}).limit(5);
});
router.get('/recent',isLoggedIn,function(req,res){
res.render('user/recent');
});
router.post('/update',function(req,res){
  var first_name = req.body.first_name && req.body.first_name.trim();
  var last_name = req.body.last_name && req.body.last_name.trim();
  var income = req.body.income && req.body.income.trim();
  var additional_income = req.body.additional_income && req.body.additional_income.trim();
  User.update({user: req.user}, {
    first_name:first_name,
    last_name: last_name,
    income: income,
    additional_income: additional_income   
}, function(err) {
    if(err) {
        console.log('update error', err);
    }

    req.flash('success', "Successful Updated !");
    res.location('/user/update');
    res.redirect('/user/update');
});
});
router.get('/update',isLoggedIn,function(req,res){

  res.render('user/profile-update',{csrfToken: req.csrfToken()});
  });
router.get('/getdata',function (req, res,next) {
  Order.find({user:req.user},function (err,docs) {
    console.log(req.user);
    res.send(docs);
    });
  });
  router.get('/logout', isLoggedIn, function (req, res, next) {
  req.logout();
  res.redirect('/');
});
router.use('/', notLoggedIn, function (req, res, next) {
  next();
});
router.get('/signup', function (req, res, next) {
  var messages = req.flash('error');
  res.render('user/signup', { csrfToken: req.csrfToken(), messages: messages, hasErrors: messages.length > 0 });
});
router.post('/signup/', passport.authenticate('local-signup', {
  failureRedirect: '/user/signup',
  failureFlash: true
}), function (req, res, next) {
  if (req.session.oldUrl) {
    var oldUrl = req.session.oldUrl;
    req.session.oldUrl = null;
    res.redirect(oldUrl);
  } else {
    res.redirect('/user/profile');
  }
});

router.get('/signin', function (req, res, next) {
  var messages = req.flash('error');
  res.render('user/signin', { csrfToken: req.csrfToken(), messages: messages, hasErrors: messages.length > 0 });
});

router.post('/signin/', passport.authenticate('local-signin', {
  failureRedirect: '/user/signin',
  failureFlash: true
}), function (req, res, next) {
  if (req.session.oldUrl) {
    var oldUrl = req.session.oldUrl;
    req.session.oldUrl = null;
    res.redirect(oldUrl);
  } else {
    res.redirect('/user/profile');
  }
});

module.exports = router;
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect('/');
  }
}
function notLoggedIn(req, res, next) {
  if (!req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
}


