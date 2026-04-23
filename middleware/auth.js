function requireAuth(req, res, next) {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
    }
    next();
}

module.exports = requireAuth;
