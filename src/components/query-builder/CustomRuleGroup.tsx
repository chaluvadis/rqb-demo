"use client";

import { useMemo, useState, useCallback, type ComponentType } from "react";
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
  type QueryBuilderProps,
  type ValueEditorType,
} from "react-querybuilder";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

const TriggerButton = ({ children, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    type="button"
    className={`inline-flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${className ?? ""}`}
    {...props}
  >
    {children}
  </button>
);

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
    controlClassnames: {
      ruleGroup: "bg-transparent",
      rule: "bg-transparent",
      header: "bg-transparent",
      body: "bg-transparent",
    },
  };

  return (
    <div className="mt-4 pt-4 border-t border-border/50 rounded-lg bg-muted/30">
      <div className="flex items-center justify-between mb-3 px-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-primary">Employee Query: {employeeId}</span>
          <span className="text-xs text-muted-foreground">(Independent query builder)</span>
        </div>
      </div>
      <div className="bg-transparent rounded-lg border border-border/50 overflow-hidden">
        <QueryBuilder {...rqbProps} />
      </div>
    </div>
  );
}

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

  // Check if this group represents a specific employee (by ID in path or group ID)
  const groupEmployeeId = employeeId || (path.length === 1 ? String(path[0]) : null);
  const hasEmployeeQueryInstance = groupEmployeeId && employeeQueries?.has(groupEmployeeId);

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
    classNames?.header,
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
            {!isRootGroup && !isEmployee && (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger render={(triggerProps: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
                    <TriggerButton {...triggerProps} aria-label="Group actions">
                      <HeaderIcon icon={ChevronDown} />
                    </TriggerButton>
                  )}>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem
                        onClick={addGroup}
                        disabled={isDisabled || (schema.maxLevels ?? Infinity) <= path.length}
                        className="flex items-center gap-2 text-sm"
                      >
                        <HeaderIcon icon={Plus} />
                        Add Group
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={cloneGroup}
                        disabled={isDisabled || !schema.showCloneButtons}
                        className="flex items-center gap-2 text-sm"
                      >
                        <HeaderIcon icon={Plus} />
                        Clone Group
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={ungroup}
                        disabled={isDisabled || !schema.showUngroupButtons}
                        className="flex items-center gap-2 text-sm"
                      >
                        <HeaderIcon icon={ChevronUp} />
                        Ungroup
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={removeGroup}
                        disabled={isDisabled}
                        className="flex items-center gap-2 text-sm text-destructive focus:text-destructive"
                      >
                        <HeaderIcon icon={Trash2} />
                        Delete Group
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenuTrigger>
                </DropdownMenu>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {!isRootGroup && schema.showShiftActions && (
            <div className="flex items-center gap-1">
              <TriggerButton
                onClick={shiftGroupUp}
                disabled={shiftUpDisabledFinal || isDisabled}
                aria-label="Move group up"
              >
                <ChevronUp className="h-4 w-4" />
              </TriggerButton>
              <TriggerButton
                onClick={shiftGroupDown}
                disabled={shiftDownDisabledFinal || isDisabled}
                aria-label="Move group down"
              >
                <ChevronDown className="h-4 w-4" />
              </TriggerButton>
            </div>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger render={(triggerProps: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
              <TriggerButton {...triggerProps} aria-label="Group actions">
                <HeaderIcon icon={ChevronDown} />
              </TriggerButton>
            )}>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuItem
                  onClick={addRule}
                  disabled={isDisabled}
                  className="flex items-center gap-2 text-sm"
                >
                  <HeaderIcon icon={Plus} />
                  Add Rule
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={addGroup}
                  disabled={isDisabled || (schema.maxLevels ?? Infinity) <= path.length}
                  className="flex items-center gap-2 text-sm"
                >
                  <HeaderIcon icon={Plus} />
                  Add Group
                </DropdownMenuItem>
                {!isRootGroup && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={cloneGroup}
                      disabled={isDisabled || !schema.showCloneButtons}
                      className="flex items-center gap-2 text-sm"
                    >
                      <HeaderIcon icon={Plus} />
                      Clone Group
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={ungroup}
                      disabled={isDisabled || !schema.showUngroupButtons}
                      className="flex items-center gap-2 text-sm"
                    >
                      <HeaderIcon icon={ChevronUp} />
                      Ungroup
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={removeGroup}
                  disabled={isDisabled || isRootGroup}
                  className="flex items-center gap-2 text-sm text-destructive focus:text-destructive"
                >
                  <HeaderIcon icon={Trash2} />
                  {isRootGroup ? "Cannot Delete Root" : "Delete Group"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenuTrigger>
          </DropdownMenu>
        </div>
      </div>

      <div className={bodyClassName}>
        {/* Filter out custom props before passing to RuleGroupHeaderComponents */}
        {(() => {
          const { employeeFields, employeeQueries, onEmployeeQueryChange, employeeId, ...ruleGroupProps } = props;
          return <RuleGroupHeaderComponents {...ruleGroupProps} classNames={mergedClassNames} />;
        })()}

        {showEmployeeQuery && groupEmployeeId && (
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
        )}
      </div>
    </div>
  );
};