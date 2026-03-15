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

type AddItAdminClassRequest = {
  class_name: number | string;
};

type AddItAdminClassResponse = {
  success: boolean;
  message: string;
  class?: {
    class_id: string;
    class_name: string;
  };
};

type AddItAdminSectionRequest = {
  teacher_id: string;
  class_id: string;
  section_name: string;
};

type AddItAdminSectionResponse = {
  success: boolean;
  message: string;
  section?: {
    section_id: string;
    class_id: string;
    teacher_id: string;
    section_name: string;
  };
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

type TeacherAssignedClassApiItem =
  | string
  | {
      class_id?: unknown;
      section_id?: unknown;
      sectionId?: unknown;
      class_name?: unknown;
      section_name?: unknown;
      subject_name?: unknown;
      className?: unknown;
      section?: unknown;
      subject?: unknown;
    };

type TeacherApiItem =
  | string
  | {
      teacher_id?: unknown;
      name?: unknown;
      full_name?: unknown;
      email?: unknown;
    };

type TeacherClassesAssignedApiResponse =
  | TeacherAssignedClassApiItem[]
  | {
      teacherId?: unknown;
      classes?: TeacherAssignedClassApiItem[];
      teachers?: TeacherApiItem[];
      schoolCode?: unknown;
      school_id?: unknown;
    };

export type TeacherAssignedClass = {
  classId: string;
  className: string;
  sectionId: string;
  sectionName: string;
  subjectName: string;
};

export type SchoolClassesAndTeachers = {
  schoolCode: string;
  classes: TeacherAssignedClass[];
  teachers: Array<{
    teacherId: string;
    name: string;
    email: string;
  }>;
};

type TeacherSectionStudentApiItem =
  | string
  | {
      student_id?: unknown;
      studentId?: unknown;
      id?: unknown;
      student_name?: unknown;
      name?: unknown;
      email?: unknown;
      roll_no?: unknown;
      rollNo?: unknown;
    };

type TeacherSectionStudentsApiResponse =
  | TeacherSectionStudentApiItem[]
  | {
      sectionId?: unknown;
      students?: TeacherSectionStudentApiItem[];
    };

export type TeacherSectionStudent = {
  studentId: string;
  name: string;
  email: string;
  rollNo: string;
};

function parseTeacherAssignedClasses(
  payload: TeacherClassesAssignedApiResponse,
): TeacherAssignedClass[] {
  const rawClasses = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.classes)
      ? payload.classes
      : [];

  return rawClasses
    .map((item): TeacherAssignedClass | null => {
      if (typeof item === "string") {
        const className = item.trim();
        if (!className) {
          return null;
        }

        return {
          classId: "",
          className,
          sectionId: "",
          sectionName: "",
          subjectName: "",
        };
      }

      if (item && typeof item === "object") {
        const className =
          typeof item.class_name === "string"
            ? item.class_name.trim()
            : typeof item.className === "string"
              ? item.className.trim()
              : "";
        const classId =
          typeof item.class_id === "string" || typeof item.class_id === "number"
            ? String(item.class_id).trim()
            : "";
        const sectionName =
          typeof item.section_name === "string"
            ? item.section_name.trim()
            : typeof item.section === "string"
              ? item.section.trim()
              : "";
        const sectionId =
          typeof item.section_id === "string" ||
          typeof item.section_id === "number"
            ? String(item.section_id).trim()
            : typeof item.sectionId === "string" ||
                typeof item.sectionId === "number"
              ? String(item.sectionId).trim()
              : sectionName;
        const subjectName =
          typeof item.subject_name === "string"
            ? item.subject_name.trim()
            : typeof item.subject === "string"
              ? item.subject.trim()
              : "";

        if (!className && !sectionName && !subjectName) {
          return null;
        }

        return {
          classId,
          className,
          sectionId,
          sectionName,
          subjectName,
        };
      }

      return null;
    })
    .filter((item): item is TeacherAssignedClass => item !== null);
}

