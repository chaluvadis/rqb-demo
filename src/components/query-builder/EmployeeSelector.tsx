"use client";

import { useMemo } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import type { EmployeeSelectorProps } from "@/types/employee";

export function EmployeeSelector({
  employees,
  selectedEmployeeId,
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
                {deptEmployees.map((employee) => {
                  const isSelected = employee.id === selectedEmployeeId;
                  return (
                    <button
                      key={employee.id}
                      type="button"
                      aria-selected={isSelected}
                      disabled={disabled || isLoading}
                      onClick={() => onSelect(employee.id)}
                      className={`
                        flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors
                        ${
                          isSelected
                            ? "bg-primary/10 text-primary ring-1 ring-primary/20"
                            : "text-foreground hover:bg-muted"
                        }
                        ${disabled || isLoading ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
                      `}
                    >
                      <span
                        className={`
                          flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2
                          ${isSelected ? "border-primary" : "border-muted-foreground/30"}
                        `}
                        aria-hidden="true"
                      >
                        {isSelected && <span className="h-2 w-2 rounded-full bg-primary" />}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-medium">{employee.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{employee.email}</p>
                      </div>
                    </button>
                  );
                })}
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
