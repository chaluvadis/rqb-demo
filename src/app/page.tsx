"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { EmployeeSelector } from "@/components/query-builder/EmployeeSelector";
import { CustomQuery } from "@/components/query-builder/CustomQuery";
import { CustomQueryBuilder } from "@/components/query-builder/CustomQueryBuilder";
import { fetchDepartmentMetadata, fetchEmployeeMetadata } from "@/lib/api/department";
import { fetchEmployeeList } from "@/lib/api/employee";
import { generateQueryId, buildDefaultQuery } from "@/lib/query-builder/fields";
import { transformMetadata } from "@/lib/query-builder/metadata";
import type { RuleGroupType } from "react-querybuilder";

function QueryBuilderApp() {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [combinedQuery, setCombinedQuery] = useState<RuleGroupType>(() => ({
    id: "query-1",
    combinator: "and",
    rules: [
      {
        id: "group-1",
        combinator: "and",
        rules: [{ field: "", operator: "=", value: "", id: "rule-1" }],
        not: false,
      },
    ],
    not: false,
  }));
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
  }, []);

  const handleCombinedQueryChange = useCallback((query: RuleGroupType) => {
    setCombinedQuery(query);
  }, []);

  const handleAddCustomQuery = useCallback(() => {
    const newQuery = buildDefaultQuery();
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

  const combinedMetadata = useMemo(() => {
    if (!departmentMetadata) return null;

    const combinedFields = [...departmentMetadata.fields];

    if (employeeMetadata) {
      combinedFields.push(
        ...employeeMetadata.fields.map((field) => ({
          ...field,
          name: `employee_${field.name}`,
          label: `[Employee] ${field.label}`,
        }))
      );
    }

    return transformMetadata({
      fields: combinedFields,
      defaultCombinator: "and",
    });
  }, [departmentMetadata, employeeMetadata]);

  const isEmployeeLoading =
    isEmployeesLoading ||
    isEmployeeMetadataLoading ||
    (selectedEmployeeId !== null && !employeeMetadataFormatted && !employeeMetadataError);

  useEffect(() => {
    if (!selectedEmployeeId || !employeeMetadata) {
      setCombinedQuery((prev) => {
        const filtered = prev.rules.filter(
          (rule) => (rule as RuleGroupType & { id?: string }).id !== `employee-group-${selectedEmployeeId}`
        );
        return { ...prev, rules: filtered };
      });
      return;
    }

    setCombinedQuery((prev) => {
      const hasGroup = prev.rules.some(
        (rule) => (rule as RuleGroupType & { id?: string }).id === `employee-group-${selectedEmployeeId}`
      );
      if (hasGroup) return prev;

      const employeeGroup: RuleGroupType = {
        id: `employee-group-${selectedEmployeeId}`,
        combinator: "and",
        rules: [{ field: "", operator: "=", value: "", id: `employee-rule-${selectedEmployeeId}` }],
        not: false,
      };

      return {
        ...prev,
        rules: [...prev.rules, employeeGroup],
      };
    });
  }, [selectedEmployeeId, employeeMetadata]);

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
            <CustomQueryBuilder
              title="Query Builder"
              description={selectedEmployeeId ? `Department + Employee Query${employeeMetadata ? ` (${employeeMetadata.employeeName})` : ""}` : "Department Query"}
              metadata={combinedMetadata}
              query={combinedQuery}
              onQueryChange={handleCombinedQueryChange}
              isLoading={isDepartmentLoading}
              error={departmentError instanceof Error ? departmentError : null}
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
                  combined: combinedQuery,
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
