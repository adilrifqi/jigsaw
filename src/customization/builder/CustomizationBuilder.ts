import { CustSpecVisitor } from '../antlr/parser/src/customization/antlr/CustSpecVisitor';
import { AbstractParseTreeVisitor } from 'antlr4ts/tree/AbstractParseTreeVisitor'
import { CustSpecComponent } from './model/CustSpecComponent';
import { AddCommandContext, ArrayAccessSuffixContext, ArrayExprContext, ArrayIndexReassignCommandContext, BooleanLitContext, ChildrenExprContext, ChildrenOfExprContext, ClassLocIdContext, CollectionForLoopContext, ComparisonContext, ConditionForLoopContext, ConjunctionContext, CustLocationContext, CustSpecParser, DecGetExprContext, DisjunctionContext, EdgesOfExprContext, ExprContext, FieldChainSuffixContext, ForCommandContext, ForInitContext, ForUpdateContext, GetDecExprContext, GetIncExprContext, HereExprContext, IdExprContext, IfCommandContext, IncGetExprContext, IsNullExprContext, LiteralContext, LiteralExprContext, LocIdContext, MergeShortcutContext, MethodLocIdContext, NegationContext, NewEdgeExprContext, NewMapExprContext, NewNodeExprContext, NewVarCommandContext, NodeOfExprContext, NodesOfExprContext, NumLitContext, OmitCommandContext, ParentsExprContext, ParentsOfExprContext, ParentVarAssignCommandContext, ParentVarExprContext, ParExprContext, PlainPropCallCommandContext, PlusPlusCommandContext, PlusPlusExprContext, PrimaryExprContext, PropSuffixContext, ReassignCommandContext, ScopeCommandContext, SemiCommandContext, SetImmutableShortcutContext, ShortcutCommandContext, SingleSubjectContext, SingleSubjectExprContext, StartContext, StatementContext, StringLitContext, SuffixedContext, SumContext, TermContext, TypeContext, ValueOfExprContext, WhileCommandContext } from '../antlr/parser/src/customization/antlr/CustSpecParser';
import { BooleanLitExpr } from './model/expr/BooleanLitExpr';
import { ErrorComponent } from './model/ErrorComponent';
import { StringLitExpr } from './model/expr/StringLitExpr';
import { IntLitExpr } from './model/expr/IntLitExpr';
import { CustSpecLexer } from '../antlr/parser/src/customization/antlr/CustSpecLexer';
import { CharStreams, CommonTokenStream, Lexer, ParserRuleContext } from 'antlr4ts';
import { ParseTree } from 'antlr4ts/tree/ParseTree';
import { ErrorBuilder } from './error/ErrorBuilder';
import { Expr } from './model/expr/Expr';
import { ValueType } from './model/expr/ValueType';
import { TypeErrorBuilder } from './error/TypeErrorBuilder';
import { NotExpr } from './model/expr/NotExpr';
import { NegativeExpr } from './model/expr/NegativeExpr';
import { BinaryNumOp, NumOp } from './model/expr/BinaryNumOp';
import { ComparisonExpr, CompOp } from './model/expr/ComparisonExpr';
import { BinaryBoolOp, BoolOp } from './model/expr/BinaryBoolOp';
import { Command } from './model/command/Command';
import { WhileCommand } from './model/command/WhileCommand';
import { IfElseCommand } from './model/command/IfElseCommand';
import { ScopeCommand } from './model/command/ScopeCommand';
import { Location, LocationType } from './model/location/Location';
import { TCLocationScope } from './model/TCLocationScope';
import { CustomizationRuntime } from './model/CustomizationRuntime';
import { NewEdgeExpr } from './model/expr/NewEdgeExpr';
import { NewNodeExpr } from './model/expr/NewNodeExpr';
import { VarRefExpr } from './model/expr/VarRefExpr';
import { NewVarCommand } from './model/command/NewVarCommand';
import { ReassignCommand } from './model/command/ReassignCommand';
import { AddCommand } from './model/command/AddCommand';
import { OmitCommand } from './model/command/OmitCommand';
import { NodeOfExpr } from './model/expr/NodeOfExpr';
import { ArrayExpr, ArrayType } from './model/expr/ArrayExpr';
import { ArrayAccessExpr } from './model/expr/ArrayAccessExpr';
import { EdgesOfExpr } from './model/expr/EdgesOfExpr';
import { HereExpr } from './model/expr/HereExpr';
import { ParentsOfExpr } from './model/expr/ParentsOfExpr';
import { ChildrenOfExpr } from './model/expr/ChildrenOfExpr';
import { PropExpr } from './model/expr/PropExpr';
import { AdditionExpr } from './model/expr/AdditionExpr';
import { ValueOfExpr } from './model/expr/ValueOfExpr';
import { ArrayIndexReassignCommand } from './model/command/ArrayIndexReassignCommand';
import { TerminalNode } from 'antlr4ts/tree/TerminalNode';
import { ExprCommand } from './model/command/ExprCommand';
import { ClassLocation } from './model/location/ClassLocation';
import { FieldLocation } from './model/location/FieldLocation';
import { MethodLocation } from './model/location/MethodLocation';
import { LocalLocation } from './model/location/LocalLocation';
import { MethodSignature } from '../../debugmodel/StackFrame';
import { Statement } from './model/Statement';
import { ParentVarExpr } from './model/expr/ParentVarExpr';
import { ParentVarAssignCommand } from './model/command/ParentVarAssignCommand';
import { IsNullExpr } from './model/expr/IsNullExpr';
import { MapType, NewMapExpr } from './model/expr/NewMapExpr';
import { ConditionForLoopCommand } from './model/command/ConditionForLoopCommand';
import { CollectionForloopCommand } from './model/command/CollectionForLoopCommand';
import { PlusPlusExpr } from './model/expr/PlusPlusExpr';
import { PlusPlusCommand } from './model/command/PlusPlusCommand';
import { ThrowingErrorListener } from './error/ThrowingErrorListener';
import { SetImmutableShortcut } from './model/command/SetImmutableShortcut';
import { SingleSubjectExpr } from './model/expr/SingleSubjectExpr';
import { FieldChainExpr } from './model/expr/FieldChainExpr';
import { NodesOfExpr } from './model/expr/NodesOfExpr';
import { MergeShortcut } from './model/command/MergeShortcut';


// TODO: Implement the value retrieval for more complex data structures (currently boolean, number, string, and arrays)
export class CustomizationBuilder extends AbstractParseTreeVisitor<CustSpecComponent> implements CustSpecVisitor<CustSpecComponent> {
    private locationStack: Location[] = [];
    private topStatements: Statement[] = []; // Not to be added to the runtime before all visitations have been done.
    private locVarsStack: TCLocationScope[] = [];
    private runtime: CustomizationRuntime = new CustomizationRuntime();

    public buildCustomization(spec: string): CustomizationRuntime | ErrorComponent {
        this.locationStack = [];
        this.topStatements = [];
        this.locVarsStack = [];
        this.runtime = new CustomizationRuntime();

        this.openLocationScope();
        
        const lexer: Lexer = new CustSpecLexer(CharStreams.fromString(spec));
        lexer.removeErrorListeners();
        lexer.addErrorListener(ThrowingErrorListener.instance);

        const parser: CustSpecParser = new CustSpecParser(new CommonTokenStream(lexer));
        parser.removeErrorListeners();
        parser.addErrorListener(ThrowingErrorListener.instance);

        try {
            const tree: ParseTree = parser.start();

            const visitResult: CustSpecComponent = this.visit(tree);
            if (visitResult instanceof ErrorComponent) return visitResult;

            this.runtime.setTopStatements(this.topStatements);
            return this.runtime;
        } catch (error) {
            return new ErrorComponent((error as Error).message);
        }
    }

    visitStart(ctx: StartContext): CustSpecComponent {
        for (const statement of ctx.statement()) {
            const comp: CustSpecComponent = this.visit(statement);
            if (comp instanceof ErrorComponent) return comp;
            this.topStatements.push(comp as Statement);
        }
        return this.runtime;
    }

    visitStatement(ctx: StatementContext): CustSpecComponent {
        return this.visit(ctx.getChild(0));
    }

    visitCustLocation(ctx: CustLocationContext): CustSpecComponent {
        return this.createLocation(ctx.locId(), ctx.statement());
    }

