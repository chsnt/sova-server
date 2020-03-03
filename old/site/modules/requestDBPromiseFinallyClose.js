  // Функция запроса к БД

  const dbConfig = require('./dbconfig.js');
  const oracledb = require('oracledb');
  
  oracledb.autoCommit = true;


  const requestDB = async function ( identParam, queryString, bindObj, optionsObj, callback ){

    // arr = [[identParam, queryString, bindObj, optionsObj, callback]]
    
    return new Promise(async (resolve, reject) => {
        
        var empty;
        var returnFunc = obj => obj       
        
        let resultObj = {}

        optionsObj = (optionsObj == undefined)? {} : optionsObj;
        bindObj = (bindObj == undefined)? {} : bindObj;

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
                } //else {
                  //  empty = []
                  //  returnFunc = (arr) => {
                        //console.dir(arr)
                  //      return JSON.stringify(arr.map(e => e[0]))
                  //  }                   
                //}
            }            

        }

                  
        try {

            oracledb.createPool(dbConfig)

            pool = await oracledb.createPool(dbConfig)

            //connection = await oracledb.getConnection(
            connection = await oracledb.getConnection(
            { 
                user: dbConfig.user, 
                password: dbConfig.password, 
                connectString: dbConfig.connectString
            });

            //oraclePool.getConnection().then

			//await connection.execute("SET SESSION wait_timeout = 604800"); // 7 days timeout
					
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
                console.dir('bindObj')
                console.dir(bindObj)

				result = await connection.execute(
					 queryString
					,bindObj
					,optionsObj
				)
			}
	
            //
            console.dir(result)
            

            if ( result ) {

                if ( result.rows ) { 

                    if ( result.rows.length ) {   // If result there is 
                        // Modify before send (return) 
                        
                        let r = result.rows
                        if ( callback != undefined ) r = await callback( r );
                        resultObj = { "id" : identParam, "response" : await returnFunc( r ), "fullResult": result }

                    } else {
                        console.log(identParam + ' - empty')
                        resultObj =  { "id" : identParam, "response" : empty , "queryString" : queryString, "fullResult": result }; 
                    }

                } else if ( result.rowsAffected ) {
                    resultObj =  { "id" : identParam, "response" : result.rowsAffected, "fullResult": result } ; 	

                } else {
                    console.log({ "id" : identParam, "response" : result, "fullResult": result })
                    resultObj = { "id" : identParam, "response" : result, "fullResult": result }; 				
                } 



            } else {

                throw new Error ({ "id" : identParam, "response" : "has no result of SQL-request" }); 

            }
		

        } catch (err) {

            console.log("error there")
            if ( err instanceof Error ) {
                reject({ "id" : identParam, "response": "error", "comment" : err.message, "queryString" : queryString })
            } else {
                reject({ "id" : identParam, "response": "error", "comment" : err, "queryString" : queryString })
            }

            if (connection) {
                try{
                    await connection.release()
                } catch(errRelease){
                    //reject(errRelease)
                    console.dir(connection)
                    console.log('cant close connection')
                }

            } else {
                console.log('has no connection')
            }	
 
        } finally {
            
            if (connection) {
                try{
                    await connection.release()
                    resolve(resultObj)
                } catch(errRelease){
                    console.log(errRelease)
                }

            } else {
                console.log('has no connection')
            }	
        }
    })
}


module.exports.requestDBPromise = requestDB