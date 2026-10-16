import React from "react";
import { RuleGroupProps, RuleGroupType, RuleType, Path, ValueEditorType, QueryBuilderProps, QueryBuilder } from "react-querybuilder";
import { Plus, Layers, Trash2 } from "lucide-react";

interface CustomRuleGroupProps extends RuleGroupProps {
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
  // Explicitly add properties from RuleGroupProps that we use
  addRule?: () => void;
  addGroup?: () => void;
  removeGroup?: () => void;
  onCombinatorChange?: (value: string) => void;
  onNotChange?: (value: boolean) => void;
  controls?: {
    ruleGroup: (props: CustomRuleGroupProps) => React.ReactNode;
    rule: (props: any) => React.ReactNode;
    // Action functions might be in controls
    addRule?: () => void;
    addGroup?: () => void;
    removeGroup?: () => void;
    onCombinatorChange?: (value: string) => void;
    onNotChange?: (value: boolean) => void;
  };
}

function hasEmployeeFields(ruleGroup: RuleGroupType | { rules: any[]; combinator?: string; not?: boolean }, employeeFields?: Array<any>): boolean {
  if (employeeFields && employeeFields.length > 0) {
    return true;
  }
  return ruleGroup.rules.some(
    (rule) =>
      typeof rule !== "string" &&
      "combinator" in rule === false &&
      rule.field &&
      (rule.field.startsWith("employee_") ||
        ["fullName", "email", "salary", "hireDate", "level", "specialty", "quota", "isActive"].includes(rule.field))
  );
}

