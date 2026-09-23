export interface QueryBuilderConfig {
  fields: Array<{
    name: string;
    label: string;
    valueEditorType: "text" | "number" | "select" | "radio" | "checkbox" | "textarea" | "date";
    operators?: string[];
    options?: Array<{ label: string; value: string }>;
  }>;
  fieldMap: Map<string, { name: string; label: string; valueEditorType: string; options?: Array<{ label: string; value: string }> }>;
  defaultCombinator: "and" | "or";
}
