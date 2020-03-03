const {container} = require('../../bottle')
const PresenceLocality = require('../../entities/PresenceLocality')

describe('PresenceLocality', () => {
    it('find', async () => {
        await container.transaction(async (connection) => {
            let entity = await PresenceLocality.find(connection, '4b96f4e4-2e05-4b85-829b-708be7ccbe9a')
            expect(entity).toBeInstanceOf(PresenceLocality)
            expect(entity.ID).toBe('4b96f4e4-2e05-4b85-829b-708be7ccbe9a')
            expect(entity.ID_COMPANY).toBe(476)
            expect(entity.ID_OFFICE).toContain('8696de27-c9b1-4a15-9ca3-ad68552fc280')
        })
    })
    it('create', async () => {
        await container.transaction(async (connection) => {
            const entity= new PresenceLocality()
            entity.ID_COMPANY=476
            entity.ID_OFFICE= '8696de27-c9b1-4a15-9ca3-ad68552fc280'
            entity.ID_LOCALITY= 377
            await entity.create(connection)
            expect(entity.primaryKey).toBeTruthy()

            let loadedEntity = await PresenceLocality.find(connection, entity.ID)
            expect(loadedEntity.ID_OFFICE).toBe(entity.ID_OFFICE)
            expect(loadedEntity.ID_LOCALITY).toBe(entity.ID_LOCALITY)
        })
    })
})