export const CustomRuleGroup: React.FC<CustomRuleGroupProps> = (props) => {
  const {
    path,
    rules,
    combinator,
    not,
    addRule,
    addGroup,
    removeGroup,
    onCombinatorChange,
    onNotChange,
    controls,
    disabled,
    employeeFields,
    employeeQueries,
    onEmployeeQueryChange,
    employeeId,
    ...rest
  } = props;

  // Debug: Log all props and controls to understand what's available
  React.useEffect(() => {
    console.log('CustomRuleGroup ALL PROPS:', Object.keys(props));
    console.log('CustomRuleGroup controls:', controls ? Object.keys(controls) : 'none');
    console.log('CustomRuleGroup addRule:', typeof addRule);
    console.log('CustomRuleGroup addGroup:', typeof addGroup);
    console.log('CustomRuleGroup removeGroup:', typeof removeGroup);
    console.log('CustomRuleGroup onCombinatorChange:', typeof onCombinatorChange);
    console.log('CustomRuleGroup onNotChange:', typeof onNotChange);
    console.log('CustomRuleGroup controls.ruleGroup:', typeof controls?.ruleGroup);
    console.log('CustomRuleGroup controls.rule:', typeof controls?.rule);
    console.log('CustomRuleGroup controls.addRule:', typeof controls?.addRule);
    console.log('CustomRuleGroup controls.addGroup:', typeof controls?.addGroup);
    console.log('CustomRuleGroup controls.removeGroup:', typeof controls?.removeGroup);
    console.log('CustomRuleGroup controls.onCombinatorChange:', typeof controls?.onCombinatorChange);
    console.log('CustomRuleGroup controls.onNotChange:', typeof controls?.onNotChange);
  }, [props]);

  const ruleGroupObj = props.ruleGroup ?? { rules: [], combinator: "and" as const, not: false } as RuleGroupType;
  const pathArray = path ?? [];
  const isRootGroup = pathArray.length === 0;
  const isEmployee = hasEmployeeFields(ruleGroupObj, employeeFields);
  const showEmployeeQuery = isEmployee && employeeFields && employeeFields.length > 0;
  const currentCombinator = combinator ?? "and";
  const isDisabled = disabled ?? false;

  // Check if this group represents a specific employee
  const groupEmployeeId = employeeId || (pathArray.length === 1 ? String(pathArray[0]) : null);

  // Try to get action functions from controls object
  const controlsAddRule = controls?.addRule;
  const controlsAddGroup = controls?.addGroup;
  const controlsRemoveGroup = controls?.removeGroup;
  const controlsOnCombinatorChange = controls?.onCombinatorChange;
  const controlsOnNotChange = controls?.onNotChange;

  const handleAddRule = () => {
    console.log('Add Rule clicked', { addRule: typeof addRule, controlsAddRule: typeof controlsAddRule });
    if (typeof addRule === 'function') {
      addRule();
    } else if (typeof controlsAddRule === 'function') {
      controlsAddRule();
    } else {
      console.error('addRule is not a function anywhere');
    }
  };

  const handleAddGroup = () => {
    console.log('Add Group clicked', { addGroup: typeof addGroup, controlsAddGroup: typeof controlsAddGroup });
    if (typeof addGroup === 'function') {
      addGroup();
    } else if (typeof controlsAddGroup === 'function') {
      controlsAddGroup();
    } else {
      console.error('addGroup is not a function anywhere');
    }
  };

  const handleRemoveGroup = () => {
    console.log('Remove Group clicked', { removeGroup: typeof removeGroup, controlsRemoveGroup: typeof controlsRemoveGroup });
    if (typeof removeGroup === 'function') {
      removeGroup();
    } else if (typeof controlsRemoveGroup === 'function') {
      controlsRemoveGroup();
    } else {
      console.error('removeGroup is not a function anywhere');
    }
  };

  const handleCombinatorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (typeof onCombinatorChange === 'function') {
      onCombinatorChange(e.target.value);
    } else if (typeof controlsOnCombinatorChange === 'function') {
      controlsOnCombinatorChange(e.target.value);
    }
  };

  const handleNotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (typeof onNotChange === 'function') {
      onNotChange(e.target.checked);
    } else if (typeof controlsOnNotChange === 'function') {
      controlsOnNotChange(e.target.checked);
    }
  };

  return (
    <div className="query-group-container mb-4 rounded-xl overflow-hidden border border-border bg-transparent shadow-sm">
      
      {/* MODERN GRADIENT HEADER */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 px-5 py-3.5 flex items-center justify-between">
        
        {/* Left Side - Group Info */}
        <div className="flex items-center gap-3">
          <Layers className="w-4 h-4 text-white/80" />
          <span className="font-semibold text-white text-sm">
            {isEmployee ? `Employee: ${groupEmployeeId ?? "Unknown"}` : `Group (${currentCombinator.toUpperCase()})`}
          </span>
          
          {/* Combinator Selector */}
          {!isRootGroup && (
            <select
              value={currentCombinator}
              onChange={handleCombinatorChange}
              disabled={isDisabled}
              className="bg-white/20 text-white border border-white/30 rounded-md px-2.5 py-1 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-white/50 disabled:opacity-50 cursor-pointer"
            >
              <option value="and" className="text-gray-900">AND</option>
              <option value="or" className="text-gray-900">OR</option>
            </select>
          )}

          {/* NOT Toggle */}
          {!isRootGroup && (
            <label className="flex items-center gap-1.5 text-xs text-white/90 cursor-pointer">
              <input
                type="checkbox"
                checked={not}
                onChange={handleNotChange}
                disabled={isDisabled}
                className="w-3.5 h-3.5 rounded border-white/30 text-indigo-600 focus:ring-white/50 disabled:opacity-50"
              />
              <span>Not</span>
            </label>
          )}
        </div>

        {/* Right Side - Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAddRule}
            disabled={isDisabled}
            className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 active:bg-white/40 text-white px-3.5 py-1.5 rounded-md text-xs font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm border border-white/20"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Rule
          </button>
          
          <button
            type="button"
            onClick={handleAddGroup}
            disabled={isDisabled}
            className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 active:bg-white/40 text-white px-3.5 py-1.5 rounded-md text-xs font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm border border-white/20"
          >
            <Layers className="w-3.5 h-3.5" />
            Add Group
          </button>

          {!isRootGroup && (
            <button
              type="button"
              onClick={handleRemoveGroup}
              disabled={isDisabled}
              className="bg-red-500/80 hover:bg-red-500 active:bg-red-600 text-white p-1.5 rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm border border-red-400/30"
              title="Delete Group"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* BODY - Rules Container */}
      <div className="p-4 bg-gradient-to-b from-gray-50/50 to-white min-h-[80px]">
        {(!rules || rules.length === 0) ? (
          <div className="text-center py-6">
            <p className="text-muted-foreground text-sm">
              No rules yet. Click "Add Rule" or "Add Group" to start.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {rules.map((rule, index) => {
              const rulePath = [...pathArray, index];
              
              if (typeof rule === "string") return null;
              
              if ("combinator" in rule) {
                // Nested Group - pass all props including addRule, addGroup, etc.
                return (
                  <div key={rule.id} className="ml-4 pl-4 border-l-2 border-indigo-200">
                    {controls?.ruleGroup({
                      ...rest,
                      ...props,
                      path: rulePath,
                      ruleGroup: rule,
                    })}
                  </div>
                );
              } else {
                // Standard Rule
                return (
                  <div key={rule.id} className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    {controls?.rule({
                      ...rest,
                      ...props,
                      path: rulePath,
                      rule,
                    })}
                  </div>
                );
              }
            })}
          </div>
        )}

        {showEmployeeQuery && groupEmployeeId && (
          <div className="mt-4 pt-4 border-t border-border/50 rounded-lg bg-muted/30">
            <div className="flex items-center gap-2 px-2 py-2 bg-primary/5 rounded-lg border border-primary/20 mb-3">
              <span className="text-xs font-medium text-primary">Employee Query: {groupEmployeeId}</span>
              <span className="text-xs text-muted-foreground">(Independent query builder)</span>
            </div>
            <EmployeeQueryBuilder
              employeeFields={employeeFields}
              employeeId={groupEmployeeId}
              initialQuery={(employeeQueries?.get(groupEmployeeId) ?? {
                id: `employee-${groupEmployeeId}`,
                combinator: "and",
                rules: [],
                not: false,
              }) as RuleGroupType}
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
  const [localQuery, setLocalQuery] = React.useState<RuleGroupType>(initialQuery);

  const handleChange = React.useCallback((query: RuleGroupType) => {
    setLocalQuery(query);
    onQueryChange(query);
  }, [onQueryChange]);

  const rqbFields = React.useMemo(
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

  const rqbOperators = React.useMemo(
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

  const rqbCombinators = React.useMemo(
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