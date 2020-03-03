const {container} = require('../../../bottle')
const catalog = require('./registryFieldNamesCatalog')

module.exports = async function registryExclRoc(req, res) {
    let result = await container.transaction(async (connection) => {
        const sql = `
            select *
            from OFFICES_ACTUAL_HUM_VIEW
            WHERE STATUS_ROC = 'исклРОК'
        `
        // let result = await Company.list()
        const {rows} = await connection.execute(sql)
        return rows
    })

    // Replace 0 & 1 where 
    const replacer = (field) => {
        if(field === 1) return '+'
        if(field === 0) return ''
    }
    result = result.map(row => {
        let newRow = row
        newRow.RES_REALTY_WITH_LAND = replacer(row.RES_REALTY_WITH_LAND)
        newRow.RES_REALTY_OTHERS = replacer(row.RES_REALTY_OTHERS)
        newRow.COMMERCIAL_REALTY = replacer(row.COMMERCIAL_REALTY)
        newRow.EQUIPMENT = replacer(row.EQUIPMENT)
        newRow.MOVABLE_PROPERTY = replacer(row.MOVABLE_PROPERTY)
        newRow.OTHERS = replacer(row.OTHERS)
        return newRow
    })

    // Array fo Excel sheet
    let sheetArr = []

    // Field names - keys
    let fieldNames = Object.keys(result[0])
   
    // Field names to RUS
    fieldNames = fieldNames.map(name => catalog[name])
    sheetArr = [fieldNames]

    // Data 
    result.forEach(r => {
        let rowArr = []
        for (const field in r) {
            if (r.hasOwnProperty(field)) {
                rowArr.push(r[field])
            }
        }
        sheetArr.push(rowArr)
    });

    return sheetArr
}