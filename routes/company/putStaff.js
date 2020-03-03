const {container} = require('../../bottle')
const Company = require('../../entities/Company')
const Employee = require('../../entities/Employe')
const QualCertificate = require('../../entities/QualCertificate')
const QualCertificateDirection = require('../../entities/QualCertificateDirection')
const SelfRegOrg = require('../../entities/SelfRegOrg')

/**
 * Обновляет персонал и квалификационные сертификаты
 *
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
module.exports = async function putStaff(req, res) {
    const result = []

    await container.transaction(async (connection) => {
        for (let eachItemJson of req.body) {
            const eachItem = new Employee()
            eachItem.merge(eachItemJson)
            eachItem.primaryKey=null

            // должности
            eachItem.POSITION_WEIGHT = 0
            for (let eachPosition of eachItemJson.POSITIONS) {
                eachItem.POSITION_WEIGHT += eachPosition.value
            }

            // саморегулируемая организация
            if (eachItemJson.SELFREG_ORG) {
                const selfRegOrg = await SelfRegOrg.findByParams(connection, {SELFREG_ORG: eachItemJson.SELFREG_ORG})
                eachItem.ID_SELFREG_ORG = selfRegOrg.primaryKey
            }

            // сохранили человека
            await eachItem.create(connection)

            // создали сертификаты
            for (let eachQualCertificateJson of eachItemJson.QUAL_CERTS) {
                const eachQualCertificate = new QualCertificate()
                eachQualCertificate.merge(eachQualCertificateJson)
                eachQualCertificate.ID_STAFF = eachItem.primaryKey
                const eachDirection = await QualCertificateDirection.findByParams(connection, {DIRECTION: eachQualCertificateJson.DIRECTION})
                eachQualCertificate.DIRECTION_ID = eachDirection.primaryKey
                await eachQualCertificate.create(connection)
            }

            result.push(eachItem.primaryKey)
        }
    })



    res.send(result)
}
