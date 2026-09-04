interface PersonReference {
  name: string;
  role: string;
  initials: string;
}

export interface ProfileDocument {
  id: string;
  name: string;
  category: string;
  updatedAt: string;
  status: "Signed" | "Current";
  isRestricted: boolean;
}

export interface ProfileRecord {
  name: string;
  preferredName: string;
  legalName: string;
  pronouns: string;
  initials: string;
  avatar: string;
  engagementStatus: "Active";
  jobTitle: string;
  jobLevel: string;
  department: string;
  team: string;
  currentProject: string;
  workEmail: string;
  personalEmail: string;
  workPhone: string;
  workplace: string;
  timeZone: string;
  contractorId: string;
  startDate: string;
  engagementLength: string;
  employmentType: string;
  weeklyHours: string;
  schedule: string;
  contractingEntity: string;
  noticePeriod: string;
  dateOfBirth: string;
  address: string;
  emergencyContact: string;
  emergencyPhone: string;
  manager: PersonReference;
  bio: string;
  leavePolicy: string;
  annualLeaveAllowance: string;
  remainingLeave: string;
  carriedOverLeave: string;
  usedLeave: string;
  scheduledLeave: string;
  pendingLeaveRequests: string;
  leaveYear: string;
  nextLeave: string;
  lastWorkingDay: string;
  updatedBy: string;
  updatedAt: string;
  documents: ProfileDocument[];
}

export const profile: ProfileRecord = {
  name: "Megat Irfan",
  preferredName: "Megat",
  legalName: "Megat Irfan bin Megat",
  pronouns: "He / him",
  initials: "MI",
  avatar: "",
  engagementStatus: "Active",
  jobTitle: "Pegawai Pentadbir Sistem",
  jobLevel: "Utama",
  department: "Pusat Data Kualiti Udara",
  team: "Operasi MyJerebu",
  currentProject: "Sistem Pemantauan Jerebu Kebangsaan",
  workEmail: "megat.irfan@myjerebu.gov.my",
  personalEmail: "megat.irfan.plan@gmail.com",
  workPhone: "+60 3-8889 1972",
  workplace: "Kuala Lumpur / Putrajaya",
  timeZone: "UTC+8 (MYT)",
  contractorId: "MJ-2026",
  startDate: "January 1, 2024",
  engagementLength: "2 tahun",
  employmentType: "Tetap",
  weeklyHours: "40 jam",
  schedule: "Isnin–Jumaat · 8:30 AM–5:30 PM",
  contractingEntity: "MyJerebu Malaysia",
  noticePeriod: "30 hari",
  dateOfBirth: "Mei 14, 1996",
  address: "Presint 4, 62100 Putrajaya, Malaysia",
  emergencyContact: "Keluarga · Waris",
  emergencyPhone: "+60 12-345 6789",
  manager: {
    name: "Dr. Azman R.",
    role: "Pengarah Pemantauan Udara",
    initials: "AR",
  },
  bio: "Megat Irfan merupakan Pegawai Pentadbir Sistem bagi MyJerebu. Beliau bertanggungjawab memantau integrasi stesen cerapan kualiti udara, mengurus data penderia PM2.5/PM10, serta memastikan penyaluran maklumat jerebu dan kualiti udara ke seluruh negara berada pada tahap tertinggi.",
  leavePolicy: "Cuti Rehat Tahunan",
  annualLeaveAllowance: "25 hari",
  remainingLeave: "18 hari",
  carriedOverLeave: "0 hari",
  usedLeave: "7 hari",
  scheduledLeave: "3 hari",
  pendingLeaveRequests: "0",
  leaveYear: "1 Januari–31 Disember 2026",
  nextLeave: "Oktober 12–16, 2026",
  lastWorkingDay: "N/A",
  updatedBy: "Megat Irfan",
  updatedAt: "September 3, 2026",
  documents: [
    {
      id: "doc-1",
      name: "Contractor agreement",
      category: "Contract",
      updatedAt: "Mar 18, 2022",
      status: "Signed",
      isRestricted: false,
    },
    {
      id: "doc-2",
      name: "Confidentiality agreement",
      category: "Compliance",
      updatedAt: "Mar 18, 2022",
      status: "Signed",
      isRestricted: true,
    },
    {
      id: "doc-4",
      name: "Information security policy acknowledgement",
      category: "Policy",
      updatedAt: "Jan 8, 2026",
      status: "Current",
      isRestricted: false,
    },
  ],
};