function parseTeacherItems(
  payload: TeacherClassesAssignedApiResponse,
): Array<{ teacherId: string; name: string; email: string }> {
  const rawTeachers =
    payload && !Array.isArray(payload) && Array.isArray(payload.teachers)
      ? payload.teachers
      : [];

  const teachers = rawTeachers
    .map((item) => {
      if (typeof item === "string") {
        const name = item.trim();
        if (!name) {
          return null;
        }

        return {
          teacherId: name,
          name,
          email: "",
        };
      }

      if (item && typeof item === "object") {
        const teacherId =
          typeof item.teacher_id === "string" ||
          typeof item.teacher_id === "number"
            ? String(item.teacher_id).trim()
            : "";
        const email = typeof item.email === "string" ? item.email.trim() : "";

        if (typeof item.name === "string") {
          const name = item.name.trim();
          if (!name) {
            return null;
          }

          return {
            teacherId: teacherId || email || name,
            name,
            email,
          };
        }

        if (typeof item.full_name === "string") {
          const name = item.full_name.trim();
          if (!name) {
            return null;
          }

          return {
            teacherId: teacherId || email || name,
            name,
            email,
          };
        }
      }

      return null;
    })
    .filter(
      (item): item is { teacherId: string; name: string; email: string } =>
        item !== null,
    );

  const uniqueByTeacherId = new Map<
    string,
    { teacherId: string; name: string; email: string }
  >();
  teachers.forEach((item) => {
    if (!uniqueByTeacherId.has(item.teacherId)) {
      uniqueByTeacherId.set(item.teacherId, item);
    }
  });

  return Array.from(uniqueByTeacherId.values());
}

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
    addItAdminClass: builder.mutation<
      AddItAdminClassResponse,
      AddItAdminClassRequest
    >({
      query: (payload) => ({
        url: "/itadmin/classes",
        method: "POST",
        body: payload,
      }),
    }),
    addItAdminSection: builder.mutation<
      AddItAdminSectionResponse,
      AddItAdminSectionRequest
    >({
      query: (payload) => ({
        url: "/itadmin/sections",
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
    getTeacherClassesAssigned: builder.query<
      TeacherAssignedClass[],
      string | void
    >({
      query: (schoolId) => ({
        url: "/teacher/classes-assigned",
        method: "GET",
        params: schoolId ? { school_id: schoolId } : undefined,
      }),
      transformResponse: (payload: TeacherClassesAssignedApiResponse) =>
        parseTeacherAssignedClasses(payload),
    }),
    getSchoolClassesAndTeachers: builder.query<
      SchoolClassesAndTeachers,
      string | void
    >({
      query: (schoolId) => ({
        url: "/teacher/classes-assigned",
        method: "GET",
        params: schoolId ? { school_id: schoolId } : undefined,
      }),
      transformResponse: (payload: TeacherClassesAssignedApiResponse) => {
        const schoolCode =
          payload &&
          !Array.isArray(payload) &&
          typeof payload.schoolCode === "string"
            ? payload.schoolCode.trim().toUpperCase()
            : payload &&
                !Array.isArray(payload) &&
                typeof payload.school_id === "string"
              ? payload.school_id.trim().toUpperCase()
              : "";

        return {
          schoolCode,
          classes: parseTeacherAssignedClasses(payload),
          teachers: parseTeacherItems(payload),
        };
      },
    }),
    getTeacherSectionStudents: builder.query<TeacherSectionStudent[], string>({
      query: (sectionId) => ({
        url: `/teacher/sections/${encodeURIComponent(sectionId)}/students`,
        method: "GET",
      }),
      transformResponse: (payload: TeacherSectionStudentsApiResponse) => {
        const rawStudents = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.students)
            ? payload.students
            : [];

        return rawStudents
          .map((item): TeacherSectionStudent | null => {
            if (typeof item === "string") {
              const name = item.trim();
              if (!name) {
                return null;
              }

              return {
                studentId: "",
                name,
                email: "",
                rollNo: "",
              };
            }

            if (item && typeof item === "object") {
              const studentId =
                typeof item.student_id === "string" ||
                typeof item.student_id === "number"
                  ? String(item.student_id).trim()
                  : typeof item.studentId === "string" ||
                      typeof item.studentId === "number"
                    ? String(item.studentId).trim()
                    : typeof item.id === "string" || typeof item.id === "number"
                      ? String(item.id).trim()
                      : "";
              const name =
                typeof item.student_name === "string"
                  ? item.student_name.trim()
                  : typeof item.name === "string"
                    ? item.name.trim()
                    : "";
              const email =
                typeof item.email === "string" ? item.email.trim() : "";
              const rollNo =
                typeof item.roll_no === "string" ||
                typeof item.roll_no === "number"
                  ? String(item.roll_no).trim()
                  : typeof item.rollNo === "string" ||
                      typeof item.rollNo === "number"
                    ? String(item.rollNo).trim()
                    : "";

              if (!studentId && !name && !email && !rollNo) {
                return null;
              }

              return {
                studentId,
                name,
                email,
                rollNo,
              };
            }

            return null;
          })
          .filter((item): item is TeacherSectionStudent => item !== null);
      },
    }),
  }),
});

export const {
  useValidateCodeMutation,
  useValidateLoginMutation,
  useLogoutMutation,
  useGetRolesQuery,
  useAddUserMutation,
  useAddItAdminClassMutation,
  useAddItAdminSectionMutation,
  useGetItAdminUsersQuery,
  useGetTeacherClassesAssignedQuery,
  useGetSchoolClassesAndTeachersQuery,
  useGetTeacherSectionStudentsQuery,
} = schoolApi;
