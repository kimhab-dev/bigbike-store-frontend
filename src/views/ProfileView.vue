<template>
  <div class="profile-page">
    <div class="profile-layout-container">
      <!-- Hidden File Input for Avatar Selection -->
      <input type="file" ref="fileInput" accept="image/png, image/jpeg, image/jpg, image/webp" class="hidden-file-input"
        @change="onFileSelected" />

      <!-- Top Profile Header Card -->
      <section class="profile-hero-card">
        <div class="hero-cover-pattern"></div>
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
                <i class="fa fa-camera camera-icon"></i>
                <span>Edit Photo</span>
              </div>
            </div>

            <!-- Verified Badge on Avatar -->
            <div v-if="authStore.isVerified" class="verified-badge-icon" title="Verified Identity">
              <i class="fa fa-check"></i>
            </div>
          </div>

          <div class="user-meta">
            <div class="name-row">
              <h1 class="user-name">{{ authStore.userName }}</h1>

              <!-- Role Master Badge -->
              <div :class="['role-master-badge', authStore.isAdmin ? 'badge-admin-master' : 'badge-user-master']">
                <i :class="authStore.isAdmin ? 'fa fa-crown role-icon' : 'fa fa-motorcycle role-icon'"></i>
                <span>{{ (authStore.userRole || 'user').toUpperCase() }}</span>
              </div>
            </div>

            <p class="user-email-row">
              <span class="email-text">{{ authStore.userEmail }}</span>
              <button class="copy-chip-btn" @click="copyText(authStore.userEmail, 'Email copied!')" title="Copy email">
                <i class="fa fa-clipboard chip-icon"></i>
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

          <!-- Header Action Buttons -->
          <div class="header-actions">
            <!-- Upload Avatar Quick Button -->
            <button class="action-btn upload" @click="triggerFileSelect" title="Upload new avatar">
              <i class="fa fa-upload btn-icon"></i>
              <span>Upload Photo</span>
            </button>

            <!-- Delete Avatar Button (Visible if user has an avatar) -->
            <button v-if="hasAvatar" class="action-btn delete-avatar" @click="confirmDeleteAvatar"
              :disabled="deletingAvatar" title="Remove current avatar picture">
              <span v-if="deletingAvatar" class="btn-spinner"></span>
              <i v-else class="fa fa-trash btn-icon"></i>
              <span>Delete Avatar</span>
            </button>

            <!-- Sync Profile Button -->
            <button class="action-btn refresh" @click="refreshProfile" :disabled="authStore.profileLoading">
              <span v-if="authStore.profileLoading" class="btn-spinner"></span>
              <i v-else class="fa fa-refresh btn-icon"></i>
              <span>{{ authStore.profileLoading ? 'Syncing...' : 'Sync Profile' }}</span>
            </button>
          </div>
        </div>
      </section>

      <!-- KPI Metrics Stats Grid -->
      <section class="metrics-grid">
        <!-- Metric 1: Account Role -->
        <div class="metric-card">
          <div class="metric-icon-box role-box">
            <i :class="authStore.isAdmin ? 'fa fa-star' : 'fa fa-user'"></i>
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
            <i class="fa fa-check-circle"></i>
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
            <i class="fa fa-birthday-cake"></i>
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
            <i class="fa fa-lock"></i>
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
            <div class="panel-header-icon"><i class="fa fa-id-card"></i></div>
            <div class="panel-header-text">
              <h3>Profile & Identity Information</h3>
              <p>Personal credentials and user settings</p>
            </div>
          </div>

          <div class="panel-body info-list">
            <div class="info-item">
              <div class="info-key">
                <span class="info-icon"><i class="fa fa-hashtag"></i></span>
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
                <span class="info-icon"><i class="fa fa-user"></i></span>
                <span>Full Name</span>
              </div>
              <div class="info-val font-bold">
                {{ authStore.userName }}
              </div>
            </div>

            <div class="info-item">
              <div class="info-key">
                <span class="info-icon"><i class="fa fa-envelope"></i></span>
                <span>Email Address</span>
              </div>
              <div class="info-val">
                {{ authStore.userEmail }}
              </div>
            </div>

            <div class="info-item">
              <div class="info-key">
                <span class="info-icon"><i class="fa fa-birthday-cake"></i></span>
                <span>Age</span>
              </div>
              <div class="info-val">
                {{ authStore.userAge ? `${authStore.userAge} Years Old` : '30 Years Old' }}
              </div>
            </div>

            <div class="info-item">
              <div class="info-key">
                <span class="info-icon"><i class="fa fa-image"></i></span>
                <span>Avatar Path</span>
              </div>
              <div class="info-val text-truncate font-mono">
                {{ authStore.userAvatar || 'No Avatar Uploaded' }}
              </div>
            </div>

            <div class="info-item">
              <div class="info-key">
                <span class="info-icon"><i class="fa fa-shield"></i></span>
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
                <span class="info-icon"><i class="fa fa-calendar"></i></span>
                <span>Created At</span>
              </div>
              <div class="info-val text-muted">
                {{ formattedCreatedDate }}
              </div>
            </div>

            <div class="info-item">
              <div class="info-key">
                <span class="info-icon"><i class="fa fa-clock-o"></i></span>
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
            <div class="panel-header-icon"><i class="fa fa-shield"></i></div>
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

            <!-- Security Recommendation Callout -->
            <div v-if="!authStore.twoFactorEnabled" class="security-callout">
              <div class="callout-icon"><i class="fa fa-exclamation-triangle"></i></div>
              <div class="callout-text">
                <strong>Enable Two-Factor Authentication</strong>
                <p>Protect your administrator privileges against unauthorized garage access.</p>
              </div>
              <button class="callout-action-btn" @click="handleSetup2FA">Configure 2FA</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Base Modal for Avatar Preview & Upload -->
    <BaseModal v-model="showPreviewModal" title="Avatar Upload Preview"
      subtitle="Inspect your new profile photo before saving" size="md" @close="cancelPreview">
      <div v-if="selectedFile && previewUrl" class="modal-preview-content">
        <div class="modal-preview-image-box">
          <img :src="previewUrl" alt="Avatar preview" class="modal-preview-img" />
        </div>

        <div class="modal-file-details">
          <div class="detail-badge font-mono">POST /auth/avatar</div>
          <h4 class="modal-file-name">{{ selectedFile.name }}</h4>
          <span class="modal-file-meta">{{ formatFileSize(selectedFile.size) }} • {{ selectedFile.type || 'image'
            }}</span>
        </div>
      </div>

      <template #footer>
        <button class="modal-btn cancel" @click="cancelPreview" :disabled="uploadingAvatar">
          Cancel
        </button>
        <button class="modal-btn confirm" @click="confirmUploadAvatar" :disabled="uploadingAvatar">
          <span v-if="uploadingAvatar" class="btn-spinner"></span>
          <i v-else class="fa fa-upload btn-icon"></i>
          <span>{{ uploadingAvatar ? 'Uploading...' : 'Confirm & Upload' }}</span>
        </button>
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
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useToast } from '@/composables/useToast';
import { formatDate } from '@/utils';
import BaseModal from '@/components/BaseModal.vue';

