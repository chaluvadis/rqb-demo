"use client";

import { useState, useCallback, useMemo } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { EmployeeSelector } from "@/components/query-builder/EmployeeSelector";
import { DepartmentQuery } from "@/components/query-builder/DepartmentQuery";
import { EmployeeQuery } from "@/components/query-builder/EmployeeQuery";
import { CustomQuery } from "@/components/query-builder/CustomQuery";
import { fetchDepartmentMetadata, fetchEmployeeMetadata } from "@/lib/api/department";
import { fetchEmployeeList } from "@/lib/api/employee";
import { generateQueryId } from "@/lib/query-builder/fields";
import type { RuleGroupType } from "react-querybuilder";

function QueryBuilderApp() {
  const [departmentQuery, setDepartmentQuery] = useState<RuleGroupType>(() => ({
    id: generateQueryId(),
    combinator: "and",
    rules: [{ field: "", operator: "=", value: "", id: generateQueryId() }],
    not: false,
  }));

  const [employeeQuery, setEmployeeQuery] = useState<RuleGroupType | undefined>(undefined);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);

  const [customQueries, setCustomQueries] = useState<
    Array<{ id: string; query: RuleGroupType }>
  >([]);

  const departmentQueryKey = useMemo(() => ["department-metadata"], []);
  const employeeQueryKey = useMemo(
    () => ["employee-metadata", selectedEmployeeId],
    [selectedEmployeeId]
  );

  const {
    data: departmentMetadata,
    isLoading: isDepartmentLoading,
    error: departmentError,
  } = useQuery({
    queryKey: departmentQueryKey,
    queryFn: fetchDepartmentMetadata,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const {
    data: employees,
    isLoading: isEmployeesLoading,
    error: employeesError,
  } = useQuery({
    queryKey: ["employees"],
    queryFn: fetchEmployeeList,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  const {
    data: employeeMetadata,
    isLoading: isEmployeeMetadataLoading,
    error: employeeMetadataError,
  } = useQuery({
    queryKey: employeeQueryKey,
    queryFn: () => fetchEmployeeMetadata(selectedEmployeeId!),
    enabled: selectedEmployeeId !== null,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const handleEmployeeSelect = useCallback((employeeId: string) => {
    setSelectedEmployeeId(employeeId);
    setEmployeeQuery({
      id: generateQueryId(),
      combinator: "and",
      rules: [{ field: "", operator: "=", value: "", id: generateQueryId() }],
      not: false,
    });
  }, []);

  const handleDepartmentQueryChange = useCallback((query: RuleGroupType) => {
    setDepartmentQuery(query);
  }, []);

  const handleEmployeeQueryChange = useCallback((query: RuleGroupType) => {
    setEmployeeQuery(query);
  }, []);

  const handleAddCustomQuery = useCallback(() => {
    const newQuery: RuleGroupType = {
      id: generateQueryId(),
      combinator: "and",
      rules: [{ field: "", operator: "=", value: "", id: generateQueryId() }],
      not: false,
    };
    setCustomQueries((prev) => [
      ...prev,
      { id: generateQueryId(), query: newQuery },
    ]);
  }, []);

  const handleCustomQueryChange = useCallback((index: number, query: RuleGroupType) => {
    setCustomQueries((prev) =>
      prev.map((item, i) => (i === index ? { ...item, query } : item))
    );
  }, []);

  const handleRemoveCustomQuery = useCallback((index: number) => {
    setCustomQueries((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const departmentMetadataFormatted = useMemo(() => {
    if (!departmentMetadata) return null;
    return {
      departmentId: departmentMetadata.departmentId,
      departmentName: departmentMetadata.departmentName,
      fields: departmentMetadata.fields,
    };
  }, [departmentMetadata]);

  const employeeMetadataFormatted = useMemo(() => {
    if (!employeeMetadata) return null;
    return {
      employeeId: employeeMetadata.employeeId,
      employeeName: employeeMetadata.employeeName,
      department: employeeMetadata.department,
      fields: employeeMetadata.fields,
    };
  }, [employeeMetadata]);

  const isEmployeeLoading =
    isEmployeesLoading ||
    isEmployeeMetadataLoading ||
    (selectedEmployeeId !== null && !employeeMetadataFormatted && !employeeMetadataError);

  return (
    <div className="flex h-screen bg-background">
      <aside className="w-72 shrink-0 border-r bg-sidebar">
        <div className="p-4">
          <h1 className="text-xl font-bold text-sidebar-foreground">Query Builder</h1>
          <p className="mt-1 text-sm text-muted-foreground">Select an employee to continue</p>
        </div>
        <div className="h-px bg-sidebar-border" />
        <div className="p-4">
          <EmployeeSelector
            employees={employees ?? []}
            selectedEmployeeId={selectedEmployeeId}
            onSelect={handleEmployeeSelect}
            isLoading={isEmployeesLoading}
            error={employeesError instanceof Error ? employeesError : null}
          />
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl px-8 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground">Query Builder</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Build complex queries using department and employee metadata.
            </p>
          </div>

          <div className="space-y-6">
            <DepartmentQuery
              metadata={departmentMetadataFormatted}
              isLoading={isDepartmentLoading}
              error={departmentError instanceof Error ? departmentError : null}
              onQueryChange={handleDepartmentQueryChange}
              query={departmentQuery}
            />

            <EmployeeQuery
              employeeId={selectedEmployeeId}
              metadata={employeeMetadataFormatted}
              isLoading={isEmployeeLoading}
              error={employeeMetadataError instanceof Error ? employeeMetadataError : null}
              onQueryChange={handleEmployeeQueryChange}
              query={employeeQuery}
            />

            {customQueries.map((item, index) => (
              <CustomQuery
                key={item.id}
                id={item.id}
                title={`Custom Query ${index + 1}`}
                config={departmentMetadata ? {
                  fields: departmentMetadata.fields.map((f) => ({
                    name: f.name,
                    label: f.label,
                    valueEditorType: f.type === "string" ? "text" : f.type === "number" ? "number" : f.type === "boolean" ? "checkbox" : f.type === "date" ? "date" : "select",
                    operators: f.operators,
                    options: f.options,
                  })),
                  fieldMap: new Map(departmentMetadata.fields.map((f) => [
                    f.name,
                    {
                      name: f.name,
                      label: f.label,
                      valueEditorType: f.type === "string" ? "text" : f.type === "number" ? "number" : f.type === "boolean" ? "checkbox" : f.type === "date" ? "date" : "select",
                      options: f.options,
                    },
                  ])),
                  defaultCombinator: "and",
                } : {
                  fields: [],
                  fieldMap: new Map(),
                  defaultCombinator: "and",
                }}
                defaultQuery={{
                  id: generateQueryId(),
                  combinator: "and",
                  rules: [{ field: "", operator: "=", value: "", id: generateQueryId() }],
                  not: false,
                }}
                query={item.query}
                onQueryChange={(q) => handleCustomQueryChange(index, q)}
                onRemove={() => handleRemoveCustomQuery(index)}
              />
            ))}

            <div>
              <button
                type="button"
                onClick={handleAddCustomQuery}
                className="flex items-center gap-2 rounded-lg border border-dashed border-input bg-transparent px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add Custom Query
              </button>
            </div>
          </div>

          <div className="mt-8 rounded-lg border bg-card p-5">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Debug / Final Query State
            </h3>
            <pre className="mt-3 overflow-x-auto rounded-lg bg-muted p-4 text-xs text-foreground">
              {JSON.stringify(
                {
                  department: departmentQuery,
                  employee: employeeQuery,
                  custom: customQueries.map((q) => q.query),
                },
                null,
                2
              )}
            </pre>
          </div>
        </div>
      </main>
    </div>
  );
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
  },
});

export default function Home() {
  return (
    <QueryClientProvider client={queryClient}>
      <QueryBuilderApp />
    </QueryClientProvider>
  );
}
