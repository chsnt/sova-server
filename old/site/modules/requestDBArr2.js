
  // Функция запроса к БД

  const dbConfig = require('./dbconfig.js');
  const oracledb = require('oracledb');
  
  oracledb.autoCommit = true;



  const requestDB = async function ( arr ){

    // arr = [[identParam, queryString, bindObj, optionsObj, callback]]
    
    return new Promise( async (resolve, reject) => {
                             
        try {

            pool = await oracledb.createPool(dbConfig); 

            connection = await oracledb.getConnection(
            { 
                user: dbConfig.user, 
                password: dbConfig.password, 
                connectString: dbConfig.connectString
            });

			//await connection.execute("SET SESSION wait_timeout = 604800"); // 7 days timeout
		
            // arr

            let arrOut = []
            
            for ( req of arr ) {

                    identParam  = req[0] 
                    queryString = req[1]             
                    bindObj     = req[2] 
                    optionsObj  = req[3] 
                    callback    = req[4] 

                    var empty;
                    var returnFunc = obj => obj                    
            
                    optionsObj = (optionsObj == undefined)? {} : optionsObj;
                    bindObj    = (bindObj == undefined)?    {} : bindObj;
            
                    // В зависимости от того что требуется на выходе - массив или объект 
                    // По разному обрабатываем перед return
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

                    console.log(`(
                        ${queryString}
                        ,${JSON.stringify(bindObj)}
                        ,${JSON.stringify(optionsObj)}
                    )`)
                    
                    if ( Object.keys(bindObj).length === 0 && Object.keys(optionsObj).length === 0 ) {
                        result = await connection.execute(queryString)
                        
                    } else if ( Object.keys(optionsObj).length === 0 ){
                        result = await connection.execute(
                            queryString
                            ,bindObj
                        )
                        
                    } else {
                        result = await connection.execute(
                            queryString
                            ,bindObj
                            ,optionsObj
                        )
                    }
            
                    //
                    console.dir(result)
                
                    if ( result.rows ) { 

                        if ( result.rows.length ) {   // If result there is 
                            // Modify before send (return) 
                            
                            let r = result.rows
                            if ( callback != undefined ) r = await callback( r );
                            arrOut.push({ "id" : identParam, "response" : await returnFunc( r ) }); 

                        } else {
                            console.log(identParam + ' - пусто')
                            arrOut.push( { "id" : identParam, "response" : empty , "queryString" : queryString } ); 
                        };
                    } else if ( result.rowsAffected ) {
                        arrOut.push( { "id" : identParam, "response" : result.rowsAffected } ); 					
                    } else {
                        console.log({ "id" : identParam, "response" : result })
                        arrOut.push( { "id" : identParam, "response" : result } ); 				
                    } 

            }
            
            resolve(arrOut)

        } catch (err) {
            console.log("error there")
            console.log(queryString)
            console.error(err);
            if (connection) {
                try {
                    // await connection.close();
                    await connection.release();
                } catch (err) {
                  reject( { "id" : identParam, "response": "error", "comment" : err, "queryString" : queryString });       
                }
            }			
            reject( { "id" : identParam, "response": "error", "comment" : err, "queryString" : queryString });
        } finally {
            if (connection) {
                try {
                    // await connection.close();
                    await connection.release();
                } catch (err) {
                  reject( { "id" : identParam, "response": "error", "comment" : err, "queryString" : queryString });       
                }
            }
        }
    })
}


module.exports.requestDBPromise = requestDB