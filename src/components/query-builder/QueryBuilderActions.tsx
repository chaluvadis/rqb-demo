"use client";

import { Trash2, Plus, GripVertical } from "lucide-react";
import type { ActionProps } from "react-querybuilder";
import { RuleGroupBodyComponents, type UseRuleGroup } from "react-querybuilder";
import { Fragment, type ComponentType } from "react";

export function RemoveRuleAction({ handleOnClick, label, testID, ruleOrGroup, ...props }: ActionProps & { testID?: string }) {
  return (
    <button
      type="button"
      data-testid={testID}
      onClick={(e) => handleOnClick(e as any)}
      title={typeof label === "string" ? label : "Remove rule"}
      className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      {...props}
    >
      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
      <span className="sr-only">{typeof label === "string" ? label : "Remove rule"}</span>
    </button>
  );
}

export function RemoveGroupAction({ handleOnClick, label, testID, ruleOrGroup, ...props }: ActionProps & { testID?: string }) {
  return (
    <button
      type="button"
      data-testid={testID}
      onClick={(e) => handleOnClick(e as any)}
      title={typeof label === "string" ? label : "Remove group"}
      className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      {...props}
    >
      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
      <span className="sr-only">{typeof label === "string" ? label : "Remove group"}</span>
    </button>
  );
}

export function AddRuleAction({ handleOnClick, label, testID, ruleOrGroup, ...props }: ActionProps & { testID?: string }) {
  return (
    <button
      type="button"
      data-testid={testID}
      onClick={(e) => handleOnClick(e as any)}
      title={typeof label === "string" ? label : "Add rule"}
      className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      {...props}
    >
      <Plus className="h-3.5 w-3.5" aria-hidden="true" />
      <span>{typeof label === "string" ? label : "Add rule"}</span>
    </button>
  );
}

export function AddGroupAction({ handleOnClick, label, testID, ruleOrGroup, ...props }: ActionProps & { testID?: string }) {
  return (
    <button
      type="button"
      data-testid={testID}
      onClick={(e) => handleOnClick(e as any)}
      title={typeof label === "string" ? label : "Add group"}
      className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      {...props}
    >
      <Plus className="h-3.5 w-3.5" aria-hidden="true" />
      <span>{typeof label === "string" ? label : "Add group"}</span>
    </button>
  );
}

export function DragHandleAction({ label, testID, ruleOrGroup, ...props }: ActionProps & { testID?: string }) {
  return (
    <span
      data-testid={testID}
      className="inline-flex h-7 w-7 cursor-grab items-center justify-center rounded-md text-muted-foreground/50 hover:text-muted-foreground"
      title={typeof label === "string" ? label : "Drag to reorder"}
      {...props}
    >
      <GripVertical className="h-3.5 w-3.5" aria-hidden="true" />
      <span className="sr-only">{typeof label === "string" ? label : "Drag to reorder"}</span>
    </span>
  );
}

interface AddRuleGroupActionProps {
  handleOnClick: (e: React.MouseEvent) => void;
  label?: string;
  testID?: string;
  ruleGroup: {
    addRule: () => void;
    addGroup: () => void;
  };
}

export function AddRuleActionBody({ handleOnClick, label, testID, ruleGroup, ...props }: AddRuleGroupActionProps) {
  return (
    <button
      type="button"
      data-testid={testID}
      onClick={handleOnClick}
      title={typeof label === "string" ? label : "Add rule"}
      className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      {...props}
    >
      <Plus className="h-3.5 w-3.5" aria-hidden="true" />
      <span>{typeof label === "string" ? label : "Add rule"}</span>
    </button>
  );
}

export function AddGroupActionBody({ handleOnClick, label, testID, ruleGroup, ...props }: AddRuleGroupActionProps) {
  return (
    <button
      type="button"
      data-testid={testID}
      onClick={handleOnClick}
      title={typeof label === "string" ? label : "Add group"}
      className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      {...props}
    >
      <Plus className="h-3.5 w-3.5" aria-hidden="true" />
      <span>{typeof label === "string" ? label : "Add group"}</span>
    </button>
  );
}

interface RuleGroupBodyElementsProps extends UseRuleGroup {}

export const CustomRuleGroupBodyElements: ComponentType<RuleGroupBodyElementsProps> = (props) => {
  return (
    <Fragment>
      <RuleGroupBodyComponents {...props} />
      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
        <AddRuleActionBody
          handleOnClick={props.addRule}
          label="Add rule"
          testID="add-rule-body"
          ruleGroup={{ addRule: props.addRule, addGroup: props.addGroup }}
        />
        <AddGroupActionBody
          handleOnClick={props.addGroup}
          label="Add group"
          testID="add-group-body"
          ruleGroup={{ addRule: props.addRule, addGroup: props.addGroup }}
        />
      </div>
    </Fragment>
  );
};

export const NullAction = () => null;
