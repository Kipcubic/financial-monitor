var express = require('express');
var passport = require('passport');
var router = express.Router();
var csrf = require('csurf');
var csrfProtection = csrf();
router.use(csrfProtection);
var Order = require('../models/bought_items');
var User=require('../models/user');
var Cart = require('../models/cart');
var ManualEx= require('../models/manualExp');
var moment = require('helper-moment');
var handlebars = require('handlebars');

handlebars.registerHelper('moment', require('helper-moment'));

// profile landing
router.get('/profile', isLoggedIn, function (req, res, next) {
  var user=req.user;
  Order.find({ user: req.user }, function (err, orders) {
    if (err) {
      return res.write('Error');
    }
   
    var cart;
    orders.forEach(function (order) {
      cart = new Cart(order.cart);
      order.items = cart.generateArray();
    });
    User.find( { first_name: { $exists: true} },function(err,named){});
    res.render('user/profile',{user:user,orders:orders})
  
  }).sort({'date': -1}).limit(5);
});

// get recent transactions
router.get('/recent',isLoggedIn,function(req,res){
  Order.find({ user: req.user }, function (err, orders) {
    if (err) {
      return res.write('Error');
    }
    
    var cart;
    orders.forEach(function (order) {
      cart = new Cart(order.cart);
      order.items = cart.generateArray();
    });
    res.render('user/recent', { orders: orders });
    });
});

// get update form
router.get('/update',isLoggedIn,function(req,res){

  res.render('user/profile-update',{csrfToken: req.csrfToken(),user:req.user,messages: req.flash('success')});
  });
//post update  user information 
router.post('/update',isLoggedIn,function(req,res){
  
  var first_name = req.body.first_name;
  var last_name = req.body.last_name;
  var income = req.body.income;
  var additional_income = req.body.additional_income;
  User.update({_id: req.user._id}, {
    $set:{
      first_name:first_name,
      last_name: last_name,
      income: income,
      additional_income: additional_income 
    }
      
}, function(err) {
    if(err) {
        console.log('update error', err);
    }


    req.flash('success', "Successful Updated !");
    res.location('/user/update');
    res.redirect('/user/update');
});
});

// get monthly
router.get('/monthly',isLoggedIn,function(req,res,next){
  Order.aggregate(
    [ 
        { 
          $match : { user : req.user._id} 
        },
      {
        $group:
          {
            _id: { month: { $month: "$date"}, year: { $year: "$date" } },
            totalAmount: { $sum: "$cart.totalPrice" },
            count: { $sum: 1 }
          }
      }
    ],function (err, result) {
      if (err) {
          console.log(err);
          return;
      }  
      Order.find({user:req.user},function(err,exp){
        if(err){
          return err
        }
        
      });
      var userSalary=req.user.income+req.user.additional_income;
      var gt=[];
      var i = result.length;
    while( i-- ) {
      if(result[i].totalAmount>userSalary){
        gt.push(result[i].totalAmount)
      }
    } 
    ManualEx.aggregate(
      [ 
          { 
            $match : { user : req.user._id} 
          },
        {
          $group:
            {
              _id: { month: { $month: "$date"}, year: { $year: "$date" } },
              totalAmount: { $sum: "$totalAmount" },
              count: { $sum: 1 }
            }
        }
      ],function (err, resultManual) {
        if (err) {
            console.log(err);
            return;
        }  
        console.log(resultManual);
        res.render('user/monthly',{ result:result,userSalary,gt:gt,resultManual:resultManual});
      
    });
  
      // res.render('user/monthly',{ result:result,userSalary,gt:gt});
    
  });
    
});
//get expenditure by category
router.get('/bycategory',isLoggedIn,function(req,res){
  ManualEx.aggregate(
    [ 
      { 
        $match : { user : req.user._id} 
      },
        {
          $group:
            {
              _id: { category:"$category"},
              totalAmount: { $sum: "$totalAmount"},
              count: { $sum: 1 }
            }
        }
    ],function (err, result) {
      if (err) {
          console.log(err);
          return;
      }
      var userSalary=req.user.income+req.user.additional_income;
    
      

        
      res.render('user/bycategory',{ result:result,userSalary});
  }).sort({'totalAmount': 1});  
});
//get manual expenses page
router.get('/manualExp',function(req,res){
  
 res.render('user/manualExp',{csrfToken: req.csrfToken()});
});
//post manual expenses
router.post('/manualExp',function(req,res){
  var newManualExp=new ManualEx();
  newManualExp.user=req.user;
  newManualExp.totalAmount=req.body.totalAmount;
  newManualExp.category=req.body.category;
  newManualExp.description=req.body.description;
  newManualExp.save(function(err,result){
      if(err){
          return err;
      }
      req.flash('success', "Successful Updated !");
      res.location('/user/manualExp');
      res.redirect('/user/manualExp'); 
      
  });
});
//get monthly earnings page
router.get('/monthlyEarning',function(req,res){
  res.render('user/monthlyEarning',{csrfToken: req.csrfToken(),user:req.user});
  });

router.post('/monthlyEarning',function(req,res){
  var jan_income = req.body.jan_income;
  var feb_income = req.body.feb_income;
  var march_income = req.body.march_income;
  var april_income = req.body.april_income;
  var may_income = req.body.may_income;
  var june_income = req.body.june_income;
  var july_income = req.body.july_income;
  var income = req.body.income;
  var sept_income = req.body.sept_income;
  var octo_income = req.body.octo_income;
  var nov_income = req.body.nov_income;
  var dec_income = req.body.dec_income;
  // var additional_income = req.body.additional_income;
  User.update({_id: req.user._id}, {
    $set:{
       jan_income :jan_income,
       feb_income : feb_income,
       march_income: march_income,
      april_income : april_income,
      may_income : may_income,
       june_income : june_income,
       july_income : july_income,
        income : income,
       sept_income : sept_income,
       octo_income : octo_income,
       nov_income : nov_income,
       dec_income : dec_income
    }
      
}, function(err) {
    if(err) {
        console.log('update error', err);
    }


    req.flash('success', "Successful Updated !");
    res.location('/user/monthlyEarning');
    res.redirect('/user/monthlyEarning');
});
  });
//render cat
router.get('/getcategory',function(req,res){
  res.render('user/cat');
});
  //get data to Fetch API
router.get('/getdata',function (req, res,next) {
  Order.find({user:req.user},function (err,docs) {
       res.send(docs);
    });
  });
  // get data to category
  router.get('/getcat',function (req, res,next) {
    ManualEx.aggregate(
      [ 
        { 
          $match : { user : req.user._id} 
        },
          {
            $group:
              {
                _id: { category:"$category"},
                totalAmount: { $sum: "$totalAmount"},
                count: { $sum: 1 }
              }
          }
      ],function (err, result) {
        if (err) {
            console.log(err);
            return;
        }     
        res.send(result);
    });
    });
    //logout
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


