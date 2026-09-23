import type { QueryMetadataResponse, QueryFieldMetadata } from "@/types/api";

const fieldTypeToValueEditorType: Record<
  QueryFieldMetadata["type"],
  "text" | "number" | "select" | "radio" | "checkbox" | "textarea" | "date"
> = {
  string: "text",
  number: "number",
  boolean: "checkbox",
  date: "date",
  select: "select",
};

function mapMetadataToFields(fields: QueryFieldMetadata[]) {
  return fields.map((field) => ({
    name: field.name,
    label: field.label,
    value: field.name,
    valueEditorType: fieldTypeToValueEditorType[field.type] as
      | "text"
      | "number"
      | "select"
      | "radio"
      | "checkbox"
      | "textarea"
      | "date",
    operators: field.operators,
    options: field.options,
  }));
}

export function transformMetadata(metadata: QueryMetadataResponse) {
  const fields = mapMetadataToFields(metadata.fields);

  const fieldMap = new Map<string, (typeof fields)[number]>();
  fields.forEach((field) => fieldMap.set(field.name, field));

  const defaultCombinator = metadata.defaultCombinator ?? "and";

  return {
    fields,
    fieldMap,
    operators: metadata.fields.flatMap((f) => f.operators ?? []),
    combinators: ["and", "or"] as const,
    defaultCombinator,
  };
}

export function getDefaultQueryForMetadata(metadata: QueryMetadataResponse) {
  const combinator = metadata.defaultCombinator ?? "and";
  return {
    id: crypto.randomUUID(),
    combinator,
    rules: [
      {
        field: "",
        operator: "=",
        value: "",
        id: crypto.randomUUID(),
      },
    ],
    not: false,
  };
}

export function getValueEditorTypeForField(
  fieldName: string,
  fieldMap: Map<string, { valueEditorType: string }>
): "text" | "number" | "select" | "radio" | "checkbox" | "textarea" | "date" {
  const field = fieldMap.get(fieldName);
  if (!field) return "text";
  return field.valueEditorType as "text" | "number" | "select" | "radio" | "checkbox" | "textarea" | "date";
}

export function getValuesForField(
  fieldName: string,
  fieldMap: Map<string, { options?: Array<{ label: string; value: string }> }>
): Array<{ label: string; value: string }> {
  const field = fieldMap.get(fieldName);
  return field?.options ?? [];
}
