const AdminUser = require('../../models/admin/AdminUser');
const { comparePassword } = require('../../utils/password');
const { generateAdminToken } = require('../../utils/jwt');

exports.login = async ({ username, password }) => {
  if (!username || !password) {
    throw { status: 400, message: 'Username and password required' };
  }

  const admin = await AdminUser.findOne({ username: username.toLowerCase() });

  if (!admin) {
    throw { status: 401, message: 'Invalid credentials' };
  }

  const isMatch = await comparePassword(password, admin.password);

  if (!isMatch) {
    throw { status: 401, message: 'Invalid credentials' };
  }

  const token = generateAdminToken(admin);

  return {
    token,
    admin: {
      id: admin._id,
      username: admin.username,
      role: admin.role
    }
  };
};
