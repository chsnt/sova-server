  // Функция запроса к БД

  const dbConfig = require('./dbconfig.js');
  const oracledb = require('oracledb');


  const requestDB = async function (queryString, optionsObj, bindObj, callback){

        //console.log('in requestDB')
        var empty;
        var returnFunc;

        optionsObj = (optionsObj == undefined)? {} : optionsObj;
        bindObj = (bindObj == undefined)? {} : bindObj;

        // В зависимости от того что требуется на выходе - массив или объект 
        // по разному обрабатываем перед return
        if (optionsObj ) {
            if (optionsObj.outFormat) { 
                // console.log(optionsObj.outFormat)
                if ( optionsObj.outFormat == 4001 ) { 
                    empty = []
                    returnFunc = (arr) => {
                        //console.dir(arr)
                        return JSON.stringify(arr.map(e => e[0]))
                    }
                } else if( optionsObj.outFormat == 4002 ){
                    empty = {}
                    returnFunc = (obj) => {
                        return JSON.stringify(obj)
                    }                    
                }
            }            

        }

                  
        try {

            connection = await oracledb.getConnection(
            { 
                user: dbConfig.user, 
                password: dbConfig.password, 
                connectString: dbConfig.connectString
            });


            result = await connection.execute(
                queryString
                ,bindObj
                ,optionsObj
            )

            // 
            if ( result.rows.length ) {   // If result there is 
                // Modify before send (return) 
                let r = result.rows

                //console.log( r)
                if ( callback != undefined ) r = await callback( r );
                return await returnFunc( r ); 
            } else {
                return empty;  
            };

        } catch (err) {
            console.log("error there")
            console.log(queryString)
            console.error(err);
			if (connection) {
                try {
                    await connection.close();
                } catch (err) {
                    return { "response": "error", "comment" : err, "queryString" : queryString }; 
                }
            }
            return { "response": "error", "comment" : err, "queryString" : queryString };
        } finally {
            if (connection) {
                try {
                    await connection.close();
                } catch (err) {
                    return err; 
                }
            }
        }
}


module.exports.requestDBwoPromise = requestDB