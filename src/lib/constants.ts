export const DEPARTMENTS = [
  {
    code: "BSIT",
    name: "BS Information Technology",
    fullName: "Bachelor of Science in Information Technology",
    color: "#1A3A8F",
    lightBg: "#EEF2FF",
    textColor: "#1A3A8F",
  },
  {
    code: "BEED/BSED",
    name: "Bachelor of Elementary/Secondary Education",
    fullName: "Bachelor of Elementary/Secondary Education",
    color: "#DC2626",
    lightBg: "#FEE2E2",
    textColor: "#991B1B",
  },
  {
    code: "BSHM",
    name: "BS Hospitality Management",
    fullName: "Bachelor of Science in Hospitality Management",
    color: "#0F6E56",
    lightBg: "#E1F5EE",
    textColor: "#065F46",
  },
  {
    code: "BSTM",
    name: "BS Tourism Management",
    fullName: "Bachelor of Science in Tourism Management",
    color: "#D97706",
    lightBg: "#FEF3C7",
    textColor: "#92400E",
  },
  {
    code: "BSBA",
    name: "BS Business Administration",
    fullName: "Bachelor of Science in Business Administration",
    color: "#0891B2",
    lightBg: "#E0F2FE",
    textColor: "#0C4A6E",
  },
  {
    code: "BSCRIM",
    name: "BS Criminology",
    fullName: "Bachelor of Science in Criminology",
    color: "#7C3AED",
    lightBg: "#EDE9FE",
    textColor: "#5B21B6",
  },
  {
    code: "BSMARINE",
    name: "BS Marine Transportation",
    fullName: "Bachelor of Science in Marine Transportation",
    color: "#0284C7",
    lightBg: "#E0F2FE",
    textColor: "#075985",
  },
] as const

export const YEAR_LEVELS = [
  "1st Year",
  "2nd Year",
  "3rd Year",
  "4th Year",
] as const

export const ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  DEPT_ADMIN: "DEPT_ADMIN",
  STUDENT: "STUDENT",
} as const

export const PORTAL_ROUTES = {
  SUPER_ADMIN: "/admin/dashboard",
  DEPT_ADMIN: "/dept/dashboard",
  STUDENT: "/student/dashboard",
} as const

export const COOKIE_NAME = "qrvents-session"
export const SCANNER_LOCK_TIMEOUT = 2 * 60 * 1000
export const SCAN_RESULT_RESET_DELAY = 4000
export const APP_NAME = "QRVents"
export const SCHOOL_NAME = "Polytechnic College of La Union"
