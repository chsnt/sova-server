const {container}= require('../../bottle')

module.exports = async function getRegistry(req, res) {
    let result = await container.transaction(async (connection) => {
        // TODO: list()
        const sql = `
            select *
            from OFFICES_ACTUAL_HUM_SLIM_VIEW
        `
        // let result = await Company.list()
        const {rows} = await connection.execute(sql)
        return rows
    })
    res.send(result)
}