    private createLocation(locIds: LocIdContext[], statements: StatementContext[]): CustSpecComponent {
        const newLocationStack: Location[] = [];
        for (const locId of locIds) {
            var thisLocation: Location;
            if (locId.classLocId()) {
                thisLocation = new ClassLocation(locId.classLocId()!.ID().toString(), this.runtime);
            } else if (locId.fieldLocId()) {
                const fieldName: string = locId.fieldLocId()!.ID() ? locId.fieldLocId()!.ID()!.toString() : locId.fieldLocId()!.NUM_VALUE()!.toString();
                if (newLocationStack.length == 0 && this.locationStack.length == 0)
                    return new ErrorComponent(new ErrorBuilder(locId, "Cannot declare field location " + fieldName + " without parent location.").toString());
                const parentLocation: Location = newLocationStack.length > 0 ? newLocationStack[newLocationStack.length - 1] : this.locationStack[this.locationStack.length - 1];
                if (parentLocation.type() == LocationType.METHOD) return new ErrorComponent(new ErrorBuilder(locId, "Field location declared inside a method location.").toString());
                thisLocation = new FieldLocation(fieldName, this.runtime);
            } else if (locId.methodLocId()) {
                const methodLocId: MethodLocIdContext = locId.methodLocId()!;
                var signatureString: string = methodLocId.ID(0).toString() + "(";
                if (newLocationStack.length == 0 && this.locationStack.length == 0)
                    return new ErrorComponent(new ErrorBuilder(locId, "Cannot declare method location " + signatureString + " without parent location.").toString());
                const parentLocation: Location = newLocationStack.length > 0 ? newLocationStack[newLocationStack.length - 1] : this.locationStack[this.locationStack.length - 1];
                if (parentLocation.type() != LocationType.CLASS) return new ErrorComponent(new ErrorBuilder(locId, "Method location declared in a non-class location.").toString());

                const paramTypes: string[] = [];
                var nextChildIndex: number = 3;
                if (methodLocId.getChild(nextChildIndex).text !== ')') {
                    var firstParamType: string = methodLocId.getChild(nextChildIndex++).text;
                    while (methodLocId.getChild(nextChildIndex).text === "[") {
                        firstParamType += "[]";
                        nextChildIndex += 2;
                    }
                    paramTypes.push(firstParamType);
                    signatureString += firstParamType;

                    while (methodLocId.getChild(nextChildIndex).text === ',') {
                        nextChildIndex++;
                        var nextParamType: string = methodLocId.getChild(nextChildIndex++).text;
                        while (methodLocId.getChild(nextChildIndex).text === "[") {
                            nextParamType += "[]";
                            nextChildIndex += 2;
                        }
                        paramTypes.push(nextParamType);
                        signatureString += "," + nextParamType;
                    }
                }
                signatureString += ")";

                thisLocation = new MethodLocation(new MethodSignature(parentLocation.getName(), methodLocId.ID(0).toString(), paramTypes), this.runtime);
            } else {
                const localVariableName: string = locId.localLocId()!.ID().text;
                if (newLocationStack.length == 0 && this.locationStack.length == 0)
                    return new ErrorComponent(new ErrorBuilder(locId, "Cannot declare local variable location " + localVariableName + " without parent location.").toString());
                const parentLocation: Location = newLocationStack.length > 0 ? newLocationStack[newLocationStack.length - 1] : this.locationStack[this.locationStack.length - 1];
                if (parentLocation.type() != LocationType.METHOD) return new ErrorComponent(new ErrorBuilder(locId, "Method location declared in a non-method location.").toString());

                thisLocation = new LocalLocation(localVariableName, this.runtime);
            }

            newLocationStack.push(thisLocation);
        }
        newLocationStack.at(-1)!.setPermanence(true);

        // Case 1: Nothing's there yet or whatever's there has no overlap with the declared locations
        // Case 2: Some overlap but branch into new locations eventually
        // Case 3: It's an existing location that needs to be replaced
        // Case 4: Subset of an existing location declaration -> Error!

        const fromTopLocs: boolean = this.locationStack.length == 0;
        var currentLocation: Location | undefined = fromTopLocs ? undefined : this.locationStack.at(-1)!;
        var newLocIndex: number = 0;
        for (; newLocIndex < newLocationStack.length; newLocIndex++) {
            const nextNewLocation: Location = newLocationStack[newLocIndex];
            const foundLocation: Location | undefined = !currentLocation
                ? this.getTopScopeLocation(nextNewLocation.getName(), nextNewLocation.type())
                : currentLocation.getChild(nextNewLocation.getName(), nextNewLocation.type());
            if (foundLocation) currentLocation = foundLocation;
            else break;
        }

        if (newLocIndex == newLocationStack.length) {
            // Replace
            if (currentLocation!.isPermanent())
                return new ErrorComponent(new ErrorBuilder(locIds[newLocIndex - 1], "Cannot replace manually declared location " + currentLocation!.getName()).toString());

            const replacer: Location = newLocationStack.at(-1)!;
            replacer.setParent(currentLocation!.getParent());
            replacer.setStatements(currentLocation!.getStatements());

            const topLocations: Location[] = this.getTopLocations();
            if (newLocationStack.length == 1 && fromTopLocs) {
                var topToSwap: number = -1;
                for (var i = 0; i < topLocations.length; i++) {
                    const thisTopLocation: Location = topLocations[i];
                    if (thisTopLocation.getName() === replacer.getName() && thisTopLocation.type() == replacer.type()) {
                        topToSwap = i;
                        break;
                    }
                }
                if (topToSwap > -1) {
                    topLocations[topToSwap] = replacer;
                } else return new ErrorComponent(new ErrorBuilder(locIds.at(-1)!, "Type-checker bug: cannot find top location to swap.").toString());
            }
        }

        if (!currentLocation) {
            currentLocation = newLocationStack[0];
            // this.topLocations.push(currentLocation);
            newLocIndex++;
        }
        // Extend
        for (; newLocIndex < newLocationStack.length; newLocIndex++) {
            newLocationStack[newLocIndex].setParent(currentLocation);
            currentLocation = newLocationStack[newLocIndex];
        }


        // Visit parse tree children
        this.openLocationScope();
        const newLocation: Location = newLocationStack.at(-1)!;
        this.pushLocationToStack(newLocation);
        for (const statementCtx of statements) {
            const visitResult: CustSpecComponent = this.visit(statementCtx);
            if (visitResult instanceof ErrorComponent) return visitResult;
            newLocation.addStatement(visitResult as Statement);
        }
        if (!this.closeLocationScope()) {
            return new ErrorComponent(
                new ErrorBuilder(locIds[0], "Type-checker has a bug where locations are closed more than they were opened.").toString()
            );
        }
        this.locationStack.pop();

        for (var i = 0; i < newLocationStack.length - 1; i++)
            newLocationStack[0].addStatement(newLocationStack[i + 1]);

        return newLocationStack[0];
    }

    visitScopeCommand(ctx: ScopeCommandContext): CustSpecComponent {
        const commands: Command[] = [];
        if (!this.openVariableScope())
            return new ErrorComponent(
                new ErrorBuilder(ctx, "Type checker bug where no location scope exists").toString()
            );
        for (var commandCtx of ctx.command()) {
            const comp: CustSpecComponent = this.visit(commandCtx);
            if (comp instanceof ErrorComponent) return comp;
            commands.push(comp as Command);
        }
        if (!this.closeVariableScope())
            return new ErrorComponent(
                new ErrorBuilder(ctx, "Type checker bug where location scopes are closed more times than they were opened.").toString()
            );

        return new ScopeCommand(commands, this.runtime, ctx);
    }

    visitIfCommand(ctx: IfCommandContext): CustSpecComponent {
        const conditions: Expr[] = [];
        const commands: Command[] = [];
        for (var i = 0; i < ctx.expr().length; i++) {
            const exprComp: CustSpecComponent = this.visit(ctx.expr(i));
            if (exprComp instanceof ErrorComponent) return exprComp;
            const expr: Expr = exprComp as Expr;
            if (expr.type() != ValueType.BOOLEAN)
                return new ErrorComponent(
                    new TypeErrorBuilder(ctx.expr(i), [ValueType.BOOLEAN], expr.type()).toString()
                );
            conditions.push(expr);
            
            const commandComp: CustSpecComponent = this.visit(ctx.command(i));
            if (commandComp instanceof ErrorComponent) return commandComp;
            commands.push(commandComp as Command);
        }

        if (ctx.command().length > ctx.expr().length) {
            const commandComp: CustSpecComponent = this.visit(ctx.command(ctx.command().length - 1));
            if (commandComp instanceof ErrorComponent) return commandComp;
            commands.push(commandComp as Command);
        }

        return new IfElseCommand(conditions, commands, ctx);
    }

    visitWhileCommand(ctx: WhileCommandContext): CustSpecComponent {
        const exprComp: CustSpecComponent = this.visit(ctx.expr());
        if (exprComp instanceof ErrorComponent) return exprComp;
        const expr: Expr = exprComp as Expr;
        if (expr.type() != ValueType.BOOLEAN)
            return new ErrorComponent(
                new TypeErrorBuilder(ctx.expr(), [ValueType.BOOLEAN], expr.type()).toString()
            );
        
        if (!this.openVariableScope())
            return new ErrorComponent(
                new ErrorBuilder(ctx, "Type checker bug where no location scope exists").toString()
            );
        const commandComp: CustSpecComponent = this.visit(ctx.command());
        if (commandComp instanceof ErrorComponent) return commandComp;
        const command: Command = commandComp as Command;
        if (!this.closeVariableScope())
            return new ErrorComponent(
                new ErrorBuilder(ctx, "Type checker bug where location scopes are closed more times than they were opened.").toString()
            );

        return new WhileCommand(expr, command, ctx, this.runtime);
    }

    visitForCommand(ctx: ForCommandContext): CustSpecComponent {
        return this.visit(ctx.forLoop());
    }

    visitSemiCommand(ctx: SemiCommandContext): CustSpecComponent {
        return this.visit(ctx.semiLessCommand());
    }

