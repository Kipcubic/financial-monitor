var mongoose =require('mongoose');
var Schema=mongoose.Schema;
var bcrypt=require('bcrypt-nodejs');
var userSchema=new Schema({
    email:{type:String,required:true},
    password:{type:String,required:true},
    first_name:{type:String,required:false},
    last_name:{type:String,required:false},
    jan_income:{type:Number,required:false},
    feb_income:{type:Number,required:false},
    march_income:{type:Number,required:false},
    april_income:{type:Number,required:false},
    may_income:{type:Number,required:false},
    june_income:{type:Number,required:false},
    july_income:{type:Number,required:false},
    // aug_income:{type:Number,required:false},
    sept_income:{type:Number,required:false},
    octo_income:{type:Number,required:false},
    nov_income:{type:Number,required:false},
    dec_income:{type:Number,required:false},   
    income:{type:Number,required:false}, 
    additional_income:{type:Number,required:false}
});
userSchema.methods.encryptPassword=function(password){
    return bcrypt.hashSync(password,bcrypt.genSaltSync(5),null);
}
userSchema.methods.validpassword=function(password){
    return bcrypt.compareSync(password,this.password);
}
module.exports=mongoose.model('User',userSchema);