import type { Employee } from "@/types/api";
import { fetchEmployees } from "./department";

export async function fetchEmployeeList(): Promise<Employee[]> {
  return fetchEmployees();
}

export async function fetchEmployeeById(employeeId: string): Promise<Employee> {
  const employees = await fetchEmployees();
  const employee = employees.find((e) => e.id === employeeId);

  if (!employee) {
    throw new Error(`Employee with ID ${employeeId} not found`);
  }

  return employee;
}
