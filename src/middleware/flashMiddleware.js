import flash from "connect-flash";
export default (req, res, next) => {
    res.locals.EC = req.flash('errorCode')[0] || null;
    res.locals.message = req.flash('message')[0] || null;
    next();
};