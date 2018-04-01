var configvalue = require('./config');

module.exports = {
    getDbconnectionstring:function() {
      return 'mongodb://'+ configvalue.uname + ':' + configvalue.pwd + '@ds223509.mlab.com:23509/mydatabase';
    }

}
