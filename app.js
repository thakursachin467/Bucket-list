var express = require('express');
var exphbs  = require('express-handlebars');
var  mongoose = require('mongoose');
var config=require('./config');
var flash = require('connect-flash');
var session = require('express-session');
var methodOverride = require('method-override')
var bodyParser = require('body-parser');
var lists= require('./models/list');
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
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true,
  cookie: { secure: true }
}));

//flash middleware
app.use(flash());

app.use(function(req,res,next) {

    res.locals.success_msg= req.flash('success_msg');
    res.locals.error_msg= req.flash('error_msg');
      res.locals.error= req.flash('error');
      next();

});


app.get('/',(req,res)=>{
  var title='welcome';
        res.render('index',{
          title:title
        });
});


app.get('/about',(req,res)=>{
        res.render('about');
});


app.get('/list/add',(req,res)=>{

        res.render('list/add');
});





app.post('/list/add',(req,res)=>{

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
            details:req.body.details
          });
        }
        else {
          var list= lists({
            title:req.body.title,
            details:req.body.details
          });

            list.save()
            .then(()=>{
              req.flash('success_msg','Item added');
              res.redirect('/list')
            });


        }
});





app.get('/list',(req,res)=>{
        lists.find({})
        .sort({date:'desc'})
        .then((data)=>{
          res.render('list/list',{
            list:data
          });
        });

});


app.get('/list/edit/:id',(req,res)=>{
       lists.find({
         _id:req.params.id
       })
       .then((data)=>{
         res.render('list/edit',{
           data:data[0]
         });
         console.log(data[0].title);
       })


});


app.get('/list/delete/:id',(req,res)=>{
  lists.find({
    _id:req.params.id
  })
  .then((data)=>{
    res.render('list/delete',{
      data:data[0]
    })
  });
});


app.delete('/list/:id',(req,res)=>{

        lists.findOneAndRemove(req.params.id)
        .then(()=>{
          req.flash('success_msg','Item deleted');
          res.redirect('/list')
        });



});


app.put('/list/:id',(req,res)=>{
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



mongoose.connect(config.getDbconnectionstring()).then(()=>{
  console.log('mongodb connected');
})
.catch(()=>{
  console.log('error');
});
app.listen(port,()=> {
  console.log(`server started on port ${port}`);
});