    visitConditionForLoop(ctx: ConditionForLoopContext): CustSpecComponent {
        if (!this.openVariableScope())
            return new ErrorComponent(
                new ErrorBuilder(ctx, "Type checker bug where no location scope exists").toString()
            );

        const forInitComp: CustSpecComponent | undefined = !ctx.forInit() ? undefined : this.visit(ctx.forInit()!);
        var forInit: Command | undefined = undefined;
        if (forInitComp) {
            if (forInitComp instanceof ErrorComponent) return forInitComp;
            forInit = forInitComp as Command;
        }

        const exprComp: CustSpecComponent | undefined = !ctx.expr() ? undefined : this.visit(ctx.expr()!);
        var expr: Expr = new BooleanLitExpr(true);
        if (exprComp) {
            if (exprComp instanceof ErrorComponent) return exprComp;
            expr = exprComp as Expr;
            if (expr.type() != ValueType.BOOLEAN)
                return new ErrorComponent(new TypeErrorBuilder(ctx.expr()!, [ValueType.BOOLEAN], expr.type()).toString());
        }

        const forUpdateComp: CustSpecComponent | undefined = !ctx.forUpdate() ? undefined : this.visit(ctx.forUpdate()!);
        var forUpdate: Command | undefined = undefined;
        if (forUpdateComp) {
            if (forUpdateComp instanceof ErrorComponent) return forUpdateComp;
            forUpdate = forUpdateComp as Command;
        }

        if (!this.openVariableScope())
            return new ErrorComponent(
                new ErrorBuilder(ctx, "Type checker bug where no location scope exists").toString()
            );
        const commandComp: CustSpecComponent = this.visit(ctx.command());
        if (commandComp instanceof ErrorComponent) return commandComp;
        const command: Command = commandComp as Command;
        if (!this.closeVariableScope())
            return new ErrorComponent(
                new ErrorBuilder(ctx, "Type checker bug where location scopes are closed more times than they were opened.").toString()
            );

        if (!this.closeVariableScope())
            return new ErrorComponent(
                new ErrorBuilder(ctx, "Type checker bug where location scopes are closed more times than they were opened.").toString()
            );

        return new ConditionForLoopCommand(forInit, expr, forUpdate, command, this.runtime, ctx);
    }
    visitForInit(ctx: ForInitContext): CustSpecComponent {return this.visit(ctx.semiLessCommand());}
    visitForUpdate(ctx: ForUpdateContext): CustSpecComponent {return this.visit(ctx.semiLessCommand());}

    visitCollectionForLoop(ctx: CollectionForLoopContext): CustSpecComponent {
        const varName: string = ctx.ID().text;

        if (!this.openVariableScope())
            return new ErrorComponent(
                new ErrorBuilder(ctx, "Type checker bug where no location scope exists").toString()
            );

        const exprComp: CustSpecComponent = this.visit(ctx.expr());
        if (exprComp instanceof ErrorComponent) return exprComp;
        const expr: Expr = exprComp as Expr;
        if (!(expr.type() instanceof ArrayType))
            return new ErrorComponent(new ErrorBuilder(ctx.expr(), "Expected an array type, given " + expr.type()).toString());
        const arrayType: ArrayType = expr.type() as ArrayType;
        const innerType: ValueType | ArrayType | MapType | undefined
            = arrayType.dimension == 1
            ? arrayType.type
            : new ArrayType(arrayType.type, arrayType.dimension - 1);

        if (innerType === undefined) return new ErrorComponent(new ErrorBuilder(ctx.expr(), "For loop to iterate over ambiguous type.").toString());
        const declaredType: ValueType | ArrayType | MapType = this.extractType(ctx.type());
        if (JSON.stringify(innerType) !== JSON.stringify(declaredType))
            return new ErrorComponent(new TypeErrorBuilder(ctx.type(), [innerType], declaredType).toString());

        if (!this.addTCVariable(varName, declaredType))
            return new ErrorComponent(
                new ErrorBuilder(ctx, "Variable with name " + varName + " already exists in this scope.").toString()
            );

        const commandComp: CustSpecComponent = this.visit(ctx.command());
        if (commandComp instanceof ErrorComponent) return commandComp;
        const command: Command = commandComp as Command;

        if (!this.closeVariableScope())
            return new ErrorComponent(
                new ErrorBuilder(ctx, "Type checker bug where location scopes are closed more times than they were opened.").toString()
            );

        return new CollectionForloopCommand(declaredType, varName, expr, command, ctx, this.runtime);
    }

    visitNewVarCommand(ctx: NewVarCommandContext): CustSpecComponent {
        const declaredType: ValueType | ArrayType | MapType = this.extractType(ctx.type());
        const varName: string = ctx.ID().toString();

        const exprComp: CustSpecComponent = this.visit(ctx.expr());
        if (exprComp instanceof ErrorComponent) return exprComp;
        const expr: Expr = exprComp as Expr;

        if (declaredType instanceof ArrayType) {
            if (!(expr.type() instanceof ArrayType))
                return new ErrorComponent(
                    new TypeErrorBuilder(ctx.expr(), [declaredType], expr.type()).toString()
                );
            const givenArrayType: ArrayType = expr.type() as ArrayType;
            const declaredArrayType: ArrayType = declaredType as ArrayType;

            if (givenArrayType.type !== undefined && JSON.stringify(declaredArrayType) !== JSON.stringify(givenArrayType))
                return new ErrorComponent(
                    new TypeErrorBuilder(ctx.expr(), [declaredType], expr.type()).toString()
                );
            else if (givenArrayType.dimension > declaredArrayType.dimension)
                return new ErrorComponent(
                    new TypeErrorBuilder(ctx.expr(), [declaredType], expr.type()).toString()
                );
        } else if (JSON.stringify(declaredType) !== JSON.stringify(expr.type()))
            return new ErrorComponent(
                new TypeErrorBuilder(ctx.expr(), [declaredType], expr.type()).toString()
            );
        
        if (!this.addTCVariable(varName, declaredType))
            return new ErrorComponent(
                new ErrorBuilder(ctx, "Variable with name " + varName + " already exists in this scope.").toString()
            );

        return new NewVarCommand(varName, expr, declaredType, this.runtime, ctx);
    }

    visitReassignCommand(ctx: ReassignCommandContext): CustSpecComponent {
        const varName: string = ctx.ID().toString();
        if (this.locVarsStack.length == 0)
            return new ErrorComponent(
                new ErrorBuilder(ctx, "Bug in type checker where scope does not exist where it should").toString()
            );

        const type: ValueType | ArrayType | MapType | undefined = this.getTCType(varName);
        if (type === undefined)
            return new ErrorComponent(
                new ErrorBuilder(ctx, "Variable " + varName + " does not exist in this scope.").toString()
            );

        const exprComp: CustSpecComponent = this.visit(ctx.expr());
        if (exprComp instanceof ErrorComponent) return exprComp;
        const expr: Expr = exprComp as Expr;
    
        if (JSON.stringify(type) !== JSON.stringify(expr.type()))
            return new ErrorComponent(
                new TypeErrorBuilder(ctx.expr(), [type!], expr.type()).toString()
            );
            
        return new ReassignCommand(varName, expr, this.runtime, ctx);
    }

    visitArrayIndexReassignCommand(ctx: ArrayIndexReassignCommandContext): CustSpecComponent {
        const arrayComp: CustSpecComponent = this.visit(ctx.expr(0));
        if (arrayComp instanceof ErrorComponent) return arrayComp;
        const arrayExpr: Expr = arrayComp as Expr;
        if (!(arrayExpr.type() instanceof ArrayType))
            return new ErrorComponent(new ErrorBuilder(ctx.expr(0), "Cannot update index of non-array expression").toString());
        const arrayType: ArrayType = arrayExpr.type() as ArrayType;

        const indicesCount: number = ctx.expr().length - 2;
        const indexExprs: Expr[] = [];
        for (var i = 1; i < ctx.expr().length - 1; i++) {
            const indexComp: CustSpecComponent = this.visit(ctx.expr(i));
            if (indexComp instanceof ErrorComponent) return indexComp;
            const indexExpr: Expr = indexComp as Expr;
            if (indexExpr.type() != ValueType.NUM)
                return new ErrorComponent(new TypeErrorBuilder(ctx.expr(i), [ValueType.NUM], indexExpr.type()).toString());
            indexExprs.push(indexExpr);
        }

        const expectedType: ValueType | ArrayType | MapType | undefined =
            indicesCount == arrayType.dimension
            ? arrayType.type
            : new ArrayType(arrayType.type, arrayType.dimension - indicesCount);

        const newValueComp: CustSpecComponent = this.visit(ctx.expr(ctx.expr().length - 1));
        if (newValueComp instanceof ErrorComponent) return newValueComp;
        const newValueExpr: Expr = newValueComp as Expr;
        const newValueType: ValueType | ArrayType | MapType = newValueExpr.type();

        if (expectedType !== undefined) {
            if (!(expectedType instanceof ArrayType)) {
                if (JSON.stringify(expectedType) !== JSON.stringify(newValueType))
                    return new ErrorComponent(new TypeErrorBuilder(ctx.expr(ctx.expr().length - 1), [expectedType], newValueExpr.type()).toString());
            } else {
                if (!(newValueType instanceof ArrayType))
                    return new ErrorComponent(new TypeErrorBuilder(ctx.expr(ctx.expr().length - 1), [expectedType], newValueExpr.type()).toString());
                else {
                    if (expectedType.type !== undefined) {
                        if (JSON.stringify(expectedType) !== JSON.stringify(newValueType))
                            return new ErrorComponent(new TypeErrorBuilder(ctx.expr(ctx.expr().length - 1), [expectedType], newValueExpr.type()).toString());
                    } else if (newValueType.type !== undefined && newValueType.dimension < expectedType.dimension)
                        return new ErrorComponent(new TypeErrorBuilder(ctx.expr(ctx.expr().length - 1), [expectedType], newValueExpr.type()).toString());
                }
            }
        }

        return new ArrayIndexReassignCommand(arrayExpr, indexExprs, newValueExpr, this.runtime, ctx);
    }

