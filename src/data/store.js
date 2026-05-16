// ============================================
// CONSTRUCTION COMMAND CENTER - DATA STORE
// ============================================

// PROJECTS LIST
export const projects = [
  { id: 1, name: "Project Alpha" },
  { id: 2, name: "Project Beta" },
  { id: 3, name: "Project Gamma" },
  { id: 4, name: "Project Delta" },
  { id: 5, name: "Project Epsilon" },
  { id: 6, name: "Project Zeta" },
];

// SAMPLE TASKS
export const initialTasks = [
  {
    id: 1,
    project: "Project Alpha",
    area: "Foundation",
    activity: "Pour concrete slab",
    priority: "High",
    status: "Ongoing",
    startDate: "2025-05-01",
    targetDate: "2025-05-20",
    blockingItems: "Rebar delivery pending",
    dependencies: "",
    nextAction: "Follow up supplier",
    responsible: "Juan",
    remarks: "Critical path item",
    dateType: "Fixed Date",
    createdDate: "2025-04-01",
    updatedDate: "2025-05-10",
  },
  {
    id: 2,
    project: "Project Beta",
    area: "Structural",
    activity: "Submit structural drawings",
    priority: "High",
    status: "Not Started",
    startDate: "2025-05-10",
    targetDate: "2025-05-18",
    blockingItems: "Engineer approval pending",
    dependencies: "",
    nextAction: "Chase engineer",
    responsible: "Maria",
    remarks: "",
    dateType: "Fixed Date",
    createdDate: "2025-04-15",
    updatedDate: "2025-05-10",
  },
  {
    id: 3,
    project: "Project Gamma",
    area: "Masonry",
    activity: "Request masonry workers",
    priority: "Medium",
    status: "Pending",
    startDate: "2025-05-12",
    targetDate: "2025-05-22",
    blockingItems: "",
    dependencies: "",
    nextAction: "Call agency",
    responsible: "Pedro",
    remarks: "Need 10 workers",
    dateType: "Estimated",
    createdDate: "2025-04-20",
    updatedDate: "2025-05-10",
  },
];

// SAMPLE MATERIALS
export const initialMaterials = [
  {
    id: 1,
    project: "Project Alpha",
    materialName: "Rebar 16mm",
    unit: "pcs",
    quantity: 500,
    neededOnSiteDate: "2025-05-19",
    leadTime: 7,
    requestPrepDate: "2025-05-12",
    requestStatus: "Pending",
    deliveryDate: "",
    supplier: "Steel Corp",
    notes: "Critical for slab pour",
  },
  {
    id: 2,
    project: "Project Beta",
    materialName: "Portland Cement",
    unit: "bags",
    quantity: 200,
    neededOnSiteDate: "2025-05-25",
    leadTime: 3,
    requestPrepDate: "2025-05-22",
    requestStatus: "Not Started",
    deliveryDate: "",
    supplier: "Cement Co",
    notes: "",
  },
];

// SAMPLE PLANS
export const initialPlans = [
  {
    id: 1,
    project: "Project Alpha",
    planType: "Structural",
    neededForActivity: "Foundation works",
    neededByDate: "2025-05-18",
    status: "Pending Approval",
    requestedFrom: "Structural Engineer",
    revisionNumber: "Rev 2",
    remarks: "Urgently needed",
  },
  {
    id: 2,
    project: "Project Beta",
    planType: "Architectural",
    neededForActivity: "Masonry works",
    neededByDate: "2025-05-25",
    status: "For Revision",
    requestedFrom: "Architect",
    revisionNumber: "Rev 1",
    remarks: "",
  },
];

// SAMPLE MANPOWER
export const initialManpower = [
  {
    id: 1,
    project: "Project Alpha",
    trade: "Carpenter",
    allocated: 5,
    required: 8,
    date: "2025-05-16",
    remarks: "Short by 3",
  },
  {
    id: 2,
    project: "Project Beta",
    trade: "Mason",
    allocated: 10,
    required: 10,
    date: "2025-05-16",
    remarks: "Fully staffed",
  },
];