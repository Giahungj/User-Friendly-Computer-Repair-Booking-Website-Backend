'use strict';
export default {
  up: async (queryInterface, Sequelize) => {
      // Tạo bảng lưu lịch sử chuyên khoa bác sĩ
      await queryInterface.createTable('DoctorSpecialtyHistory', {
          id: {
              type: Sequelize.INTEGER,
              autoIncrement: true,
              primaryKey: true
          },
          doctorId: {
              type: Sequelize.INTEGER,
              allowNull: false
          },
          specialtyId: {
              type: Sequelize.INTEGER,
              allowNull: false
          },
          deletedAt: {
              type: Sequelize.DATE,
              defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
          }
      });

      // Trigger lưu chuyên khoa trước khi xóa
      await queryInterface.sequelize.query(`
        CREATE TRIGGER before_specialty_delete
        BEFORE UPDATE ON Specialty
        FOR EACH ROW
        BEGIN
            IF NEW.deleted = 1 THEN
                -- Lưu specialtyId vào bảng DoctorSpecialtyHistory
                INSERT INTO DoctorSpecialtyHistory (doctorId, specialtyId)
                SELECT id, specialtyId FROM Doctors WHERE specialtyId = OLD.id;
                
                -- Cập nhật specialtyId của bác sĩ thành NULL
                UPDATE Doctors SET specialtyId = NULL WHERE specialtyId = OLD.id;
            END IF;
        END;
      `);

      // Trigger khôi phục chuyên khoa
      await queryInterface.sequelize.query(`
          CREATE TRIGGER after_specialty_restore
          AFTER UPDATE ON Specialty
          FOR EACH ROW
          BEGIN
              IF NEW.deleted  = 0 THEN
                  UPDATE Doctors d
                  JOIN DoctorSpecialtyHistory h ON d.id = h.doctorId
                  SET d.specialtyId = h.specialtyId
                  WHERE h.specialtyId = NEW.id;

                  DELETE FROM DoctorSpecialtyHistory WHERE specialtyId = NEW.id;
              END IF;
          END;
      `);
  },

  down: async (queryInterface, Sequelize) => {
      await queryInterface.dropTable('DoctorSpecialtyHistory');
      await queryInterface.sequelize.query(`DROP TRIGGER IF EXISTS before_specialty_delete;`);
      await queryInterface.sequelize.query(`DROP TRIGGER IF EXISTS after_specialty_restore;`);
  }
};
