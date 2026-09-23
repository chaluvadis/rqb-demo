import type { RuleGroupType } from "react-querybuilder";

const defaultOperators = [
  { name: "=", label: "= Equal" },
  { name: "!=", label: "≠ Not equal" },
  { name: "<", label: "< Less than" },
  { name: ">", label: "> Greater than" },
  { name: "<=", label: "≤ Less or equal" },
  { name: ">=", label: "≥ Greater or equal" },
  { name: "contains", label: "∋ Contains" },
  { name: "beginsWith", label: "↖ Begins with" },
  { name: "endsWith", label: "↘ Ends with" },
  { name: "doesNotContain", label: "∌ Does not contain" },
  { name: "doesNotBeginWith", label: "↖ Does not begin with" },
  { name: "doesNotEndWith", label: "↘ Does not end with" },
  { name: "null", label: "∅ Is null" },
  { name: "notNull", label: "◊ Is not null" },
  { name: "in", label: "∈ In" },
  { name: "notIn", label: "∉ Not in" },
  { name: "between", label: "⇔ Between" },
  { name: "notBetween", label: "⇎ Not between" },
];

export const operators = defaultOperators;

export const combinators = [
  { name: "and", label: "AND" },
  { name: "or", label: "OR" },
];

let buildQueryCounter = 0;

export function generateQueryId() {
  buildQueryCounter += 1;
  return `id-${buildQueryCounter}`;
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
