const {container} = require('../../bottle')
const Curator = require('../../entities/Curator')

describe('Curator', () => {
    it('find', async () => {
        await container.transaction(async (connection) => {
            let entity = await Curator.find(connection, '97d4b43f-43dc-4f4e-924e-d087d6a1ff6e')
            expect(entity).toBeInstanceOf(Curator)
            expect(entity.ID).toBe('97d4b43f-43dc-4f4e-924e-d087d6a1ff6e')
            expect(entity.ID_REGION).toBe(1)
            expect(entity.ID_USER).toBe(26)
        })
    })
    it('list', async () => {
        await container.transaction(async (connection) => {
            let list = await Curator.list(connection)
            expect(list).toBeInstanceOf(Array)
            expect(list[0]).toBeInstanceOf(Curator)
        })
    })
})
