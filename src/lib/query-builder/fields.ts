import type { QueryFieldMetadata } from "@/types/api";
import type { RuleGroupType } from "react-querybuilder";

const defaultOperators = [
  { name: "=", label: "=" },
  { name: "!=", label: "!=" },
  { name: "<", label: "<" },
  { name: ">", label: ">" },
  { name: "<=", label: "<=" },
  { name: ">=", label: ">=" },
  { name: "contains", label: "contains" },
  { name: "beginsWith", label: "begins with" },
  { name: "endsWith", label: "ends with" },
  { name: "doesNotContain", label: "does not contain" },
  { name: "doesNotBeginWith", label: "does not begin with" },
  { name: "doesNotEndWith", label: "does not end with" },
  { name: "null", label: "is null" },
  { name: "notNull", label: "is not null" },
  { name: "in", label: "in" },
  { name: "notIn", label: "not in" },
  { name: "between", label: "between" },
  { name: "notBetween", label: "not between" },
];

export const operators = defaultOperators;

export const combinators = [
  { name: "and", label: "AND" },
  { name: "or", label: "OR" },
];

let buildQueryCounter = 0;

export function generateQueryId() {
  buildQueryCounter += 1;
  return `id-${buildQueryCounter}-${Date.now().toString(36)}`;
}

export function buildDefaultQuery(combinator: "and" | "or" = "and"): RuleGroupType {
  const id = generateQueryId();
  return {
    id,
    combinator,
    rules: [
      {
        field: "",
        operator: "=",
        value: "",
        id: generateQueryId(),
      },
    ],
    not: false,
  };
}
