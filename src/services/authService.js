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

  uploadAvatar(formData) {
    return api.post(API_ENDPOINTS.AUTH.AVATAR, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  deleteAvatar() {
    return api.delete(API_ENDPOINTS.AUTH.AVATAR);
  },

  // POST /auth/2fa/setup — initiates 2FA, returns { secret, qrCode }
  setup2FA() {
    return api.post(API_ENDPOINTS.AUTH.TWO_FA_SETUP);
  },

  // POST /auth/2fa/verify  body: { token } — verifies TOTP code to enable 2FA
  verify2FA(token) {
    return api.post(API_ENDPOINTS.AUTH.TWO_FA_VERIFY, { token });
  },

  // POST /auth/2fa/disable  body: { token } — disables 2FA with current TOTP code
  disable2FA(token) {
    return api.post(API_ENDPOINTS.AUTH.TWO_FA_DISABLE, { token });
  },
};

export default authService;