    visitParentVarAssignCommand(ctx: ParentVarAssignCommandContext): CustSpecComponent {
        const parentsWritten: number = ctx.PARENT().length;
        const varName: string = ctx.ID().text;
        if (this.locationStack.length == 0) return new ErrorComponent(new ErrorBuilder(ctx, "Cannot use the parent prefix in the global scope").toString());
        else {
            var targetLocationScope: TCLocationScope | undefined = undefined;
            var traversed: number = 0;
            var locationStackIndex: number = this.locationStack.length - 1;
            while (true) {
                if (locationStackIndex < 0) return new ErrorComponent(new ErrorBuilder(ctx, "The number of parents written goes beyond the global scope.").toString());
                if (locationStackIndex == 0) {
                    var currLoc: Location = this.locationStack[0];
                    traversed++;
                    while (currLoc.getParent()) {
                        traversed++;
                        currLoc = currLoc.getParent()!;
                    }
                } else {
                    var currLoc: Location = this.locationStack[locationStackIndex];
                    const targetLoc: Location = this.locationStack[locationStackIndex - 1];
                    while (targetLoc != currLoc) {
                        currLoc = currLoc.getParent()!;
                        traversed++;
                    }
                }
                if (traversed > parentsWritten)
                    return new ErrorComponent(new ErrorBuilder(ctx, "Variable reference of a non-manually declared ancestor.").toString());
                else if (traversed == parentsWritten) {
                    // locVarsStack.length == locationStack.length + 1 => this scope is associated with an ancestor location, not the current one.
                    targetLocationScope = this.locVarsStack[locationStackIndex];
                    break;
                }

                locationStackIndex--;
            }

            if (!targetLocationScope)
                return new ErrorComponent(new ErrorBuilder(ctx, "Type-checker error: Cannot find target location scope").toString());

            const foundType: ValueType | ArrayType | MapType | undefined = targetLocationScope.getType(varName);
            if (foundType === undefined) return new ErrorComponent(new ErrorBuilder(ctx, "Variable with the name " + varName + " does not exist in the target scope.").toString());

            const exprComp: CustSpecComponent = this.visit(ctx.expr());
            if (exprComp instanceof ErrorComponent) return exprComp;
            const expr: Expr = exprComp as Expr;
            if (JSON.stringify(foundType) !== JSON.stringify(expr.type()))
                return new ErrorComponent(new TypeErrorBuilder(ctx.expr(), [foundType], expr.type()).toString());

            return new ParentVarAssignCommand(varName, parentsWritten, expr, foundType, this.runtime, ctx);
        }
    }

    visitAddCommand(ctx: AddCommandContext): CustSpecComponent {
        const comp: CustSpecComponent = this.visit(ctx.expr());
        if (comp instanceof ErrorComponent) return comp;
        const expr: Expr = comp as Expr;
        const exprType: ValueType | ArrayType | MapType = expr.type();
        var mistype: boolean = false;

        if (exprType instanceof ArrayType) {
            const arrayType: ArrayType = exprType as ArrayType;
            if (arrayType.dimension != 1 || (arrayType.type != ValueType.NODE && arrayType.type != ValueType.EDGE))
                mistype = true;
        } else if (exprType instanceof MapType) mistype = true;
        else if (exprType != ValueType.NODE && exprType != ValueType.EDGE) mistype = true;

        if (mistype)
            return new ErrorComponent(
                new TypeErrorBuilder(ctx.expr(), [ValueType.NODE, ValueType.EDGE, new ArrayType(ValueType.NODE, 1), new ArrayType(ValueType.EDGE, 1)], expr.type()).toString()
            );

        return new AddCommand(expr, this.runtime, ctx);
    }

    visitOmitCommand(ctx: OmitCommandContext): CustSpecComponent {
        const comp: CustSpecComponent = this.visit(ctx.expr());
        if (comp instanceof ErrorComponent) return comp;
        const expr: Expr = comp as Expr;
        const exprType: ValueType | ArrayType | MapType = expr.type();
        var mistype: boolean = false;

        if (exprType instanceof ArrayType) {
            const arrayType: ArrayType = exprType as ArrayType;
            if (arrayType.dimension != 1 || (arrayType.type != ValueType.NODE && arrayType.type != ValueType.EDGE))
                mistype = true;
        } else if (exprType instanceof MapType) mistype = true;
        else if (exprType != ValueType.NODE && exprType != ValueType.EDGE) mistype = true;

        if (mistype)
            return new ErrorComponent(
                new TypeErrorBuilder(ctx.expr(), [ValueType.NODE, ValueType.EDGE, new ArrayType(ValueType.NODE, 1), new ArrayType(ValueType.EDGE, 1)], expr.type()).toString()
            );

        return new OmitCommand(expr, this.runtime, ctx);
    }

    visitPlainPropCallCommand(ctx: PlainPropCallCommandContext): CustSpecComponent {
        const propCall: Expr | ErrorComponent = this.processPropCall(ctx.suffixed(), ctx.ID(), ctx.expr(), ctx);
        if (propCall instanceof ErrorComponent) return propCall;
        return new ExprCommand(propCall);
    }

    visitPlusPlusCommand(ctx: PlusPlusCommandContext): CustSpecComponent {
        const comp: CustSpecComponent = this.visit(ctx.plusPlus());
        if (comp instanceof ErrorBuilder) return comp;
        return new PlusPlusCommand(comp as PlusPlusExpr);
    }

    visitShortcutCommand(ctx: ShortcutCommandContext): CustSpecComponent {
        return this.visit(ctx.shortcut());
    }

    visitSetImmutableShortcut(ctx: SetImmutableShortcutContext): CustSpecComponent {
        const targetSubjectComp: CustSpecComponent = this.visit(ctx.expr());
        if (targetSubjectComp instanceof ErrorComponent) return targetSubjectComp;
        const targetSubject: Expr = targetSubjectComp as Expr;
        if (targetSubject.type() != ValueType.SUBJECT && JSON.stringify(targetSubject.type()) !== JSON.stringify(new ArrayType(ValueType.SUBJECT, 1)))
            return new ErrorComponent(new TypeErrorBuilder(ctx.expr(), [ValueType.SUBJECT, new ArrayType(ValueType.SUBJECT, 1)], targetSubject.type()).toString());

        return new SetImmutableShortcut(targetSubject, this.runtime, ctx);
    }

    visitMergeShortcut(ctx: MergeShortcutContext): CustSpecComponent {
        const mergedComp: CustSpecComponent = this.visit(ctx.expr());
        if (mergedComp instanceof ErrorComponent) return mergedComp;
        const mergedExpr: Expr = mergedComp as Expr;
        const mergedType: ValueType | ArrayType | MapType = mergedExpr.type();
        if (mergedType != ValueType.SUBJECT && !(mergedType instanceof ArrayType && mergedType.type == ValueType.SUBJECT && mergedType.dimension == 1))
            return new ErrorComponent(new TypeErrorBuilder(ctx.expr(), [ValueType.SUBJECT, new ArrayType(ValueType.SUBJECT, 1)], mergedType).toString());

        return new MergeShortcut(mergedExpr, this.runtime);
    }

    visitExpr(ctx: ExprContext): CustSpecComponent{
        return this.visit(ctx.disjunction());
    }

    visitDisjunction(ctx: DisjunctionContext): CustSpecComponent {
        if (ctx.OR().length == 0) {
            return this.visit(ctx.conjunction(0));
        } else {
            const booleanExprs: Expr[] = [];
            for (var compCtx of ctx.conjunction()) {
                const comp: CustSpecComponent = this.visit(compCtx);
                if (comp instanceof ErrorComponent) return comp;
                const expr: Expr = comp as Expr;
                if (expr.type() != ValueType.BOOLEAN)
                    return new ErrorComponent(
                        new TypeErrorBuilder(compCtx, [ValueType.BOOLEAN], expr.type()).toString()
                    );
                booleanExprs.push(expr);
            }

            var result = booleanExprs[booleanExprs.length - 1];
            for (var i = booleanExprs.length - 2; i >= 0; i--)
                result = new BinaryBoolOp(booleanExprs[i], result, BoolOp.OR);
            return result;
        }
    }

    visitConjunction(ctx: ConjunctionContext): CustSpecComponent {
        if (ctx.AND().length == 0) {
            return this.visit(ctx.comparison(0));
        } else {
            const booleanExprs: Expr[] = [];
            for (var compCtx of ctx.comparison()) {
                const comp: CustSpecComponent = this.visit(compCtx);
                if (comp instanceof ErrorComponent) return comp;
                const expr: Expr = comp as Expr;
                if (expr.type() != ValueType.BOOLEAN)
                    return new ErrorComponent(
                        new TypeErrorBuilder(compCtx, [ValueType.BOOLEAN], expr.type()).toString()
                    );
                booleanExprs.push(expr);
            }

            var result = booleanExprs[booleanExprs.length - 1];
            for (var i = booleanExprs.length - 2; i >= 0; i--)
                result = new BinaryBoolOp(booleanExprs[i], result, BoolOp.AND);
            return result;
        }
    }

