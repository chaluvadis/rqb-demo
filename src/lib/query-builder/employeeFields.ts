import type { ValueEditorType } from "react-querybuilder";

const typeToValueEditorType: Record<string, ValueEditorType> = {
  string: "text",
  number: "text",
  boolean: "checkbox",
  date: "text",
  select: "select",
};

export const employeeFields = [
  { name: "employeeId", label: "Employee ID", type: "string" as const, operators: ["=", "!=", "contains", "beginsWith", "endsWith"] },
  { name: "fullName", label: "Full Name", type: "string" as const, operators: ["=", "!=", "contains", "beginsWith", "endsWith"] },
  { name: "email", label: "Email", type: "string" as const, operators: ["=", "!=", "contains", "endsWith"] },
  { name: "department", label: "Department", type: "select" as const, operators: ["=", "!=", "in", "notIn"], options: [
    { label: "Engineering", value: "Engineering" },
    { label: "Marketing", value: "Marketing" },
    { label: "Sales", value: "Sales" },
    { label: "HR", value: "HR" },
    { label: "Finance", value: "Finance" },
  ]},
  { name: "hireDate", label: "Hire Date", type: "date" as const, operators: ["=", "!=", "<", ">", "<=", ">=", "between", "notBetween"] },
  { name: "salary", label: "Salary", type: "number" as const, operators: ["=", "!=", "<", ">", "<=", ">=", "between", "notBetween"] },
  { name: "level", label: "Level", type: "select" as const, operators: ["=", "!="], options: [
    { label: "Junior", value: "junior" },
    { label: "Mid", value: "mid" },
    { label: "Senior", value: "senior" },
    { label: "Lead", value: "lead" },
    { label: "Principal", value: "principal" },
  ]},
  { name: "specialty", label: "Specialty", type: "select" as const, operators: ["=", "!="], options: [
    { label: "Frontend", value: "frontend" },
    { label: "Backend", value: "backend" },
    { label: "Full Stack", value: "fullstack" },
    { label: "DevOps", value: "devops" },
    { label: "Mobile", value: "mobile" },
    { label: "Digital Marketing", value: "digital" },
    { label: "Brand", value: "brand" },
    { label: "Content", value: "content" },
    { label: "Recruiting", value: "recruiting" },
    { label: "L&D", value: "lnd" },
    { label: "Benefits", value: "benefits" },
  ]},
  { name: "quota", label: "Quota", type: "number" as const, operators: ["=", "!=", "<", ">", "<=", ">="] },
  { name: "isActive", label: "Active", type: "boolean" as const, operators: ["=", "!="] },
];

export function getEmployeeFieldsForDepartment(department: string): typeof employeeFields {
  const baseFields = employeeFields.filter((f) => 
    ["employeeId", "fullName", "email", "department", "hireDate", "salary", "isActive"].includes(f.name)
  );

  const departmentSpecific = employeeFields.filter((f) => {
    if (department === "Engineering") return ["level", "specialty"].includes(f.name);
    if (department === "Marketing") return ["specialty"].includes(f.name);
    if (department === "Sales") return ["quota"].includes(f.name);
    if (department === "HR") return ["specialty"].includes(f.name);
    return false;
  });

  return [...baseFields, ...departmentSpecific];
}

export function transformEmployeeFieldsToRQB(fields: typeof employeeFields) {
  return fields.map((field) => ({
    name: field.name,
    label: field.label,
    value: field.name,
    valueEditorType: typeToValueEditorType[field.type] ?? "text",
    operators: field.operators,
    options: field.options,
  }));
}