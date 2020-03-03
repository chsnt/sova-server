const {container} = require('../../bottle')
const Company = require('../../entities/Company')
const Office = require('../../entities/Office')
const PresenceLocality = require('../../entities/PresenceLocality')
const Locality = require('../../entities/Locality')
const RegionAccess = require('../../entities/RegionAccess')
const Region = require('../../entities/Region')

/**
 * Сохраняет оффисы компании,
 * Создает, если это новые офисы без идентификаторов
 * создает / обновляет / удаляет презенс-локалити для офисов
 * создает / обновляет / удаляет регион-аксессы для компании
 *
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
module.exports = async function putOffice(req, res) {
    const stateIds = new Set()
    const result = []

    await container.transaction(async (connection) => {
        for (let eachOfficeJson of req.body) {
            const eachOffice = new Office()
            eachOffice.merge(eachOfficeJson)
            eachOffice.history.merge(eachOfficeJson)
            await eachOffice.create(connection)
            result.push(eachOffice.primaryKey)

            for (let eachLocalityJson of eachOfficeJson.PRESENCE_LOCALITY) {
                const eachPresenceLocality = new PresenceLocality()
                eachPresenceLocality.ID_COMPANY = eachOfficeJson.ID_COMPANY
                eachPresenceLocality.ID_OFFICE = eachOffice.primaryKey
                eachPresenceLocality.ID_LOCALITY= eachLocalityJson.ID
                await eachPresenceLocality.create(connection)

                const eachState = await Region.findByParams(connection, {STATE: eachLocalityJson.STATE})
                stateIds.add(eachState.ID)
            }
        }
        for (let eachStateId of [...stateIds]) {
            const regionAccess = new RegionAccess()
            regionAccess.ACCESS_WEIGHT = 0
            regionAccess.ID_COMPANY = req.body[0].ID_COMPANY
            regionAccess.ID_REGION = eachStateId
            regionAccess.ACCESS_WEIGHT = 0
            await regionAccess.create(connection)
        }
        res.send(result)
    })
}
