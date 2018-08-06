var mongoose=require('mongoose');
var Schema=mongoose.Schema;
var schema=new Schema({
    user:{type:Schema.Types.ObjectId,ref:'User'},
    category:{type:String,required:true},
    totalAmount:{type:Number,required:true},
    description:{type:String,required:true},
    date: { type: Date, default: Date.now }

});
module.exports=mongoose.model('manualExp',schema);