var  mongoose = require('mongoose');

var schema = mongoose.Schema;

var bucketlist= new schema({
      title:{
        type: String,
        require:true
      },
      details:{
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

var list = mongoose.model('BucketList',bucketlist);

module.exports =list;
