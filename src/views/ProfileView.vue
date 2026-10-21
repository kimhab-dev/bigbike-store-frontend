<template>
  <div class="profile-page">
    <input type="file" ref="fileInput" accept="image/png, image/jpeg, image/jpg, image/webp"
      class="hidden-file-input" @change="onFileSelected" />

    <div class="profile-wrap">

      <!-- Breadcrumb -->
      <div class="profile-breadcrumb">
        <router-link to="/" class="bc-link">Account</router-link>
        <span class="bc-sep">/</span>
        <span class="bc-current">Profile</span>
      </div>

      <h1 class="profile-page-title">My profile</h1>

      <!-- Profile Header Card -->
      <div class="profile-card">
        <div class="profile-card-left">
          <div class="avatar-container" @click="openAvatarModal">
            <div class="avatar-circle" :class="{ 'is-admin': authStore.isAdmin }">
              <img v-if="avatarSrc" :src="avatarSrc" :alt="authStore.userName" class="avatar-img"
                crossorigin="anonymous" referrerpolicy="no-referrer" @error="onAvatarError" />
              <span v-else class="avatar-initials">{{ userInitials }}</span>
            </div>
            <button class="avatar-edit-badge" type="button" title="Change photo" @click.stop="openAvatarModal">
              <i class="bi bi-pencil-fill"></i>
            </button>
          </div>
          <div class="profile-meta">
            <h2 class="profile-name">{{ authStore.userName }}</h2>
            <p class="profile-email">{{ authStore.userEmail }}</p>
            <div class="profile-badges">
              <span v-if="authStore.isVerified" class="badge badge-verified">
                <i class="bi bi-check-lg"></i> Email verified
              </span>
              <span :class="['badge', authStore.isAdmin ? 'badge-admin' : 'badge-customer']">
                {{ authStore.isAdmin ? 'Admin' : 'Customer' }}
              </span>
            </div>
          </div>
        </div>
        <div class="profile-card-right">
          <div class="profile-stat">
            <span class="stat-label">Member since</span>
            <span class="stat-value">{{ formattedCreatedDate }}</span>
          </div>
          <div class="profile-stat">
            <span class="stat-label">Last updated</span>
            <span class="stat-value">{{ formattedUpdatedDate }}</span>
          </div>
        </div>
      </div>

      <!-- Personal Information Card -->
      <div class="section-card">
        <div class="section-card-header">
          <h3 class="section-title">Personal information</h3>
          <p class="section-sub">This is the name we use on your orders.</p>
        </div>
        <div class="section-card-body">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Full name</label>
              <input type="text" class="form-input" v-model="editName" placeholder="Enter your name" />
            </div>
            <div class="form-group">
              <label class="form-label">Age <span class="optional">(optional)</span></label>
              <input type="number" class="form-input" v-model="editAge" placeholder="Not set" min="0" max="120" />
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Email</label>
            <input type="email" class="form-input" :value="authStore.userEmail" disabled />
            <p class="form-hint">Verified. Email can't be changed here. Contact support to update it.</p>
          </div>
          <div class="form-actions">
            <button class="btn-discard" @click="discardChanges" :disabled="isSaving">Discard</button>
            <button class="btn-save" @click="savePersonalInfo" :disabled="isSaving">
              <span v-if="isSaving" class="btn-spinner"></span>
              {{ isSaving ? 'Saving...' : 'Save changes' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Security Card -->
      <div class="section-card">
        <div class="section-card-header">
          <h3 class="section-title">Security</h3>
          <p class="section-sub">Keep your account and orders safe.</p>
        </div>
        <div class="section-card-body">
          <div class="security-row">
            <div class="security-row-info">
              <span class="sec-label">Two-factor authentication</span>
              <span class="sec-sub">
                {{ authStore.twoFactorEnabled ? 'On.' : 'Off.' }}
                {{ authStore.twoFactorEnabled ? 'Your account has extra protection.' : 'Turn it on to add a code step when you sign in.' }}
              </span>
            </div>
            <button class="toggle-switch" :class="{ 'toggle-on': authStore.twoFactorEnabled }" @click="handleSetup2FA">
              <span class="toggle-thumb"></span>
            </button>
          </div>
          <div class="security-divider"></div>
          <div class="security-row">
            <div class="security-row-info">
              <span class="sec-label">Password</span>
              <span class="sec-sub">Use at least 8 characters.</span>
            </div>
            <button class="btn-change-pw" @click="handleChangePassword">Change password</button>
          </div>
        </div>
      </div>

      <!-- Log out Card -->
      <div class="section-card logout-card">
        <div class="logout-card-left">
          <span class="sec-label">Log out</span>
          <span class="sec-sub">End your session on this device.</span>
        </div>
        <button class="btn-logout" @click="handleLogout">Log out</button>
      </div>

    </div>

    <!-- Avatar Crop Modal -->
    <BaseModal v-model="showCropModal"
      :title="croppingConfirmed ? 'Confirm Upload' : 'Crop Your Photo'"
      :subtitle="croppingConfirmed ? 'This cropped photo will be set as your profile picture' : 'Drag to reposition · Scroll to zoom'"
      size="md" @close="cancelCrop">
      <div v-if="!croppingConfirmed" class="crop-modal-body">
        <div class="crop-step-badge"><span class="crop-step-num">2</span><span>Adjust your photo</span></div>
        <div class="cropper-wrap">
          <Cropper ref="cropperRef" :src="previewUrl"
            :stencil-props="{ aspectRatio: 1, movable: true, resizable: true, handlers: {}, lines: {} }"
            :stencil-component="CircleStencil" background-class="cropper-bg" class="profile-cropper" />
        </div>
        <p class="crop-tip"><i class="bi bi-info-circle"></i> Drag to reposition &bull; Scroll to zoom in/out</p>
      </div>
      <div v-else class="crop-confirm-body">
        <div class="crop-step-badge step-confirm"><span class="crop-step-num">3</span><span>Looks good?</span></div>
        <div class="crop-result-wrap"><img :src="croppedPreviewUrl" alt="Cropped preview" class="crop-result-img" /></div>
        <p class="crop-confirm-hint">This is exactly what will be uploaded as your profile picture.</p>
      </div>
      <template #footer>
        <template v-if="!croppingConfirmed">
          <button class="modal-btn cancel" @click="cancelCrop">Cancel</button>
          <button class="modal-btn confirm" @click="confirmCrop"><i class="bi bi-crop btn-icon"></i> Confirm Crop</button>
        </template>
        <template v-else>
          <button class="modal-btn cancel" @click="croppingConfirmed = false" :disabled="uploadingAvatar">
            <i class="bi bi-arrow-left btn-icon"></i> Re-crop
          </button>
          <button class="modal-btn confirm" @click="confirmUploadAvatar" :disabled="uploadingAvatar">
            <span v-if="uploadingAvatar" class="btn-spinner"></span>
            <i v-else class="bi bi-cloud-arrow-up-fill btn-icon"></i>
            {{ uploadingAvatar ? 'Uploading...' : 'Upload Photo' }}
          </button>
        </template>
      </template>
    </BaseModal>

    <!-- View Avatar Modal -->
    <BaseModal v-model="showViewAvatarModal" :title="authStore.userName" subtitle="Current Profile Picture" size="md">
      <div class="modal-view-avatar-box">
        <img v-if="avatarSrc" :src="avatarSrc" :alt="authStore.userName" class="full-avatar-view"
          crossorigin="anonymous" referrerpolicy="no-referrer" @error="onAvatarError" />
        <div v-else class="initials-view-box"><span>{{ userInitials }}</span></div>
      </div>
      <template #footer>
        <button v-if="hasAvatar" class="modal-btn delete" @click="confirmDeleteAvatarFromModal" :disabled="deletingAvatar">
          <span v-if="deletingAvatar" class="btn-spinner"></span><span>Delete Avatar</span>
        </button>
        <button class="modal-btn confirm" @click="triggerFileSelectFromModal">Change Photo</button>
      </template>
    </BaseModal>

    <!-- 2FA Setup Modal -->
    <BaseModal v-model="show2FASetupModal" title="Enable Two-Factor Authentication"
      subtitle="Scan the QR code with your authenticator app" size="md" @close="close2FASetupModal">
      <div class="twofa-modal-body">
        <div v-if="twoFALoading" class="twofa-loading">
          <span class="btn-spinner twofa-spinner"></span><p>Generating secure 2FA secret…</p>
        </div>
        <div v-else-if="twoFAQrCode && !twoFAVerified" class="twofa-setup-content">
          <div class="twofa-qr-box"><img :src="twoFAQrCode" alt="2FA QR Code" class="twofa-qr-img" /></div>
          <p class="twofa-instruction">
            <i class="bi bi-phone-fill"></i>
            Open <strong>Google Authenticator</strong> or <strong>Authy</strong>, tap <em>Add Account</em>, then scan the QR code above.
          </p>
          <div v-if="twoFASecret" class="twofa-secret-row">
            <span class="twofa-secret-label">Manual key:</span>
            <code class="twofa-secret-code">{{ twoFASecret }}</code>
            <button class="copy-inline-btn" @click="copyText(twoFASecret, 'Secret copied!')"><i class="bi bi-clipboard"></i></button>
          </div>
          <div class="twofa-input-group">
            <label class="twofa-label">Enter 6-digit code from your app to confirm</label>
            <input v-model="twoFAToken" type="text" inputmode="numeric" maxlength="6" placeholder="000000"
              class="twofa-token-input" @keyup.enter="confirmEnable2FA" />
            <p v-if="twoFAError" class="twofa-error"><i class="bi bi-exclamation-circle-fill"></i> {{ twoFAError }}</p>
          </div>
        </div>
        <div v-else-if="twoFAVerified" class="twofa-success">
          <div class="twofa-success-icon"><i class="bi bi-shield-check"></i></div>
          <h4>2FA Enabled!</h4><p>Your account is now protected with two-factor authentication.</p>
        </div>
      </div>
      <template #footer>
        <button class="modal-btn cancel" @click="close2FASetupModal" :disabled="twoFAVerifying">Cancel</button>
        <button v-if="twoFAQrCode && !twoFAVerified" class="modal-btn confirm" @click="confirmEnable2FA"
          :disabled="twoFAVerifying || twoFAToken.length < 6">
          <span v-if="twoFAVerifying" class="btn-spinner"></span>
          <i v-else class="bi bi-shield-lock-fill btn-icon"></i>
          {{ twoFAVerifying ? 'Verifying…' : 'Enable 2FA' }}
        </button>
        <button v-else-if="twoFAVerified" class="modal-btn confirm" @click="close2FASetupModal">
          <i class="bi bi-check-lg btn-icon"></i> Done
        </button>
      </template>
    </BaseModal>

    <!-- 2FA Disable Modal -->
    <BaseModal v-model="show2FADisableModal" title="Disable Two-Factor Authentication"
      subtitle="Enter your current TOTP code to turn off 2FA" size="sm" @close="close2FADisableModal">
      <div class="twofa-modal-body">
        <div class="twofa-disable-warning">
          <i class="bi bi-exclamation-triangle-fill"></i>
          <p>Disabling 2FA will reduce your account security. Make sure this is intentional.</p>
        </div>
        <div class="twofa-input-group">
          <label class="twofa-label">Enter your 6-digit authenticator code</label>
          <input v-model="twoFADisableToken" type="text" inputmode="numeric" maxlength="6" placeholder="000000"
            class="twofa-token-input" @keyup.enter="confirmDisable2FA" />
          <p v-if="twoFADisableError" class="twofa-error"><i class="bi bi-exclamation-circle-fill"></i> {{ twoFADisableError }}</p>
        </div>
      </div>
      <template #footer>
        <button class="modal-btn cancel" @click="close2FADisableModal" :disabled="twoFADisabling">Cancel</button>
        <button class="modal-btn delete" @click="confirmDisable2FA"
          :disabled="twoFADisabling || twoFADisableToken.length < 6">
          <span v-if="twoFADisabling" class="btn-spinner"></span>
          <i v-else class="bi bi-shield-x btn-icon"></i>
          {{ twoFADisabling ? 'Disabling…' : 'Disable 2FA' }}
        </button>
      </template>
    </BaseModal>

  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useToast } from '@/composables/useToast';
import { formatDate } from '@/utils';
import BaseModal from '@/components/BaseModal.vue';
import { Cropper, CircleStencil } from 'vue-advanced-cropper';
import 'vue-advanced-cropper/dist/style.css';

const authStore = useAuthStore();
const toast = useToast();

const fileInput = ref(null);
const selectedFile = ref(null);
const previewUrl = ref(null);
const showCropModal = ref(false);
const showPreviewModal = ref(false);
const showViewAvatarModal = ref(false);
const uploadingAvatar = ref(false);
const deletingAvatar = ref(false);
const avatarLoadFailed = ref(false);
const avatarVersion = ref(Date.now());
const cropperRef = ref(null);
const croppingConfirmed = ref(false);
const croppedPreviewUrl = ref(null);
const croppedBlob = ref(null);

const userInitials = computed(() => {
  const name = authStore.user?.name || authStore.user?.email || 'AD';
  return name.substring(0, 2).toUpperCase();
});

const hasAvatar = computed(() => {
  return !!authStore.userAvatar;
});

const avatarSrc = computed(() => {
  if (avatarLoadFailed.value) return null;
  const avatarPath = authStore.userAvatar;
  if (!avatarPath) return null;
  // Hide the default avatar — show initials fallback instead
  let url = avatarPath;
  if (!avatarPath.startsWith('http://') && !avatarPath.startsWith('https://')) {
    const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
    url = `${apiBase}/${avatarPath.replace(/^\//, '')}`;
  }
  return `${url}?v=${avatarVersion.value}`;
});

const onAvatarError = () => {
  avatarLoadFailed.value = true;
};

const openAvatarModal = () => {
  showViewAvatarModal.value = true;
};

const triggerFileSelect = () => {
  showViewAvatarModal.value = false;
  if (fileInput.value) {
    fileInput.value.click();
  }
};

const triggerFileSelectFromModal = () => {
  triggerFileSelect();
};

const onFileSelected = (event) => {
  const files = event.target.files;
  if (!files || files.length === 0) return;

  const file = files[0];

  // Validate image type
  if (!file.type.startsWith('image/')) {
    toast.warning('Please select a valid image file (JPEG, PNG, WEBP).', 'Invalid File Type');
    return;
  }

  // Validate max size (5MB)
  if (file.size > 5 * 1024 * 1024) {
    toast.warning('Selected image exceeds maximum allowed size of 5MB.', 'File Too Large');
    return;
  }

  selectedFile.value = file;
  previewUrl.value = URL.createObjectURL(file);
  croppingConfirmed.value = false;
  croppedPreviewUrl.value = null;
  croppedBlob.value = null;
  // Step 2: open crop modal
  showCropModal.value = true;
};

// Step 3: user clicks "Confirm Crop" — extract canvas, convert to Blob, show preview
const confirmCrop = () => {
  if (!cropperRef.value) return;
  const { canvas } = cropperRef.value.getResult();
  if (!canvas) return;
  canvas.toBlob(
    (blob) => {
      if (!blob) return;
      croppedBlob.value = blob;
      if (croppedPreviewUrl.value) URL.revokeObjectURL(croppedPreviewUrl.value);
      croppedPreviewUrl.value = URL.createObjectURL(blob);
      croppingConfirmed.value = true;
    },
    'image/jpeg',
    0.92,
  );
};

const cancelCrop = () => {
  showCropModal.value = false;
  croppingConfirmed.value = false;
  croppedBlob.value = null;
  if (croppedPreviewUrl.value) URL.revokeObjectURL(croppedPreviewUrl.value);
  croppedPreviewUrl.value = null;
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
  previewUrl.value = null;
  selectedFile.value = null;
  if (fileInput.value) fileInput.value.value = '';
};

const cancelPreview = () => {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
  if (croppedPreviewUrl.value) URL.revokeObjectURL(croppedPreviewUrl.value);
  selectedFile.value = null;
  previewUrl.value = null;
  croppedBlob.value = null;
  croppedPreviewUrl.value = null;
  croppingConfirmed.value = false;
  showPreviewModal.value = false;
  showCropModal.value = false;
  if (fileInput.value) fileInput.value.value = '';
};

// Step 4: upload cropped image blob to backend
const confirmUploadAvatar = async () => {
  const blobToUpload = croppedBlob.value;
  if (!blobToUpload) return;

  // Convert Blob to File so authStore.uploadAvatar can append it as FormData
  const ext = 'jpg';
  const fileName = `avatar_${Date.now()}.${ext}`;
  const file = new File([blobToUpload], fileName, { type: 'image/jpeg' });

  uploadingAvatar.value = true;
  try {
    await authStore.uploadAvatar(file);
    toast.success('Avatar picture updated successfully!', 'Upload Complete');
    cancelPreview();
    avatarLoadFailed.value = false;
    avatarVersion.value = Date.now();
  } catch (err) {
    const errorMsg = err.response?.data?.message || err.message || 'Failed to upload avatar';
    toast.error(typeof errorMsg === 'object' ? JSON.stringify(errorMsg) : errorMsg, 'Upload Error');
  } finally {
    uploadingAvatar.value = false;
  }
};

const confirmDeleteAvatar = async () => {
  if (!confirm('Are you sure you want to remove your current profile avatar?')) {
    return;
  }

  deletingAvatar.value = true;
  try {
    await authStore.deleteAvatar();
    toast.success('Avatar has been removed successfully.', 'Avatar Deleted');
    cancelPreview();
    showViewAvatarModal.value = false;
    avatarLoadFailed.value = false;
  } catch (err) {
    const errorMsg = err.response?.data?.message || err.message || 'Failed to delete avatar';
    toast.error(typeof errorMsg === 'object' ? JSON.stringify(errorMsg) : errorMsg, 'Delete Error');
  } finally {
    deletingAvatar.value = false;
  }
};

const confirmDeleteAvatarFromModal = () => {
  confirmDeleteAvatar();
};

const formattedCreatedDate = computed(() => {
  const dateStr = authStore.user?.createdAt || authStore.userCreatedAt;
  if (!dateStr) return 'Aug 25, 2026';
  return formatDate(dateStr);
});

const formattedUpdatedDate = computed(() => {
  const dateStr = authStore.user?.updatedAt || authStore.userUpdatedAt;
  if (!dateStr) return 'Aug 26, 2026';
  return formatDate(dateStr);
});

const formatFileSize = (bytes) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const permissionsList = computed(() => {
  if (authStore.isAdmin) {
    return [
      {
        title: 'Full Superbike Inventory Control',
        desc: 'Create, update, price, and archive all motorcycle fleet models',
        granted: true,
      },
      {
        title: 'User & Rider Account Management',
        desc: 'Inspect roles, verification status, and credentials governance',
        granted: true,
      },
      {
        title: 'Real-time Telemetry & Diagnostics',
        desc: 'Access live speed sensors, track telemetry, and maintenance records',
        granted: true,
      },
      {
        title: 'System Logs & Security Auditing',
        desc: 'Access audit trail, 2FA tokens, and NestJS API gateway policies',
        granted: true,
      },
    ];
  }
  return [
    {
      title: 'Garage Superbike Access',
      desc: 'Browse and book premium motorcycles in the fleet',
      granted: true,
    },
    {
      title: 'Personal Order & Rental History',
      desc: 'Review past track day bookings and store purchases',
      granted: true,
    },
    {
      title: 'Administrator Panel Control',
      desc: 'Manage backend database and rider permissions',
      granted: false,
    },
  ];
});

const copyText = async (text, message = 'Copied to clipboard!') => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(message, 'Clipboard');
  } catch (err) {
    toast.info(`Value: ${text}`, 'Copy Info');
  }
};

