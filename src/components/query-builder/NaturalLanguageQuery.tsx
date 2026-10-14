"use client";

import { useMemo } from "react";
import type { RuleGroupType, RuleType } from "react-querybuilder";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NaturalLanguageQueryProps {
  query: RuleGroupType;
  fields: Array<{ name: string; label: string }>;
  className?: string;
  onCopy?: (text: string) => void;
}

const operatorLabels: Record<string, string> = {
  "=": "equals",
  "!=": "does not equal",
  "<": "is less than",
  ">": "is greater than",
  "<=": "is less than or equal to",
  ">=": "is greater than or equal to",
  contains: "contains",
  beginsWith: "begins with",
  endsWith: "ends with",
  doesNotContain: "does not contain",
  doesNotBeginWith: "does not begin with",
  doesNotEndWith: "does not end with",
  null: "is empty",
  notNull: "is not empty",
  in: "is one of",
  notIn: "is not one of",
  between: "is between",
  notBetween: "is not between",
};

const combinatorLabels: Record<string, string> = {
  and: "AND",
  or: "OR",
};

function getFieldLabel(fieldName: string, fields: Array<{ name: string; label: string }>): string {
  const field = fields.find((f) => f.name === fieldName);
  return field?.label || fieldName;
}

function formatValue(operator: string, value: any): string {
  if (operator === "null" || operator === "notNull") {
    return "";
  }
  if (Array.isArray(value)) {
    return value.map((v) => `"${v}"`).join(", ");
  }
  if (typeof value === "string") {
    return `"${value}"`;
  }
  return String(value);
}

function ruleToNaturalLanguage(rule: RuleType, fields: Array<{ name: string; label: string }>): string {
  if (typeof rule === "string") {
    return "";
  }

  const fieldLabel = getFieldLabel(rule.field, fields);
  const operatorLabel = operatorLabels[rule.operator] || rule.operator;
  const valueStr = formatValue(rule.operator, rule.value);

  if (operatorLabel === "is empty") {
    return `${fieldLabel} is empty`;
  }
  if (operatorLabel === "is not empty") {
    return `${fieldLabel} is not empty`;
  }
  if (["is one of", "is not one of"].includes(operatorLabel)) {
    return `${fieldLabel} ${operatorLabel} [${valueStr}]`;
  }
  if (["is between", "is not between"].includes(operatorLabel) && Array.isArray(rule.value)) {
    return `${fieldLabel} ${operatorLabel} ${rule.value[0]} and ${rule.value[1]}`;
  }

  return `${fieldLabel} ${operatorLabel} ${valueStr}`;
}

function groupToNaturalLanguage(group: RuleGroupType, fields: Array<{ name: string; label: string }>, depth = 0): string {
  if (!group.rules || group.rules.length === 0) {
    return "";
  }

  const combinator = combinatorLabels[group.combinator] || group.combinator;
  const notPrefix = group.not ? "NOT (" : "";
  const notSuffix = group.not ? ")" : "";

  const ruleStrings = group.rules
    .map((rule) => {
      if (typeof rule === "string") return "";
      if ("combinator" in rule) {
        return groupToNaturalLanguage(rule as RuleGroupType, fields, depth + 1);
      }
      return ruleToNaturalLanguage(rule, fields);
    })
    .filter(Boolean);

  if (ruleStrings.length === 0) return "";

  const joiner = ` ${combinator} `;
  const joined = ruleStrings.join(joiner);

  if (depth > 0) {
    return `${notPrefix}(${joined})${notSuffix}`;
  }

  return `${notPrefix}${joined}${notSuffix}`;
}

export function NaturalLanguageQuery({
  query,
  fields,
  className = "",
  onCopy,
}: NaturalLanguageQueryProps) {
  const naturalLanguage = useMemo(() => {
    if (!query || !query.rules || query.rules.length === 0) {
      return "No query defined. Add rules to build a query.";
    }
    return groupToNaturalLanguage(query, fields);
  }, [query, fields]);

  const handleCopy = () => {
    if (onCopy) {
      onCopy(naturalLanguage);
    } else {
      navigator.clipboard.writeText(naturalLanguage);
    }
  };

  const isEmpty = useMemo(() => {
    if (!query || !query.rules) return true;
    return query.rules.every((rule) => {
      if (typeof rule === "string") return true;
      if ("combinator" in rule) return false;
      return !rule.field || rule.field === "";
    });
  }, [query]);

  return (
    <Card
      className={`
        bg-gradient-to-br from-primary/5 via-background to-background
        border-primary/20 shadow-sm
        ${className}
      `}
    >
      <CardContent className="pt-4 pb-4 px-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center gap-1.5 text-sm">
                <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
                <span className="font-semibold text-foreground">Natural Language Query</span>
                {isEmpty && (
                  <Badge variant="secondary" className="text-xs">
                    Empty
                  </Badge>
                )}
              </div>
            </div>
            <div
              className={`
                p-4 rounded-lg border transition-colors
                ${isEmpty
                  ? "bg-muted/50 border-dashed border-muted-foreground/30 text-muted-foreground"
                  : "bg-background border-border text-foreground"
                }
                font-mono text-sm leading-relaxed min-h-[60px] max-h-[200px] overflow-y-auto
              `}
            >
              {isEmpty ? (
                <span className="italic text-center block py-8">
                  Add rules to the query builder to see the natural language translation here.
                </span>
              ) : (
                <span className="whitespace-pre-wrap break-words">{naturalLanguage}</span>
              )}
            </div>
          </div>

          {!isEmpty && (
            <div className="flex flex-col gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="gap-1.5"
                aria-label="Copy natural language query"
              >
                <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">Copy</span>
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}