const {container} = require('../bottle')
const StatusRoc = require('../entities/StatusRoc')

/**
 * StatusRoc
 */
describe('StatusRoc', () => {
    it('primaryKeyName', async () => {
        expect(StatusRoc.primaryKeyName).toBe('ID')
    })

    // TODO: not working    
    it.skip('columnsWoPrimaryKey', () => {
        expect(StatusRoc.columnsWoGenerated).toBeInstanceOf(Object)
        expect(StatusRoc.columnsWoGenerated).not.toHaveProperty('ID')
        expect(StatusRoc.columnsWoGenerated).toHaveProperty('STATUS_ROC')
    })

    it('find', async () => {
        let entity = await container.transaction(async (connection) => StatusRoc.find(connection, 'c5346d54-c1a3-493b-bcbf-54670495a18e'))
        expect(entity).toBeInstanceOf(StatusRoc)
        expect(entity.ID).toBe('c5346d54-c1a3-493b-bcbf-54670495a18e')
        expect(entity.STATUS_ROC).toContain('РОК')
    })

})
