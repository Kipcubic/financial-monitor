var mongoose=require('mongoose');
var Schema=mongoose.Schema;
var schema=new Schema({
	imagePath:{type:String,required:true},
	productName:{type:String,required:true},
	description:{type:String,required:true},
	price:{type:Number,required:true},
	category:{type:Number,required:true}
});
module.exports=mongoose.model('Product',schema);