const {container} = require('../../bottle');
const Employe = require('../../entities/Employe');

describe('Employe', () => {

  it('create', async () => {
    await container.transaction(async (connection) => {
      let employe = new Employe();
      employe.PLACEBORN = "gorillaz";
      employe.PHONE_NUM ="+7(999)999-99-99";
      employe.ID_COMPANY = 1234
      await employe.create(connection);
      console.log(employe.ID)
      expect(employe.ID_COMPANY).toBe(1234)
    });
  })

  it('delete',async ()=>{
    await container.transaction(async (connection) => {
      let employe = new Employe();
      employe.PLACEBORN = "gorillaz";
      employe.PHONE_NUM ="+7(999)999-99-99";
      employe.ID_COMPANY = 1234
      await employe.create(connection);
      await employe.delete(connection)

      // fetching after delete and check
      const {rows} = await connection.execute('select * from PC_STAFF where ID=' + employe.primaryKey)
      expect(rows.length).toBe(0)
    })
  })


});
