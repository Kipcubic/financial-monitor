var mongoose=require('mongoose');
var Schema=mongoose.Schema;
var schema=new Schema({
    user:{type:Schema.Types.ObjectId,ref:'User'},
    cart:{type:Object,required:true},
    date: { type: Date, default: Date.now }
    // address:{type:String,required:true},
    // name:{type:String,required:true},
    // category:{type:String,required:true},
    // dateOfPurchase:{type:Date,required:true}
});
module.exports=mongoose.model('boughtItems',schema);