// ── 2FA Setup ──────────────────────────────────────────────────────────────
const show2FASetupModal = ref(false);
const show2FADisableModal = ref(false);
const twoFALoading = ref(false);
const twoFAVerifying = ref(false);
const twoFADisabling = ref(false);
const twoFAQrCode = ref(null);
const twoFASecret = ref(null);
const twoFAToken = ref('');
const twoFADisableToken = ref('');
const twoFAError = ref('');
const twoFADisableError = ref('');
const twoFAVerified = ref(false);

const handleSetup2FA = async () => {
  if (authStore.twoFactorEnabled) {
    // Already enabled — open disable modal instead
    twoFADisableToken.value = '';
    twoFADisableError.value = '';
    show2FADisableModal.value = true;
    return;
  }
  // Open setup modal and fetch QR code
  twoFAQrCode.value = null;
  twoFASecret.value = null;
  twoFAToken.value = '';
  twoFAError.value = '';
  twoFAVerified.value = false;
  show2FASetupModal.value = true;
  twoFALoading.value = true;
  try {
    const data = await authStore.setup2FA();
    twoFAQrCode.value = data?.qrCode || data?.data?.qrCode || null;
    twoFASecret.value = data?.secret || data?.data?.secret || null;
  } catch (err) {
    const msg = err.response?.data?.message || err.message || 'Failed to initiate 2FA setup';
    toast.error(typeof msg === 'object' ? JSON.stringify(msg) : msg, '2FA Error');
    show2FASetupModal.value = false;
  } finally {
    twoFALoading.value = false;
  }
};

