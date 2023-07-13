import ErrorResponse from "../lib/error-response.js";
import authService from "../services/authService.js";

const login = async (req, res) => {
  const userWithToken = await authService.loginUser(req.body);

  return res.status(200).json({ success: true, data: userWithToken });
};

const register = async (req, res) => {
  console.log(req.body);
  const registeredUser = await authService.registerUser(req.body);

  return res.status(200).json({ success: true, data: registeredUser });
};

export default {
  login,
  register,
};
