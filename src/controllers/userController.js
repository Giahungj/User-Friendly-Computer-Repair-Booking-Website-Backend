import db from '../models/index';
import formatUtil from '../utils/formatUtil';

// --------------------------------------------------
const getUserDetailPage = async (req, res) => {
    const userId = req.params.id;

    // Lấy thông tin user và bản ghi UserLock (nếu có)
    const user = await db.User.findOne({
        where: { id: userId },
        include: [{
            model: db.UserLock,
            required: false // Left join để lấy cả khi không có UserLock
        }],
        raw: true,
        nest: true
    });

    // Lấy thông tin patient (nếu có)
    const patient = await db.Patient.findOne({
        where: { userId: userId },
        raw: true,
        nest: true
    });

    const userData = {
        ...user,
        UserLocks: {
            ...user.UserLocks,
            lockEndTime: user?.UserLocks?.lockEndTime ? formatUtil.formatDate(user.UserLocks.lockEndTime) : null
        },
        sex: user?.sex === 'Female' ? 'Nữ' : user?.sex === 'Male' ? 'Nam' : 'Khác',
        userType: user?.userType === 'doctor' ? 'Bác sĩ' : user?.userType === 'patient' ? 'Bệnh nhân' : 'Admin',
        createdAt: user?.createdAt ? formatUtil.formatDate(user.createdAt) : null,
        updatedAt: user?.updatedAt ? formatUtil.formatDate(user.updatedAt) : null
    };

    console.log('userData', userData)
    return res.render('layouts/layout', {
        page: `pages/users/userDetail.ejs`,
        pageTitle: 'Chi tiết tài khoản',
        user: userData,
        patient: patient
    })
}

// --------------------------------------------------
const lockAccount = async (req, res) => {
    try {
        const { userId, lockedBy, lockReason, lockEndTime } = req.body;

        // Validate required fields
        if (!userId || !lockedBy || !lockReason) {
            return res.status(400).json({ error: 'Thiếu thông tin bắt buộc: userId, lockedBy, lockReason' });
        }

        // Check if user exists
        const user = await db.User.findOne({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ error: 'Không tìm thấy người dùng' });
        }

        // Create lock record
        const lockData = {
            userId,
            lockedBy,
            lockReason,
            lockStartTime: new Date(),
            lockEndTime: lockEndTime ? new Date(lockEndTime) : null,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        await db.UserLock.create(lockData); // Giả định bảng khóa tài khoản là AccountLock

        return res.status(200).json({ message: 'Khóa tài khoản thành công' });
    } catch (error) {
        console.error('Lỗi khi khóa tài khoản:', error);
        return res.status(500).json({ error: 'Lỗi server khi khóa tài khoản' });
    }
}

// --------------------------------------------------
const unlockAccount = async (req, res) => {
    try {
        const { userId } = req.body;

        // Validate required fields
        if (!userId) {
            return res.status(400).json({ error: 'Thiếu thông tin bắt buộc: userId' });
        }

        // Check if user exists
        const user = await db.User.findOne({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ error: 'Không tìm thấy người dùng' });
        }
        const lockRecord = await db.UserLock.findOne({ where: { userId } });
        if (lockRecord) {
            await lockRecord.destroy();
        }

        return res.status(200).json({ message: 'Mở khóa tài khoản thành công' });
    } catch (error) {
        console.error('Lỗi khi khóa tài khoản:', error);
        return res.status(500).json({ error: 'Lỗi server khi mở khóa tài khoản' });
    }
}

// --------------------------------------------------
export default {
    getUserDetailPage,
    lockAccount,
    unlockAccount,
}