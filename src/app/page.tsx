"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { EmployeeSelector } from "@/components/query-builder/EmployeeSelector";
import { CustomQuery } from "@/components/query-builder/CustomQuery";
import { CustomQueryBuilder } from "@/components/query-builder/CustomQueryBuilder";
import { NaturalLanguageQuery } from "@/components/query-builder/NaturalLanguageQuery";
import { QueryBuilder } from "react-querybuilder";
import { fetchDepartmentMetadata, fetchEmployeeMetadata } from "@/lib/api/department";
import { fetchEmployeeList } from "@/lib/api/employee";
import { generateQueryId, buildDefaultQuery } from "@/lib/query-builder/fields";
import { transformMetadata } from "@/lib/query-builder/metadata";
import type { RuleGroupType, ValueEditorType } from "react-querybuilder";
import { transformEmployeeFieldsToRQB, getEmployeeFieldsForDepartment } from "@/lib/query-builder/employeeFields";
import { Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

function QueryBuilderApp() {
  // Main query state
  const [combinedQuery, setCombinedQuery] = useState<RuleGroupType>(() => ({
    id: "query-1",
    combinator: "and",
    rules: [
      {
        id: "group-1",
        combinator: "and",
        rules: [{ field: "departmentName", operator: "=", value: "", id: "rule-1" }],
        not: false,
      },
    ],
    not: false,
  }));
  
  // Custom queries (additional independent query builders)
  const [customQueries, setCustomQueries] = useState<
    Array<{ id: string; query: RuleGroupType }>
  >([]);
  
  // Employee-specific query builders - array of employees with their own query state
  const [employeeQueries, setEmployeeQueries] = useState<Array<{
    id: string;
    name: string;
    department: string;
    query: RuleGroupType;
  }>>([]);

  const departmentQueryKey = useMemo(() => ["department-metadata"], []);

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

  const handleCombinedQueryChange = useCallback((query: RuleGroupType) => {
    setCombinedQuery(query);
  }, []);

  // Sidebar click handler - adds employee to the employeeQueries array
  const handleEmployeeSelect = useCallback((employee: { id: string; name: string; department: string }) => {
    setEmployeeQueries(prev => {
      // Prevent duplicates
      if (prev.find(emp => emp.id === employee.id)) return prev;
      
      return [
        ...prev,
        {
          id: employee.id,
          name: employee.name,
          department: employee.department,
          query: { combinator: "and", rules: [], not: false } // Default empty query
        }
      ];
    });
  }, []);

  const handleEmployeeQueryChange = useCallback((employeeId: string, newQuery: RuleGroupType) => {
    setEmployeeQueries(prev => prev.map(emp => 
      emp.id === employeeId ? { ...emp, query: newQuery } : emp
    ));
  }, []);

  const removeEmployeeQuery = useCallback((employeeId: string) => {
    setEmployeeQueries(prev => prev.filter(emp => emp.id !== employeeId));
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

  const combinedMetadata = useMemo(() => {
    if (!departmentMetadata) return null;

    const combinedFields = [...departmentMetadata.fields];

    // Add employee fields from all selected employees (prefixed)
    employeeQueries.forEach((emp) => {
      // We need to fetch or have the fields for each employee's department
      // For now, we'll just use the department fields as-is
      // In a real app, you'd fetch per-employee metadata
    });

    return transformMetadata({
      fields: combinedFields,
      defaultCombinator: "and",
    });
  }, [departmentMetadata, employeeQueries]);

  // Combined fields for NLQ (main + employee + custom queries)
  const nlqFields = useMemo(() => {
    const fields: Array<{ name: string; label: string }> = [];
    
    // Department fields
    if (departmentMetadata) {
      fields.push(...departmentMetadata.fields.map((f) => ({ name: f.name, label: f.label })));
    }
    
    // Employee fields (prefixed with employee name)
    employeeQueries.forEach((emp) => {
      const empFields = getEmployeeFieldsForDepartment(emp.department);
      fields.push(
        ...empFields.map((field) => ({
          name: `employee_${emp.id}_${field.name}`,
          label: `[${emp.name}] ${field.label}`,
        }))
      );
    });
    
    return fields;
  }, [departmentMetadata, employeeQueries]);

  // Flatten all queries into a single RuleGroupType for NLQ display
  const flattenedQueryForNLQ = useMemo((): RuleGroupType => {
    const allRules: RuleGroupType["rules"] = [];
    
    // Add main query rules
    combinedQuery.rules.forEach((rule) => {
      allRules.push(rule);
    });
    
    // Add employee query rules
    employeeQueries.forEach((emp) => {
      emp.query.rules.forEach((rule) => {
        if (typeof rule !== "string" && "combinator" in rule) {
          allRules.push({
            ...rule,
            id: `employee-${emp.id}-${rule.id}`,
          });
        } else if (typeof rule !== "string") {
          allRules.push({
            ...rule,
            id: `employee-${emp.id}-${rule.id}`,
          });
        }
      });
    });
    
    // Add custom query rules
    customQueries.forEach((custom, idx) => {
      custom.query.rules.forEach((rule) => {
        if (typeof rule !== "string" && "combinator" in rule) {
          allRules.push({
            ...rule,
            id: `custom-${idx}-${rule.id}`,
          });
        } else if (typeof rule !== "string") {
          allRules.push({
            ...rule,
            id: `custom-${idx}-${rule.id}`,
          });
        }
      });
    });

    return {
      id: "combined-nlq",
      combinator: "and",
      rules: allRules,
      not: false,
    };
  }, [combinedQuery, employeeQueries, customQueries]);

  // Employee-specific fields for QueryBuilder props
  const getEmployeeFieldsForQB = useCallback((department: string) => {
    const fields = getEmployeeFieldsForDepartment(department);
    return transformEmployeeFieldsToRQB(fields) as Array<{
      name: string;
      label: string;
      value: string;
      valueEditorType: ValueEditorType;
      operators?: string[];
      options?: Array<{ label: string; value: string }>;
    }>;
  }, []);

  return (
    <div className="flex h-screen bg-background">
      <aside className="w-72 shrink-0 border-r bg-sidebar">
        <div className="p-4">
          <h1 className="text-xl font-bold text-sidebar-foreground">Query Builder</h1>
          <p className="mt-1 text-sm text-muted-foreground">Click an employee to add their query builder</p>
        </div>
        <div className="h-px bg-sidebar-border" />
        <div className="p-4">
          <EmployeeSelector
            employees={employees ?? []}
            onSelect={handleEmployeeSelect}
            isLoading={isEmployeesLoading}
            error={employeesError instanceof Error ? employeesError : null}
          />
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl px-8 py-8">
          <div className="space-y-6">
            {/* GLOBAL NLQ BLOCK - Rendered ONCE at the top */}
            <NaturalLanguageQuery
              query={flattenedQueryForNLQ}
              fields={nlqFields}
              className="mb-6"
            />

            {/* MAIN QUERY BUILDER */}
            <CustomQueryBuilder
              description="Department Query"
              metadata={combinedMetadata}
              query={combinedQuery}
              onQueryChange={handleCombinedQueryChange}
              isLoading={isDepartmentLoading}
              error={departmentError instanceof Error ? departmentError : null}
              showNLQ={false}
            />

            {/* EMPLOYEE QUERY BUILDERS - Separate independent builders below main */}
            {employeeQueries.length > 0 && (
              <div className="mt-8 space-y-6">
                <h2 className="text-lg font-semibold uppercase tracking-wider text-muted-foreground">
                  Employee Query Builders
                </h2>
                {employeeQueries.map((emp) => (
                  <Card key={emp.id} className="bg-transparent border-border/50">
                    <CardContent className="p-4">
                      {/* Employee Query Builder Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 text-primary">
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground">Query for: {emp.name}</h3>
                            <p className="text-sm text-muted-foreground">Department: {emp.department}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeEmployeeQuery(emp.id)}
                          className="text-destructive hover:text-destructive/80 transition-colors"
                          aria-label={`Remove query builder for ${emp.name}`}
                        >
                          <Trash2 className="h-5 w-5" aria-hidden="true" />
                        </button>
                      </div>

                      {/* Employee-specific QueryBuilder */}
                      <EmployeeQueryBuilder
                        employeeId={emp.id}
                        employeeName={emp.name}
                        department={emp.department}
                        query={emp.query}
                        onQueryChange={handleEmployeeQueryChange}
                        fields={getEmployeeFieldsForQB(emp.department)}
                      />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* CUSTOM QUERIES */}
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

            {/* ADD CUSTOM QUERY BUTTON */}
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

          {/* DEBUG / FINAL QUERY STATE */}
          <div className="mt-8 rounded-lg border bg-card p-5">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Debug / Final Query State
            </h3>
            <pre className="mt-3 overflow-x-auto rounded-lg bg-muted p-4 text-xs text-foreground">
              {JSON.stringify(
                {
                  combined: combinedQuery,
                  employeeQueries: employeeQueries.map(e => ({ id: e.id, name: e.name, query: e.query })),
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

// Separate Employee Query Builder component
function EmployeeQueryBuilder({
  employeeId,
  employeeName,
  department,
  query,
  onQueryChange,
  fields,
}: {
  employeeId: string;
  employeeName: string;
  department: string;
  query: RuleGroupType;
  onQueryChange: (employeeId: string, query: RuleGroupType) => void;
  fields: Array<{
    name: string;
    label: string;
    value: string;
    valueEditorType: ValueEditorType;
    operators?: string[];
    options?: Array<{ label: string; value: string }>;
  }>;
}) {
  const [localQuery, setLocalQuery] = useState<RuleGroupType>(query);

  useEffect(() => {
    setLocalQuery(query);
  }, [query]);

  const handleChange = useCallback((newQuery: RuleGroupType) => {
    setLocalQuery(newQuery);
    onQueryChange(employeeId, newQuery);
  }, [employeeId, onQueryChange]);

  const rqbOperators = useMemo(
    () => [
      { name: "=", value: "=", label: "=" },
      { name: "!=", value: "!=", label: "≠" },
      { name: "<", value: "<", label: "<" },
      { name: ">", value: ">", label: ">" },
      { name: "<=", value: "<=", label: "≤" },
      { name: ">=", value: ">=", label: "≥" },
      { name: "contains", value: "contains", label: "Contains" },
      { name: "beginsWith", value: "beginsWith", label: "Begins with" },
      { name: "endsWith", value: "endsWith", label: "Ends with" },
      { name: "null", value: "null", label: "Is null" },
      { name: "notNull", value: "notNull", label: "Is not null" },
      { name: "in", value: "in", label: "In" },
      { name: "notIn", value: "notIn", label: "Not in" },
    ],
    []
  );

  const rqbCombinators = useMemo(
    () => [
      { name: "and", value: "and", label: "AND" },
      { name: "or", value: "or", label: "OR" },
    ],
    []
  );

  const builderId = `employee-qb-${employeeId}`;

  const rqbProps = {
    qbId: builderId,
    query: localQuery,
    onQueryChange: handleChange,
    fields: fields,
    operators: rqbOperators,
    combinators: rqbCombinators,
    idGenerator: () => `emp-${employeeId}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    showCloneButtons: false,
    showLockButtons: false,
    showNotToggle: true,
    showCombinatorsBetweenRules: false,
    resetOnFieldChange: false,
    resetOnOperatorChange: false,
    autoSelectField: true,
    controlClassnames: {
      ruleGroup: "bg-transparent",
      rule: "bg-transparent",
      header: "bg-transparent",
      body: "bg-transparent",
    },
  };

  return (
    <div className="bg-transparent rounded-lg border border-border/50 overflow-hidden">
      <QueryBuilder {...rqbProps} />
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