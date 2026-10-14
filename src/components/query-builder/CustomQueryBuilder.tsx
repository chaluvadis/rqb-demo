"use client";

import { useMemo, useCallback, useState } from "react";
import {
  QueryBuilder,
  type RuleGroupType,
  type QueryBuilderProps,
  type ValueEditorType,
} from "react-querybuilder";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { QueryBuilderConfig } from "@/lib/query-builder/types";
import { operators, combinators, generateQueryId } from "@/lib/query-builder/fields";
import { buildDefaultQuery } from "@/lib/query-builder/fields";
import { getValueEditorTypeForField, getValuesForField } from "@/lib/query-builder/metadata";
import { RemoveGroupAction, RemoveRuleAction, CustomRuleGroupBodyElements, NullAction } from "./QueryBuilderActions";
import { CustomRuleGroup } from "./CustomRuleGroup";
import { NaturalLanguageQuery } from "./NaturalLanguageQuery";
import { transformEmployeeFieldsToRQB, getEmployeeFieldsForDepartment } from "@/lib/query-builder/employeeFields";

// Keep a local re-export so query-builder imports remain stable.
export { operators, combinators };

export interface CustomQueryBuilderProps {
  title?: string;
  metadata: QueryBuilderConfig | null;
  defaultQuery?: RuleGroupType | null;
  onQueryChange: (query: RuleGroupType) => void;
  query?: RuleGroupType;
  isLoading?: boolean;
  error?: Error | null;
  description?: string;
  actions?: React.ReactNode;
  emptyState?: React.ReactNode;
  employeeFields?: Array<{
    name: string;
    label: string;
    valueEditorType: ValueEditorType;
    operators?: string[];
    options?: Array<{ label: string; value: string }>;
  }>;
  employeeDepartment?: string;
  onEmployeeQueryChange?: (employeeId: string, query: RuleGroupType) => void;
  showNLQ?: boolean;
}

let builderCounter = 0;

