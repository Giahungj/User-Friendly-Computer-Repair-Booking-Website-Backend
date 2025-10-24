import repairBookingService from '../services/newservices/repairBookingService';
import workScheduleService from '../services/newservices/workScheduleService';
import technicianService from '../services/newservices/technicianService';
import storeService from '../services/newservices/storeService';
import syncService from '../services/newservices/syncService';
import transferRequestService from '../services/newservices/transferRequestService.js';
import chartService from "../services/newservices/chartService.js";

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const getHomePage = async (req, res) => {
    try {
        const { date, storeId } = req.query;

        const currentDate = date || new Date().toISOString().split("T")[0];
        const currentStoreId = storeId || 2;
        
        const [bookings, schedules, technicians, stores, lateOrders, leaveTechnicians, syncErrors, performance, transferRequests ] = await Promise.all([
            repairBookingService.getRepairBookingsByStoreId({ date: currentDate, storeId: currentStoreId }),
            workScheduleService.getSchedulesByDateAndStore({ date: currentDate, storeId: currentStoreId }),
            technicianService.getTechnicianRatings({ date: currentDate, storeId: currentStoreId }),
            storeService.getAllStoreSuport(),
            repairBookingService.getLateRepairBookings({ date: currentDate, storeId: currentStoreId }),         
            technicianService.getLeaveTechnicians({ date: currentDate, storeId: currentStoreId }), 
            syncService.getSyncErrors(),
            chartService.getStoreStatistics({ date: currentDate, storeId: currentStoreId }),
            transferRequestService.transferRequests({})
        ]);
        
        const currentStore = stores.DT.find(s => s.storeId === Number(currentStoreId)) || { 
            storeId: currentStoreId, 
        };

        const storeList = stores?.DT?.map(s => ({ storeId: s.store_id, name: s.name })) || [];

		const data = {
			date: currentDate,
			store: currentStore,
			quickStats: bookings.DT.quickStats,
			todaySchedules: schedules.DT,
			performance: performance,
			feedbacks: technicians.DT,
            alerts: {
                lateOrders: lateOrders.DT,
                technicianLeaves: leaveTechnicians.DT,
                transferRequests: transferRequests.DT,
                syncErrors: syncErrors.DT
            }
		};

		res.render('layouts/layout', {
			page: 'pages/admin/adminHomePage.ejs',
			pageTitle: 'Home',
			user: req.user || null,
			data,
            stores: storeList,
            storeId
		});
    } catch (error) {
        console.error("Error rendering home page:", error);
        res.status(500).render('layouts/layout', {
            page: 'pages/misc/errorPage.ejs',
            pageTitle: 'Error',
            EM: "An error occurred while loading the home page.",
            EC: -1,
        });
    }
}
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const getOverview = async (req, res) => {
    try {
        res.render('layouts/layout', {
            page: 'pages/admin/adminHomePage.ejs',
            pageTitle: 'Home',
            user: req.user || null,
        });
    } catch (error) {
        console.error("Error rendering home page:", error);
        res.status(500).render('layouts/layout', {
            page: 'pages/misc/errorPage.ejs',
            pageTitle: 'Error',
            EM: "An error occurred while loading the home page.",
            EC: -1,
        });
    }
}
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const getBookingStats = async (req, res) => {
    try {
        res.render('layouts/layout', {
            page: 'pages/admin/adminHomePage.ejs',
            pageTitle: 'Home',
            user: req.user || null, 
        });
    } catch (error) {
        console.error("Error rendering home page:", error);
        res.status(500).render('layouts/layout', {
            page: 'pages/misc/errorPage.ejs',
            pageTitle: 'Error',
            EM: "An error occurred while loading the home page.",
            EC: -1,
        });
    }
}
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const getCustomerStats = async (req, res) => {
    try {
        res.render('layouts/layout', {
            page: 'pages/admin/adminHomePage.ejs',
            pageTitle: 'Home',
            user: req.user || null, 
        });
    } catch (error) {
        console.error("Error rendering home page:", error);
        res.status(500).render('layouts/layout', {
            page: 'pages/misc/errorPage.ejs',
            pageTitle: 'Error',
            EM: "An error occurred while loading the home page.",
            EC: -1,
        });
    }
}
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const exportReport = async (req, res) => {
    try {
        res.render('layouts/layout', {
            page: 'pages/admin/adminHomePage.ejs',
            pageTitle: 'Home',
            user: req.user || null, 
        });
    } catch (error) {
        console.error("Error rendering home page:", error);
        res.status(500).render('layouts/layout', {
            page: 'pages/misc/errorPage.ejs',
            pageTitle: 'Error',
            EM: "An error occurred while loading the home page.",
            EC: -1,
        });
    }
}

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
export default {
    getHomePage,
    getOverview,
    getBookingStats,
    getCustomerStats,
    exportReport
    
}