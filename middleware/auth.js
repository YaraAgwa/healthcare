const jwt = require('jsonwebtoken');

exports.authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            status: 'error',
            message: 'Access token is required'
        });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({
                status: 'error',
                
                message: 'Invalid token'
            });
        }
        req.user = user;
        next();
    });
};

exports.isPatient = (req, res, next) => {
    if (req.user.role !== 'patient') {
        return res.status(403).json({
            status: 'error',
            message: 'Access denied. Patients only.'
        });
    }
    next();
};

exports.isDoctor = (req, res, next) => {
    if (req.user.role !== 'doctor') {
        return res.status(403).json({
            status: 'error',
            message: 'Access denied. Doctors only.'
        });
    }
    next();
};