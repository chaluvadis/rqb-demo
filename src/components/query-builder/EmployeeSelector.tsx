"use client";

import { useMemo } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import type { Employee } from "@/types/api";

interface EmployeeSelectorProps {
  employees: Employee[];
  onSelect: (employee: { id: string; name: string; department: string }) => void;
  isLoading: boolean;
  error: Error | null;
  disabled?: boolean;
}

export function EmployeeSelector({
  employees,
  onSelect,
  isLoading,
  error,
  disabled = false,
}: EmployeeSelectorProps) {
  const grouped = useMemo(() => {
    const map = new Map<string, typeof employees>();
    employees.forEach((emp) => {
      const existing = map.get(emp.department) ?? [];
      existing.push(emp);
      map.set(emp.department, existing);
    });
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [employees]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-8">
          <Skeleton className="h-6 w-6 rounded-full" />
          <span className="ml-3 text-sm text-muted-foreground">Loading employees...</span>
        </div>
      );
    }

    if (error) {
      return (
        <Alert variant="destructive" className="rounded-lg">
          <AlertDescription className="text-xs">
            <p className="font-semibold">Failed to load employees</p>
            <p className="mt-1 text-muted-foreground">{error.message}</p>
          </AlertDescription>
        </Alert>
      );
    }

    if (employees.length === 0) {
      return (
        <div className="py-8 text-center text-sm text-muted-foreground">
          No employees available.
        </div>
      );
    }

    return (
      <ScrollArea className="h-[calc(100vh-140px)]">
        <div className="space-y-4 pr-4">
          {grouped.map(([department, deptEmployees]) => (
            <div key={department}>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {department}
              </p>
              <div className="space-y-1">
                {deptEmployees.map((employee) => (
                  <button
                    key={employee.id}
                    type="button"
                    disabled={disabled || isLoading}
                    onClick={() => onSelect({ id: employee.id, name: employee.name, department: employee.department })}
                    className={`
                      flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors
                      text-foreground hover:bg-muted
                      ${disabled || isLoading ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
                    `}
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium">{employee.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{employee.email}</p>
                    </div>
                    <span className="ml-auto text-xs text-muted-foreground">+ Add</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    );
  };

  return (
    <div className="h-full">
      <h2 className="mb-4 text-lg font-semibold">Employees</h2>
      {renderContent()}
    </div>
  );
}