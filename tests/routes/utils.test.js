const request = require('supertest')

const app = require('../../app')

describe('/api/utils/', () => {
    /**
     * проверяем асинхронный Роут
     */
    it('async', async () => {
        const res = await request(app)
            .get('/api/utils/async')
            .send()

        expect(res.statusCode).toEqual(200)
        expect(res.statusCode).toEqual(200)
    })

    describe('error', ()=>{
        /**
         * проверяем получение JSON-данных
         */
        it('json', async () => {
            const res = await request(app)
                .get('/api/utils/json')
                .send()
            expect(res.body).toHaveProperty('message')
        })

        /**
         * Проверяем формат ошибок
         */
        it('error', async () => {
            const res = await request(app)
                .get('/api/utils/error')
                .send()
            // console.log(res.body)
            expect(res.body).toHaveProperty('message')
            expect(res.body).toHaveProperty('stack')
            expect(res.body).toHaveProperty('code')
        })

        /**
         * Проверяем формат аснхронных ошибок
         */
        it('asyncError', async () => {
            const res = await request(app)
                .get('/api/utils/asyncError')
                .send()
            // console.log(res.body)
            expect(res.body).toHaveProperty('message')
            expect(res.body).toHaveProperty('stack')
            expect(res.body).toHaveProperty('code')
        })
    })
})
