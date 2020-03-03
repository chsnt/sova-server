const {container}= require('../../bottle')
const Company = require('../../entities/Company')
const CompanyType = require('../../entities/CompanyType')

/**
 * Обновляет основные поля компании / создает, если это новая компания без идентификатора
 *
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
module.exports = async function put(req, res) {
    await container.transaction(async (connection) => {
        const company= new Company()

        company.merge(req.body)
        company.history.merge(req.body)
        company.history.ID= null

        // преобразую тип компании к ИДЕНТИФИКАТОРУ
        const companyType= await CompanyType.findByParams(connection, {TYPE_OF_COMPANY: req.body.TYPE_OF_COMPANY})
        company.history.ID_TYPE_OF_COMPANY= companyType.ID

        await company.create(connection)
        res.send({
            ID:company.ID
        })
    })
}
