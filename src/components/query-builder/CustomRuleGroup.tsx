"use client";

import { useState, useMemo, useCallback, type ComponentType } from "react";
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  type LucideIcon,
} from "lucide-react";
import {
  QueryBuilder,
  RuleGroupHeaderComponents,
  type UseRuleGroup,
  type RuleGroupType,
  type RuleGroupTypeIC,
  type RuleType,
  type Path,
  type ValueEditorType,
  type QueryBuilderProps,
} from "react-querybuilder";

interface CustomRuleGroupProps extends UseRuleGroup {
  employeeFields?: Array<{
    name: string;
    label: string;
    valueEditorType: ValueEditorType;
    operators?: string[];
    options?: Array<{ label: string; value: string }>;
  }>;
  employeeQueries?: Map<string, RuleGroupType>;
  onEmployeeQueryChange?: (employeeId: string, query: RuleGroupType) => void;
  employeeId?: string;
}

const HeaderIcon = ({ icon: Icon }: { icon: LucideIcon }) => (
  <span className="inline-flex h-5 w-5 items-center justify-center">
    <Icon className="h-4 w-4" aria-hidden="true" />
  </span>
);

function isRuleType(rule: RuleType | RuleGroupType | RuleGroupTypeIC | string): rule is RuleType {
  return typeof rule !== "string" && !("combinator" in rule);
}

function hasEmployeeFields(ruleGroup: RuleGroupType | RuleGroupTypeIC, employeeFields?: Array<any>): boolean {
  if (employeeFields && employeeFields.length > 0) {
    return true;
  }
  return ruleGroup.rules.some(
    (rule) =>
      isRuleType(rule) &&
      rule.field &&
      (rule.field.startsWith("employee_") ||
        ["fullName", "email", "salary", "hireDate", "level", "specialty", "quota", "isActive"].includes(rule.field))
  );
}