    visitComparison(ctx: ComparisonContext): CustSpecComponent {
        if (ctx._left === null || ctx._left === undefined) {
            return this.visit(ctx.sum(0));
        } else {
            var op: CompOp;
            if (ctx.LESS() !== undefined) op = CompOp.LESS;
            else if (ctx.LEQ() !== undefined) op = CompOp.LEQ;
            else if (ctx.EQUAL() !== undefined) op = CompOp.EQUAL;
            else if (ctx.NEQ() !== undefined) op = CompOp.NEQ;
            else if (ctx.GEQ() !== undefined) op = CompOp.GEQ;
            else op = CompOp.GREATER;

            const leftComp: CustSpecComponent = this.visit(ctx._left);
            if (leftComp instanceof ErrorComponent) return leftComp;
            const leftExpr: Expr = leftComp as Expr;
            if (op != CompOp.EQUAL && op != CompOp.NEQ && leftExpr.type() != ValueType.NUM)
                return new ErrorComponent(
                    new TypeErrorBuilder(ctx._left, [ValueType.NUM], leftExpr.type()).toString()
                );
            
            const rightComp: CustSpecComponent = this.visit(ctx._right);
            if (rightComp instanceof ErrorComponent) return rightComp;
            const rightExpr: Expr = rightComp as Expr;
            if (op != CompOp.EQUAL && op != CompOp.NEQ && rightExpr.type() != ValueType.NUM)
                return new ErrorComponent(
                    new TypeErrorBuilder(ctx._right, [ValueType.NUM], rightExpr.type()).toString()
                );
            
            if (leftExpr.type() != rightExpr.type()) {
                return new ErrorComponent(
                    new TypeErrorBuilder(ctx._right, [leftExpr.type()], rightExpr.type()).toString()
                );
            }

            return new ComparisonExpr(leftExpr, rightExpr, op);
        }
    }

    visitSum(ctx: SumContext): CustSpecComponent {
        if (ctx._left === null || ctx._left === undefined) {
            return this.visit(ctx.term());
        } else if (ctx.MIN()) {
            const leftComp: CustSpecComponent = this.visit(ctx._left);
            if (leftComp instanceof ErrorComponent) return leftComp;
            const leftExpr: Expr = leftComp as Expr;
            if (leftExpr.type() != ValueType.NUM)
                return new ErrorComponent(
                    new TypeErrorBuilder(ctx._left, [ValueType.NUM], leftExpr.type()).toString()
                );
            
            const rightComp: CustSpecComponent = this.visit(ctx._right);
            if (rightComp instanceof ErrorComponent) return rightComp;
            const rightExpr: Expr = rightComp as Expr;
            if (rightExpr.type() != ValueType.NUM)
                return new ErrorComponent(
                    new TypeErrorBuilder(ctx._right, [ValueType.NUM], rightExpr.type()).toString()
                );
            
            return new BinaryNumOp(leftExpr, rightExpr, NumOp.SUB, ctx);
        } else {
            const leftComp: CustSpecComponent = this.visit(ctx._left);
            if (leftComp instanceof ErrorComponent) return leftComp;
            const leftExpr: Expr = leftComp as Expr;
            const leftType: ValueType | ArrayType | MapType = leftExpr.type();

            const rightComp: CustSpecComponent = this.visit(ctx._right);
            if (rightComp instanceof ErrorComponent) return rightComp;
            const rightExpr: Expr = rightComp as Expr;
            const rightType: ValueType | ArrayType | MapType = rightExpr.type();

            if (leftType == ValueType.STRING
                && rightType != ValueType.NUM
                && rightType != ValueType.STRING)
                return new ErrorComponent(
                    new TypeErrorBuilder(ctx._right, [ValueType.NUM, ValueType.STRING], rightType).toString()
                );

            if (rightType == ValueType.STRING
                && leftType != ValueType.NUM
                && leftType != ValueType.STRING)
                return new ErrorComponent(
                    new TypeErrorBuilder(ctx._left, [ValueType.NUM, ValueType.STRING], leftType).toString()
                );

            if (leftType == ValueType.NUM && rightType != ValueType.NUM)
                return new ErrorComponent(
                    new TypeErrorBuilder(ctx._right, [ValueType.NUM], rightType).toString()
                );

            if (leftType instanceof ArrayType) {
                if (!(rightType instanceof ArrayType))
                    return new ErrorComponent(
                        new TypeErrorBuilder(ctx._right, [leftType], rightType).toString()
                    );
                else {
                    const leftArrayType: ArrayType = leftType as ArrayType;
                    const rightArrayType: ArrayType = rightType as ArrayType;
                    if (leftArrayType.type != rightArrayType.type || leftArrayType.dimension != rightArrayType.dimension || leftArrayType.dimension == 0)
                        return new ErrorComponent(
                            new TypeErrorBuilder(ctx._right, [leftArrayType], rightArrayType).toString()
                        );
                }
            }
            else if (leftType != ValueType.STRING && leftType != ValueType.NUM)
                return new ErrorComponent(
                    new TypeErrorBuilder(ctx._left, [ValueType.STRING, ValueType.NUM], leftType).toString()
                );

            if (leftType instanceof MapType)
                return new ErrorComponent(
                    new TypeErrorBuilder(ctx._left, [ValueType.STRING, ValueType.NUM], leftType).toString()
                );
            if (rightType instanceof MapType)
                return new ErrorComponent(
                    new TypeErrorBuilder(ctx._right, [ValueType.STRING, ValueType.NUM], rightType).toString()
                );

            return new AdditionExpr(leftExpr, rightExpr);
        }
    }

    visitTerm(ctx: TermContext): CustSpecComponent {
        if (ctx._left === null || ctx._left === undefined) {
            return this.visit(ctx.negation());
        } else {
            const leftComp: CustSpecComponent = this.visit(ctx._left);
            if (leftComp instanceof ErrorComponent) return leftComp;
            const leftExpr: Expr = leftComp as Expr;
            if (leftExpr.type() != ValueType.NUM)
                return new ErrorComponent(
                    new TypeErrorBuilder(ctx._left, [ValueType.NUM], leftExpr.type()).toString()
                );
            
            const rightComp: CustSpecComponent = this.visit(ctx._right);
            if (rightComp instanceof ErrorComponent) return rightComp;
            const rightExpr: Expr = rightComp as Expr;
            if (rightExpr.type() != ValueType.NUM)
                return new ErrorComponent(
                    new TypeErrorBuilder(ctx._right, [ValueType.NUM], rightExpr.type()).toString()
                );
            
            return new BinaryNumOp(
                leftExpr,
                rightExpr,
                ctx.TIMES() != undefined ? NumOp.MULT : NumOp.DIV,
                ctx
            );
        }
    }

    visitNegation(ctx: NegationContext): CustSpecComponent {
        const comp: CustSpecComponent = this.visit(ctx.suffixed());
        if (comp instanceof ErrorComponent) return comp;
        const expr: Expr = comp as Expr;

        if (ctx.MIN() !== undefined) {
            // Expr must be a number
            if (expr.type() != ValueType.NUM)
                return new ErrorComponent(
                    new TypeErrorBuilder(ctx.suffixed(), [ValueType.NUM], expr.type()).toString()
                );
            return new NegativeExpr(expr);
        } else if (ctx.NOT() !== undefined) {
            // Expr must be a boolean
            if (expr.type() != ValueType.BOOLEAN)
                return new ErrorComponent(
                    new TypeErrorBuilder(ctx.suffixed(), [ValueType.BOOLEAN], expr.type()).toString()
                );
            return new NotExpr(expr);
        } else return expr;
    }

    visitPropSuffix(ctx: PropSuffixContext): CustSpecComponent {
        return this.processPropCall(ctx.suffixed(), ctx.ID(), ctx.expr(), ctx);
    }

    visitArrayAccessSuffix(ctx: ArrayAccessSuffixContext): CustSpecComponent {
        const arrayComp: CustSpecComponent = this.visit(ctx.suffixed()!);
        if (arrayComp instanceof ErrorComponent) return arrayComp;
        const arrayExpr: Expr = arrayComp as Expr;
        if (!(arrayExpr.type() instanceof ArrayType))
            return new ErrorComponent(
                new ErrorBuilder(ctx.suffixed()!, "Indexed expression must be an array. Found " + arrayExpr.type()).toString()
            );
        else if ((arrayExpr.type() as ArrayType).type === undefined)
            return new ErrorComponent(new ErrorBuilder(ctx.suffixed()!, "Cannot get element of an array of ambiguous type.").toString());
        const arrayType: ArrayType = arrayExpr.type() as ArrayType;
        if (arrayType.dimension == 0)
            return new ErrorComponent(
                new ErrorBuilder(ctx.suffixed()!, "Cannot index an empty array.").toString()
            );

        const exprComp: CustSpecComponent = this.visit(ctx.expr()!);
        if (exprComp instanceof ErrorComponent) return exprComp;
        const expr: Expr = exprComp as Expr;
        if (expr.type() != ValueType.NUM)
            return new ErrorComponent(
                new TypeErrorBuilder(ctx.expr()!, [ValueType.NUM], expr.type()).toString()
            );

        return new ArrayAccessExpr(arrayExpr, expr, ctx);
    }