const confirmEnable2FA = async () => {
  if (twoFAToken.value.length < 6) return;
  twoFAVerifying.value = true;
  twoFAError.value = '';
  try {
    await authStore.verify2FA(twoFAToken.value);
    twoFAVerified.value = true;
    toast.success('Two-factor authentication enabled successfully!', '2FA Active');
  } catch (err) {
    const msg = err.response?.data?.message || err.message || 'Invalid verification code';
    twoFAError.value = typeof msg === 'object' ? JSON.stringify(msg) : msg;
  } finally {
    twoFAVerifying.value = false;
  }
};

const close2FASetupModal = () => {
  show2FASetupModal.value = false;
  twoFAQrCode.value = null;
  twoFASecret.value = null;
  twoFAToken.value = '';
  twoFAError.value = '';
  twoFAVerified.value = false;
};

const confirmDisable2FA = async () => {
  if (twoFADisableToken.value.length < 6) return;
  twoFADisabling.value = true;
  twoFADisableError.value = '';
  try {
    await authStore.disable2FA(twoFADisableToken.value);
    show2FADisableModal.value = false;
    toast.success('Two-factor authentication has been disabled.', '2FA Disabled');
  } catch (err) {
    const msg = err.response?.data?.message || err.message || 'Invalid code or 2FA disable failed';
    twoFADisableError.value = typeof msg === 'object' ? JSON.stringify(msg) : msg;
  } finally {
    twoFADisabling.value = false;
  }
};