const ControlButton = ({ 
  children, 
  className = "", 
  onClick, 
  disabled = false,
  variant = "default",
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "default" | "destructive" }) => {
  const baseStyles = "inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors";
  const variants = {
    default: "bg-primary/10 text-primary hover:bg-primary/20",
    destructive: "bg-destructive/10 text-destructive hover:bg-destructive/20",
  };
  
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

const SelectTrigger = ({ 
  value, 
  onChange, 
  children,
  className = "",
  ...props 
}: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select
    value={value}
    onChange={onChange}
    className={`bg-primary/10 text-primary border border-primary/20 rounded-lg px-2 py-1 text-xs font-medium ${className}`}
    {...props}
  >
    {children}
  </select>
);

export const CustomRuleGroup: ComponentType<CustomRuleGroupProps> = (props) => {
  const {
    ruleGroup,
    path,
    schema,
    classNames,
    translations,
    addRule,
    addGroup,
    removeGroup,
    cloneGroup,
    ungroup,
    shiftGroupUp,
    shiftGroupDown,
    shiftUpDisabled,
    shiftDownDisabled,
    disabled,
    onCombinatorChange,
    onNotToggleChange,
    employeeFields,
    employeeQueries,
    onEmployeeQueryChange,
    employeeId,
    ...rest
  } = props;

  const isRootGroup = path.length === 0;
  const isEmployee = hasEmployeeFields(ruleGroup, employeeFields);
  const showEmployeeQuery = isEmployee && employeeFields && employeeFields.length > 0;
  const currentCombinator = "combinator" in ruleGroup && ruleGroup.combinator ? ruleGroup.combinator : "and";
  const isDisabled = disabled ?? false;
  const shiftUpDisabledFinal = shiftUpDisabled ?? false;
  const shiftDownDisabledFinal = shiftDownDisabled ?? false;

  // Check if this group represents a specific employee
  const groupEmployeeId = employeeId || (path.length === 1 ? String(path[0]) : null);

  const ruleGroupClassName = [
    "rounded-xl",
    "border",
    "bg-transparent",
    "shadow-sm",
    "overflow-hidden",
  ]
    .filter(Boolean)
    .join(" ");

  const headerClassName = [
    "flex",
    "items-center",
    "justify-between",
    "gap-3",
    "px-4",
    "py-3",
    "bg-gradient-to-r",
    "from-primary/5",
    "to-primary/10",
    "border-b",
    "border-border/50",
    "rounded-t-xl",
  ]
    .filter(Boolean)
    .join(" ");

  const bodyClassName = [
    classNames?.body,
    "p-4",
  ]
    .filter(Boolean)
    .join(" ");

  const mergedClassNames = useMemo(() => ({
    ...classNames,
    header: headerClassName,
    body: bodyClassName,
    ruleGroup: ruleGroupClassName,
    undoRedoActions: classNames?.undoRedoActions ?? "flex items-center gap-1",
    undoAction: classNames?.undoAction ?? "",
    redoAction: classNames?.redoAction ?? "",
    shiftActions: classNames?.shiftActions ?? "flex items-center gap-1",
    dragHandle: classNames?.dragHandle ?? "inline-flex h-7 w-7 cursor-grab items-center justify-center rounded-md text-muted-foreground/50 hover:text-muted-foreground",
    combinators: classNames?.combinators ?? "rounded-md",
    notToggle: classNames?.notToggle ?? "rounded-md",
    addRule: classNames?.addRule ?? "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
    addGroup: classNames?.addGroup ?? "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
    cloneGroup: classNames?.cloneGroup ?? "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
    ungroup: classNames?.ungroup ?? "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
    lockGroup: classNames?.lockGroup ?? "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
    muteGroup: classNames?.muteGroup ?? "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
    removeGroup: classNames?.removeGroup ?? "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
  }), [classNames]);

  return (
    <div
      className={ruleGroupClassName}
      data-testid="rule-group"
      data-path={JSON.stringify(path)}
    >
      <div className={headerClassName}>
        <div className="flex items-center gap-3">
          <div
            className={`
              flex h-8 w-8 shrink-0 items-center justify-center rounded-lg
              ${isEmployee ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}
            `}
          >
            <HeaderIcon icon={ChevronDown} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">
              {isEmployee ? `Employee: ${groupEmployeeId ?? "Unknown"}` : `Group (${currentCombinator.toUpperCase()})`}
            </span>
            {/* Combinator selector for non-root groups */}
            {!isRootGroup && (
              <SelectTrigger
                value={currentCombinator}
                onChange={(e) => onCombinatorChange?.(e.target.value)}
                disabled={isDisabled}
              >
                <option value="and">AND</option>
                <option value="or">OR</option>
              </SelectTrigger>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {/* Shift actions for non-root groups */}
          {!isRootGroup && schema.showShiftActions && (
            <div className="flex items-center gap-1">
              <ControlButton
                onClick={shiftGroupUp}
                disabled={shiftUpDisabledFinal || isDisabled}
                aria-label="Move group up"
                variant="default"
              >
                <ChevronUp className="h-4 w-4" />
              </ControlButton>
              <ControlButton
                onClick={shiftGroupDown}
                disabled={shiftDownDisabledFinal || isDisabled}
                aria-label="Move group down"
                variant="default"
              >
                <ChevronDown className="h-4 w-4" />
              </ControlButton>
            </div>
          )}

          {/* Main controls: Add Rule, Add Group, Delete */}
          <div className="flex items-center gap-2">
            <ControlButton
              onClick={addRule}
              disabled={isDisabled}
              aria-label="Add Rule"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Add Rule</span>
            </ControlButton>
            <ControlButton
              onClick={addGroup}
              disabled={isDisabled || (schema.maxLevels ?? Infinity) <= path.length}
              aria-label="Add Group"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Add Group</span>
            </ControlButton>
            {!isRootGroup && (
              <ControlButton
                onClick={removeGroup}
                disabled={isDisabled}
                aria-label="Delete Group"
                variant="destructive"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              </ControlButton>
            )}
          </div>
        </div>
      </div>

      <div className={bodyClassName}>
        {/* Filter out custom props before passing to RuleGroupHeaderComponents */}
        {(() => {
          const { employeeFields, employeeQueries, onEmployeeQueryChange, employeeId, ...ruleGroupProps } = props;
          return <RuleGroupHeaderComponents {...ruleGroupProps} classNames={mergedClassNames} />;
        })()}

        {showEmployeeQuery && groupEmployeeId && (
          <div className="mt-4 pt-4 border-t border-border/50 rounded-lg bg-muted/30">
            <div className="flex items-center gap-2 px-2 py-2 bg-primary/5 rounded-lg border border-primary/20 mb-3">
              <span className="text-xs font-medium text-primary">Employee Query: {groupEmployeeId}</span>
              <span className="text-xs text-muted-foreground">(Independent query builder)</span>
            </div>
            <EmployeeQueryBuilder
              employeeFields={employeeFields}
              employeeId={groupEmployeeId}
              initialQuery={employeeQueries?.get(groupEmployeeId) ?? {
                id: `employee-${groupEmployeeId}`,
                combinator: "and",
                rules: [],
                not: false,
              }}
              onQueryChange={(query) => onEmployeeQueryChange?.(groupEmployeeId!, query)}
              disabled={isDisabled}
            />
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Secondary QueryBuilder for employee-specific queries.
 * Renders a fully functional QueryBuilder with employee-specific fields.
 */
function EmployeeQueryBuilder({
  employeeFields,
  employeeId,
  initialQuery,
  onQueryChange,
  disabled,
}: {
  employeeFields: Array<{
    name: string;
    label: string;
    valueEditorType: ValueEditorType;
    operators?: string[];
    options?: Array<{ label: string; value: string }>;
  }>;
  employeeId: string;
  initialQuery: RuleGroupType;
  onQueryChange: (query: RuleGroupType) => void;
  disabled: boolean;
}) {
  const [localQuery, setLocalQuery] = useState<RuleGroupType>(initialQuery);

  const handleChange = useCallback((query: RuleGroupType) => {
    setLocalQuery(query);
    onQueryChange(query);
  }, [onQueryChange]);

  const rqbFields = useMemo(
    () =>
      employeeFields.map((field) => ({
        name: field.name,
        label: field.label,
        value: field.name,
        valueEditorType: field.valueEditorType,
        operators: field.operators,
        options: field.options,
      })),
    [employeeFields]
  );

  const rqbOperators = useMemo(
    () => [
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
    ],
    []
  );

  const rqbCombinators = useMemo(
    () => [
      { name: "and", value: "and", label: "AND" },
      { name: "or", value: "or", label: "OR" },
    ],
    []
  );

  const builderId = `employee-qb-${employeeId}`;

  const rqbProps: QueryBuilderProps<RuleGroupType, typeof rqbFields[number], typeof rqbOperators[number], typeof rqbCombinators[number]> = {
    qbId: builderId,
    query: localQuery,
    onQueryChange: handleChange,
    fields: rqbFields,
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
    controlElements: {
      ruleGroup: CustomRuleGroup as any,
    },
    controlClassnames: {
      ruleGroup: "bg-transparent",
      rule: "bg-transparent",
      header: "bg-transparent",
      body: "bg-transparent",
    },
  };

  return (
    <div className="bg-transparent rounded-lg border border-border/50 overflow-hidden">
      <QueryBuilder {...rqbProps} />
    </div>
  );
}