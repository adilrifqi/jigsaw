import { ParserRuleContext } from "antlr4ts";
import { RuntimeError } from "../../error/RuntimeError";
import { CustomizationRuntime } from "../CustomizationRuntime";
import { ArrayAccessExpr } from "../expr/ArrayAccessExpr";
import { ArrayType } from "../expr/ArrayExpr";
import { Expr } from "../expr/Expr";
import { IntLitExpr } from "../expr/IntLitExpr";
import { MapType } from "../expr/NewMapExpr";
import { ValueType } from "../expr/ValueType";
import { Command } from "./Command";
import { NewVarCommand } from "./NewVarCommand";

export class CollectionForloopCommand extends Command {
    private readonly varType: ValueType | ArrayType | MapType;
    private readonly varName: string;
    private readonly arrayExpr: Expr;
    private readonly commands: Command;
    private readonly ctx: ParserRuleContext;
    private readonly runtime: CustomizationRuntime;

    constructor(varType: ValueType | ArrayType | MapType, varName: string, arrayExpr: Expr, command: Command, ctx: ParserRuleContext, runtime: CustomizationRuntime) {
        super();
        this.varType = varType;
        this.varName = varName;
        this.arrayExpr = arrayExpr;
        this.commands = command;
        this.ctx = ctx;
        this.runtime = runtime;
    }

    public execute(): RuntimeError | undefined {
        const arrayResult: Object | null = this.arrayExpr.eval();
        if (arrayResult === null) return new RuntimeError(this.ctx, "Cannot iterate over null.");
        if (arrayResult instanceof RuntimeError) return arrayResult;
        const array: (Object | null)[] = arrayResult as (Object | null)[];

        for (var i = 0; i < array.length; i++) {
            if (!this.runtime.openVariableScope())
                return new RuntimeError(this.ctx, "For some reason, a new variable scope cannot be opened.");

            const newVarCommand: NewVarCommand = new NewVarCommand(this.varName, new ArrayAccessExpr(this.arrayExpr, new IntLitExpr(i), this.ctx), this.varType, this.runtime, this.ctx);
            const newVarCommandResult: RuntimeError | undefined = newVarCommand.execute();
            if (newVarCommandResult) return newVarCommandResult;

            const commandResult: RuntimeError | undefined = this.commands.execute();
            if (commandResult) return commandResult;

            if (!this.runtime.closeVariableScope())
                return new RuntimeError(this.ctx, "For some reason, variable scope cannot be closed.");
        }

        return undefined;
    }
}