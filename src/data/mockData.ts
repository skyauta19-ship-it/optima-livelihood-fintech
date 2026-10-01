import type {
  DepositChannel,
  FundingApplication,
  LivelihoodProject,
  MemberState,
  Transaction,
} from "@/types";

export const STORYBOARD_URL =
  "https://dala-prod-public-storage.s3.eu-west-1.amazonaws.com/attachments/9a1ff585-be55-4860-8cc2-e55c5fdaa430/1790547283521_WhatsApp_Image_2026-09-27_at_23.13.44.jpeg";

export const STORAGE_KEY = "optima-livelihood-state-v1";
export const THEME_KEY = "optima-livelihood-theme";

export const MICRO_LOAN_RATE = 0.08;
export const GRANT_CEILING = 1500;
export const LOAN_CEILING = 5000;

export const DEPOSIT_CHANNELS: DepositChannel[] = [
  "Mobile Money",
  "Community Cooperative Deposit",
  "Bank Transfer",
];

const CREDIT_TYPES: TransactionType[] = [
  "deposit",
  "grant_disbursement",
  "loan_disbursement",
];

type TransactionType = Transaction["type"];

export function isCredit(type: TransactionType): boolean {
  return CREDIT_TYPES.includes(type);
}

export function signedAmount(tx: Transaction): number {
  return isCredit(tx.type) ? tx.amount : -tx.amount;
}

export function computeMonthlyPayment(
  amount: number,
  annualRate: number,
  termMonths: number,
): number {
  if (termMonths <= 0) return 0;
  return Math.round((amount * (1 + annualRate * (termMonths / 12))) / termMonths);
}

const PROJECTS: LivelihoodProject[] = [
  {
    id: "prj-solar",
    name: "Solar Bakery Collective",
    category: "Solar Bakery & Food",
    location: "Market Row, Zone 4",
    owner: "Amara Okonjo",
    summary:
      "Shared solar oven and chilled display unit supplying fresh bread to three market stands.",
    goal: 3800,
    saved: 2960,
    monthlyReturn: 640,
    deadline: "2026-11-18",
    status: "In Progress",
    milestones: [
      { label: "Group account opened", done: true },
      { label: "Solar oven unit procured", done: true },
      { label: "Fit-out and health permit", done: false },
    ],
  },
  {
    id: "prj-tailoring",
    name: "Tailoring Guild Workshop",
    category: "Tailoring & Garments",
    location: "Cooperative Yard, Zone 2",
    owner: "Amara Okonjo",
    summary:
      "Six-member garment workshop adding two industrial machines and a fabric bulk-buy scheme.",
    goal: 2400,
    saved: 2140,
    monthlyReturn: 520,
    deadline: "2026-10-02",
    status: "In Progress",
    milestones: [
      { label: "Machine quotations verified", done: true },
      { label: "Fabric bulk supplier signed", done: true },
      { label: "Second machine installed", done: false },
    ],
  },
  {
    id: "prj-farm",
    name: "Organic Farm Plot Cluster",
    category: "Agriculture & Farming",
    location: "Riverside Plots, Sector B",
    owner: "Amara Okonjo",
    summary:
      "Drip irrigation and certified seed for eleven cooperative plots feeding the bakery supply chain.",
    goal: 5200,
    saved: 1980,
    monthlyReturn: 880,
    deadline: "2027-02-28",
    status: "Planning",
    milestones: [
      { label: "Land use agreement", done: true },
      { label: "Irrigation kit order", done: false },
      { label: "Seed certification", done: false },
    ],
  },
  {
    id: "prj-artisan",
    name: "Artisan Retail Kiosk",
    category: "Artisan & Retail",
    location: "Transit Hub, Bay 1",
    owner: "Amara Okonjo",
    summary:
      "Finished kiosk selling woven goods and bakery products from a single shared counter.",
    goal: 1600,
    saved: 1600,
    monthlyReturn: 310,
    deadline: "2026-09-05",
    status: "Completed",
    milestones: [
      { label: "Kiosk constructed", done: true },
      { label: "Stock rotation live", done: true },
      { label: "First quarterly audit", done: true },
    ],
  },
];

