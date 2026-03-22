import { apiClient } from "../utils/apiClient";

type VerifyResetTokenResponse = {
  valid?: boolean;
  message?: string;
};

type ResetPasswordResponse = {
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
