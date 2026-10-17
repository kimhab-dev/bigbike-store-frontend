<template>
  <div class="profile-page">
    <div class="profile-layout-container">
      <!-- Hidden File Input for Avatar Selection -->
      <input type="file" ref="fileInput" accept="image/png, image/jpeg, image/jpg, image/webp" class="hidden-file-input"
        @change="onFileSelected" />

      <!-- Top Profile Header Card -->
      <section class="profile-hero-card">
        <div class="hero-content">
          <div class="avatar-container">
            <div class="avatar-frame" :class="{ 'is-admin': authStore.isAdmin }" @click="openAvatarModal">
              <!-- Current Profile Avatar -->
              <img v-if="avatarSrc" :src="avatarSrc" :alt="authStore.userName" class="avatar-img"
                crossorigin="anonymous" referrerpolicy="no-referrer" @error="onAvatarError" />
              <!-- Fallback Initials -->
              <span v-else class="avatar-initials">{{ userInitials }}</span>

              <!-- Hover / Click Trigger Overlay -->
              <div class="avatar-edit-overlay" title="Click to view or edit avatar">
                <i class="bi bi-camera-fill camera-icon"></i>
                <span>Edit Photo</span>
              </div>
            </div>
          </div>

          <div class="user-meta">
            <div class="name-row">
              <h1 class="user-name">{{ authStore.userName }}</h1>

              <!-- Role Master Badge -->
              <div :class="['role-master-badge', authStore.isAdmin ? 'badge-admin-master' : 'badge-user-master']">
                <i :class="authStore.isAdmin ? 'bi bi-shield-lock-fill role-icon' : 'bi bi-person-badge-fill role-icon'"></i>
                <span>{{ (authStore.userRole || 'user').toUpperCase() }}</span>
              </div>
            </div>

            <p class="user-email-row">
              <span class="email-text">{{ authStore.userEmail }}</span>
              <button class="copy-chip-btn" @click="copyText(authStore.userEmail, 'Email copied!')" title="Copy email">
                <i class="bi bi-clipboard chip-icon"></i>
              </button>
            </p>

            <div class="header-tags">
              <span class="meta-tag">
                <span class="tag-label">ID:</span>
                <span class="tag-val font-mono">#{{ authStore.user?.id || '24' }}</span>
              </span>
              <span class="meta-tag">
                <span class="tag-label">Member Since:</span>
                <span class="tag-val">{{ formattedCreatedDate }}</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      <!-- KPI Metrics Stats Grid -->
      <section class="metrics-grid">
        <!-- Metric 1: Account Role -->
        <div class="metric-card">
          <div class="metric-icon-box role-box">
            <i :class="authStore.isAdmin ? 'bi bi-shield-fill-check' : 'bi bi-person-fill'"></i>
          </div>
          <div class="metric-details">
            <span class="metric-label">Access Level</span>
            <strong class="metric-value">{{ authStore.isAdmin ? 'Super Admin' : 'Registered Rider' }}</strong>
            <span class="metric-sub">{{ authStore.isAdmin ? 'Full Root Permissions' : 'Standard Access' }}</span>
          </div>
        </div>

        <!-- Metric 2: Identity Verification -->
        <div class="metric-card">
          <div class="metric-icon-box verified-box" :class="{ verified: authStore.isVerified }">
            <i class="bi bi-patch-check-fill"></i>
          </div>
          <div class="metric-details">
            <span class="metric-label">Identity Status</span>
            <strong class="metric-value" :class="{ 'text-emerald': authStore.isVerified }">
              {{ authStore.isVerified ? 'Verified Official' : 'Pending Verification' }}
            </strong>
            <span class="metric-sub">{{ authStore.isVerified ? 'KYC Passed & Verified' : 'Action Required' }}</span>
          </div>
        </div>

        <!-- Metric 3: Age / Rider Tier -->
        <div class="metric-card">
          <div class="metric-icon-box age-box">
            <i class="bi bi-calendar2-heart-fill"></i>
          </div>
          <div class="metric-details">
            <span class="metric-label">Rider Age</span>
            <strong class="metric-value">{{ authStore.userAge ? `${authStore.userAge} Years` : '30 Years' }}</strong>
            <span class="metric-sub">Eligible for 1000cc+ Class</span>
          </div>
        </div>

        <!-- Metric 4: 2FA Security -->
        <div class="metric-card">
          <div class="metric-icon-box security-box" :class="{ active: authStore.twoFactorEnabled }">
            <i class="bi bi-shield-lock-fill"></i>
          </div>
          <div class="metric-details">
            <span class="metric-label">2-Factor Auth (2FA)</span>
            <strong class="metric-value" :class="authStore.twoFactorEnabled ? 'text-emerald' : 'text-amber'">
              {{ authStore.twoFactorEnabled ? 'Enabled' : 'Disabled' }}
            </strong>
            <span class="metric-sub">{{ authStore.twoFactorEnabled ? 'Hardware / TOTP Active' : 'Setup Recommended'
            }}</span>
          </div>
        </div>
      </section>

      <!-- Main Profile Body Grid -->
      <div class="profile-body-grid">
        <!-- Left Panel: Account Details -->
        <div class="panel-card">
          <div class="panel-header">
            <div class="panel-header-icon"><i class="bi bi-person-vcard-fill"></i></div>
            <div class="panel-header-text">
              <h3>Profile & Identity Information</h3>
              <p>Personal credentials and user settings</p>
            </div>
          </div>

          <div class="panel-body info-list">
            <div class="info-item">
              <div class="info-key">
                <span class="info-icon"><i class="bi bi-hash"></i></span>
                <span>Account ID</span>
              </div>
              <div class="info-val font-mono">
                <span>#{{ authStore.user?.id || '24' }}</span>
                <button class="copy-inline-btn"
                  @click="copyText(authStore.user?.id || '24', 'Account ID copied!')">Copy</button>
              </div>
            </div>

            <div class="info-item">
              <div class="info-key">
                <span class="info-icon"><i class="bi bi-person-fill"></i></span>
                <span>Full Name</span>
              </div>
              <div class="info-val font-bold">
                {{ authStore.userName }}
              </div>
            </div>

            <div class="info-item">
              <div class="info-key">
                <span class="info-icon"><i class="bi bi-envelope-fill"></i></span>
                <span>Email Address</span>
              </div>
              <div class="info-val">
                {{ authStore.userEmail }}
              </div>
            </div>

            <div class="info-item">
              <div class="info-key">
                <span class="info-icon"><i class="bi bi-calendar2-event-fill"></i></span>
                <span>Age</span>
              </div>
              <div class="info-val">
                {{ authStore.userAge ? `${authStore.userAge} Years Old` : '30 Years Old' }}
              </div>
            </div>

            <div class="info-item">
              <div class="info-key">
                <span class="info-icon"><i class="bi bi-image-fill"></i></span>
                <span>Avatar Path</span>
              </div>
              <div class="info-val text-truncate font-mono">
                {{ authStore.userAvatar || 'No Avatar Uploaded' }}
              </div>
            </div>

            <div class="info-item">
              <div class="info-key">
                <span class="info-icon"><i class="bi bi-shield-check"></i></span>
                <span>System Role</span>
              </div>
              <div class="info-val">
                <span :class="['role-pill', authStore.isAdmin ? 'admin-pill' : 'user-pill']">
                  {{ authStore.userRole.toUpperCase() }}
                </span>
              </div>
            </div>

            <div class="info-item">
              <div class="info-key">
                <span class="info-icon"><i class="bi bi-calendar3"></i></span>
                <span>Created At</span>
              </div>
              <div class="info-val text-muted">
                {{ formattedCreatedDate }}
              </div>
            </div>

            <div class="info-item">
              <div class="info-key">
                <span class="info-icon"><i class="bi bi-clock-history"></i></span>
                <span>Last Updated</span>
              </div>
              <div class="info-val text-muted">
                {{ formattedUpdatedDate }}
              </div>
            </div>
          </div>
        </div>

        <!-- Right Panel: Admin Privileges & System Capabilities -->
        <div class="panel-card">
          <div class="panel-header">
            <div class="panel-header-icon"><i class="bi bi-shield-shaded"></i></div>
            <div class="panel-header-text">
              <h3>{{ authStore.isAdmin ? 'Admin Root Permissions' : 'Rider Privileges' }}</h3>
              <p>Granted system capabilities and security protocols</p>
            </div>
          </div>

          <div class="panel-body permissions-list">
            <div class="permission-row" v-for="(perm, idx) in permissionsList" :key="idx">
              <div class="perm-status-dot" :class="{ enabled: perm.granted }"></div>
              <div class="perm-info">
                <strong>{{ perm.title }}</strong>
                <p>{{ perm.desc }}</p>
              </div>
              <span class="perm-badge" :class="perm.granted ? 'badge-granted' : 'badge-denied'">
                {{ perm.granted ? 'AUTHORIZED' : 'RESTRICTED' }}
              </span>
            </div>

            <!-- Security 2FA Callout -->
            <div class="security-callout" :class="{ 'callout-success': authStore.twoFactorEnabled }">
              <div class="callout-icon">
                <i :class="authStore.twoFactorEnabled ? 'bi bi-shield-fill-check' : 'bi bi-shield-exclamation'"></i>
              </div>
              <div class="callout-text">
                <strong>{{ authStore.twoFactorEnabled ? 'Two-Factor Authentication Active' : 'Enable Two-Factor Authentication' }}</strong>
                <p>{{ authStore.twoFactorEnabled ? 'Your account is secured with TOTP-based 2FA.' : 'Protect your account against unauthorized access.' }}</p>
              </div>
              <button class="callout-action-btn" :class="{ 'btn-danger-outline': authStore.twoFactorEnabled }" @click="handleSetup2FA">
                {{ authStore.twoFactorEnabled ? 'Disable 2FA' : 'Configure 2FA' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Crop Modal (Steps 2 & 3) ── -->
    <BaseModal
      v-model="showCropModal"
      :title="croppingConfirmed ? 'Confirm Upload' : 'Crop Your Photo'"
      :subtitle="croppingConfirmed ? 'This cropped photo will be set as your profile picture' : 'Drag to reposition · Scroll to zoom · Drag corners to resize'"
      size="md"
      @close="cancelCrop"
    >
      <!-- Step 2: Cropper -->
      <div v-if="!croppingConfirmed" class="crop-modal-body">
        <div class="crop-step-badge">
          <span class="crop-step-num">2</span>
          <span>Adjust your photo</span>
        </div>
        <div class="cropper-wrap">
          <Cropper
            ref="cropperRef"
            :src="previewUrl"
            :stencil-props="{
              aspectRatio: 1,
              movable: true,
              resizable: true,
              handlers: {},
              lines: {},
            }"
            :stencil-component="CircleStencil"
            background-class="cropper-bg"
            class="profile-cropper"
          />
        </div>
        <p class="crop-tip">
          <i class="bi bi-info-circle"></i>
          Drag to reposition &bull; Scroll to zoom in/out
        </p>
      </div>

      <!-- Step 3: Preview cropped result -->
      <div v-else class="crop-confirm-body">
        <div class="crop-step-badge step-confirm">
          <span class="crop-step-num">3</span>
          <span>Looks good?</span>
        </div>
        <div class="crop-result-wrap">
          <img :src="croppedPreviewUrl" alt="Cropped preview" class="crop-result-img" />
        </div>
        <p class="crop-confirm-hint">This is exactly what will be uploaded as your profile picture.</p>
      </div>

      <template #footer>
        <!-- Step 2 footer -->
        <template v-if="!croppingConfirmed">
          <button class="modal-btn cancel" @click="cancelCrop">Cancel</button>
          <button class="modal-btn confirm" @click="confirmCrop">
            <i class="bi bi-crop btn-icon"></i>
            Confirm Crop
          </button>
        </template>
        <!-- Step 3 footer -->
        <template v-else>
          <button class="modal-btn cancel" @click="croppingConfirmed = false" :disabled="uploadingAvatar">
            <i class="bi bi-arrow-left btn-icon"></i>
            Re-crop
          </button>
          <button class="modal-btn confirm" @click="confirmUploadAvatar" :disabled="uploadingAvatar">
            <span v-if="uploadingAvatar" class="btn-spinner"></span>
            <i v-else class="bi bi-cloud-arrow-up-fill btn-icon"></i>
            <span>{{ uploadingAvatar ? 'Uploading...' : 'Upload Photo' }}</span>
          </button>
        </template>
      </template>
    </BaseModal>


    <!-- Base Modal for Viewing Full Profile Picture -->
    <BaseModal v-model="showViewAvatarModal" :title="authStore.userName" subtitle="Current Profile Picture" size="md">
      <div class="modal-view-avatar-box">
        <img v-if="avatarSrc" :src="avatarSrc" :alt="authStore.userName" class="full-avatar-view"
          crossorigin="anonymous" referrerpolicy="no-referrer" @error="onAvatarError" />
        <div v-else class="initials-view-box">
          <span>{{ userInitials }}</span>
        </div>
      </div>

      <template #footer>
        <button v-if="hasAvatar" class="modal-btn delete" @click="confirmDeleteAvatarFromModal"
          :disabled="deletingAvatar">
          <span v-if="deletingAvatar" class="btn-spinner"></span>
          <span>Delete Avatar</span>
        </button>
        <button class="modal-btn confirm" @click="triggerFileSelectFromModal">
          Change Photo
        </button>
      </template>
    </BaseModal>

    <!-- 2FA Setup Modal -->
    <BaseModal v-model="show2FASetupModal" title="Enable Two-Factor Authentication"
      subtitle="Scan the QR code with your authenticator app" size="md" @close="close2FASetupModal">
      <div class="twofa-modal-body">
        <!-- Step 1: Loading / Generating -->
        <div v-if="twoFALoading" class="twofa-loading">
          <span class="btn-spinner twofa-spinner"></span>
          <p>Generating secure 2FA secret…</p>
        </div>

        <!-- Step 2: Show QR Code -->
        <div v-else-if="twoFAQrCode && !twoFAVerified" class="twofa-setup-content">
          <div class="twofa-qr-box">
            <img :src="twoFAQrCode" alt="2FA QR Code" class="twofa-qr-img" />
          </div>
          <p class="twofa-instruction">
            <i class="bi bi-phone-fill"></i>
            Open <strong>Google Authenticator</strong> or <strong>Authy</strong>, tap <em>Add Account</em>, then scan the QR code above.
          </p>
          <div v-if="twoFASecret" class="twofa-secret-row">
            <span class="twofa-secret-label">Manual key:</span>
            <code class="twofa-secret-code">{{ twoFASecret }}</code>
            <button class="copy-inline-btn" @click="copyText(twoFASecret, 'Secret copied!')">
              <i class="bi bi-clipboard"></i>
            </button>
          </div>
          <div class="twofa-input-group">
            <label class="twofa-label">Enter 6-digit code from your app to confirm</label>
            <input
              v-model="twoFAToken"
              type="text"
              inputmode="numeric"
              maxlength="6"
              placeholder="000000"
              class="twofa-token-input"
              @keyup.enter="confirmEnable2FA"
            />
            <p v-if="twoFAError" class="twofa-error"><i class="bi bi-exclamation-circle-fill"></i> {{ twoFAError }}</p>
          </div>
        </div>

        <!-- Step 3: Success -->
        <div v-else-if="twoFAVerified" class="twofa-success">
          <div class="twofa-success-icon"><i class="bi bi-shield-check"></i></div>
          <h4>2FA Enabled!</h4>
          <p>Your account is now protected with two-factor authentication.</p>
        </div>
      </div>

      <template #footer>
        <button class="modal-btn cancel" @click="close2FASetupModal" :disabled="twoFAVerifying">Cancel</button>
        <button
          v-if="twoFAQrCode && !twoFAVerified"
          class="modal-btn confirm"
          @click="confirmEnable2FA"
          :disabled="twoFAVerifying || twoFAToken.length < 6"
        >
          <span v-if="twoFAVerifying" class="btn-spinner"></span>
          <i v-else class="bi bi-shield-lock-fill btn-icon"></i>
          <span>{{ twoFAVerifying ? 'Verifying…' : 'Enable 2FA' }}</span>
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
          <input
            v-model="twoFADisableToken"
            type="text"
            inputmode="numeric"
            maxlength="6"
            placeholder="000000"
            class="twofa-token-input"
            @keyup.enter="confirmDisable2FA"
          />
          <p v-if="twoFADisableError" class="twofa-error"><i class="bi bi-exclamation-circle-fill"></i> {{ twoFADisableError }}</p>
        </div>
      </div>
      <template #footer>
        <button class="modal-btn cancel" @click="close2FADisableModal" :disabled="twoFADisabling">Cancel</button>
        <button
          class="modal-btn delete"
          @click="confirmDisable2FA"
          :disabled="twoFADisabling || twoFADisableToken.length < 6"
        >
          <span v-if="twoFADisabling" class="btn-spinner"></span>
          <i v-else class="bi bi-shield-x btn-icon"></i>
          <span>{{ twoFADisabling ? 'Disabling…' : 'Disable 2FA' }}</span>
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

onMounted(async () => {
  if (!authStore.user || !authStore.user.role) {
    try {
      await authStore.fetchProfile();

    } catch (e) {
      // Handled in store
    }
  }
});
</script>

<style scoped>
.hidden-file-input {
  display: none;
}

.profile-page {
  min-height: calc(100vh - 70px);
  background-color: #070a12;
  color: #f8fafc;
  padding: 2.5rem 1.5rem 4rem 1.5rem;
}

.profile-layout-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Hero Profile Header Card */
.profile-hero-card {
  position: relative;
  background: rgba(15, 23, 42, 0.78);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(56, 189, 248, 0.22);
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 20px 45px -10px rgba(0, 0, 0, 0.7), 0 0 35px rgba(14, 165, 233, 0.08);
  padding: 2.25rem;
}

.hero-content {
  padding: 0;
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-top: 0;
  position: relative;
  z-index: 2;
  flex-wrap: wrap;
}

.avatar-container {
  position: relative;
}

.avatar-frame {
  position: relative;
  width: 104px;
  height: 104px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-initials {
  font-size: 2.2rem;
  font-weight: 800;
  color: #ffffff;
  font-family: var(--font-heading);
}

/* Hover overlay for quick camera selection */
.avatar-edit-overlay {
  position: absolute;
  inset: 0;
  background: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(4px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  color: #38bdf8;
  font-size: 0.75rem;
  font-weight: 700;
  opacity: 0;
  transition: opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.camera-icon {
  font-size: 1.2rem;
}

.user-meta {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  min-width: 260px;
}

.name-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.user-name {
  font-size: 1.85rem;
  font-weight: 800;
  color: #f8fafc;
  letter-spacing: -0.02em;
}

.role-master-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.3rem 0.85rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.badge-admin-master {
  background: rgba(245, 158, 11, 0.15);
  color: #fbbf24;
  border: 1px solid rgba(245, 158, 11, 0.4);
  box-shadow: 0 0 12px rgba(245, 158, 11, 0.2);
}

.badge-user-master {
  background: rgba(14, 165, 233, 0.15);
  color: #38bdf8;
  border: 1px solid rgba(56, 189, 248, 0.4);
}

.user-email-row {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
  color: #94a3b8;
}

.copy-chip-btn {
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(71, 85, 105, 0.4);
  color: #cbd5e1;
  border-radius: 6px;
  padding: 0.15rem 0.4rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.copy-chip-btn:hover {
  background: rgba(56, 189, 248, 0.2);
  color: #38bdf8;
}

.chip-icon {
  width: 14px;
  height: 14px;
}

.header-tags {
  display: flex;
  gap: 1.25rem;
  margin-top: 0.4rem;
  flex-wrap: wrap;
}

.meta-tag {
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.tag-label {
  color: #64748b;
  font-weight: 500;
}

.tag-val {
  color: #cbd5e1;
  font-weight: 600;
}

.font-mono {
  font-family: var(--font-mono);
}

.header-actions {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  flex-wrap: wrap;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 1.15rem;
  border-radius: 10px;
  font-size: 0.88rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.action-btn.upload {
  background: rgba(14, 165, 233, 0.15);
  border: 1px solid rgba(56, 189, 248, 0.4);
  color: #38bdf8;
}

.action-btn.upload:hover {
  background: rgba(14, 165, 233, 0.3);
  color: #ffffff;
}

.action-btn.delete-avatar {
  background: rgba(244, 63, 94, 0.15);
  border: 1px solid rgba(244, 63, 94, 0.4);
  color: #fb7185;
}

.action-btn.delete-avatar:hover:not(:disabled) {
  background: rgba(244, 63, 94, 0.3);
  color: #ffffff;
}

.action-btn.delete-avatar:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.action-btn.refresh {
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid rgba(71, 85, 105, 0.6);
  color: #f8fafc;
}

.action-btn.refresh:hover:not(:disabled) {
  background: rgba(51, 65, 85, 0.9);
  border-color: #38bdf8;
  color: #38bdf8;
}

.action-btn.refresh:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Modal Internal Styling */
.modal-preview-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
  text-align: center;
}

.modal-preview-image-box {
  width: 180px;
  height: 180px;
  border-radius: 20px;
  overflow: hidden;
  border: 3px solid #38bdf8;
  box-shadow: 0 10px 30px rgba(56, 189, 248, 0.35);
  background: #090d16;
}

.modal-preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.modal-file-details {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.detail-badge {
  background: rgba(14, 165, 233, 0.15);
  color: #38bdf8;
  border: 1px solid rgba(56, 189, 248, 0.3);
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
  margin-bottom: 0.3rem;
}

.modal-file-name {
  font-size: 1.05rem;
  font-weight: 700;
  color: #f8fafc;
}

.modal-file-meta {
  font-size: 0.8rem;
  color: #94a3b8;
}

.modal-view-avatar-box {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem 0;
}

.full-avatar-view {
  max-width: 280px;
  max-height: 280px;
  width: 100%;
  height: auto;
  border-radius: 20px;
  border: 2px solid rgba(56, 189, 248, 0.3);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.6);
  object-fit: cover;
}

.initials-view-box {
  width: 160px;
  height: 160px;
  border-radius: 50%;
  background: linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  font-weight: 800;
  color: #ffffff;
}

.modal-btn {
  padding: 0.65rem 1.25rem;
  border-radius: 10px;
  font-size: 0.88rem;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.modal-btn.cancel {
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid rgba(71, 85, 105, 0.6);
  color: #cbd5e1;
}

.modal-btn.cancel:hover:not(:disabled) {
  background: rgba(51, 65, 85, 0.9);
  color: #ffffff;
}

.modal-btn.delete {
  background: rgba(244, 63, 94, 0.15);
  border: 1px solid rgba(244, 63, 94, 0.4);
  color: #fb7185;
}

.modal-btn.delete:hover:not(:disabled) {
  background: rgba(244, 63, 94, 0.3);
  color: #ffffff;
}

.modal-btn.confirm {
  background: linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%);
  border: none;
  color: #ffffff;
  box-shadow: 0 4px 14px rgba(14, 165, 233, 0.5);
}

.modal-btn.confirm:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(14, 165, 233, 0.7);
}

.modal-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Metrics KPI Grid */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.25rem;
}

.metric-card {
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.2s ease;
}

.metric-card:hover {
  border-color: rgba(56, 189, 248, 0.3);
  transform: translateY(-2px);
}

.metric-icon-box {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  flex-shrink: 0;
  background: transparent;
  border: none;
}

.role-box {
  color: #fbbf24;
}

.verified-box {
  color: #10b981;
}

.age-box {
  color: #38bdf8;
}

.security-box {
  color: #f43f5e;
}

.security-box.active {
  color: #10b981;
}

.metric-details {
  display: flex;
  flex-direction: column;
}

.metric-label {
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.metric-value {
  font-size: 1.15rem;
  font-weight: 700;
  color: #f8fafc;
  margin: 0.1rem 0;
}

.metric-sub {
  font-size: 0.72rem;
  color: #94a3b8;
}

.text-emerald {
  color: #34d399 !important;
}

.text-amber {
  color: #fbbf24 !important;
}

/* Body Grid */
.profile-body-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.panel-card {
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  overflow: hidden;
}

.panel-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid rgba(51, 65, 85, 0.5);
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.panel-header-icon {
  font-size: 1.35rem;
  color: #38bdf8;
  width: 32px;
  text-align: center;
}

.panel-header-text h3 {
  font-size: 1.1rem;
  font-weight: 700;
  color: #f8fafc;
}

.panel-header-text p {
  font-size: 0.78rem;
  color: #64748b;
}

.panel-body {
  padding: 1.5rem;
}

/* Info List */
.info-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0.5rem;
  border-bottom: 1px solid rgba(51, 65, 85, 0.3);
}

.info-item:last-child {
  border-bottom: none;
}

.info-key {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #94a3b8;
  font-size: 0.88rem;
  font-weight: 500;
}

.info-icon {
  font-size: 1rem;
}

.info-val {
  font-size: 0.92rem;
  color: #f8fafc;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.text-truncate {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.copy-inline-btn {
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid rgba(71, 85, 105, 0.5);
  color: #38bdf8;
  font-size: 0.7rem;
  padding: 0.15rem 0.45rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

.copy-inline-btn:hover {
  background: rgba(56, 189, 248, 0.2);
}

.role-pill {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.2rem 0.6rem;
  border-radius: 6px;
}

.admin-pill {
  background: rgba(245, 158, 11, 0.2);
  color: #fbbf24;
  border: 1px solid rgba(245, 158, 11, 0.4);
}

.user-pill {
  background: rgba(14, 165, 233, 0.2);
  color: #38bdf8;
  border: 1px solid rgba(14, 165, 233, 0.4);
}

.text-muted {
  color: #94a3b8 !important;
}

/* Permissions List */
.permissions-list {
  display: flex;
  flex-direction: column;
  gap: 1.15rem;
}

.permission-row {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.6rem;
  background: rgba(11, 15, 25, 0.6);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.perm-status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #64748b;
  flex-shrink: 0;
}

.perm-status-dot.enabled {
  background: #10b981;
  box-shadow: 0 0 8px #10b981;
}

.perm-info {
  flex: 1;
}

.perm-info strong {
  font-size: 0.85rem;
  color: #f8fafc;
  display: block;
}

.perm-info p {
  font-size: 0.72rem;
  color: #64748b;
  margin-top: 0.1rem;
}

.perm-badge {
  font-size: 0.65rem;
  font-weight: 700;
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
}

.badge-granted {
  background: rgba(16, 185, 129, 0.15);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.badge-denied {
  background: rgba(244, 63, 94, 0.15);
  color: #fb7185;
  border: 1px solid rgba(244, 63, 94, 0.3);
}

.security-callout {
  margin-top: 0.5rem;
  padding: 0.85rem 1rem;
  background: rgba(245, 158, 11, 0.08);
  border: 1px dashed rgba(245, 158, 11, 0.4);
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.callout-icon {
  font-size: 1.25rem;
}

.callout-text {
  flex: 1;
}

.callout-text strong {
  font-size: 0.82rem;
  color: #fbbf24;
  display: block;
}

.callout-text p {
  font-size: 0.72rem;
  color: #cbd5e1;
}

.callout-action-btn {
  background: #f59e0b;
  color: #1e1b4b;
  border: none;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.35rem 0.75rem;
  border-radius: 6px;
  cursor: pointer;
  transition: opacity 0.2s;
  white-space: nowrap;
}

.callout-action-btn:hover {
  opacity: 0.9;
}

/* Responsive */
@media (max-width: 900px) {
  .profile-body-grid {
    grid-template-columns: 1fr;
  }

  .profile-hero-card {
    padding: 1.5rem;
  }

  .hero-content {
    flex-direction: column;
    align-items: flex-start;
    margin-top: 0;
    gap: 1.25rem;
  }

  .header-actions {
    width: 100%;
    justify-content: flex-start;
  }
}

/* ── 2FA Modal Styles ──────────────────────────────────────────────────────── */
.twofa-modal-body {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.twofa-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 2rem 0;
  color: rgba(248, 250, 252, 0.6);
  font-size: 0.9rem;
}

.twofa-spinner {
  width: 32px;
  height: 32px;
  border-width: 3px;
}

.twofa-setup-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}

.twofa-qr-box {
  background: #ffffff;
  border-radius: 16px;
  padding: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
}

.twofa-qr-img {
  width: 180px;
  height: 180px;
  display: block;
  border-radius: 8px;
}

.twofa-instruction {
  font-size: 0.875rem;
  color: rgba(248, 250, 252, 0.7);
  text-align: center;
  line-height: 1.6;
  margin: 0;
}

.twofa-instruction i {
  margin-right: 0.3rem;
  color: #38bdf8;
}

.twofa-secret-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(56, 189, 248, 0.2);
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  width: 100%;
  flex-wrap: wrap;
}

.twofa-secret-label {
  font-size: 0.75rem;
  color: rgba(248, 250, 252, 0.5);
  white-space: nowrap;
}

.twofa-secret-code {
  font-family: 'Courier New', monospace;
  font-size: 0.8rem;
  color: #38bdf8;
  letter-spacing: 0.05em;
  flex: 1;
  word-break: break-all;
}

.twofa-input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
}

.twofa-label {
  font-size: 0.8rem;
  color: rgba(248, 250, 252, 0.6);
  font-weight: 500;
}

.twofa-token-input {
  background: rgba(15, 23, 42, 0.7);
  border: 1.5px solid rgba(56, 189, 248, 0.3);
  border-radius: 10px;
  color: #f8fafc;
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: 0.35em;
  padding: 0.65rem 1rem;
  text-align: center;
  width: 100%;
  outline: none;
  transition: border-color 0.2s;
}

.twofa-token-input::placeholder {
  color: rgba(248, 250, 252, 0.2);
  letter-spacing: 0.3em;
}

.twofa-token-input:focus {
  border-color: #38bdf8;
  box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.12);
}

.twofa-error {
  font-size: 0.8rem;
  color: #f87171;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  margin: 0;
}

.twofa-success {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 1.5rem 0;
  text-align: center;
}

.twofa-success-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, #10b981, #059669);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  color: #ffffff;
  box-shadow: 0 8px 24px rgba(16, 185, 129, 0.4);
}

.twofa-success h4 {
  font-size: 1.1rem;
  font-weight: 700;
  color: #10b981;
  margin: 0;
}

.twofa-success p {
  font-size: 0.875rem;
  color: rgba(248, 250, 252, 0.6);
  margin: 0;
}

.twofa-disable-warning {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.25);
  border-radius: 10px;
  padding: 0.9rem 1rem;
}

.twofa-disable-warning i {
  font-size: 1.1rem;
  color: #f59e0b;
  flex-shrink: 0;
  margin-top: 2px;
}

.twofa-disable-warning p {
  font-size: 0.85rem;
  color: rgba(248, 250, 252, 0.7);
  margin: 0;
  line-height: 1.5;
}

/* Callout success variant (2FA enabled) */
.security-callout.callout-success {
  background: rgba(16, 185, 129, 0.08);
  border-color: rgba(16, 185, 129, 0.25);
}

.security-callout.callout-success .callout-icon {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
}

.callout-action-btn.btn-danger-outline {
  background: rgba(248, 113, 113, 0.12);
  color: #f87171;
  border: 1px solid rgba(248, 113, 113, 0.3);
}

.callout-action-btn.btn-danger-outline:hover {
  background: rgba(248, 113, 113, 0.22);
}

/* ── Crop Modal ─────────────────────────────────── */
.crop-modal-body {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.crop-step-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: #38bdf8;
  background: rgba(14, 165, 233, 0.1);
  border: 1px solid rgba(56, 189, 248, 0.25);
  border-radius: 9999px;
  padding: 0.22rem 0.7rem 0.22rem 0.3rem;
  width: fit-content;
}

.crop-step-badge.step-confirm {
  color: #34d399;
  background: rgba(16, 185, 129, 0.1);
  border-color: rgba(52, 211, 153, 0.25);
}

.crop-step-num {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #0ea5e9;
  color: #fff;
  font-size: 0.72rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.crop-step-badge.step-confirm .crop-step-num {
  background: #10b981;
}

.cropper-wrap {
  width: 100%;
  height: 320px;
  background: #0b0f18;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid rgba(56, 189, 248, 0.15);
}

.profile-cropper {
  width: 100%;
  height: 100%;
}

:deep(.cropper-bg) {
  background: #0b0f18;
}

:deep(.vue-advanced-cropper__background) {
  background: #0b0f18;
}

:deep(.vue-advanced-cropper__foreground) {
  background: rgba(0, 0, 0, 0.5);
}

:deep(.vue-circle-stencil__overlay) {
  border: 2.5px solid #38bdf8;
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.55);
}

.crop-tip {
  font-size: 0.78rem;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin: 0;
}

/* Step 3 confirm body */
.crop-confirm-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.crop-result-wrap {
  width: 180px;
  height: 180px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid rgba(56, 189, 248, 0.4);
  box-shadow: 0 0 28px rgba(14, 165, 233, 0.25);
}

.crop-result-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.crop-confirm-hint {
  font-size: 0.8rem;
  color: #64748b;
  text-align: center;
  margin: 0;
}
</style>
