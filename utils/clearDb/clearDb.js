const oracledb = require('oracledb')
const {container} = require('../../bottle.js')
const fs= require('fs')
const query = fs.readFileSync(__dirname+'/query.sql', {encoding:'UTF-8'})

console.log(query)
container.transaction(async (connection) => {
    return await connection.execute(query)
}).then(()=>{
    return oracledb.getPool()
}).then((pool)=>{
    return pool.close()
})