export function CustomQueryBuilder({
  title,
  metadata,
  defaultQuery,
  onQueryChange,
  query,
  isLoading = false,
  error = null,
  description,
  actions,
  emptyState,
  employeeFields,
  employeeDepartment,
  onEmployeeQueryChange,
  showNLQ = true,
}: CustomQueryBuilderProps) {
  const isControlled = query !== undefined;
  const [internalQuery, setInternalQuery] = useState<RuleGroupType>(() =>
    defaultQuery ?? buildDefaultQuery()
  );

  // State for employee-specific secondary query builders
  const [employeeQueries, setEmployeeQueries] = useState<Map<string, RuleGroupType>>(new Map());

  const activeQuery = isControlled ? query : internalQuery;

  const handleQueryChange = useCallback(
    (newQuery: RuleGroupType) => {
      if (!isControlled) {
        setInternalQuery(newQuery);
      }
      onQueryChange(newQuery);
    },
    [isControlled, onQueryChange]
  );

  const handleEmployeeQueryChange = useCallback(
    (employeeId: string, employeeQuery: RuleGroupType) => {
      setEmployeeQueries((prev) => {
        const next = new Map(prev);
        next.set(employeeId, employeeQuery);
        return next;
      });
      onEmployeeQueryChange?.(employeeId, employeeQuery);
    },
    [onEmployeeQueryChange]
  );

  const getValueEditorType = useCallback(
    (_field: string, _operator: string, misc: { fieldData: { name: string; }; }): ValueEditorType => {
      return getValueEditorTypeForField(misc.fieldData.name, metadata?.fieldMap ?? new Map()) as ValueEditorType;
    },
    [metadata]
  );

  const getValues = useCallback(
    (_field: string, _operator: string, misc: { fieldData: { name: string; }; }) => {
      return getValuesForField(misc.fieldData.name, metadata?.fieldMap ?? new Map());
    },
    [metadata]
  );

  const rqbFields = useMemo(() => {
    if (!metadata?.fields) return [];
    return metadata.fields.map((field) => ({
      name: field.name,
      label: field.label,
      value: field.name,
    }));
  }, [metadata]);

  const rqbOperators = useMemo(
    () =>
      operators.map((op) => ({
        name: op.name,
        label: op.label,
        value: op.name,
      })),
    []
  );

  const rqbCombinators = useMemo(
    () =>
      combinators.map((c) => ({
        name: c.name,
        label: c.label,
        value: c.name,
      })),
    []
  );

  const builderId = useMemo(() => {
    builderCounter += 1;
    return `qb-${builderCounter}`;
  }, []);

  const resolvedEmployeeFields = useMemo(() => {
    if (employeeFields) return employeeFields;
    if (employeeDepartment) return transformEmployeeFieldsToRQB(getEmployeeFieldsForDepartment(employeeDepartment));
    return [];
  }, [employeeFields, employeeDepartment]);

  const nlqFields = useMemo(() => {
    if (!metadata?.fields) return [];
    return metadata.fields.map((field) => ({ name: field.name, label: field.label }));
  }, [metadata]);

  // Extract employee IDs from the query to pass to CustomRuleGroup
  const employeeIdsInQuery = useMemo(() => {
    const ids = new Set<string>();
    const extractEmployeeIds = (group: RuleGroupType) => {
      group.rules.forEach((rule) => {
        if (typeof rule !== "string" && "combinator" in rule) {
          extractEmployeeIds(rule);
        } else if (typeof rule !== "string" && rule.field?.startsWith("employee_")) {
          // Extract employee ID from field name like "employee_employeeId_fullName"
          const match = rule.field.match(/^employee_([^_]+)_/);
          if (match) ids.add(match[1]);
        }
      });
    };
    extractEmployeeIds(activeQuery);
    return ids;
  }, [activeQuery]);

  const rqbProps = {
    qbId: builderId,
    query: activeQuery,
    onQueryChange: handleQueryChange,
    fields: rqbFields,
    operators: rqbOperators,
    combinators: rqbCombinators,
    getValueEditorType: metadata ? getValueEditorType : undefined,
    getValues: metadata ? getValues : undefined,
    idGenerator: generateQueryId,
    showCloneButtons: false,
    showLockButtons: false,
    showNotToggle: true,
    showCombinatorsBetweenRules: false,
    resetOnFieldChange: false,
    resetOnOperatorChange: false,
    autoSelectField: true,
    controlElements: {
      removeRuleAction: RemoveRuleAction,
      removeGroupAction: RemoveGroupAction,
      addRuleAction: NullAction,
      addGroupAction: NullAction,
      ruleGroupBodyElements: CustomRuleGroupBodyElements,
      ruleGroup: CustomRuleGroup as any,
    },
    controlClassnames: {
      ruleGroup: "bg-transparent",
      rule: "bg-transparent",
      header: "bg-transparent",
      body: "bg-transparent",
    },
    // Pass employee fields and queries to custom ruleGroup
    employeeFields: resolvedEmployeeFields,
    employeeQueries,
    onEmployeeQueryChange: handleEmployeeQueryChange,
  } as QueryBuilderProps<RuleGroupType, typeof rqbFields[number], typeof rqbOperators[number], typeof rqbCombinators[number]>;

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" aria-hidden="true" />
          <span className="ml-3 text-sm text-muted-foreground">Loading query configuration...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
          <p className="text-sm font-medium text-destructive">Failed to load query configuration</p>
          <p className="mt-1 text-xs text-muted-foreground">{error.message}</p>
        </div>
      );
    }

    if (!metadata) {
      if (emptyState) {
        return emptyState;
      }
      return (
        <div className="py-12 text-center text-sm text-muted-foreground">
          No metadata available. Select an employee to configure this query.
        </div>
      );
    }

    return (
      <div className="space-y-4 bg-transparent">
        {showNLQ && (
          <NaturalLanguageQuery
            query={activeQuery}
            fields={nlqFields}
            className="mb-2"
          />
        )}
        <div className="bg-transparent rounded-xl border border-border/50 overflow-hidden">
          <QueryBuilder {...rqbProps} />
        </div>
      </div>
    );
  };

  return (
    <Card className="rounded-xl shadow-sm bg-transparent border-border/50">
      {title && (
        <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 px-5 py-4 bg-transparent">
          <div>
            <CardTitle className="text-lg font-semibold">{title}</CardTitle>
            {description && (
              <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </CardHeader>
      )}
      <CardContent className="p-5 bg-transparent">
        {renderContent()}
      </CardContent>
    </Card>
  );
}