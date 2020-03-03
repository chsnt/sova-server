  // Функция получения списка полей таблицы

  const dbConfig = require('./dbconfig.js');
  const oracledb = require('oracledb');


  const getColumnsArray = async function (SCHEMA, TABLE){

        SCHEMA = SCHEMA.toUpperCase()
        TABLE  = TABLE.toUpperCase()    

        queryString = ` SELECT column_name
                        FROM ALL_TAB_COLUMNS
                        WHERE owner = '${SCHEMA}'
                        AND table_name = '${TABLE}' 
                        AND column_name <> 'ID'
                        ORDER BY column_name `

        optionsObj = { outFormat: oracledb.ARRAY };
        
        try {

            connection = await oracledb.getConnection(
            { 
                user: dbConfig.user, 
                password: dbConfig.password, 
                connectString: dbConfig.connectString
            });


        result = await connection.execute(
            queryString
            ,{}
            ,optionsObj
        )

            // 
            if ( result.rows.length ) {   // If result there is  
                return await JSON.stringify(result.rows.map(e => e[0]));   
            } else {
                return [];  
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


module.exports.getColumnsArray = getColumnsArray