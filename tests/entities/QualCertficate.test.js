const {container} = require('../../bottle');
const QualCertficate = require('../../entities/QualCertificate');

describe('QualCertficate', () => {



  it('create', async () => {
    let key = await container.transaction(async (connection) => {
      let qualCer = new QualCertficate();
      qualCer.LEGACY_DIRECTION = "gorillaz";
      qualCer.NUM ="99999-13";
      qualCer.ID_STAFF=20;
      qualCer.DIRECTION_ID=20;
      qualCer.ID=null;
      await qualCer.create(connection);

      let ResData =  await QualCertficate.find(connection, qualCer.primaryKey);
      expect(ResData.LEGACY_DIRECTION).toBe("gorillaz");
      expect(ResData.NUM).toBe('99999-13');
      return  ResData.primaryKey;
    });

    await container.transaction(async (connection) => {
      let sql = `DELETE FROM QUAL_CERT WHERE ID='${key}'`;
      let rows = await connection.execute(sql);
      expect(rows.rowsAffected).toBe(1);
    })
  })

});
