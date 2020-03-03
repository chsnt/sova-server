  // Функция запроса к БД

  const dbConfig = require('./dbconfig.js');
  const oracledb = require('oracledb');


  const requestDB = async function (queryString, optionsObj, bindObj){

        //console.log('in requestDB')
        var empty;
        var returnFunc;

        optionsObj = (optionsObj == undefined)? {} : optionsObj;
        bindObj = (bindObj == undefined)? {} : bindObj;

        // В зависимости от того что требуется на выходе - массив или объект 
        // по разному обрабатываем перед return
        if (optionsObj ) {
            if (optionsObj.outFormat) { 
                console.log(optionsObj.outFormat)
                if ( optionsObj.outFormat == 4001 ) { 
                    empty = []
                    returnFunc = (arr) => {
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
                return await returnFunc(result.rows); 
            } else {
                return empty;  
            };

        } catch (err) {
            console.error(err);
            return err;
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


module.exports.requestDB = requestDB