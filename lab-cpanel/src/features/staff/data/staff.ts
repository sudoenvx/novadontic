import type { StaffResponse } from "../api/staffResponse";
import { mapStaffResponseToStaff } from "../api/mapStaffResponseToStaff";

const staffResponses: StaffResponse[] = [
  {
    id: "dina-amer",
    full_name: "Dina Amer",
    email_address: "dina@novadontic.com",
    role_id: "owner",
    status: "active",
    created_at: "12 March 2024",
  },
  {
    id: "mina-samir",
    full_name: "Mina Samir",
    email_address: "mina@novadontic.com",
    role_id: "administrator",
    status: "active",
    created_at: "18 March 2024",
  },
  {
    id: "ahmed-rashad",
    full_name: "Ahmed Rashad",
    email_address: "ahmed@novadontic.com",
    role_id: "technician",
    status: "active",
    created_at: "22 March 2024",
  },
  {
    id: "sara-youssef",
    full_name: "Sara Youssef",
    email_address: "sara@novadontic.com",
    role_id: "administrator",
    status: "active",
    created_at: "09 April 2024",
  },
  {
    id: "omar-hassan",
    full_name: "Omar Hassan",
    email_address: "omar@novadontic.com",
    role_id: "technician",
    status: "active",
    created_at: "Today",
  },
  {
    id: "laila-fathy",
    full_name: "Laila Fathy",
    email_address: "laila@novadontic.com",
    role_id: "technician",
    status: "suspended",
    created_at: "04 June 2024",
  },
];

export const staffFixtures = staffResponses.map(mapStaffResponseToStaff);
