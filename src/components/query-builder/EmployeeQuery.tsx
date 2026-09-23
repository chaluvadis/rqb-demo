"use client";

import { useMemo } from "react";
import type { RuleGroupType } from "react-querybuilder";
import { CustomQueryBuilder } from "./CustomQueryBuilder";
import type { QueryBuilderConfig } from "@/lib/query-builder/types";
import { transformMetadata, getDefaultQueryForMetadata } from "@/lib/query-builder/metadata";

export interface EmployeeQueryProps {
  employeeId: string | null;
  metadata: {
    employeeId: string;
    employeeName: string;
    department: string;
    fields: Array<{
      name: string;
      label: string;
      type: string;
      operators?: string[];
      options?: Array<{ label: string; value: string }>;
    }>;
  } | null;
  isLoading: boolean;
  error: Error | null;
  onQueryChange: (query: RuleGroupType) => void;
  query: RuleGroupType | undefined;
}

export function EmployeeQuery({
  employeeId,
  metadata,
  isLoading,
  error,
  onQueryChange,
  query,
}: EmployeeQueryProps) {
  const config: QueryBuilderConfig | null = useMemo(() => {
    if (!metadata) return null;
    return transformMetadata({
      fields: metadata.fields as Array<{
        name: string;
        label: string;
        type: "string" | "number" | "boolean" | "date" | "select";
        operators?: string[];
        options?: Array<{ label: string; value: string }>;
      }>,
      defaultCombinator: "and",
    });
  }, [metadata]);

  const defaultQuery: RuleGroupType | null = useMemo(() => {
    if (!metadata) return null;
    return getDefaultQueryForMetadata({
      fields: metadata.fields as Array<{
        name: string;
        label: string;
        type: "string" | "number" | "boolean" | "date" | "select";
        operators?: string[];
        options?: Array<{ label: string; value: string }>;
      }>,
      defaultCombinator: "and",
    }) as RuleGroupType;
  }, [metadata]);

  const description = useMemo(() => {
    if (isLoading) return "Loading employee query...";
    if (error) return "Error loading employee query";
    if (!employeeId) return "No employee selected";
    if (metadata) return `Query for ${metadata.employeeName} (${metadata.department})`;
    return "";
  }, [employeeId, metadata, isLoading, error]);

  return (
    <CustomQueryBuilder
      title="Employee Query"
      description={description}
      metadata={config}
      defaultQuery={defaultQuery}
      query={query}
      onQueryChange={onQueryChange}
      isLoading={isLoading}
      error={error}
      emptyState={
        <div className="py-12 text-center text-sm text-muted-foreground">
          Select an employee from the sidebar to build an employee-specific query.
        </div>
      }
    />
  );
}
