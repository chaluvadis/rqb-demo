"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { EmployeeSelector } from "@/components/query-builder/EmployeeSelector";
import { CustomQueryBuilder } from "@/components/query-builder/CustomQueryBuilder";
import { NaturalLanguageQuery } from "@/components/query-builder/NaturalLanguageQuery";
import { CustomRuleGroup } from "@/components/query-builder/CustomRuleGroup";
import { QueryBuilder } from "react-querybuilder";
import { fetchDepartmentMetadata, fetchEmployeeMetadata } from "@/lib/api/department";
import { fetchEmployeeList } from "@/lib/api/employee";
import { generateQueryId, buildDefaultQuery } from "@/lib/query-builder/fields";
import { transformMetadata } from "@/lib/query-builder/metadata";
import type { RuleGroupType, ValueEditorType, QueryBuilderProps } from "react-querybuilder";
import { transformEmployeeFieldsToRQB, getEmployeeFieldsForDepartment } from "@/lib/query-builder/employeeFields";
import { Trash2, Plus } from "lucide-react";

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

  const combinedMetadata = useMemo(() => {
    if (!departmentMetadata) return null;

    const combinedFields = [...departmentMetadata.fields];

    // Add employee fields from all selected employees (prefixed)
    employeeQueries.forEach((emp) => {
      const empFields = getEmployeeFieldsForDepartment(emp.department);
      combinedFields.push(
        ...empFields.map((field) => ({
          ...field,
          name: `employee_${emp.id}_${field.name}`,
          label: `[${emp.name}] ${field.label}`,
        }))
      );
    });

    return transformMetadata({
      fields: combinedFields,
      defaultCombinator: "and",
    });
  }, [departmentMetadata, employeeQueries]);

  // Combined fields for NLQ (main + employee queries)
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

    return {
      id: "combined-nlq",
      combinator: "and",
      rules: allRules,
      not: false,
    };
  }, [combinedQuery, employeeQueries]);

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

  // Common control elements for ALL query builders (unified UX)
  const commonControlElements = {
    ruleGroup: CustomRuleGroup,
  };

  // Common transparent classnames for ALL query builders
  const transparentClassnames = {
    ruleGroup: "bg-transparent",
    rule: "bg-transparent",
    header: "bg-transparent",
    body: "bg-transparent",
  };

  // Build rqbProps for employee query builders
  const buildEmployeeRQBProps = useCallback((employeeId: string, employeeName: string, department: string, fields: Array<{
    name: string;
    label: string;
    value: string;
    valueEditorType: ValueEditorType;
    operators?: string[];
    options?: Array<{ label: string; value: string }>;
  }>) => {
    const rqbOperators = [
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
    ];

    const rqbCombinators = [
      { name: "and", value: "and", label: "AND" },
      { name: "or", value: "or", label: "OR" },
    ];

    return {
      qbId: `employee-qb-${employeeId}`,
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
      controlElements: commonControlElements as any,
      controlClassnames: transparentClassnames,
    } as QueryBuilderProps<RuleGroupType, typeof fields[number], typeof rqbOperators[number], typeof rqbCombinators[number]>;
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
            {/* 1. Natural Language Query Block (Top) */}
            <NaturalLanguageQuery
              query={flattenedQueryForNLQ}
              fields={nlqFields}
              className="mb-4"
            />

            {/* 2. Main Query Builder (Middle) */}
            <div className="rounded-xl border border-border/50 bg-transparent overflow-hidden">
              <CustomQueryBuilder
                description="Department Query"
                metadata={combinedMetadata}
                query={combinedQuery}
                onQueryChange={handleCombinedQueryChange}
                isLoading={isDepartmentLoading}
                error={departmentError instanceof Error ? departmentError : null}
                showNLQ={false}
              />
            </div>

            {/* 3. Employee Query Builders (Flow directly below the main builder) */}
            {employeeQueries.length > 0 && (
              <div className="space-y-4">
                {employeeQueries.map((emp) => {
                  const empFields = getEmployeeFieldsForQB(emp.department);
                  const rqbProps = buildEmployeeRQBProps(emp.id, emp.name, emp.department, empFields);
                  
                  return (
                    <div key={emp.id} className="rounded-xl border border-border/50 bg-transparent overflow-hidden">
                      {/* Employee Query Builder with unified CustomRuleGroup */}
                      <div className="bg-transparent rounded-lg border border-border/50 overflow-hidden">
                        <QueryBuilder
                          {...rqbProps}
                          query={emp.query}
                          onQueryChange={(newQuery) => handleEmployeeQueryChange(emp.id, newQuery)}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* 4. Debug State (Bottom) */}
            <div className="mt-8 rounded-lg border bg-card p-5">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Debug / Final Query State
              </h3>
              <pre className="mt-3 overflow-x-auto rounded-lg bg-muted p-4 text-xs text-foreground">
                {JSON.stringify(
                  {
                    combined: combinedQuery,
                    employeeQueries: employeeQueries.map(e => ({ id: e.id, name: e.name, query: e.query })),
                  },
                  null,
                  2
                )}
              </pre>
            </div>
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