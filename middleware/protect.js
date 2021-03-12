const routeProtect = function(req, res, next){
    if(!req.session.user) {
        res.redirect(302, '/login');
    } else {
        next();
    };
};

module.exports = routeProtect;