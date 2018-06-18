var express = require('express');
var router = express.Router();
var Cart=require('../models/cart');
var Product=require('../models/product');
var bought_items=require('../models/bought_items');


/* GET home page. */
router.get('/', function(req, res, next) {
	Product.find(function(err,docs){
		
		var productChunks=[];
		var chunkSize=3;
		for(var i=0;i<docs.length;i+=chunkSize){
			productChunks.push(docs.slice(i,i+chunkSize));
		}
		res.render('shop', { title: 'finance-monitor',products:productChunks});
	});
});

router.get('/add-to-cart/:id',function(req,res,next){
	
 var productId=req.params.id;
 var cart=new Cart(req.session.cart ? req.session.cart:{items:{}});
 Product.findById(productId,function(err,product){
   if(err){
     return res.redirect('/');
   }
   cart.add(product,product.id);
   req.session.cart = cart;   
   res.redirect('/'); 
 });
});
router.get('/reduce/:id',function(req,res,next){
	var productId=req.params.id;
	var cart=new Cart(req.session.cart?req.session.cart:{});
	
	cart.reduceByOne(productId);
	req.session.cart=cart;
	res.redirect('/shopping-cart');
});
router.get('/remove/:id',function(req,res,next){
	var productId=req.params.id;
	var cart=new Cart(req.session.cart?req.session.cart:{});
	
	cart.removeItem(productId);
	req.session.cart=cart;
	res.redirect('/shopping-cart');
});
router.get('/shopping-cart',function(req,res,next){
 if(!req.session.cart){
	 return res.render('shop/shopping-cart',{products:null});
 } 
 var cart=new Cart(req.session.cart);
 res.render('shop/shopping-cart',{products:cart.generateArray(),totalPrice:cart.totalPrice});
});
router.get('/checkout',isLoggedIn,function(req,res,next){
	usermail=req.user.email;
	if(!req.session.cart){
		return res.render('shop/shopping-cart');
	}
	var cart=new Cart(req.session.cart);
	res.render('shop/checkout',{total:cart.totalPrice});
});
router.post('/checkout',isLoggedIn,function(req,res,next){
	var cart=new Cart(req.session.cart);
	var boughtItems=new bought_items({
		user:req.user,
		cart:cart

		});
		boughtItems.save(function(err,result){
			req.flash('Success','Successfully added product');
			req.session.cart=null;
			res.redirect('/');
		});
});

module.exports = router;
function isLoggedIn(req,res,next){
	if(req.isAuthenticated()){
		return next();
	}
	req.session.oldUrl=req.url;
   res.redirect('user/signin');
}