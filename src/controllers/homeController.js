// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const getHomePage = async (req, res) => {
    try {
        // Render the home page with necessary data
        res.render('layouts/layout', {
            page: 'pages/adminHomePage.ejs',
            pageTitle: 'Home',
            user: req.user || null, // Assuming user data is attached to req
        });
    } catch (error) {
        console.error("Error rendering home page:", error);
        res.status(500).render('layouts/layout', {
            page: 'pages/errorPage.ejs',
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
            page: 'pages/adminHomePage.ejs',
            pageTitle: 'Home',
            user: req.user || null, // Assuming user data is attached to req
        });
    } catch (error) {
        console.error("Error rendering home page:", error);
        res.status(500).render('layouts/layout', {
            page: 'pages/errorPage.ejs',
            pageTitle: 'Error',
            EM: "An error occurred while loading the home page.",
            EC: -1,
        });
    }
}
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const getBookingStats = async (req, res) => {
    try {
        // Render the home page with necessary data
        res.render('layouts/layout', {
            page: 'pages/adminHomePage.ejs',
            pageTitle: 'Home',
            user: req.user || null, // Assuming user data is attached to req
        });
    } catch (error) {
        console.error("Error rendering home page:", error);
        res.status(500).render('layouts/layout', {
            page: 'pages/errorPage.ejs',
            pageTitle: 'Error',
            EM: "An error occurred while loading the home page.",
            EC: -1,
        });
    }
}
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const getCustomerStats = async (req, res) => {
    try {
        // Render the home page with necessary data
        res.render('layouts/layout', {
            page: 'pages/adminHomePage.ejs',
            pageTitle: 'Home',
            user: req.user || null, // Assuming user data is attached to req
        });
    } catch (error) {
        console.error("Error rendering home page:", error);
        res.status(500).render('layouts/layout', {
            page: 'pages/errorPage.ejs',
            pageTitle: 'Error',
            EM: "An error occurred while loading the home page.",
            EC: -1,
        });
    }
}
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const exportReport = async (req, res) => {
    try {
        // Render the home page with necessary data
        res.render('layouts/layout', {
            page: 'pages/adminHomePage.ejs',
            pageTitle: 'Home',
            user: req.user || null, // Assuming user data is attached to req
        });
    } catch (error) {
        console.error("Error rendering home page:", error);
        res.status(500).render('layouts/layout', {
            page: 'pages/errorPage.ejs',
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