const authStore = useAuthStore();
const toast = useToast();

const fileInput = ref(null);
const selectedFile = ref(null);
const previewUrl = ref(null);
const showPreviewModal = ref(false);
const showViewAvatarModal = ref(false);
const uploadingAvatar = ref(false);
const deletingAvatar = ref(false);
const avatarLoadFailed = ref(false);
const avatarVersion = ref(Date.now());

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
  showPreviewModal.value = true;
};

const cancelPreview = () => {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value);
  }
  selectedFile.value = null;
  previewUrl.value = null;
  showPreviewModal.value = false;
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

const confirmUploadAvatar = async () => {
  if (!selectedFile.value) return;

  uploadingAvatar.value = true;
  try {
    // Sends FormData containing ONLY 'avatar' field to POST /auth/avatar
    await authStore.uploadAvatar(selectedFile.value);
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

const handleSetup2FA = () => {
  toast.info('2FA Setup module will guide you through TOTP authenticator pairing.', 'Security Center');
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
  background: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(56, 189, 248, 0.2);
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
}

.hero-cover-pattern {
  height: 120px;
  background: linear-gradient(135deg, #0f172a 0%, #0369a1 50%, #0284c7 100%);
  position: relative;
}

.hero-cover-pattern::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: radial-gradient(rgba(255, 255, 255, 0.15) 1px, transparent 1px);
  background-size: 16px 16px;
  opacity: 0.4;
}

.hero-content {
  padding: 0 2rem 2rem 2rem;
  display: flex;
  align-items: flex-end;
  gap: 1.75rem;
  margin-top: -50px;
  position: relative;
  z-index: 2;
  flex-wrap: wrap;
}

.avatar-container {
  position: relative;
}

.avatar-frame {
  position: relative;
  width: 110px;
  height: 110px;
  border-radius: 24px;
  background: linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 4px solid #0f172a;
  box-shadow: 0 10px 25px rgba(14, 165, 233, 0.4);
  overflow: hidden;
  cursor: pointer;
}

.avatar-frame.is-admin {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  box-shadow: 0 10px 25px rgba(245, 158, 11, 0.4);
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

.avatar-frame:hover .avatar-edit-overlay {
  opacity: 1;
}

.camera-icon {
  font-size: 1.2rem;
}

.verified-badge-icon {
  position: absolute;
  bottom: -4px;
  right: -4px;
  width: 26px;
  height: 26px;
  background: #10b981;
  color: white;
  border: 3px solid #0f172a;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.5);
  z-index: 3;
  font-size: 0.7rem;
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

.action-btn .btn-icon {
  width: 1.1rem;
  height: 1.1rem;
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

  .hero-content {
    flex-direction: column;
    align-items: flex-start;
    margin-top: -40px;
    gap: 1.25rem;
  }

  .header-actions {
    width: 100%;
    justify-content: flex-start;
  }
}
</style>
