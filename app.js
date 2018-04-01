var express = require('express');
var exphbs  = require('express-handlebars');
var  mongoose = require('mongoose');
var config=require('./config');
var flash = require('connect-flash');
var session = require('express-session');
var bcrypt = require('bcryptjs');
var passport= require('passport');
var methodOverride = require('method-override')
var bodyParser = require('body-parser');
var lists= require('./models/list');
var users= require('./models/users');
var configpassport=require('./config/passport');
const {ensureAuthenticated}=require('./helpers/auth');
var app=express();
var port = process.env.PORT ||3000;

//handlebars middleware
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

//method override middleware
app.use(methodOverride('_method'))

//express session middleware
// Express session midleware
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));

//flash middleware
app.use(flash());
//passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.use(function(req,res,next) {

    res.locals.success_msg= req.flash('success_msg');
    res.locals.error_msg= req.flash('error_msg');
    res.locals.error= req.flash('error');
    res.locals.userid=req.user || null;
      next();

});

configpassport(passport);

app.get('/',(req,res)=>{
  var title='welcome';
        res.render('index',{
          title:title
        });
});


app.get('/about',(req,res)=>{
        res.render('about');
});


app.get('/list/add',ensureAuthenticated,(req,res)=>{

        res.render('list/add');
});


app.post('/list/add',ensureAuthenticated,(req,res)=>{

        let errors=[];
        if(!req.body.title){
          errors.push({text:'please add a title'});
        }

        if(!req.body.details){
          errors.push({text:'please add some details'});
        }


        if(errors.length>0){
          res.render('list/add',{
            errors:errors,
            title:req.body.title,
            details:req.body.details,
            user:req.user.id
          });
        }
        else {

          var list= lists({
            title:req.body.title,
            details:req.body.details,
            user:req.user.id
          });

            list.save()
            .then(()=>{
              req.flash('success_msg','Item added');
              res.redirect('/list')
            });


        }
});



app.get('/list',ensureAuthenticated,(req,res)=>{
        lists.find({user:req.user.id})
        .sort({date:'desc'})
        .then((data)=>{
          res.render('list/list',{
            list:data
          });
        });

});


app.get('/list/edit/:id',ensureAuthenticated,(req,res)=>{
       lists.find({
         _id:req.params.id
       })
       .then((data)=>{
         if(data.user.id!= req.user.id){
           req.flash('error_msg','not allowed');
           req.redirect('/list');
         }
         else {
           res.render('list/edit',{
             data:data[0]
           });
         }

       });


});


app.get('/list/delete/:id',ensureAuthenticated,(req,res)=>{
  lists.find({
    _id:req.params.id
  })
  .then((data)=>{
    res.render('list/delete',{
      data:data[0]
    })
  });
});


app.delete('/list/:id',ensureAuthenticated,(req,res)=>{

        lists.findOneAndRemove(req.params.id)
        .then(()=>{
          req.flash('success_msg','Item deleted');
          res.redirect('/list')
        });



});


app.put('/list/:id',ensureAuthenticated,(req,res)=>{
    lists.findOneAndUpdate(req.params.id,
      {
        title:req.body.title,
        details:req.body.details
      })
      .then(()=>{
        req.flash('success_msg','Item updated');
          res.redirect('/list');

      });

});


app.get('/login',(req,res)=>{

      res.render('login');
});

app.post('/login',(req,res,next)=>{
        passport.authenticate('local',{
          successRedirect:'/list',
          failureRedirect:'/login',
          failureFlash:true
        })(req,res,next);
});

app.get('/register',(req,res)=>{

      res.render('register');
});

app.post('/register',(req,res)=>{
        let errors=[];
        if(req.body.password != req.body.passwordconfirmation) {
          errors.push({text:'passwords do not match'});
        }

        if(req.body.password.length < 4) {
          errors.push({text:'password must be more then 4 character'});
        }

        if(errors.length >0) {
          res.render('register',{
              errors:errors,
              name:req.body.name,
              email:req.body.email,
              password:req.body.password,
              password2:req.body.passwordconfirmation
          });
        }
        else {
          users.findOne({email:req.body.email})
          .then((data)=>{
            if(data){
              req.flash('error_msg','user already exist with this email ');
              res.redirect('/register')
            }
            else{
              var user= users({
                name:req.body.name,
                email:req.body.email,
                password:req.body.password
              });

              bcrypt.genSalt(10,(err,salt)=>{
                  bcrypt.hash(user.password,salt,(err,hash)=>{
                        if(err){
                          throw err;
                        }
                        else {
                           user.password =hash;
                           user.save()
                           .then(()=>{
                             req.flash('success_msg','user created now you can login');
                             res.redirect('/login');
                           });
                        }
                  });

              });

            }
          });


        }


});

app.get('/logout',(req,res)=>{
      req.logout();
      req.flash('success_msg','you are logout');
      res.redirect('/login');

});

mongoose.connect(config.getDbconnectionstring()).then(()=>{
  console.log('mongodb connected');
})
.catch(()=>{
  console.log('error');
});
app.listen(port,()=> {
  console.log(`server started on port ${port}`);
});