    visitFieldChainSuffix(ctx: FieldChainSuffixContext): CustSpecComponent {
        const suffixedComp: CustSpecComponent = this.visit(ctx.suffixed());
        if (suffixedComp instanceof ErrorComponent) return suffixedComp;
        const suffixedExpr: Expr = suffixedComp as Expr;
        const suffixedType: ValueType | ArrayType | MapType  = suffixedExpr.type();
        if (suffixedType != ValueType.SUBJECT && !(suffixedType instanceof ArrayType && suffixedType.dimension == 1 && suffixedType.type == ValueType.SUBJECT))
            return new ErrorComponent(new TypeErrorBuilder(ctx.suffixed(), [ValueType.SUBJECT, new ArrayType(ValueType.SUBJECT, 1)], suffixedType).toString());

        const fieldChain: string[] = [];
        for (const fieldLocId of ctx.fieldLocId()) {
            const fieldName: string = fieldLocId.ID() ? fieldLocId.ID()!.toString() : fieldLocId.NUM_VALUE()!.toString();
            fieldChain.push(fieldName);
        }

        if (fieldChain.length == 0) return suffixedExpr;

        return new FieldChainExpr(suffixedExpr, fieldChain, this.runtime, ctx);
    }

    visitPrimaryExpr(ctx: PrimaryExprContext): CustSpecComponent {
        return this.visit(ctx.primary());
    }

    visitIdExpr(ctx: IdExprContext): CustSpecComponent {
        const varName: string = ctx.ID().toString();
        const type: ValueType | ArrayType | MapType | undefined = this.getTCType(varName);
        if (type === undefined)
            return new ErrorComponent(
                new ErrorBuilder(ctx, "Variable " + varName + " is not defined in this scope").toString()
            );
        
        return new VarRefExpr(varName, type, this.runtime, ctx);
    }
    
    visitNewNodeExpr(ctx: NewNodeExprContext): CustSpecComponent {
        const comp: CustSpecComponent = this.visit(ctx.expr());
        if (comp instanceof ErrorComponent) return comp;
        const expr: Expr = comp as Expr;
        if (expr.type() != ValueType.STRING)
            return new ErrorComponent(
                new TypeErrorBuilder(ctx.expr(), [ValueType.STRING], expr.type()).toString()
            );
        
        return new NewNodeExpr(expr);
    }

    visitNewEdgeExpr(ctx: NewEdgeExprContext): CustSpecComponent {
        const firstComp: CustSpecComponent = this.visit(ctx.expr(0));
        if (firstComp instanceof ErrorComponent) return firstComp;
        const firstExpr: Expr = firstComp as Expr;
        if (firstExpr.type() != ValueType.NODE)
            return new ErrorComponent(
                new TypeErrorBuilder(ctx.expr(0), [ValueType.NODE], firstExpr.type()).toString()
            );

        const secondComp: CustSpecComponent = this.visit(ctx.expr(1));
        if (secondComp instanceof ErrorComponent) return secondComp;
        const secondExpr: Expr = secondComp as Expr;
        if (secondExpr.type() != ValueType.NODE)
            return new ErrorComponent(
                new TypeErrorBuilder(ctx.expr(1), [ValueType.NODE], secondExpr.type()).toString()
            );

        const thirdComp: CustSpecComponent = this.visit(ctx.expr(2));
        if (thirdComp instanceof ErrorComponent) return thirdComp;
        const thirdExpr: Expr = thirdComp as Expr;
        if (thirdExpr.type() != ValueType.STRING)
            return new ErrorComponent(
                new TypeErrorBuilder(ctx.expr(1), [ValueType.STRING], thirdExpr.type()).toString()
            );
        
        return new NewEdgeExpr(firstExpr, secondExpr, thirdExpr, ctx);
    }

    visitParentsExpr(ctx: ParentsExprContext): CustSpecComponent {
        return new ParentsOfExpr(new HereExpr(this.runtime), this.runtime);
    }

    visitParentsOfExpr(ctx: ParentsOfExprContext): CustSpecComponent {
        const exprComp: CustSpecComponent = this.visit(ctx.expr());
        if (exprComp instanceof ErrorComponent) return exprComp;
        const expr: Expr = exprComp as Expr;
        if (expr.type() != ValueType.SUBJECT)
            return new ErrorComponent(
                new TypeErrorBuilder(ctx.expr(), [ValueType.SUBJECT], expr.type()).toString()
            );

        return new ParentsOfExpr(expr, this.runtime);
    }

    visitHereExpr(ctx: HereExprContext): CustSpecComponent {
        return new HereExpr(this.runtime);
    }

    visitChildrenExpr(ctx: ChildrenExprContext): CustSpecComponent {
        return new ChildrenOfExpr(new HereExpr(this.runtime), this.runtime);
    }

    visitChildrenOfExpr(ctx: ChildrenOfExprContext): CustSpecComponent {
        const exprComp: CustSpecComponent = this.visit(ctx.expr());
        if (exprComp instanceof ErrorComponent) return exprComp;
        const expr: Expr = exprComp as Expr;
        if (expr.type() != ValueType.SUBJECT)
            return new ErrorComponent(
                new TypeErrorBuilder(ctx.expr(), [ValueType.SUBJECT], expr.type()).toString()
            );

        return new ChildrenOfExpr(expr, this.runtime);
    }

    visitValueOfExpr(ctx: ValueOfExprContext): CustSpecComponent {
        const comp: CustSpecComponent = this.visit(ctx.expr());
        if (comp instanceof ErrorComponent) return comp;
        const expr: Expr = comp as Expr;
        if (expr.type() != ValueType.SUBJECT)
            return new ErrorComponent(
                new TypeErrorBuilder(ctx.expr(), [ValueType.SUBJECT], expr.type()).toString()
            );

        const declaredType: ValueType | ArrayType | MapType = this.extractType(ctx.type());
        if (!this.validValueOfType(declaredType))
            return new ErrorComponent(new ErrorBuilder(ctx.type(), "Invalid target type " + JSON.stringify(declaredType)).toString());

        return new ValueOfExpr(expr, declaredType, this.runtime, ctx);
    }

    visitSingleSubjectExpr(ctx: SingleSubjectExprContext): CustSpecComponent {
        return this.visit(ctx.singleSubject());
    }

    private validValueOfType(type: ValueType | ArrayType | MapType): boolean {
        if (type instanceof MapType) {
            const keyType: ValueType | ArrayType | MapType | undefined = type.keyType;
            const valueType: ValueType | ArrayType | MapType | undefined = type.valueType;
            if (keyType === undefined || valueType === undefined)
                return keyType === undefined && valueType === undefined;
            return this.validValueOfType(keyType) && this.validValueOfType(valueType);
        }
        if (type instanceof ArrayType) {
            if (type.type === undefined) return false;
            return this.validValueOfType(type.type);
        }
        else return type == ValueType.BOOLEAN || type == ValueType.NUM || type == ValueType.STRING;
    }

    visitSingleSubject(ctx: SingleSubjectContext): CustSpecComponent {
        if (ctx.classLocId()) {
            if (this.locationStack.length > 0) return new ErrorComponent(new ErrorBuilder(ctx, "Class location declared inside a location.").toString());
            return new SingleSubjectExpr(ctx.classLocId()!.ID().text, LocationType.CLASS, this.runtime, ctx);
        }
        else if (ctx.fieldLocId()) {
            if (this.locationStack.length == 0 || !(this.locationStack.at(-1)! instanceof ClassLocation)) return new ErrorComponent(new ErrorBuilder(ctx, "Field location declared in a non-class location.").toString());
            const fieldName: string = ctx.fieldLocId()!.ID() ? ctx.fieldLocId()!.ID()!.toString() : ctx.fieldLocId()!.NUM_VALUE()!.toString();
            return new SingleSubjectExpr(fieldName, LocationType.FIELD, this.runtime, ctx);
        } else if (ctx.localLocId()) {
            if (this.locationStack.length == 0 || !(this.locationStack.at(-1)! instanceof MethodLocation)) return new ErrorComponent(new ErrorBuilder(ctx, "Local location declared in a non-method location.").toString());
            return new SingleSubjectExpr(ctx.localLocId()!.ID().text, LocationType.LOCAL, this.runtime, ctx);
        }
        return new ErrorComponent(new ErrorBuilder(ctx, "Parser error: unknown type of location was provided").toString());
    }

    visitNodeOfExpr(ctx: NodeOfExprContext): CustSpecComponent {
        const exprComp: CustSpecComponent = this.visit(ctx.expr());
        if (exprComp instanceof ErrorComponent) return exprComp;
        const expr: Expr = exprComp as Expr;
        if (expr.type() != ValueType.SUBJECT)
            return new ErrorComponent(
                new TypeErrorBuilder(ctx.expr(), [ValueType.SUBJECT], expr.type()).toString()
            );

        return new NodeOfExpr(expr, this.runtime, ctx);
    }

    visitNodesOfExpr(ctx: NodesOfExprContext): CustSpecComponent {
        const subjectArrayComp: CustSpecComponent = this.visit(ctx.expr());
        if (subjectArrayComp instanceof ErrorComponent) return subjectArrayComp;
        const subjectArrayExpr: Expr = subjectArrayComp as Expr;
        const subjectArrayType: ValueType | ArrayType | MapType = subjectArrayExpr.type();
        if (subjectArrayType instanceof ArrayType && (subjectArrayType.type == ValueType.SUBJECT && subjectArrayType.dimension == 1 || subjectArrayType.type === undefined))
            return new NodesOfExpr(subjectArrayExpr, this.runtime);

        return new ErrorComponent(new TypeErrorBuilder(ctx.expr(), [new ArrayType(ValueType.SUBJECT, 1)], subjectArrayType).toString());
    }