const close2FADisableModal = () => {
  show2FADisableModal.value = false;
  twoFADisableToken.value = '';
  twoFADisableError.value = '';
};

const refreshProfile = async () => {
  try {
    avatarLoadFailed.value = false;
    await authStore.fetchProfile();
    toast.success('Profile details synchronized with server', 'Profile Synchronized');
  } catch (err) {
    toast.error('Failed to load updated profile from server', 'Sync Error');
  }
};

// ── Personal info edit state ────────────────────
const editName = ref(authStore.userName || '');
const editAge = ref(authStore.userAge || '');
const isSaving = ref(false);

const discardChanges = () => {
  editName.value = authStore.userName || '';
  editAge.value = authStore.userAge || '';
};

const savePersonalInfo = async () => {
  isSaving.value = true;
  try {
    await authStore.updateProfile({ name: editName.value, age: editAge.value ? Number(editAge.value) : undefined });
    toast.success('Profile updated successfully!', 'Saved');
  } catch (err) {
    const msg = err.response?.data?.message || err.message || 'Failed to update profile';
    toast.error(typeof msg === 'object' ? JSON.stringify(msg) : msg, 'Update Error');
  } finally {
    isSaving.value = false;
  }
};

const handleLogout = async () => {
  try {
    await authStore.logout();
  } catch (e) {
    // already handled
  }
};

