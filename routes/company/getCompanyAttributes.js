const {container} = require('../../bottle')

module.exports = async function getCompanyAttributes(req, res) {
    let result = await container.transaction(async (connection) => {
        const sql = `
            select *
            from PC_ATTRIBUTES_ACTUAL_VIEW
            where ID = :id 
      `;
        const {rows} = await connection.execute(sql, {id: req.params.id});
        return rows[0]
    })
    res.send(result)
}
