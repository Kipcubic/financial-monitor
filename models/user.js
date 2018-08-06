var mongoose =require('mongoose');
var Schema=mongoose.Schema;
var bcrypt=require('bcrypt-nodejs');
var userSchema=new Schema({
    email:{type:String,required:true},
    password:{type:String,required:true},
    first_name:{type:String,required:true},
    last_name:{type:String,required:true},
    income:{type:Number,required:true},
 
    additional_income:{type:Number,required:true}
});
userSchema.methods.encryptPassword=function(password){
    return bcrypt.hashSync(password,bcrypt.genSaltSync(5),null);
}
userSchema.methods.validpassword=function(password){
    return bcrypt.compareSync(password,this.password);
}
module.exports=mongoose.model('User',userSchema);