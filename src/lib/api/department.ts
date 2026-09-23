import type {
  DepartmentMetadataResponse,
  QueryMetadataResponse,
  EmployeeMetadataResponse,
  Employee,
} from "@/types/api";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const departmentFields: QueryMetadataResponse["fields"] = [
  {
    name: "departmentName",
    label: "Department Name",
    type: "string",
    operators: ["=", "!=", "contains", "beginsWith", "endsWith", "doesNotContain"],
  },
  {
    name: "budget",
    label: "Budget",
    type: "number",
    operators: ["=", "!=", "<", ">", "<=", ">=", "between", "notBetween"],
  },
  {
    name: "headcount",
    label: "Headcount",
    type: "number",
    operators: ["=", "!=", "<", ">", "<=", ">="],
  },
  {
    name: "isActive",
    label: "Is Active",
    type: "boolean",
    operators: ["=", "!="],
  },
  {
    name: "createdAt",
    label: "Created Date",
    type: "date",
    operators: ["=", "!=", "<", ">", "<=", ">=", "between", "notBetween"],
  },
  {
    name: "location",
    label: "Location",
    type: "select",
    operators: ["=", "!=", "in", "notIn"],
    options: [
      { label: "New York", value: "NY" },
      { label: "San Francisco", value: "SF" },
      { label: "London", value: "LDN" },
      { label: "Berlin", value: "BER" },
      { label: "Tokyo", value: "TKY" },
    ],
  },
];

const employees: Employee[] = [
  { id: "emp-1", name: "Alice Johnson", email: "alice@example.com", department: "Engineering" },
  { id: "emp-2", name: "Bob Smith", email: "bob@example.com", department: "Marketing" },
  { id: "emp-3", name: "Carol White", email: "carol@example.com", department: "Engineering" },
  { id: "emp-4", name: "David Brown", email: "david@example.com", department: "Sales" },
  { id: "emp-5", name: "Eve Davis", email: "eve@example.com", department: "HR" },
];

const employeeFieldTemplates: Record<string, QueryMetadataResponse["fields"]> = {
  Engineering: [
    { name: "fullName", label: "Full Name", type: "string", operators: ["=", "!=", "contains", "beginsWith"] },
    { name: "email", label: "Email", type: "string", operators: ["=", "!=", "contains", "endsWith"] },
    { name: "salary", label: "Salary", type: "number", operators: ["=", "!=", "<", ">", "<=", ">="] },
    { name: "hireDate", label: "Hire Date", type: "date", operators: ["=", "!=", "<", ">"] },
    { name: "level", label: "Level", type: "select", operators: ["=", "!="], options: [
      { label: "Junior", value: "junior" },
      { label: "Mid", value: "mid" },
      { label: "Senior", value: "senior" },
      { label: "Lead", value: "lead" },
    ]},
    { name: "isActive", label: "Active", type: "boolean", operators: ["=", "!="] },
  ],
  Marketing: [
    { name: "fullName", label: "Full Name", type: "string", operators: ["=", "!=", "contains"] },
    { name: "email", label: "Email", type: "string", operators: ["=", "!=", "contains"] },
    { name: "salary", label: "Salary", type: "number", operators: ["=", "!=", "<", ">"] },
    { name: "hireDate", label: "Hire Date", type: "date", operators: ["=", "!="] },
    { name: "specialty", label: "Specialty", type: "select", operators: ["=", "!="], options: [
      { label: "Digital", value: "digital" },
      { label: "Brand", value: "brand" },
      { label: "Content", value: "content" },
    ]},
    { name: "isActive", label: "Active", type: "boolean", operators: ["=", "!="] },
  ],
  Sales: [
    { name: "fullName", label: "Full Name", type: "string", operators: ["=", "!=", "contains"] },
    { name: "email", label: "Email", type: "string", operators: ["=", "!=", "contains"] },
    { name: "salary", label: "Salary", type: "number", operators: ["=", "!=", "<", ">"] },
    { name: "hireDate", label: "Hire Date", type: "date", operators: ["=", "!="] },
    { name: "quota", label: "Quota", type: "number", operators: ["=", "!=", "<", ">", "<=", ">="] },
    { name: "isActive", label: "Active", type: "boolean", operators: ["=", "!="] },
  ],
  HR: [
    { name: "fullName", label: "Full Name", type: "string", operators: ["=", "!=", "contains"] },
    { name: "email", label: "Email", type: "string", operators: ["=", "!=", "contains"] },
    { name: "salary", label: "Salary", type: "number", operators: ["=", "!=", "<", ">"] },
    { name: "hireDate", label: "Hire Date", type: "date", operators: ["=", "!="] },
    { name: "specialty", label: "Specialty", type: "select", operators: ["=", "!="], options: [
      { label: "Recruiting", value: "recruiting" },
      { label: "L&D", value: "lnd" },
      { label: "Benefits", value: "benefits" },
    ]},
    { name: "isActive", label: "Active", type: "boolean", operators: ["=", "!="] },
  ],
};

export async function fetchDepartmentMetadata(): Promise<DepartmentMetadataResponse> {
  await delay(800);

  if (Math.random() < 0.05) {
    throw new Error("Failed to fetch department metadata. Please try again.");
  }

  return {
    departmentId: "dept-1",
    departmentName: "Engineering",
    fields: departmentFields,
    defaultCombinator: "and",
    defaultOperator: "=",
  };
}

export async function fetchEmployees(): Promise<Employee[]> {
  await delay(400);
  return [...employees];
}

export async function fetchEmployeeMetadata(
  employeeId: string
): Promise<EmployeeMetadataResponse> {
  await delay(600 + Math.random() * 400);

  const employee = employees.find((e) => e.id === employeeId);
  if (!employee) {
    throw new Error(`Employee with ID ${employeeId} not found`);
  }

  if (Math.random() < 0.08) {
    throw new Error(`Failed to fetch metadata for employee ${employee.name}. Please try again.`);
  }

  const fields = employeeFieldTemplates[employee.department] || employeeFieldTemplates["Engineering"];

  return {
    employeeId: employee.id,
    employeeName: employee.name,
    department: employee.department,
    fields,
    defaultCombinator: "and",
    defaultOperator: "=",
  };
}
