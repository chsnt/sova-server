const request = require('supertest')
const app = require('../../../app')

describe('/api/common/', () => {
    it('access-levels', async () => {
        const res = await request(app).get('/api/common/access-levels').send()
        expect(res.statusCode).toEqual(200)
        expect(res.body).toBeInstanceOf(Array)
        expect(res.body.length).toBe(6)
    })

    it('locations', async () => {
        const res = await request(app).get('/api/common/locations/sova').send()
        // console.log(res.body)
        expect(res.statusCode).toEqual(200)
        expect(res.body).toBeInstanceOf(Array)
        expect(res.body.length).toBeGreaterThan(200)
    })
})
