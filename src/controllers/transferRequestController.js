import transferRequestService from '../services/newservices/transferRequestService.js';

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const renderTransferRequestListPage = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const searchQuery = req.query.q || '';
        const filters = {
            status: req.query.status || '',
            technicianId: req.query.technicianId || '',
            storeManagerId: req.query.storeManagerId || '',
            fromDate: req.query.fromDate || '',
            toDate: req.query.toDate || ''
        };

        const result = await transferRequestService.transferRequests({
            page,
            searchQuery,
            filters,
            getAll: false
        });

        if (result.EC === 0) {
            return res.render('layouts/layout', {
                page: 'pages/transfer/transferRequestListPage.ejs',
                pageTitle: 'Danh sách yêu cầu chuyển cửa hàng',
                transferRequests: result.DT.transferRequests,
                totalRequests: result.DT.total,
                totalPages: result.DT.totalPages,
                searchQuery,
                filters,
                currentPage: page,
                EM: result.EM,
                EC: result.EC
            })
        } else {
            return res.status(400).render('layouts/layout', {
                page: 'pages/misc/errorPage.ejs',
                pageTitle: 'Lỗi',
                EM: result.EM,
                EC: result.EC
            });
        }
    } catch (error) {
        console.error('Lỗi khi lấy danh sách lịch sửa chữa:', error);
        return res.status(500).render('layouts/layout', {
            page: 'pages/misc/errorPage.ejs',
            pageTitle: 'Lỗi 500',
            EM: 'Không thể tải danh sách lịch sửa chữa.',
            EC: -1
        });
    }
};

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const renderTransferRequestDetailPage = async (req, res) => {
    try {
        const { transferRequestId } = req.params;
        if (!transferRequestId) {
            return res.status(400).render('layouts/layout', {
                page: 'pages/misc/errorPage.ejs',
                pageTitle: 'Lỗi',
                EM: 'Thiếu mã đơn yêu cầu.',
                EC: -1
            });
        }
        const result = await transferRequestService.transferRequest(transferRequestId);
        if (result.EC === 0) {
            return res.render('layouts/layout', {
                page: 'pages/transfer/transferRequestDetailPage.ejs',
                pageTitle: 'Chi tiết đơn yêu cầu',
                transferRequest : result.DT,
                EM: result.EM,
                EC: result.EC,
                breadcrumbs: [
                    { name: 'Trang chủ', url: '/' },
                    { name: 'Đơn yêu cầu', url: '/admin/don-yeu-cau/danh-sach' },
                    { name: `Đơn yêu cầu ${result.DT.transferRequestId}` || `Mã ${transferRequestId}`, url: '', active: true }
                ]
            });
        } else {
            return res.status(404).render('layouts/layout', {
                page: 'pages/misc/errorPage.ejs',
                pageTitle: 'Không tìm thấy',
                EM: result.EM || 'Không tìm thấy đơn đặt lịch.',
                EC: result.EC
            });
        }
    } catch (error) {
        console.error('Lỗi khi lấy chi tiết đơn đặt lịch:', error);
        return res.status(500).render('layouts/layout', {
            page: 'pages/misc/errorPage.ejs',
            pageTitle: 'Lỗi 500',
            EM: 'Không thể tải chi tiết đơn đặt lịch.',
            EC: -1
        });
    }
};

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const handleTransferRequestUpdate = async (req, res) => {
    try {
        const { transferRequestId } = req.params;
        const { storeManagerId, technicianId, note } = req.body;

        if (!transferRequestId || !storeManagerId || !technicianId) {
            return res.status(400).render('layouts/layout', {
                page: 'pages/misc/errorPage.ejs',
                pageTitle: 'Lỗi',
                EM: 'Thiếu thông tin yêu cầu.',
                EC: -1
            });
        }

        console.log(" ================================================= CONTROLLER ================================================= ")
        console.log("transferRequestId: ", transferRequestId)
        console.log("storeManagerId: ", storeManagerId)
        console.log("technicianId: ", technicianId)
        console.log("note: ", note)

        const result = await transferRequestService.updateTransferRequest({
            storeManagerId: parseInt(storeManagerId),
            technicianId: parseInt(technicianId),
            transferRequestId: parseInt(transferRequestId),
            note
        });

        if (result.EC === 0) {
            return res.render('layouts/layout', {
                page: 'pages/transfer/transferRequestDetailPage.ejs',
                pageTitle: 'Chi tiết đơn yêu cầu',
                transferRequest : result.DT,
                toast: { message: result.EM },
                breadcrumbs: [
                    { name: 'Trang chủ', url: '/' },
                    { name: 'Đơn yêu cầu', url: '/admin/don-yeu-cau/danh-sach' },
                    { name: `Đơn yêu cầu ${result.DT.transferRequestId}` || `Mã ${transferRequestId}`, url: '', active: true }
                ]
            });
        } else {
            return res.status(404).render('layouts/layout', {
                page: 'pages/misc/errorPage.ejs',
                pageTitle: 'Không tìm thấy',
                EM: result.EM || 'Không tìm thấy đơn đặt lịch.',
                EC: result.EC
            });
        }
    } catch (error) {
        console.error('Lỗi khi lấy chi tiết đơn đặt lịch:', error);
        return res.status(500).render('layouts/layout', {
            page: 'pages/misc/errorPage.ejs',
            pageTitle: 'Lỗi 500',
            EM: 'Không thể tải chi tiết đơn đặt lịch.',
            EC: -1
        });
    }
};

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
export default {
    renderTransferRequestListPage,
    renderTransferRequestDetailPage,
    handleTransferRequestUpdate
};