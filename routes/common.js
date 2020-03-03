const express = require('express')
const router = express.Router()

const container = require('../bottle').container

/**
 * Справочник уровней доступа
 */
router.get('/access-levels', async function (req, res) {
    const connection = await container.connection,
        sql = `
            select
                ID,
                ENG_NAME,
                ABBREVIATION,
                NAME FULLNAME,
                WEIGHT
            from ACCESS_LEVEL_WEIGHTS
        `,
        dataset = await connection.execute(sql,)

    res.send(dataset.rows)
})

/**
 * Справочник федокругов, регионов, населенных пунктов
 */
router.get('/locations/:service', async function (req, res) {
    const service=req.params.service
    if (!service.match(/^\w+$/)){
        throw new Error('Имя сервиса должно состоять только из латинских букв')
    }

    const connection = await container.connection,
        sql = `
            SELECT
                id, state, locality
            FROM  pub.SHORT_LIST_LOCATIONS
            WHERE sova = 1
            ORDER BY state,
                CASE locality
                    WHEN 'Прочие населенные пункты' THEN 2
                    ELSE 1
                END        
`,
        dataset = await connection.execute(sql,)

    res.send(dataset.rows)
})


module.exports = router
