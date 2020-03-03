const {container} = require('../../bottle')
const OfficeHistory = require('../../entities/OfficeHistory')
const Office = require('../../entities/Office')

describe('Office', () => {
    it('find', async () => {
        await container.transaction(async (connection) => {
            let entity = await Office.find(connection, '384b6e73-7a57-4f9b-8d15-e08e1f4fecbe')
            expect(entity).toBeInstanceOf(Office)
            expect(entity.EMAIL).toBe('ocenka2p@yandex.ru')

            expect(entity.history).toBeInstanceOf(OfficeHistory)
            expect(entity.history.OFFICE_ADDRESS).toBe('г. Екатеринбург, ул. Отто Шмидта, д. 58, оф. 306')
        })
    })

    it('create', async () => {
        await container.transaction(async (connection) => {
            const data={}

            const entity= new Office()
            entity.EMAIL='test'
            entity.ID_COMPANY=563
            entity.history.OFFICE_ADDRESS='test'
            await entity.create(connection)
            expect(entity.primaryKey).toBeTruthy()
            expect(entity.history.primaryKey).toBeTruthy()


            let loadedEntity = await Office.find(connection, entity.ID)
            expect(loadedEntity.EMAIL).toBe(entity.EMAIL)
            expect(loadedEntity.history.OFFICE_ADDRESS).toBe(entity.history.OFFICE_ADDRESS)
        })
    })


})
