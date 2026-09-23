export interface QueryFieldMetadata {
  name: string;
  label: string;
  type: "string" | "number" | "boolean" | "date" | "select";
  operators?: string[];
  options?: Array<{
    label: string;
    value: string;
  }>;
}

export interface QueryMetadataResponse {
  fields: QueryFieldMetadata[];
  defaultCombinator?: "and" | "or";
  defaultOperator?: string;
}

export interface DepartmentMetadataResponse extends QueryMetadataResponse {
  departmentId: string;
  departmentName: string;
}

export interface EmployeeMetadataResponse extends QueryMetadataResponse {
  employeeId: string;
  employeeName: string;
  department: string;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  avatar?: string;
}