    visitEdgesOfExpr(ctx: EdgesOfExprContext): CustSpecComponent {
        const firstComp: CustSpecComponent = this.visit(ctx.expr(0));
        if (firstComp instanceof ErrorComponent) return firstComp;
        const firstExpr: Expr = firstComp as Expr;
        if (firstExpr.type() != ValueType.NODE)
            return new ErrorComponent(
                new TypeErrorBuilder(ctx.expr(0), [ValueType.NODE], firstExpr.type()).toString()
            );

        const secondComp: CustSpecComponent = this.visit(ctx.expr(1));
        if (secondComp instanceof ErrorComponent) return secondComp;
        const secondExpr: Expr = secondComp as Expr;
        if (secondExpr.type() != ValueType.NODE)
            return new ErrorComponent(
                new TypeErrorBuilder(ctx.expr(1), [ValueType.NODE], secondExpr.type()).toString()
            );

        return new EdgesOfExpr(firstExpr, secondExpr, this.runtime, ctx);
    }

    visitLiteralExpr(ctx: LiteralExprContext): CustSpecComponent {
        return this.visit(ctx.literal());
    }

    visitParExpr(ctx: ParExprContext): CustSpecComponent {
        return this.visit(ctx.expr());
    }

    visitArrayExpr(ctx: ArrayExprContext): CustSpecComponent {
        if (ctx.expr().length == 0) return new ArrayExpr([]);

        const contents: Expr[] = [];

        var exprComp: CustSpecComponent = this.visit(ctx.expr(0));
        if (exprComp instanceof ErrorComponent) return exprComp;
        var expr: Expr = exprComp as Expr;
        var type: ValueType | ArrayType | MapType = expr.type();
        contents.push(expr);

        for (var i = 1; i < ctx.expr().length; i++) {
            exprComp = this.visit(ctx.expr(i));
            if (exprComp instanceof ErrorComponent) return exprComp;
            expr = exprComp as Expr;
            const currentType: ValueType | ArrayType | MapType = expr.type();

            if (type instanceof ArrayType && type.type === undefined) {
                if (currentType instanceof ArrayType) {
                    if (currentType.type !== undefined) {
                        if (currentType.dimension < type.dimension)
                            return new ErrorComponent(new TypeErrorBuilder(ctx.expr(i), [type], expr.type()).toString());
                        type = currentType;
                    } else if (currentType.dimension > type.dimension) type = currentType;
                } else return new ErrorComponent(new TypeErrorBuilder(ctx.expr(i), [type], expr.type()).toString());
            } else if (JSON.stringify(type) !== JSON.stringify(expr.type()))
                return new ErrorComponent(
                    new TypeErrorBuilder(ctx.expr(i), [type], expr.type()).toString()
                );
            contents.push(expr);
        }

        return new ArrayExpr(
            contents,
            !(type instanceof ArrayType)
            ? new ArrayType(type, 1)
            : new ArrayType((type as ArrayType).type, (type as ArrayType).dimension + 1)
        );
    }

    visitParentVarExpr(ctx: ParentVarExprContext): CustSpecComponent {
        const parentsWritten: number = ctx.PARENT().length;
        const varName: string = ctx.ID().text;
        if (this.locationStack.length == 0) return new ErrorComponent(new ErrorBuilder(ctx, "Cannot use the parent prefix in the global scope").toString());
        else {
            var targetLocationScope: TCLocationScope | undefined = undefined;
            var traversed: number = 0;
            var locationStackIndex: number = this.locationStack.length - 1;
            while (true) {
                if (locationStackIndex < 0) return new ErrorComponent(new ErrorBuilder(ctx, "The number of parents written goes beyond the global scope.").toString());
                if (locationStackIndex == 0) {
                    var currLoc: Location = this.locationStack[0];
                    traversed++;
                    while (currLoc.getParent()) {
                        traversed++;
                        currLoc = currLoc.getParent()!;
                    }
                } else {
                    var currLoc: Location = this.locationStack[locationStackIndex];
                    const targetLoc: Location = this.locationStack[locationStackIndex - 1];
                    while (targetLoc != currLoc) {
                        currLoc = currLoc.getParent()!;
                        traversed++;
                    }
                }
                if (traversed > parentsWritten)
                    return new ErrorComponent(new ErrorBuilder(ctx, "Variable reference of a non-manually declared ancestor.").toString());
                else if (traversed == parentsWritten) {
                    // locVarsStack.length == locationStack.length + 1 => this scope is associated with an ancestor location, not the current one.
                    targetLocationScope = this.locVarsStack[locationStackIndex];
                    break;
                }

                locationStackIndex--;
            }

            if (!targetLocationScope)
                return new ErrorComponent(new ErrorBuilder(ctx, "Type-checker error: Cannot find target location scope").toString());

            const foundType: ValueType | ArrayType | MapType | undefined = targetLocationScope.getType(varName);
            if (foundType === undefined) return new ErrorComponent(new ErrorBuilder(ctx, "Variable with the name " + varName + " does not exist in the target scope.").toString());
            return new ParentVarExpr(varName, foundType, parentsWritten, this.runtime);
        }
    }

    visitIsNullExpr(ctx: IsNullExprContext): CustSpecComponent {
        const comp: CustSpecComponent = this.visit(ctx.expr());
        if (comp instanceof ErrorComponent) return comp;
        const expr: Expr = comp as Expr;
        if (expr.type() != ValueType.SUBJECT)
            return new ErrorComponent(new TypeErrorBuilder(ctx.expr(), [ValueType.SUBJECT], expr.type()).toString());

        return new IsNullExpr(expr, this.runtime);
    }

    visitNewMapExpr(ctx: NewMapExprContext): CustSpecComponent {
        const keyType: ValueType | ArrayType | MapType = this.extractType(ctx.type(0));
        const valueType: ValueType | ArrayType | MapType = this.extractType(ctx.type(1));
        return new NewMapExpr(new MapType(keyType, valueType));
    }

    visitPlusPlusExpr(ctx: PlusPlusExprContext): CustSpecComponent {
        return this.visit(ctx.plusPlus());
    }
    visitGetIncExpr(ctx: GetIncExprContext): CustSpecComponent {
        return this.getPlusPlusExpr(ctx, ctx.ID().text, true, false);
    }
    visitIncGetExpr(ctx: IncGetExprContext): CustSpecComponent {
        return this.getPlusPlusExpr(ctx, ctx.ID().text, true, true);
    }
    visitGetDecExpr(ctx: GetDecExprContext): CustSpecComponent {
        return this.getPlusPlusExpr(ctx, ctx.ID().text, false, false);
    }
    visitDecGetExpr(ctx: DecGetExprContext): CustSpecComponent {
        return this.getPlusPlusExpr(ctx, ctx.ID().text, false, true);
    }

    visitLiteral(ctx: LiteralContext): CustSpecComponent {
        return this.visit(ctx.getChild(0));
    }

    visitNumLit(ctx: NumLitContext): CustSpecComponent {
        const value: number = +ctx.NUM_VALUE().toString();
        if (isNaN(value))
            return new ErrorComponent(
                new ErrorBuilder(ctx, "Invalid number literal " + ctx.NUM_VALUE().toString()).toString()
            );
        return new IntLitExpr(value);
    }

    visitStringLit(ctx: StringLitContext): CustSpecComponent {
        const totalLength: number = ctx.STRING_VALUE().toString().length;
        const contents: string = ctx.STRING_VALUE().toString().substring(1, totalLength - 1);

        var finalString: string = "";
        for (var i = 0; i < contents.length; i++) {
            const currChar: string = contents.charAt(i);
            if (currChar === "\\") {
                // Assume that the input text is valid
                const nextChar: string = contents.charAt(++i);
                const transformed: string | undefined = this.transformChar(currChar + nextChar);
                if (transformed === undefined)
                    return new ErrorComponent(new ErrorBuilder(ctx, "Unknown character " + currChar + nextChar).toString());
                finalString += transformed;
            } else finalString += currChar;
        }

        return new StringLitExpr(finalString);
    }
    
    visitBooleanLit(ctx: BooleanLitContext): CustSpecComponent {
        return new BooleanLitExpr(ctx.TRUE() != undefined);
    }

    protected defaultResult(): CustSpecComponent {
        throw new Error('Method not implemented.');
    }


