export interface RuleAction {
  type: 'show' | 'hide' | 'enable' | 'disable' | 'require' | 'unrequire' | 'setDefault' | 'compute';
  targetField: string;
  value?: any;
}

export interface RuleResult {
  actions: RuleAction[];
}

export interface FieldState {
  fieldVisibility: Record<string, boolean>;
  fieldEnabled: Record<string, boolean>;
  fieldRequired: Record<string, boolean>;
  formState: Record<string, any>;
}

export class RulesEngine {
  static evaluateRules(rules: any[], context: { fieldValues: Record<string, any>; fieldMetadata: Record<string, any> }): RuleResult {
    const actions: RuleAction[] = [];
    
    // Simple rule evaluation for now
    rules.forEach(rule => {
      if (rule.condition && this.evaluateCondition(rule.condition, context.fieldValues)) {
        actions.push({
          type: rule.action,
          targetField: rule.targetField,
          value: rule.value
        });
      }
    });
    
    return { actions };
  }
  
  static applyRuleResults(actions: RuleAction[], formValues: Record<string, any>, fieldVisibility: Record<string, boolean>, fieldEnabled: Record<string, boolean>, fieldRequired: Record<string, boolean>): FieldState {
    const updatedVisibility = { ...fieldVisibility };
    const updatedEnabled = { ...fieldEnabled };
    const updatedRequired = { ...fieldRequired };
    const updatedFormState = { ...formValues };
    
    actions.forEach(action => {
      switch (action.type) {
        case 'show':
          updatedVisibility[action.targetField] = true;
          break;
        case 'hide':
          updatedVisibility[action.targetField] = false;
          break;
        case 'enable':
          updatedEnabled[action.targetField] = true;
          break;
        case 'disable':
          updatedEnabled[action.targetField] = false;
          break;
        case 'require':
          updatedRequired[action.targetField] = true;
          break;
        case 'unrequire':
          updatedRequired[action.targetField] = false;
          break;
        case 'setDefault':
          if (action.value !== undefined) {
            updatedFormState[action.targetField] = action.value;
          }
          break;
        case 'compute':
          if (action.value !== undefined) {
            updatedFormState[action.targetField] = action.value;
          }
          break;
      }
    });
    
    return {
      fieldVisibility: updatedVisibility,
      fieldEnabled: updatedEnabled,
      fieldRequired: updatedRequired,
      formState: updatedFormState
    };
  }
  
  private static evaluateCondition(condition: any, fieldValues: Record<string, any>): boolean {
    // Simple condition evaluation
    if (typeof condition === 'string') {
      // Basic field value check
      const [field, operator, value] = condition.split(' ');
      const fieldValue = fieldValues[field];
      
      switch (operator) {
        case '==':
          return fieldValue == value;
        case '!=':
          return fieldValue != value;
        case '>':
          return Number(fieldValue) > Number(value);
        case '<':
          return Number(fieldValue) < Number(value);
        case '>=':
          return Number(fieldValue) >= Number(value);
        case '<=':
          return Number(fieldValue) <= Number(value);
        case 'contains':
          return String(fieldValue).includes(value);
        default:
          return false;
      }
    }
    
    return false;
  }
}
