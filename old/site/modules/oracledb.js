//var log = require('log4js').getLogger("oracledb");
var oracledb = require("oracledb");

module.exports = function(pool) {
 
  var doConnect = function(callback) {

    console.log("INFO: Module getConnection() called - attempting to retrieve a connection using the node-oracledb driver");

    pool.getConnection(function(err, connection) {

      
      if (err) { 
        console.log("ERROR: Cannot get a connection: ", err);
        return callback(err);
      }
     
      if (typeof pool !== "undefined") {
        console.log("INFO: Connections open: " + pool.connectionsOpen);
        console.log("INFO: Connections in use: " + pool.connectionsInUse);
      }
      
		doExecute(connection, "SELECT SYS_CONTEXT('userenv', 'sid') AS session_id FROM DUAL", {}, function(err, result) {
        
        if (err) {
          console.log("ERROR: Unable to determine Oracle SESSION ID for this transaction: ", err);
          releaseConnection(connection);
          return callback(err);
        }
       
        console.log("INFO: Connection retrieved from the database, SESSION ID: ", result.rows[0][0]);        
        return callback(err, connection);

      });

    });

  }



  
  var doExecute = function(connection, sql, params, callback) {
    connection.execute(sql, params, { autoCommit: true}, function(err, result) {
      
      if (err) {
        console.log("ERROR: Unable to execute the SQL: ", err);        
        return callback(err);
      }
      
      return callback(err, result);

    });

  }  

  var doSelect = function(connection, sql, params,start,limit, callback) {
    	var selectSQL = "SELECT * FROM ( SELECT A.*,ROWNUM ID FROM ("+sql+") A WHERE ROWNUM <= "+limit+" ) WHERE ID >= "+start;
	console.log('Final Select SQL:'+selectSQL);
	connection.execute(selectSQL, params,{outFormat: oracledb.OBJECT}, function(err, result) {      
      if (err) {
        console.log("ERROR: Unable to execute the SQL: ", err);        
        return callback(err);
      }

      
      return callback(err, result);

    });

  }


  
  var doCommit = function(connection, callback) {
    connection.commit(function(err) {
      if (err) {
        console.log("ERROR: Unable to COMMIT transaction: ", err);
      }
      return callback(err, connection);
    });
  }





 
  var doRelease = function(connection) {

    connection.release(function(err) {
      if (err) {
        //console.log("ERROR: Unable to RELEASE the connection: ", err);
      } else {
		  console.log('Connection has been released..');
	  }
      return;
    });

  }



 
  module.exports.doConnect  = doConnect;
  module.exports.doExecute  = doExecute;
  module.exports.doCommit   = doCommit;
  module.exports.doRelease  = doRelease;
  module.exports.doSelect   = doSelect;

}