const handleChangePassword = () => {
  toast.info('Password change: use the reset password link sent to your email.', 'Change Password');
};

onMounted(async () => {
  if (!authStore.user || !authStore.user.role) {
    try {
      await authStore.fetchProfile();
    } catch (e) {
      // Handled in store
    }
  }
  editName.value = authStore.userName || '';
  editAge.value = authStore.userAge || '';
});
</script>

<style scoped>
* { box-sizing: border-box; }

.hidden-file-input { display: none; }

.profile-page {
  min-height: calc(100vh - 70px);
  background: #080d1a;
  color: #f8fafc;
  font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  padding: 2.5rem 1.5rem 5rem;
}

.profile-wrap {
  max-width: 760px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

/* Breadcrumb */
.profile-breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.85rem;
  color: #64748b;
  margin-bottom: 0.1rem;
}
.bc-link { color: #64748b; text-decoration: none; transition: color 0.15s; }
.bc-link:hover { color: #94a3b8; }
.bc-sep { color: #475569; }
.bc-current { color: #38bdf8; font-weight: 600; }

.profile-page-title {
  font-size: 1.85rem;
  font-weight: 800;
  color: #ffffff;
  margin: 0 0 0.5rem;
  letter-spacing: -0.02em;
}

/* Profile Header Card */
.profile-card {
  background: #0c1427;
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 16px;
  padding: 1.6rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  flex-wrap: wrap;
}
.profile-card-left {
  display: flex;
  align-items: center;
  gap: 1.35rem;
}

/* Avatar */
.avatar-container {
  position: relative;
  width: 76px;
  height: 76px;
  flex-shrink: 0;
  cursor: pointer;
}
.avatar-circle {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: #1d4ed8;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.35);
}
.avatar-circle.is-admin {
  background: #b45309;
}
.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.avatar-initials {
  font-size: 1.55rem;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: 0.02em;
  user-select: none;
}
.avatar-edit-badge {
  position: absolute;
  bottom: 0px;
  right: 0px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #38bdf8;
  color: #080d1a;
  border: 2px solid #0c1427;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.68rem;
  cursor: pointer;
  transition: transform 0.15s, background 0.15s;
  padding: 0;
}
.avatar-edit-badge:hover {
  transform: scale(1.12);
  background: #7dd3fc;
}

.profile-meta { display: flex; flex-direction: column; gap: 0.25rem; }
.profile-name { font-size: 1.3rem; font-weight: 700; color: #ffffff; margin: 0; }
.profile-email { font-size: 0.88rem; color: #94a3b8; margin: 0; }
.profile-badges { display: flex; flex-wrap: wrap; align-items: center; gap: 0.55rem; margin-top: 0.3rem; }

.badge {
  display: inline-flex; align-items: center; gap: 0.3rem;
  border-radius: 9999px;
}
.badge-verified {
  background: rgba(16, 185, 129, 0.15);
  color: #34d399;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.65rem;
}
.badge-customer {
  background: #1e293b;
  color: #94a3b8;
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.25rem 0.75rem;
}
.badge-admin {
  background: rgba(245, 158, 11, 0.2);
  color: #fbbf24;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.75rem;
}

.profile-card-right {
  display: flex;
  gap: 2.2rem;
  flex-shrink: 0;
}
.profile-stat { display: flex; flex-direction: column; gap: 0.2rem; }
.stat-label { font-size: 0.78rem; color: #64748b; font-weight: 500; }
.stat-value { font-size: 0.95rem; font-weight: 700; color: #ffffff; }

/* Section Cards */
.section-card {
  background: #0c1427;
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 16px;
  padding: 1.75rem 2rem;
  display: flex;
  flex-direction: column;
}
.section-card-header {
  padding: 0 0 1.25rem;
}
.section-title { font-size: 1.05rem; font-weight: 700; color: #ffffff; margin: 0 0 0.3rem; }
.section-sub { font-size: 0.85rem; color: #94a3b8; margin: 0; }
.section-card-body { padding: 0; display: flex; flex-direction: column; gap: 1.25rem; }

/* Form */
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
}
.form-group { display: flex; flex-direction: column; gap: 0.45rem; }
.form-label { font-size: 0.85rem; font-weight: 600; color: #f1f5f9; }
.optional { color: #64748b; font-weight: 400; }

.form-input {
  background: #070c18;
  border: 1px solid #1e2c45;
  border-radius: 8px;
  color: #ffffff;
  font-size: 0.9rem;
  padding: 0.7rem 1rem;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  width: 100%;
}
.form-input:focus {
  border-color: #38bdf8;
  box-shadow: 0 0 0 2px rgba(56, 189, 248, 0.15);
}
.form-input:disabled { color: #94a3b8; cursor: not-allowed; opacity: 0.85; }
.form-input::placeholder { color: #475569; }
.form-hint { font-size: 0.78rem; color: #64748b; margin: 0.15rem 0 0; }

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding-top: 0.5rem;
}
.btn-discard {
  padding: 0.6rem 1.25rem;
  background: transparent;
  border: 1px solid #1e2c45;
  border-radius: 8px;
  color: #94a3b8;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-discard:hover {
  background: rgba(255, 255, 255, 0.04);
  color: #f1f5f9;
  border-color: #334155;
}
.btn-save {
  display: inline-flex; align-items: center; gap: 0.4rem;
  padding: 0.6rem 1.4rem;
  background: #0284c7;
  border: none; border-radius: 8px;
  color: #ffffff; font-size: 0.85rem; font-weight: 600;
  cursor: pointer; transition: background 0.2s;
}
.btn-save:hover { background: #0369a1; }
.btn-save:disabled { opacity: 0.6; cursor: not-allowed; }

/* Security */
.security-row {
  display: flex; align-items: center;
  justify-content: space-between; gap: 1.5rem;
}
.security-row-info { display: flex; flex-direction: column; gap: 0.25rem; }
.sec-label { font-size: 0.92rem; font-weight: 600; color: #f8fafc; }
.sec-sub { font-size: 0.83rem; color: #64748b; }
.security-divider { height: 1px; background: rgba(255, 255, 255, 0.06); margin: 0.25rem 0; }

/* Toggle Switch */
.toggle-switch {
  position: relative;
  width: 46px; height: 26px;
  background: #1e2c45;
  border: none;
  border-radius: 13px;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.25s;
  padding: 0;
}
.toggle-switch.toggle-on { background: #0284c7; }
.toggle-thumb {
  position: absolute;
  top: 3px; left: 3px;
  width: 20px; height: 20px;
  border-radius: 50%;
  background: #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.35);
  transition: transform 0.25s;
}
.toggle-on .toggle-thumb { transform: translateX(20px); }

.btn-change-pw {
  padding: 0.55rem 1.25rem;
  background: #070c18;
  border: 1px solid #1e2c45;
  border-radius: 8px;
  color: #f8fafc;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}
.btn-change-pw:hover {
  border-color: #38bdf8;
  color: #ffffff;
}

/* Log out card */
.logout-card {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.6rem 2rem;
  border: 1px solid rgba(239, 68, 68, 0.25);
}
.logout-card-left { display: flex; flex-direction: column; gap: 0.25rem; }
.btn-logout {
  padding: 0.55rem 1.4rem;
  background: transparent;
  border: 1.5px solid #ef4444;
  border-radius: 8px;
  color: #ef4444;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}
.btn-logout:hover { background: rgba(239, 68, 68, 0.1); }

/* Spinner */
.btn-spinner {
  display: inline-block;
  width: 14px; height: 14px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Modal styles shared */
.crop-modal-body, .crop-confirm-body { display: flex; flex-direction: column; gap: 1rem; }
.crop-step-badge { display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; color: #94a3b8; }
.crop-step-num {
  width: 22px; height: 22px; border-radius: 50%;
  background: #2563eb; color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.75rem; font-weight: 700;
}
.step-confirm .crop-step-num { background: #16a34a; }
.cropper-wrap { width: 100%; height: 320px; background: #000; border-radius: 12px; overflow: hidden; }
.profile-cropper { width: 100%; height: 100%; }
.crop-tip { font-size: 0.78rem; color: #64748b; margin: 0; }
.crop-result-wrap { display: flex; justify-content: center; }
.crop-result-img { width: 160px; height: 160px; border-radius: 50%; object-fit: cover; border: 3px solid #2563eb; }
.crop-confirm-hint { font-size: 0.78rem; color: #64748b; text-align: center; margin: 0; }
.modal-view-avatar-box { display: flex; justify-content: center; align-items: center; padding: 1rem; }
.full-avatar-view { width: 200px; height: 200px; border-radius: 50%; object-fit: cover; }
.initials-view-box {
  width: 200px; height: 200px; border-radius: 50%;
  background: linear-gradient(135deg, #1d4ed8, #38bdf8);
  display: flex; align-items: center; justify-content: center;
  font-size: 3.5rem; font-weight: 800; color: #fff;
}
.modal-btn {
  display: inline-flex; align-items: center; gap: 0.4rem;
  padding: 0.5rem 1.25rem; border-radius: 8px;
  font-size: 0.85rem; font-weight: 700; cursor: pointer; transition: all 0.2s;
}
.modal-btn.cancel { background: transparent; border: 1px solid rgba(71,85,105,0.4); color: #94a3b8; }
.modal-btn.cancel:hover { border-color: #64748b; color: #f1f5f9; }
.modal-btn.confirm { background: #2563eb; border: none; color: #fff; }
.modal-btn.confirm:hover { background: #1d4ed8; }
.modal-btn.confirm:disabled { opacity: 0.5; cursor: not-allowed; }
.modal-btn.delete { background: transparent; border: 1px solid #dc2626; color: #ef4444; }
.modal-btn.delete:hover { background: rgba(220,38,38,0.12); }
.btn-icon { font-size: 0.9rem; }

/* 2FA */
.twofa-modal-body { display: flex; flex-direction: column; gap: 1.25rem; }
.twofa-loading { display: flex; flex-direction: column; align-items: center; gap: 1rem; color: #94a3b8; padding: 2rem; }
.twofa-spinner { width: 28px; height: 28px; border-width: 3px; }
.twofa-setup-content { display: flex; flex-direction: column; gap: 1rem; }
.twofa-qr-box { display: flex; justify-content: center; }
.twofa-qr-img { width: 180px; height: 180px; border-radius: 12px; border: 2px solid rgba(56,189,248,0.3); }
.twofa-instruction { font-size: 0.85rem; color: #94a3b8; display: flex; align-items: flex-start; gap: 0.5rem; margin: 0; }
.twofa-secret-row { display: flex; align-items: center; gap: 0.5rem; background: rgba(15,23,42,0.7); border-radius: 8px; padding: 0.5rem 0.75rem; }
.twofa-secret-label { font-size: 0.78rem; color: #64748b; }
.twofa-secret-code { font-size: 0.82rem; font-family: monospace; color: #38bdf8; letter-spacing: 0.05em; }
.twofa-input-group { display: flex; flex-direction: column; gap: 0.5rem; }
.twofa-label { font-size: 0.82rem; color: #94a3b8; font-weight: 600; }
.twofa-token-input {
  width: 100%; background: rgba(15,23,42,0.8);
  border: 1px solid rgba(71,85,105,0.4);
  border-radius: 8px; color: #f8fafc;
  font-size: 1.2rem; text-align: center; letter-spacing: 0.3em;
  padding: 0.65rem; outline: none;
}
.twofa-token-input:focus { border-color: #38bdf8; }
.twofa-error { font-size: 0.78rem; color: #f87171; display: flex; align-items: center; gap: 0.35rem; margin: 0; }
.twofa-success { display: flex; flex-direction: column; align-items: center; gap: 0.75rem; padding: 1.5rem; text-align: center; }
.twofa-success-icon { font-size: 2.5rem; color: #22c55e; }
.twofa-success h4 { font-size: 1rem; font-weight: 700; margin: 0; color: #f1f5f9; }
.twofa-success p { font-size: 0.83rem; color: #64748b; margin: 0; }
.twofa-disable-warning { display: flex; align-items: flex-start; gap: 0.65rem; background: rgba(220,38,38,0.1); border: 1px solid rgba(220,38,38,0.25); border-radius: 10px; padding: 0.85rem; color: #fca5a5; font-size: 0.83rem; }
.copy-inline-btn { background: transparent; border: none; color: #64748b; cursor: pointer; padding: 0; font-size: 0.85rem; }
.copy-inline-btn:hover { color: #38bdf8; }

/* Responsive */
@media (max-width: 640px) {
  .profile-card { flex-direction: column; align-items: flex-start; }
  .profile-card-right { gap: 1.25rem; }
  .form-row { grid-template-columns: 1fr; }
  .section-card-header, .section-card-body { padding: 1rem; }
  .logout-card { padding: 1rem; }
  .profile-page-title { font-size: 1.4rem; }
}
</style>
