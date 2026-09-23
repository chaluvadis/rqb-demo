"use client";

import { useMemo } from "react";
import type { RuleGroupType } from "react-querybuilder";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomQueryBuilder } from "./CustomQueryBuilder";
import type { QueryBuilderConfig } from "@/lib/query-builder/types";
import { transformMetadata, getDefaultQueryForMetadata } from "@/lib/query-builder/metadata";

export interface DepartmentQueryProps {
  metadata: {
    departmentId: string;
    departmentName: string;
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
  query: RuleGroupType;
}

export function DepartmentQuery({
  metadata,
  isLoading,
  error,
  onQueryChange,
  query,
}: DepartmentQueryProps) {
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

  return (
    <CustomQueryBuilder
      title="Department Query"
      description={`Query for ${metadata?.departmentName ?? "Department"} (ID: ${metadata?.departmentId ?? "..."})`}
      metadata={config}
      defaultQuery={defaultQuery}
      query={query}
      onQueryChange={onQueryChange}
      isLoading={isLoading}
      error={error}
    />
  );
}