const APPLICATIONS: FundingApplication[] = [
  {
    id: "app-organic-grant",
    reference: "OLP-APP-2214",
    type: "grant",
    amount: 1200,
    projectId: "prj-farm",
    projectName: "Organic Farm Plot Cluster",
    purpose: "Certified seed and organic compost for the riverside plots",
    planSummary:
      "Compost and certified seed for eleven plots, with harvest sold into the bakery supply chain.",
    termMonths: 0,
    annualRate: 0,
    monthlyPayment: 0,
    outstanding: 0,
    status: "Approved & Disbursed",
    submittedAt: "2026-08-14",
    reviewedAt: "2026-08-16",
    reviewerNote: "Approved by the branch committee at the August sitting.",
  },
  {
    id: "app-tailoring-loan",
    reference: "OLP-APP-2077",
    type: "micro_loan",
    amount: 1500,
    projectId: "prj-tailoring",
    projectName: "Tailoring Guild Workshop",
    purpose: "Industrial sewing machine and fabric bulk-buy capital",
    planSummary:
      "Machine repaid from garment contracts signed with two school uniform buyers.",
    termMonths: 12,
    annualRate: MICRO_LOAN_RATE,
    monthlyPayment: computeMonthlyPayment(1500, MICRO_LOAN_RATE, 12),
    outstanding: 940,
    status: "Approved & Disbursed",
    submittedAt: "2026-06-02",
    reviewedAt: "2026-06-05",
    reviewerNote: "Disbursed after three months of verified savings history.",
  },
  {
    id: "app-bakery-loan",
    reference: "OLP-APP-2318",
    type: "micro_loan",
    amount: 2000,
    projectId: "prj-solar",
    projectName: "Solar Bakery Collective",
    purpose: "Fit-out, chilled display and health permitting",
    planSummary:
      "Display unit and permitting for the market row stand, repaid from daily bread sales.",
    termMonths: 18,
    annualRate: MICRO_LOAN_RATE,
    monthlyPayment: computeMonthlyPayment(2000, MICRO_LOAN_RATE, 18),
    outstanding: 0,
    status: "Pending",
    submittedAt: "2026-09-24",
  },
  {
    id: "app-artisan-pack",
    reference: "OLP-APP-1990",
    type: "grant",
    amount: 900,
    projectId: "prj-artisan",
    projectName: "Artisan Retail Kiosk",
    purpose: "Recycled packaging and counter signage kit",
    planSummary:
      "Packaging upgrade to lift retail margin on woven goods sold at the transit hub.",
    termMonths: 0,
    annualRate: 0,
    monthlyPayment: 0,
    outstanding: 0,
    status: "Needs Revision",
    submittedAt: "2026-07-11",
    reviewedAt: "2026-07-14",
    reviewerNote: "Attach a supplier quotation and resubmit for the next sitting.",
  },
];

const TRANSACTIONS: Transaction[] = [
  {
    id: "tx-1",
    reference: "OLP-TX-90412",
    type: "deposit",
    label: "Weekly savings deposit",
    channel: "Mobile Money",
    amount: 320,
    date: "2026-09-26",
    projectId: "prj-solar",
  },
  {
    id: "tx-2",
    reference: "OLP-TX-90388",
    type: "project_allocation",
    label: "Allocated to Solar Bakery Collective",
    channel: "Member request",
    amount: 500,
    date: "2026-09-22",
    projectId: "prj-solar",
  },
  {
    id: "tx-3",
    reference: "OLP-TX-90341",
    type: "loan_repayment",
    label: "Micro-loan instalment",
    channel: "Mobile Money",
    amount: 130,
    date: "2026-09-18",
  },
  {
    id: "tx-4",
    reference: "OLP-TX-90302",
    type: "deposit",
    label: "Cooperative harvest bonus",
    channel: "Community Cooperative Deposit",
    amount: 640,
    date: "2026-09-12",
  },
  {
    id: "tx-5",
    reference: "OLP-TX-90255",
    type: "project_allocation",
    label: "Allocated to Tailoring Guild Workshop",
    channel: "Member request",
    amount: 400,
    date: "2026-09-04",
    projectId: "prj-tailoring",
  },
  {
    id: "tx-6",
    reference: "OLP-TX-90188",
    type: "grant_disbursement",
    label: "Livelihood starter grant disbursed",
    channel: "System credit",
    amount: 1200,
    date: "2026-08-16",
    projectId: "prj-farm",
  },
  {
    id: "tx-7",
    reference: "OLP-TX-90140",
    type: "deposit",
    label: "Monthly savings deposit",
    channel: "Bank Transfer",
    amount: 280,
    date: "2026-08-09",
  },
  {
    id: "tx-8",
    reference: "OLP-TX-90091",
    type: "loan_repayment",
    label: "Micro-loan instalment",
    channel: "Mobile Money",
    amount: 130,
    date: "2026-08-02",
  },
  {
    id: "tx-9",
    reference: "OLP-TX-90042",
    type: "project_allocation",
    label: "Allocated to Organic Farm Plot Cluster",
    channel: "Member request",
    amount: 350,
    date: "2026-07-27",
    projectId: "prj-farm",
  },
  {
    id: "tx-10",
    reference: "OLP-TX-89904",
    type: "deposit",
    label: "Mobile money top-up",
    channel: "Mobile Money",
    amount: 450,
    date: "2026-07-18",
  },
  {
    id: "tx-11",
    reference: "OLP-TX-89766",
    type: "loan_disbursement",
    label: "Expansion micro-loan disbursed",
    channel: "System credit",
    amount: 1500,
    date: "2026-06-05",
    projectId: "prj-tailoring",
  },
  {
    id: "tx-12",
    reference: "OLP-TX-89601",
    type: "deposit",
    label: "Cooperative savings opening",
    channel: "Community Cooperative Deposit",
    amount: 900,
    date: "2026-05-21",
  },
];

export function createInitialState(): MemberState {
  return {
    profile: {
      name: "Amara Okonjo",
      memberId: "OLP-2481",
      branch: "Cooperative Branch 04",
      joinedAt: "2023-04-12",
      creditScore: 742,
      repaymentRate: 98,
    },
    walletBalance: 4820,
    projects: PROJECTS.map((project) => ({
      ...project,
      milestones: project.milestones.map((milestone) => ({ ...milestone })),
    })),
    transactions: TRANSACTIONS.map((transaction) => ({ ...transaction })),
    applications: APPLICATIONS.map((application) => ({ ...application })),
  };
}