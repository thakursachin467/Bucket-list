var  mongoose = require('mongoose');

var schema = mongoose.Schema;

var users= new schema({
      name:{
        type: String,
        require:true
      },
      email:{
        type:String,
        require:true
      },
      password:{
        type:String,
        require:true
      },
      date:{
        type:Date,
        default:Date.now
      }
},
    {
    autoIndexId: true
  });


  var user = mongoose.model('users',users);

  module.exports =user;
