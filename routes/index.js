var express = require('express');
var router = express.Router();
var path = require('path');
var Cart=require('../models/cart');
var Product=require('../models/product');
var bought_items=require('../models/bought_items');
var multer  = require('multer');
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now()+path.extname(file.originalname));
  }
});
 
var upload = multer({ storage: storage })

/* GET home page. */
router.get('/', function(req, res, next) {
	Product.find(function(err,docs){
		var user=req.user;		
		var productChunks=[];
		var chunkSize=3;
		for(var i=0;i<docs.length;i+=chunkSize){
			productChunks.push(docs.slice(i,i+chunkSize));
		}
		res.render('shop', { title: 'finance-monitor',products:productChunks,user:user});
	});
});
router.get('/computing',function(req,res){
res.render('shop/computing');
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

router.get('/uploadproductform',function(req,res,next){
	res.render('shop/uploadproduct');
});
router.post('/addimage', upload.single('productImage'), function (req, res, next) {

	console.log(req.file);
const newProduct=new Product({
	imagePath:req.file.path,
	productName:req.body.prod_name,
	description:req.body.description,
	price:req.body.price,
	category:req.body.category
});
newProduct.save(function (err, product) {
	if (err) return console.error(err);
	console.log(product.productName + " saved to bookstore collection.");
  });

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