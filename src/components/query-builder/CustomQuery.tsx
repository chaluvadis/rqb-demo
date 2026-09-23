"use client";

import { useMemo } from "react";
import type { RuleGroupType } from "react-querybuilder";
import { CustomQueryBuilder } from "./CustomQueryBuilder";
import type { QueryBuilderConfig } from "@/lib/query-builder/types";
import { Button } from "@/components/ui/button";

export interface CustomQueryProps {
  id: string;
  title: string;
  config: QueryBuilderConfig;
  defaultQuery: RuleGroupType;
  query: RuleGroupType;
  onQueryChange: (query: RuleGroupType) => void;
  onRemove: () => void;
}

export function CustomQuery({
  id,
  title,
  config,
  defaultQuery,
  query,
  onQueryChange,
  onRemove,
}: CustomQueryProps) {
  const actions = useMemo(
    () => (
      <Button
        variant="destructive"
        size="sm"
        onClick={onRemove}
      >
        Remove
      </Button>
    ),
    [onRemove]
  );

  return (
    <CustomQueryBuilder
      key={id}
      title={title}
      metadata={config}
      defaultQuery={defaultQuery}
      query={query}
      onQueryChange={onQueryChange}
      actions={actions}
    />
  );
}
