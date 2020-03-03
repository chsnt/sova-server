const {container} = require('../bottle')
const SelfRegOrg = require('../entities/SelfRegOrg')

/**
 * SelfRegOrg
 */
describe('SelfRegOrg', () => {
    it('primaryKeyName', async () => {
        expect(SelfRegOrg.primaryKeyName).toBe('ID')
    })

    // TODO: not working    
    it.skip('columnsWoPrimaryKey', () => {
        expect(SelfRegOrg.columnsWoGenerated).toBeInstanceOf(Object)
        expect(SelfRegOrg.columnsWoGenerated).not.toHaveProperty('ID')
        expect(SelfRegOrg.columnsWoGenerated).toHaveProperty('SELFREG_ORG')
    })

    it('find', async () => {
        let entity = await container.transaction(async (connection) => SelfRegOrg.find(connection, '5563b671-87f7-47e7-a531-f644b735b72d'))
        expect(entity).toBeInstanceOf(SelfRegOrg)
        expect(entity.ID).toBe('5563b671-87f7-47e7-a531-f644b735b72d')
        expect(entity.SELFREG_ORG).toContain('РОО')
    })

})
