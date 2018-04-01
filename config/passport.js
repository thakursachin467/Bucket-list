var local= require('passport-local').Strategy;
var mongoose= require('mongoose');
var bcrypt = require('bcryptjs');
var users= require('../models/users');


module.exports = function(passport){

        passport.use(new local({usernameField:'email'},(email,password,done)=>{
            users.findOne({email:email})
            .then((data)=>{
              if(!data){
                  return done(null,false,{message:'no user found'});
              }

              //match password
              bcrypt.compare(password,data.password,(error,isMatch)=>{
                if(error) throw error;
                if(isMatch) {
                  return done(null,data)
                }
                else {
                  return done(null,false,{message:'password incorrect'});

                }
              });

            })

        }));

        passport.serializeUser(function(data, done) {
  done(null, data.id);
});

passport.deserializeUser(function(id, done) {
  users.findById(id, function(err, data) {
    done(err, data);
  });
});

}
