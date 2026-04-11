import { apiClient } from "../utils/apiClient";
import { getAuthToken } from "../utils/authSession";

type VerifyResetTokenResponse = {
  valid?: boolean;
  message?: string;
};

type ResetPasswordResponse = {
  success?: boolean;
  message?: string;
};

type ForgotPasswordResponse = {
  success?: boolean;
  message?: string;
};

type VerifyOtpResponse = {
  success?: boolean;
  message?: string;
};

type ChangePasswordResponse = {
  success?: boolean;
  message?: string;
};

export async function verifyResetToken(
  token: string,
): Promise<VerifyResetTokenResponse> {
  return apiClient.get<VerifyResetTokenResponse>(
    `/auth/reset-password/${encodeURIComponent(token)}`,
  );
}

export async function resetPassword(
  token: string,
  tempPassword: string,
  newPassword: string,
): Promise<ResetPasswordResponse> {
  return apiClient.post<ResetPasswordResponse>("/auth/reset-password", {
    token,
    tempPassword,
    newPassword,
  });
}

export async function forgotPassword(
  email: string,
  schoolCode: string,
): Promise<ForgotPasswordResponse> {
  return apiClient.post<ForgotPasswordResponse>("/auth/forgot-password", {
    email,
    schoolCode,
  });
}

export async function verifyForgotPasswordOtp(
  email: string,
  schoolCode: string,
  otp: string,
  newPassword: string,
  confirmPassword: string,
): Promise<VerifyOtpResponse> {
  return apiClient.post<VerifyOtpResponse>("/auth/forgot-password/verify", {
    email,
    otp,
    newPassword,
    confirmPassword,
  });
}

export async function changePassword(
  currentPassword: string,
  newPassword: string,
): Promise<ChangePasswordResponse> {
  const token = getAuthToken();
  return apiClient.post<ChangePasswordResponse>(
    "/auth/change-password",
    { currentPassword, newPassword },
    { Authorization: `Bearer ${token}` },
  );
}
