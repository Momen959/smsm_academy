const adminAuthService = require('../../services/admin/auth');

exports.login = async (req, res) => {
  try {
    const result = await adminAuthService.login(req.body);

    return res.status(200).json({
      message: 'Login successful',
      ...result
    });

  } catch (error) {
    return res.status(error.status || 500).json({
      message: error.message || 'Server error'
    });
  }
};