    // ========================Helpers========================
    private processPropCall(suffixed: SuffixedContext, id: TerminalNode, exprs: ExprContext[], ruleCtx: ParserRuleContext): PropExpr | ErrorComponent {
        const comp: CustSpecComponent = this.visit(suffixed);
        if (comp instanceof ErrorComponent) return comp;
        const expr: Expr = comp as Expr;

        const prop: string = id.toString();
        const argExprs: Expr[] = [];

        switch (prop) {
            case "length":
                if (expr.type() instanceof ArrayType && exprs.length == 0)
                    if ((expr.type() as ArrayType).dimension > 0) break;
            case "label":
                if (expr.type() == ValueType.EDGE && exprs.length == 0) break;
            case "contains":
            case "append": {
                const suffixedType: ValueType | ArrayType | MapType = expr.type();
                if (suffixedType instanceof ArrayType) {
                    const suffixedArrayType : ArrayType = suffixedType as ArrayType;
                    const expectedType: ValueType | ArrayType | MapType | undefined =
                        suffixedArrayType.dimension > 1
                        ? new ArrayType(suffixedArrayType.type, suffixedArrayType.dimension - 1)
                        : suffixedArrayType.type;

                    if (exprs.length == 1) {
                        const argComp: CustSpecComponent = this.visit(exprs[0]);
                        if (argComp instanceof ErrorComponent) return argComp;
                        const argExpr: Expr = argComp as Expr;
                        const argType: ValueType | ArrayType | MapType = argExpr.type();
                        var valid: boolean = false;

                        if (expectedType === undefined) valid = true;
                        else if (!(expectedType instanceof ArrayType)) valid = JSON.stringify(argType) === JSON.stringify(expectedType);
                        else if (expectedType instanceof ArrayType) {
                            if (expectedType.type !== undefined)
                                valid = JSON.stringify(argType) === JSON.stringify(expectedType);
                            else if (argType instanceof ArrayType) {
                                if (argType.type === undefined) valid = true;
                                else valid = argType.dimension >= expectedType.dimension;
                            }
                        }

                        if (valid) {
                            argExprs.push(argExpr);
                            break;
                        }
                    }
                }
            }
            case "remove": {
                if (expr.type() instanceof ArrayType)
                    if (exprs.length == 1) {
                        const indexComp: CustSpecComponent = this.visit(exprs[0]);
                        if (indexComp instanceof ErrorComponent) return indexComp;
                        const indexExpr: Expr = indexComp as Expr;
                        if (indexExpr.type() == ValueType.NUM) {
                            argExprs.push(indexExpr);
                            break;
                        }
                    }
            }
            case "setTitle": {
                if (expr.type() == ValueType.NODE)
                    if (exprs.length == 1) {
                        const newLabelComp: CustSpecComponent = this.visit(exprs[0]);
                        if (newLabelComp instanceof ErrorComponent) return newLabelComp;
                        const newLabelExpr: Expr = newLabelComp as Expr;
                        if (newLabelExpr.type() == ValueType.STRING) {
                            argExprs.push(newLabelExpr);
                            break;
                        }
                    }
            }
            case "title":
                if (expr.type() == ValueType.NODE && exprs.length == 0) break;
            case "addRow": {
                if (expr.type() == ValueType.NODE && exprs.length == 1) {
                    const newRowComp: CustSpecComponent = this.visit(exprs[0]);
                    if (newRowComp instanceof ErrorComponent) return newRowComp;
                    const newRowExpr: Expr = newRowComp as Expr;
                    if (newRowExpr.type() == ValueType.STRING) {
                        argExprs.push(newRowExpr);
                        break;
                    }
                }
            }
            case "rows":
                if (expr.type() == ValueType.NODE && exprs.length == 0) break;
            case "clearRows":
                if (expr.type() == ValueType.NODE && exprs.length == 0) break;
            case "removeRow": {
                if (expr.type() == ValueType.NODE && exprs.length == 1) {
                    const indexComp: CustSpecComponent = this.visit(exprs[0]);
                    if (indexComp instanceof ErrorComponent) return indexComp;
                    const indexExpr: Expr = indexComp as Expr;
                    if (indexExpr.type() == ValueType.NUM) {
                        argExprs.push(indexExpr);
                        break;
                    }
                }
            }
            case "setRows": {
                if (expr.type() == ValueType.NODE && exprs.length == 1) {
                    const rowsComp: CustSpecComponent = this.visit(exprs[0]);
                    if (rowsComp instanceof ErrorComponent) return rowsComp;
                    const rows: Expr = rowsComp as Expr;
                    if (JSON.stringify(rows.type()) === JSON.stringify(new ArrayType(ValueType.STRING, 1))) {
                        argExprs.push(rows);
                        break;
                    }
                }
            }
            case "size":
                if (expr.type() instanceof MapType && exprs.length == 0) break;
            case "put": {
                if (expr.type() instanceof MapType && exprs.length == 2) {
                    const mapType: MapType = expr.type() as MapType;

                    const keyComp: CustSpecComponent = this.visit(exprs[0]);
                    if (keyComp instanceof ErrorComponent) return keyComp;
                    const key: Expr = keyComp as Expr;
                    if (JSON.stringify(key.type()) === JSON.stringify(mapType.keyType)) {
                        argExprs.push(key);
                        const valueComp: CustSpecComponent = this.visit(exprs[1]);
                        if (valueComp instanceof ErrorComponent) return valueComp;
                        const value: Expr = valueComp as Expr;
                        if (JSON.stringify(value.type()) === JSON.stringify(mapType.valueType)) {
                            argExprs.push(value);
                            break;
                        }
                    }
                }
            }
            case "containsKey":
            case "get": {
                if (expr.type() instanceof MapType && exprs.length == 1) {
                    const mapType: MapType = expr.type() as MapType;

                    const keyComp: CustSpecComponent = this.visit(exprs[0]);
                    if (keyComp instanceof ErrorComponent) return keyComp;
                    const key: Expr = keyComp as Expr;
                    if (JSON.stringify(key.type()) === JSON.stringify(mapType.keyType)) {
                        argExprs.push(key);
                        break;
                    }
                }
            }
            default:
                return new ErrorComponent(
                    new ErrorBuilder(ruleCtx, "The property " + prop + " does not exist for expressions of type " + expr.type()).toString()
                );
        }

        return new PropExpr(expr, prop, argExprs, this.runtime, ruleCtx);
    }
    
    private transformChar(char: string): string | undefined {
        if (char.length < 1 || char.length > 2) return undefined;
        if (char.length == 1) {
            if (char === "\\") return undefined;
            return char;
        }
        const first: string = char.charAt(0);
        if (first != "\\") return undefined;
        const second: string = char.charAt(1);
        switch(second) {
            case "\"": return "\"";
            case "'": return "'";
            case "\\": return "\\";
            case "t": return "\t";
            case "b": return "\b";
            case "r": return "\r";
            case "f": return "\f";
            case "n": return "\n";
            default: return undefined;
        }
    }

    private getTopScopeLocation(locationName: string, type: LocationType): Location | undefined {
        for (var location of this.getTopLocations()) {
            if (location.getName() === locationName && location.type() == type) return location;
        }
        return undefined;
    }

    private getTopLocations(): Location[] {
        const result: Location[] = [];
        for (const topStatement of this.topStatements)
            if (topStatement instanceof Location)
                result.push(topStatement);
        return result;
    }

    private pushLocationToStack(location: Location) {
        this.locationStack.push(location);
    }

    private openLocationScope() {
        this.locVarsStack.push(new TCLocationScope());
    }

    private closeLocationScope(): boolean {
        if (this.locVarsStack.length == 0) return false;
        this.locVarsStack.pop();
        return true;
    }

    private openVariableScope(): boolean {
        if (this.locVarsStack.length == 0) return false;
        this.locVarsStack.at(-1)!.openVariableScope();
        return true;
    }

    private closeVariableScope(): boolean {
        if (this.locVarsStack.length == 0) return false;
        return this.locVarsStack.at(-1)!.closeVariableScope();
    }

    private addTCVariable(name: string, type: ValueType | ArrayType | MapType): boolean {
        if (this.locVarsStack.length == 0) return false;
        return this.locVarsStack.at(-1)!.addVariable(name, type);
    }

    private containsTCVariable(name: string): boolean {
        if (this.locVarsStack.length == 0) return false;
        return this.locVarsStack.at(-1)!.containsVariable(name);
    }

    private getTCType(name: string): ValueType | ArrayType | MapType | undefined {
        if (this.locVarsStack.length == 0) return undefined;
        return this.locVarsStack.at(-1)!.getType(name);
    }

    private extractType(typeCtx: TypeContext): ValueType | ArrayType | MapType {
        const typeCtxs: TypeContext[] = typeCtx.type();
        if (typeCtxs.length == 1) {
            const innerType: ValueType | ArrayType | MapType = this.extractType(typeCtxs[0]);
            if (innerType instanceof ArrayType)
                return new ArrayType(innerType.type, innerType.dimension + 1);
            else return new ArrayType(innerType, 1);
        } else if (typeCtxs.length == 2)
            return new MapType(this.extractType(typeCtxs[0]), this.extractType(typeCtxs[1]));
        else {
            if (typeCtx.basicType()!.NUM_TYPE()) return ValueType.NUM;
            else if (typeCtx.basicType()!.BOOLEAN_TYPE()) return ValueType.BOOLEAN;
            else if (typeCtx.basicType()!.STRING_TYPE()) return ValueType.STRING;
            else if (typeCtx.basicType()!.NODE_TYPE()) return ValueType.NODE;
            else if (typeCtx.basicType()!.EDGE_TYPE()) return ValueType.EDGE;
            else return ValueType.SUBJECT;
        }
    }

    private getPlusPlusExpr(ctx: ParserRuleContext, varName: string, inc: boolean, opFirst: boolean): CustSpecComponent {
        const type: ValueType | ArrayType | MapType | undefined = this.getTCType(varName);
        if (type === undefined)
            return new ErrorComponent(
                new ErrorBuilder(ctx, "Variable " + varName + " is not defined in this scope").toString()
            );
        if (type != ValueType.NUM)
            return new ErrorComponent(new TypeErrorBuilder(ctx, [ValueType.NUM], type).toString());

        return new PlusPlusExpr(varName, inc, opFirst, this.runtime);
    }
}