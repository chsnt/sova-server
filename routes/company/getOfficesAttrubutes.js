const {container} = require('../../bottle')

module.exports = async function getOfficesAttributes(req, res) {
    let result = await container.transaction(async (connection) => {
        const sql = `
            SELECT *
            FROM OFFICES_ATTR_VIEW
            WHERE ID_company = :id
        `
        const {rows} = await connection.execute(sql, {id: req.params.id})

        for (let eachRow of rows) {
            const eachSql = `
                select
                    pl.id,
                    l.id id_locality,
                    l.state,
                    l.locality
                from PRESENCE_LOCALITY pl
                    left join "PUB".SHORT_LIST_LOCATIONS l on pl.id_locality = l.ID
                where pl.ID_OFFICE = :office_id
              `
            const eachRowLocality = await connection.execute(eachSql, {
                    office_id: eachRow.ID_OFFICE
                })
            eachRow.PRESENCE_LOCALITY = eachRowLocality.rows
        }
        return rows
    })
    res.send(result)
}
