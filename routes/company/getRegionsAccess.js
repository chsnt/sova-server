const {container} = require('../../bottle')

module.exports = async function getRegionsAccess(req, res) {
    let result = await container.transaction(async (connection) => {
        const sql = `
            SELECT *
            FROM ACCESES_COMPANY_REGION_VIEW
            WHERE ID_COMPANY = :id
        `

        const {rows} = await connection.execute(sql, {id: req.params.id})

        let result = rows.map(eachRegionAccessLevels => {

          const eachPermissions = {
            COMMERCIAL_REALTY: false,
            EQUIPMENT: false,
            MOVABLE_PROPERTY: false,
            OTHERS: false,
            RES_REALTY_OTHERS: false,
            RES_REALTY_WITH_LAND: false
          };

          if(eachRegionAccessLevels.ENG_NAME != null){
            const eachPermissionsArr = eachRegionAccessLevels.ENG_NAME.split(', ');
            eachPermissionsArr.forEach(eachPermissionName => eachPermissions[eachPermissionName] = true)
          };

            return {
                ID: eachRegionAccessLevels.ID,
                ID_COMPANY:eachRegionAccessLevels.ID_COMPANY,
                STATE: eachRegionAccessLevels.STATE,
                PERMISSIONS: eachPermissions
            }
        })
        return result
    })
    res.send(result)
}
