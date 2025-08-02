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

export default {
    getHomePage,
    // Other exports can be added here as needed
}