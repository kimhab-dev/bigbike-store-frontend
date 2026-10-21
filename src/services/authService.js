import api from '@/api/axios';
import { API_ENDPOINTS } from '@/constants';

export const authService = {
  login(credentials) {
    return api.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
  },

  register(userData) {
    return api.post(API_ENDPOINTS.AUTH.REGISTER, userData);
  },

  // POST /auth/verify-email  body: { token }
  verifyEmail(token) {
    return api.post(API_ENDPOINTS.AUTH.VERIFY_EMAIL, { token });
  },

  // POST /auth/resend-verification-email  body: { email }
  resendVerificationEmail(email) {
    return api.post(API_ENDPOINTS.AUTH.RESEND_VERIFICATION, { email });
  },

  // POST /auth/forgot-password-request  body: { email }
  requestPasswordReset(email) {
    return api.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
  },

  // POST /auth/reset-password  body: { token, newPassword }
  resetPassword(token, newPassword) {
    return api.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, { token, newPassword });
  },

  getProfile() {
    return api.get(API_ENDPOINTS.AUTH.PROFILE);
  },

  updateProfile(data) {
    return api.patch(API_ENDPOINTS.AUTH.PROFILE, data);
  },

  uploadAvatar(formData) {
    return api.post(API_ENDPOINTS.AUTH.AVATAR, formData);
  },

  deleteAvatar() {
    return api.delete(API_ENDPOINTS.AUTH.AVATAR);
  },

  // POST /auth/2fa/setup — initiates 2FA, returns { secret, qrCode }
  setup2FA() {
    return api.post(API_ENDPOINTS.AUTH.TWO_FA_SETUP);
  },

  // POST /auth/2fa/verify  body: { token } — verifies TOTP code to enable 2FA (profile setup)
  verify2FA(token) {
    return api.post(API_ENDPOINTS.AUTH.TWO_FA_VERIFY, { token });
  },

  // POST /auth/2fa/verify  body: { tempToken, code } — completes login when 2FA is required
  verifyLoginTOTP(tempToken, code) {
    return api.post(API_ENDPOINTS.AUTH.TWO_FA_LOGIN_VERIFY, { tempToken, code });
  },

  // POST /auth/2fa/disable  body: { token } — disables 2FA with current TOTP code
  disable2FA(token) {
    return api.post(API_ENDPOINTS.AUTH.TWO_FA_DISABLE, { token });
  },
};

export default authService;
