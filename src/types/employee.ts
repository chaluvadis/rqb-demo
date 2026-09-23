import type { Employee } from "./api";

export interface EmployeeSelectorProps {
  employees: Employee[];
  selectedEmployeeId: string | null;
  onSelect: (employeeId: string) => void;
  isLoading: boolean;
  error: Error | null;
  disabled?: boolean;
}
