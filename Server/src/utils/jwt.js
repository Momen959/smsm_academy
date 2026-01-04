const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

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
