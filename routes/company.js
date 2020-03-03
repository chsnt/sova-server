const {container} = require('../bottle')
const express = require('express')
// const e = require('../component/utils/errorTemplate.js');
const router = express.Router()

const putCompanyRegionAccesses = require('./company/putCompanyRegionAccesses')
const getRegistry = require('./company/getRegistry')

const getCompanyAttributes = require('./company/getCompanyAttributes')
const getOfficesAttributes = require('./company/getOfficesAttrubutes')
const getRegionsAccess = require('./company/getRegionsAccess')
const getStaffAttrubutes= require('./company/getStaffAttrubutes')
const put = require('./company/put')
const putOffices = require('./company/putOffices')
const putStaff = require('./company/putStaff')

/**
 * Создать компанию
 */
router.put('/put', put)

/**
 * Создать офисы
 */
router.put('/:id/putOffices', putOffices)

/**
 * реестр компаний для главной страницы
 */
router.get('/registry', getRegistry)

/**
 * Основная информация по компании
 */
router.get('/:id/company-attributes', getCompanyAttributes)

/**
 * Информация по офисам
 */
router.get('/:id/office-attributes', getOfficesAttributes)

/**
 * Доступные виды деятельности по регионам
 */
router.get('/:id/region-access', getRegionsAccess)

/**
 * Инфа по сотрудникам компании
 */
router.get('/:id/staff-attributes', getStaffAttrubutes)

router.put('/:id/putStaff',putStaff)

router.put('/company-region-accesses', async (req, res) => {
    await putCompanyRegionAccesses.inPointPut(req, res)
});

/*
router.delete('/company-region-accesses', async (req, res) => {
    let cookie_id = req.cookies.uid;
    let id = req.body.ID;
    let data = await PcAttrHist.del(id, cookie_id)
    res.send(data)
})
*/
/**
 * Инфа по сотрудникам компании
 */
// router.get('/:id/staff-attributes', async (req, res) => {
//     await Staff.getStaffAttributes(req, res)
// })

//TODO Editing Alexey - how do i understand that?
router.get('/staff-position-weight', async (req, res) => {
    await Staff.getPositionWeight(req, res);
})



router.post('/add-new-company', async (req, res) => {
    try {
        // Input error handling
        let objInput = req.body;
        // if (!req.signedCookies.access_token) throw new Error('Need access token')
        if (!Object.keys(objInput).length) throw new Error('Request has empty body')
        if (!Array.isArray(objInput.offices)) throw new Error('offices - must be an array')
        if (!objInput.offices.reduce((acc, val) => acc && Array.isArray(val.presenceLocality), true))
            throw new Error('offices.presenceLocality - must be an array')


        // Prepare input data
        // If in input object no field with regions and tolerance levels (not specified explicitly)
        // then we generate its from offices
        if (!objInput.company.accessLevels) {

            objInput.company.accessLevels = [];
            let offices = objInput.offices
            offices.forEach(({presenceLocality}) =>
                presenceLocality.forEach(({STATE}) => {
                    let region = {'REGION': STATE, 'ACCESS_WEIGHT': 0}
                    let regionStr = JSON.stringify(region)
                    // Is there such a region?
                    // When adding/updating an office, you still have to look and if there is such a region in the list of regions (if no - add)
                    let addedRegionsStr = objInput.company.accessLevels.map(reg => JSON.stringify(reg))
                    if (!addedRegionsStr.includes(regionStr)) objInput.company.accessLevels.push(region)
                })
            )
        }

        let result = await Company.insert(res, req);
        // res.send data
    } catch (error) {
        console.log(error)
        res.send (e(error.message))
    }

});

module.exports = router;
