const jwt = require('jsonwebtoken');

exports.generateAdminToken = (admin) => {
  return jwt.sign(
    {
      sub: admin._id,
      role: admin.role
    },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
};
