import { ParserRuleContext } from "antlr4ts";
import { EdgeInfo, NodeInfo, VariableInfo } from "../../../../debugmodel/DiagramInfo";
import { RuntimeError } from "../../error/RuntimeError";
import { CustomizationRuntime, Subject } from "../CustomizationRuntime";
import { ArrayType } from "./ArrayExpr";
import { Expr } from "./Expr";
import { ValueType } from "./ValueType";

export class PropExpr extends Expr {
    private readonly proppedExpr: Expr;
    private readonly prop: string;
    private readonly args: Expr[];
    private readonly runtime: CustomizationRuntime;
    private readonly ctx: ParserRuleContext;
    private readonly isSubjectProp: boolean;

    constructor(proppedExpr: Expr, prop: string, args: Expr[], runtime: CustomizationRuntime, ctx: ParserRuleContext, isSubjectProp: boolean = false) {
        super();
        this.proppedExpr = proppedExpr;
        this.prop = prop;
        this.args = args;
        this.runtime = runtime;
        this.ctx = ctx;
        this.isSubjectProp = isSubjectProp;
    }

    public type(): ValueType | ArrayType {
        if (this.isSubjectProp) return ValueType.SUBJECT;

        switch (this.prop) {
            case "length":
                return ValueType.NUM;
            case "label":
                return ValueType.STRING;
            case "append":
                return ValueType.NUM;
            case "remove":
                return ValueType.NUM;
            case "setTitle":
                return ValueType.STRING;
            case "title":
                return ValueType.STRING;
            default:
                return ValueType.NUM;
        }
    }

    public eval(): Object {
        const proppedValue: Object | null = this.proppedExpr.eval();
        if (proppedValue instanceof RuntimeError) return proppedValue;
        if (proppedValue === null) return new RuntimeError(this.ctx, "Cannot access property of null");

        if (this.isSubjectProp) {
            const fieldSubject: Subject | null = this.runtime.getFieldOfName(proppedValue as Subject, this.prop);
            if (fieldSubject === null)
                return new RuntimeError(this.ctx, "Field with name " + this.prop + " does not exist in this location scope.");
            return fieldSubject as Subject;
        } else
            switch (this.prop) {
                case "length":
                    return (proppedValue as any[]).length;
                case "label":
                    return (proppedValue as EdgeInfo).label;
                case "append": {
                    const argValue : Object | null = this.args[0].eval();
                    if (argValue instanceof RuntimeError) return argValue;

                    const proppedArray: (Object | null)[] = proppedValue as (Object | null)[];
                    proppedArray.push(argValue);
                    return proppedArray.length;
                }
                case "remove": {
                    const argValue: Object = this.args[0].eval() as Object;
                    if (argValue instanceof RuntimeError) return argValue;

                    const proppedArray: (Object | null)[] = proppedValue as (Object | null)[];
                    const index: number = argValue as number;
                    if (index >= proppedArray.length || index < 0)
                        return new RuntimeError(this.ctx, "Index out of bounds, index" + index + " to an array of size " + proppedArray.length);
                    proppedArray.splice(index, 1);
                    return proppedArray.length;
                }
                case "setTitle": {
                    if (proppedValue === null) return new RuntimeError(this.ctx, "Cannot do setTitle on a null value.");
                    const node: NodeInfo = proppedValue as NodeInfo;

                    const newLabelValue: Object = this.args[0].eval() as Object;
                    if (newLabelValue instanceof RuntimeError) return newLabelValue;
                    const newLabel: string = newLabelValue as string;

                    node.data.title = newLabel;
                    return newLabel;
                }
                case "title": {
                    if (proppedValue === null) return new RuntimeError(this.ctx, "Cannot get the title of a null value.");
                    const node: NodeInfo = proppedValue as NodeInfo;

                    const titleInfo: VariableInfo | string = node.data.title;
                    let title: string;
                    if (typeof titleInfo === 'string') title = titleInfo;
                    else {
                        const scopeTopVar: boolean = node.data.scopeTopVar !== undefined && node.data.scopeTopVar !== null ? node.data.scopeTopVar : false;
                        title = scopeTopVar ? titleInfo.name + "(" + titleInfo.type + ")" : titleInfo.type;
                        if (!titleInfo.value.includes("@")) title += ": " + titleInfo.value;
                    }

                    return title;
                }
                default:
                    return new RuntimeError(this.ctx, "Somehow the invalid property " + this.prop + " passed type-checking.");
            }
    }
}