import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getAuthToken } from "../utils/authSession";

type ValidateCodeRequest = {
  schoolCode: string;
};

type ValidateCodeResponse = {
  valid: boolean;
  schoolCode?: string;
  message?: string;
};

type ValidateLoginRequest = {
  valid: boolean;
  schoolCode: string;
  email: string;
  password?: string;
};

type ValidateLoginResponse = {
  valid: boolean;
  schoolCode: string;
  email: string;
  role: string;
  token: string;
  message?: string;
};

type LogoutRequest = void;

type LogoutResponse = {
  success: boolean;
  message: string;
};

type RolesApiItem = string | { role?: unknown };

type RolesApiResponse = RolesApiItem[] | { roles?: RolesApiItem[] };

type AddUserPayload = {
  schoolCode: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: "ACTIVE";
};

type AddUserRequest = AddUserPayload;

type AddUserResponse = {
  success: boolean;
  message: string;
  user?: AddUserPayload;
};

type ItAdminUser = {
  name: string;
  email: string;
  phone: string;
  whatsapp: string | null;
  role: string | null;
};

type ItAdminUsersResponse = {
  schoolCode: string;
  count: number;
  users: ItAdminUser[];
};

type DashboardOverviewResponse = {
  success: boolean;
  role: string;
  data: Record<string, unknown>;
};

export const schoolApi = createApi({
  reducerPath: "schoolApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000",
    prepareHeaders: (headers) => {
      const token = getAuthToken();
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
        headers.set("x-access-token", token);
      }

      return headers;
    },
  }),
  endpoints: (builder) => ({
    validateCode: builder.mutation<ValidateCodeResponse, ValidateCodeRequest>({
      query: (body) => ({
        url: "/school/validate-code",
        method: "POST",
        body,
      }),
    }),
    validateLogin: builder.mutation<
      ValidateLoginResponse,
      ValidateLoginRequest
    >({
      query: (body) => ({
        url: "/auth/validate-login",
        method: "POST",
        body,
      }),
    }),
    logout: builder.mutation<LogoutResponse, LogoutRequest>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
    }),
    getRoles: builder.query<string[], void>({
      query: () => ({
        url: "/roles",
        method: "GET",
      }),
      transformResponse: (payload: RolesApiResponse) => {
        const rawRoles = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.roles)
            ? payload.roles
            : [];

        const normalizedRoles = rawRoles
          .map((item) => {
            if (typeof item === "string") {
              return item.trim().toUpperCase();
            }

            if (item && typeof item === "object") {
              const roleValue = item.role;
              if (typeof roleValue === "string") {
                return roleValue.trim().toUpperCase();
              }
            }

            return "";
          })
          .filter((item) => item.length > 0);

        return Array.from(new Set(normalizedRoles));
      },
    }),
    addUser: builder.mutation<AddUserResponse, AddUserRequest>({
      query: (payload) => ({
        url: "/users",
        method: "POST",
        body: payload,
      }),
    }),
    getItAdminUsers: builder.query<ItAdminUsersResponse, void>({
      query: () => ({
        url: "/itadmin/users",
        method: "GET",
      }),
    }),
    getDashboardOverview: builder.query<DashboardOverviewResponse, void>({
      query: () => ({
        url: "/dashboard/overview",
        method: "GET",
      }),
    }),
  }),
});

export const {
  useValidateCodeMutation,
  useValidateLoginMutation,
  useLogoutMutation,
  useGetRolesQuery,
  useAddUserMutation,
  useGetItAdminUsersQuery,
  useGetDashboardOverviewQuery,
} = schoolApi;
