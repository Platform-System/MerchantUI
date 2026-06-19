import { getApiClient, getPublicApiClient, getKeycloak, getValidToken as getValidTokenShared, configurePlatformApi } from '@platform-system/api-client';
import { toast } from 'sonner';
import { ENV } from '../config/env';

configurePlatformApi({
  baseURL: ENV.API_URL,
  keycloak: {
    url: ENV.KEYCLOAK_URL,
    realm: ENV.KEYCLOAK_REALM,
    clientId: ENV.KEYCLOAK_CLIENT_ID,
    redirectUri: typeof window !== 'undefined' ? window.location.origin : undefined,
  },
  onUnauthorized: () => {
    toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
  },
  onError: (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message;

    if (status === 404 && (
      error.config?.url?.includes('/api/wallet/me') ||
      error.config?.url?.includes('/api/identity/users/me/images/avatar') ||
      error.config?.url?.includes('/api/identity/users/me/images/cover') ||
      error.config?.url?.includes('/api/identity/users/me/profile')
    )) {
      return;
    }

    if (status === 403) {
      toast.error('Bạn không có quyền thực hiện hành động này.');
    } else if (status >= 500) {
      toast.error('Lỗi hệ thống. Vui lòng thử lại sau.');
    } else {
      toast.error(message || 'Đã có lỗi xảy ra.');
    }
  }
});

export const apiClient = getApiClient();
export const publicApiClient = getPublicApiClient();
export const keycloak = getKeycloak();
export const getValidToken = getValidTokenShared;


