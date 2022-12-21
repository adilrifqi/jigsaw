import { CustSpecVisitor } from '../antlr/parser/src/customization/antlr/CustSpecVisitor';
import { AbstractParseTreeVisitor } from 'antlr4ts/tree/AbstractParseTreeVisitor'
import { CustSpecComponent } from './model/CustSpecComponent';
import { AddCommandContext, ArrayAccessSuffixContext, ArrayExprContext, ArrayIndexReassignCommandContext, BooleanLitContext, ChildrenExprContext, ChildrenOfExprContext, CommandContext, ComparisonContext, ConjunctionContext, CustLocationContext, CustSpecParser, DisjunctionContext, EdgesOfExprContext, ExprContext, FieldSubjectExprContext, HereExprContext, IdExprContext, IfCommandContext, LiteralContext, LiteralExprContext, LocIdContext, NegationContext, NewEdgeExprContext, NewNodeExprContext, NewVarCommandContext, NodeOfExprContext, NumLitContext, OmitCommandContext, ParentsExprContext, ParentsOfExprContext, ParExprContext, PlainPropCallCommandContext, PrimaryExprContext, PropSuffixContext, ReassignCommandContext, ScopeCommandContext, StartContext, StringLitContext, SuffixedContext, SumContext, TermContext, TypeContext, ValueOfExprContext, WhileCommandContext } from '../antlr/parser/src/customization/antlr/CustSpecParser';
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
import { Location } from './model/location/Location';
import { TCLocationScope } from './model/TCLocationScope';
import { CustomizationRuntime } from './model/CustomizationRuntime';
import { NewEdgeExpr } from './model/expr/NewEdgeExpr';
import { NewNodeExpr } from './model/expr/NewNodeExpr';
import { VarRefExpr } from './model/expr/VarRefExpr';
import { NewVarCommand } from './model/command/NewVarCommand';
import { ReassignCommand } from './model/command/ReassignCommand';
import { AddCommand } from './model/command/AddCommand';
import { LocationType } from './model/location/LocationType';
import { OmitCommand } from './model/command/OmitCommand';
import { NodeOfExpr } from './model/expr/NodeOfExpr';
import path = require('path');
import { ArrayExpr, ArrayType } from './model/expr/ArrayExpr';
import { ArrayAccessExpr } from './model/expr/ArrayAccessExpr';
import { EdgesOfExpr } from './model/expr/EdgesOfExpr';
import { HereExpr } from './model/expr/HereExpr';
import { ParentsOfExpr } from './model/expr/ParentsOfExpr';
import { ChildrenOfExpr } from './model/expr/ChildrenOfExpr';
import { FieldSubjectExpr } from './model/expr/FieldSubjectExpr';
import { PropExpr } from './model/expr/PropExpr';
import { AdditionExpr } from './model/expr/AdditionExpr';
import { ValueOfExpr } from './model/expr/ValueOfExpr';
import { ArrayIndexReassignCommand } from './model/command/ArrayIndexReassignCommand';
import { TerminalNode } from 'antlr4ts/tree/TerminalNode';
import { ExprCommand } from './model/command/ExprCommand';


// TODO: Implement the value retrieval for more complex data structures (currently boolean, number, string, and arrays)
export class CustomizationBuilder extends AbstractParseTreeVisitor<CustSpecComponent> implements CustSpecVisitor<CustSpecComponent> {
    private locationStack: Location[] = [];
    private topLocations: Location[] = []; // Not to be added to the runtime before all visitations have been done.
    private locVarsStack: TCLocationScope[] = [];
    private runtime: CustomizationRuntime = new CustomizationRuntime();

    public buildCustomization(spec: string): CustomizationRuntime | ErrorComponent {
        this.locationStack = [];
        this.topLocations = [];
        this.locVarsStack = [];
        this.runtime = new CustomizationRuntime();
        
        const lexer: Lexer = new CustSpecLexer(CharStreams.fromString(spec));
        const parser: CustSpecParser = new CustSpecParser(new CommonTokenStream(lexer));
        const tree: ParseTree = parser.start();

        const visitResult: CustSpecComponent = this.visit(tree);
        if (visitResult instanceof ErrorComponent) return visitResult;

        this.runtime.setTopLocations(this.topLocations);
        return this.runtime;
    }

    visitStart(ctx: StartContext): CustSpecComponent {
        for (var location of ctx.custLocation()) {
            const comp: CustSpecComponent = this.visit(location);
            if (comp instanceof ErrorComponent) return comp;
            // this.topLocations.push(comp as Location);
        }
        return this.runtime;
    }

    visitCustLocation(ctx: CustLocationContext): CustSpecComponent {
        return this.createLocation(ctx.locId(), ctx.command(), ctx.custLocation());
    }

    private createLocation(locIds: LocIdContext[], commands: CommandContext[], custLocations: CustLocationContext[]): CustSpecComponent {
        if (locIds.length == 1) {
            const newLocationName: string = locIds[0].ID() ? locIds[0].ID()!.toString() : locIds[0].NUM_VALUE()!.toString();
            const type: LocationType = locIds[0].CLASS != undefined ? LocationType.CLASS : LocationType.FIELD;

            const newLocation: Location = new Location(newLocationName, type, this.runtime);
            if (this.locationStack.length > 0) {
                var currentLocation: Location | undefined = this.locationStack.at(-1)!;
                newLocation.setParent(currentLocation);
                if (!currentLocation.addChild(newLocation))
                    return new ErrorComponent(
                        new ErrorBuilder(locIds[0], "Location with name " + newLocationName + " already exists in location " + currentLocation.getName()).toString()
                    );
            }

            // Replace a temporary location with the same name in the same location if it exists
            const toInspect: Location[] = this.locationStack.length == 0 ? this.topLocations : this.locationStack.at(-1)!.getChildren();
            var toSwap: number = -1;
            for (var i = 0; i < toInspect.length; i++) {
                const location: Location = toInspect[i];
                if (location.getType() == type && location.getName() === newLocationName) {
                    toSwap = i;
                    break;
                }
            }
            if (toSwap > -1) {
                var oldLocation: Location = toInspect[toSwap];
                newLocation.setParent(oldLocation.getParent());
                newLocation.setChildren(oldLocation.getChildren());
                newLocation.setCommands(oldLocation.getCommands());
                toInspect[toSwap] = newLocation;
            } else if (!this.addTopLocation(newLocation))
                return new ErrorComponent(new ErrorBuilder(locIds[0], "Top location must be a class.").toString());

            this.pushLocationToStack(newLocation);
        } else {
            const newLocationName: string = locIds[locIds.length - 1].ID() ? locIds[locIds.length - 1].ID()!.toString() : locIds[locIds.length - 1].NUM_VALUE()!.toString();
            const type: LocationType = locIds[locIds.length - 1].CLASS() != undefined ? LocationType.CLASS : LocationType.FIELD;

            var currentLocation: Location | undefined = this.locationStack.length > 0 ? this.locationStack.at(-1)! : undefined;
            var foundDirectParent: boolean = false;

            const ids: {id: string, type: LocationType}[] = [];
            for (const locId of locIds) {
                const locIdName: string = locId.ID() ? locId.ID()!.toString() : locId.NUM_VALUE()!.toString();
                ids.push({id: locIdName, type: locId.CLASS() != undefined ? LocationType.CLASS : LocationType.FIELD});
            }

            var idIndex: number = 0;
            for (; idIndex < ids.length - 1; idIndex++) {
                const nextLocation: Location | undefined = currentLocation === undefined
                        ? this.getTopScopeLocation(ids[idIndex].id)
                        : currentLocation.getChild(ids[idIndex].id);

                if (nextLocation) {
                    currentLocation = nextLocation;
                    if (idIndex >= ids.length - 2) {
                        foundDirectParent = true;
                        break;
                    }
                } else break;
            }

            if (!foundDirectParent) {
                const isNewTopLocation: boolean = idIndex == 0;
                for (; idIndex < ids.length - 1; idIndex++) {
                    const newLocation: Location = new Location(ids[idIndex].id, ids[idIndex].type, this.runtime);
                    if (currentLocation) {
                        currentLocation.addChild(newLocation);
                        newLocation.setParent(currentLocation);
                    }
                    currentLocation = newLocation;
                }

                const newLocation: Location = new Location(newLocationName, type, this.runtime, currentLocation);
                if (currentLocation) currentLocation.addChild(newLocation); // Can be null?
                else return new ErrorComponent(new ErrorBuilder(locIds[0], "Bug with type checker. Found undefined where there shouldn't be.").toString());
                if (isNewTopLocation && !this.addTopLocation(newLocation))
                    return new ErrorComponent(new ErrorBuilder(locIds[0], "Top location must be a class.").toString());
                this.pushLocationToStack(newLocation);
            } else {
                var toSwap: number = -1;
                for (var i = 0; i < currentLocation!.getChildren().length; i++) {
                    const currentCurrentLocationChild: Location = currentLocation!.getChildren()[i];
                    if (currentCurrentLocationChild.getType() == type
                            && currentCurrentLocationChild.getName() === newLocationName) {
                        toSwap = i;
                        break;
                    }
                }
                const newLocation: Location = new Location(newLocationName, type, this.runtime, currentLocation);
                if (toSwap > -1) {
                    const oldLocation: Location = currentLocation!.getChildren()[toSwap];
                    newLocation.setParent(oldLocation.getParent());
                    newLocation.setChildren(oldLocation.getChildren());
                    newLocation.setCommands(oldLocation.getCommands());
                    currentLocation!.getChildren()[toSwap] = newLocation;
                } else if (!this.addTopLocation(newLocation))
                    return new ErrorComponent(new ErrorBuilder(locIds[0], "Top location must be a class.").toString());

                currentLocation!.addChild(newLocation);
                this.pushLocationToStack(newLocation);
            }
        }

        this.openLocationScope();
        const newLocation: Location = this.locationStack.at(-1)!;
        for (var commandCtx of commands) {
            const visitResult: CustSpecComponent = this.visit(commandCtx);
            if (visitResult instanceof ErrorComponent) return visitResult;
            newLocation.addCommand(visitResult as Command);
        }
        for (var locationCtx of custLocations) {
            const visitResult: CustSpecComponent = this.visit(locationCtx);
            if (visitResult instanceof ErrorComponent) return visitResult;
            newLocation.addChild(visitResult as Location);
        }
        if (!this.closeLocationScope()) {
            return new ErrorComponent(
                new ErrorBuilder(locIds[0], "Type-checker has a bug where locations are closed more than they were opened.").toString()
            );
        }
        return this.locationStack.pop()!;
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

        if (this.locationStack.length == 0)
            return new ErrorComponent(
                new ErrorBuilder(ctx, "Type checker bug where the location stack is empty where it shouldn't be.").toString()
            );
        return new ScopeCommand(commands, this.runtime, this.locationStack.at(-1)!, ctx);
    }

    visitNewVarCommand(ctx: NewVarCommandContext): CustSpecComponent {
        var deepestType: ValueType;
        var dimension: number = 0;
        var currentTypeCtx: TypeContext = ctx.type();
        while (currentTypeCtx.type()) {
            dimension++;
            currentTypeCtx = currentTypeCtx.type()!;
        }
        
        if (currentTypeCtx.basicType()!.NUM_TYPE()) deepestType = ValueType.NUM;
        else if (currentTypeCtx.basicType()!.BOOLEAN_TYPE()) deepestType = ValueType.BOOLEAN;
        else if (currentTypeCtx.basicType()!.STRING_TYPE()) deepestType = ValueType.STRING;
        else if (currentTypeCtx.basicType()!.NODE_TYPE()) deepestType = ValueType.NODE;
        else if (currentTypeCtx.basicType()!.EDGE_TYPE()) deepestType = ValueType.EDGE;
        else if (currentTypeCtx.basicType()!.SUBJECT_TYPE()) deepestType = ValueType.SUBJECT;
        else return new ErrorComponent(
            new ErrorBuilder(ctx.type(), "Invalid type " + ctx.type().toString() + ".").toString()
        );

        const declaredType: ValueType | ArrayType = dimension == 0 ? deepestType : {type: deepestType, dimension: dimension};
        const varName: string = ctx.ID().toString();

        const exprComp: CustSpecComponent = this.visit(ctx.expr());
        if (exprComp instanceof ErrorComponent) return exprComp;
        const expr: Expr = exprComp as Expr;

        if (declaredType == ValueType.NODE && expr.type() != ValueType.NODE && expr.type() !== null)
            return new ErrorComponent(
                new TypeErrorBuilder(ctx.expr(), [ValueType.NODE], expr.type()).toString()
            );
        else if (declaredType == ValueType.EDGE && expr.type() != ValueType.EDGE && expr.type() !== null)
            return new ErrorComponent(
                new TypeErrorBuilder(ctx.expr(), [ValueType.EDGE], expr.type()).toString()
            );
        else if (!(declaredType as any in ValueType)) {
            // If the given array type is of dimension 0 then it's fine
            // If they're both arrays with different types, raise error
            const declaredArrayType: ArrayType = declaredType as ArrayType;
            if (expr.type() as any in ValueType)
                return new ErrorComponent(
                    new TypeErrorBuilder(ctx.expr(), [declaredType], expr.type()).toString()
                );
            const givenArrayType: ArrayType = expr.type() as ArrayType;
            if (givenArrayType.dimension > 0 && JSON.stringify(declaredArrayType) !== JSON.stringify(givenArrayType))
                return new ErrorComponent(
                    new TypeErrorBuilder(ctx.expr(), [declaredType], expr.type()).toString()
                );
        } else if (JSON.stringify(declaredType) != JSON.stringify(expr.type()))
            return new ErrorComponent(
                new TypeErrorBuilder(ctx.expr(), [declaredType], expr.type()).toString()
            );
        
        if (!this.addTCVariable(varName, declaredType))
            return new ErrorComponent(
                new ErrorBuilder(ctx, "Variable with name " + varName + " already exists in this scope.").toString()
            );

        if (this.locationStack.length == 0)
            return new ErrorComponent(
                new ErrorBuilder(ctx, "Type checker bug where the location stack is empty where it shouldn't be.").toString()
            );
        return new NewVarCommand(varName, expr, declaredType, this.runtime, this.locationStack.at(-1)!, ctx);
    }

    visitReassignCommand(ctx: ReassignCommandContext): CustSpecComponent {
        const varName: string = ctx.ID().toString();
        if (this.locVarsStack.length == 0)
            return new ErrorComponent(
                new ErrorBuilder(ctx, "Bug in type checker where scope does not exist where it should").toString()
            );

        if (this.locationStack.length == 0)
            return new ErrorComponent(
                new ErrorBuilder(ctx, "Type checker bug where the location stack is empty where it shouldn't be.").toString()
            );

        const type: ValueType | ArrayType | undefined = this.getTCType(varName);
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
            
        return new ReassignCommand(varName, expr, this.runtime, this.locationStack.at(-1)!, ctx);
    }

    visitArrayIndexReassignCommand(ctx: ArrayIndexReassignCommandContext): CustSpecComponent {
        const arrayComp: CustSpecComponent = this.visit(ctx.expr(0));
        if (arrayComp instanceof ErrorComponent) return arrayComp;
        const arrayExpr: Expr = arrayComp as Expr;
        if (arrayExpr.type() as any in ValueType)
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

        const expectedType: ValueType | ArrayType =
            indicesCount == arrayType.dimension
            ? arrayType.type
            : {type: arrayType.type, dimension: arrayType.dimension - indicesCount};

        const newValueComp: CustSpecComponent = this.visit(ctx.expr(ctx.expr().length - 1));
        if (newValueComp instanceof ErrorComponent) return newValueComp;
        const newValueExpr: Expr = newValueComp as Expr;
        if (JSON.stringify(expectedType) !== JSON.stringify(newValueExpr.type()))
            return new ErrorComponent(new TypeErrorBuilder(ctx.expr(ctx.expr().length - 1), [expectedType], newValueExpr.type()).toString());

        return new ArrayIndexReassignCommand(arrayExpr, indexExprs, newValueExpr, this.runtime, this.locationStack.at(-1)!, ctx);
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

        if (this.locationStack.length == 0)
            return new ErrorComponent(
                new ErrorBuilder(ctx, "Type checker bug where the location stack is empty where it shouldn't be.").toString()
            );
        return new IfElseCommand(conditions, commands, this.locationStack.at(-1)!);
    }

    visitWhileCommand(ctx: WhileCommandContext): CustSpecComponent {
        const exprComp: CustSpecComponent = this.visit(ctx.expr());
        if (exprComp instanceof ErrorComponent) return exprComp;
        const expr: Expr = exprComp as Expr;
        if (expr.type() != ValueType.BOOLEAN)
            return new ErrorComponent(
                new TypeErrorBuilder(ctx.expr(), [ValueType.BOOLEAN], expr.type()).toString()
            );
        
        const commandComp: CustSpecComponent = this.visit(ctx.command());
        if (commandComp instanceof ErrorComponent) return commandComp;
        const command: Command = commandComp as Command;

        if (this.locationStack.length == 0)
            return new ErrorComponent(
                new ErrorBuilder(ctx, "Type checker bug where the location stack is empty where it shouldn't be.").toString()
            );
        return new WhileCommand(expr, command, this.locationStack.at(-1)!);
    }

    visitAddCommand(ctx: AddCommandContext): CustSpecComponent {
        const comp: CustSpecComponent = this.visit(ctx.expr());
        if (comp instanceof ErrorComponent) return comp;
        const expr: Expr = comp as Expr;
        const exprType: ValueType | ArrayType = expr.type();
        var mistype: boolean = false;

        if (exprType as any in ValueType) {
            if (exprType != ValueType.NODE && exprType != ValueType.EDGE) mistype = true;
        } else {
            const arrayType: ArrayType = exprType as ArrayType;
            if (arrayType.dimension != 1 || (arrayType.type != ValueType.NODE && arrayType.type != ValueType.EDGE))
                mistype = true;
        }

        if (mistype)
            return new ErrorComponent(
                new TypeErrorBuilder(ctx.expr(), [ValueType.NODE, ValueType.EDGE, {type: ValueType.NODE, dimension: 1}, {type: ValueType.EDGE, dimension: 1}], expr.type()).toString()
            );

        return new AddCommand(expr, this.runtime, this.locationStack.at(-1)!, ctx);
    }

    visitOmitCommand(ctx: OmitCommandContext): CustSpecComponent {
        const comp: CustSpecComponent = this.visit(ctx.expr());
        if (comp instanceof ErrorComponent) return comp;
        const expr: Expr = comp as Expr;
        const exprType: ValueType | ArrayType = expr.type();
        var mistype: boolean = false;

        if (exprType as any in ValueType) {
            if (exprType != ValueType.NODE && exprType != ValueType.EDGE) mistype = true;
        } else {
            const arrayType: ArrayType = exprType as ArrayType;
            if (arrayType.dimension != 1 || (arrayType.type != ValueType.NODE && arrayType.type != ValueType.EDGE))
                mistype = true;
        }

        if (mistype)
            return new ErrorComponent(
                new TypeErrorBuilder(ctx.expr(), [ValueType.NODE, ValueType.EDGE, {type: ValueType.NODE, dimension: 1}, {type: ValueType.EDGE, dimension: 1}], expr.type()).toString()
            );

        return new OmitCommand(expr, this.runtime, this.locationStack.at(-1)!, ctx);
    }

    visitPlainPropCallCommand(ctx: PlainPropCallCommandContext): CustSpecComponent {
        const propCall: Expr | ErrorComponent = this.processPropCall(ctx.suffixed(), ctx.ID(), ctx.expr(), ctx);
        if (propCall instanceof ErrorComponent) return propCall;
        return new ExprCommand(propCall, this.locationStack.at(-1)!);
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
            
            return new BinaryNumOp(leftExpr, rightExpr, NumOp.SUB);
        } else {
            const leftComp: CustSpecComponent = this.visit(ctx._left);
            if (leftComp instanceof ErrorComponent) return leftComp;
            const leftExpr: Expr = leftComp as Expr;
            const leftType: ValueType | ArrayType = leftExpr.type();

            const rightComp: CustSpecComponent = this.visit(ctx._right);
            if (rightComp instanceof ErrorComponent) return rightComp;
            const rightExpr: Expr = rightComp as Expr;
            const rightType: ValueType | ArrayType = rightExpr.type();

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

            if (!(leftType as any in ValueType)) {
                if (rightType as any in ValueType)
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
                ctx.TIMES() != undefined ? NumOp.MULT : NumOp.DIV
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
        if (ctx.ID()) return this.processPropCall(ctx.suffixed(), ctx.ID()!, ctx.expr(), ctx);
        else {
            const comp: CustSpecComponent = this.visit(ctx.suffixed()!);
            if (comp instanceof ErrorComponent) return comp;
            const expr: Expr = comp as Expr;

            if (expr.type() != ValueType.SUBJECT)
                return new ErrorComponent(
                    new TypeErrorBuilder(ctx, [ValueType.SUBJECT], expr.type()).toString()
                );

            const locIdName: string = ctx.locId()!.ID() ? ctx.locId()!.ID()!.toString() : ctx.locId()!.NUM_VALUE()!.toString();
            return new PropExpr(expr, locIdName, [], this.runtime, ctx, true);
        }
    }

    visitArrayAccessSuffix(ctx: ArrayAccessSuffixContext): CustSpecComponent {
        const arrayComp: CustSpecComponent = this.visit(ctx.suffixed()!);
        if (arrayComp instanceof ErrorComponent) return arrayComp;
        const arrayExpr: Expr = arrayComp as Expr;
        if (arrayExpr.type() as any in ValueType)
            return new ErrorComponent(
                new ErrorBuilder(ctx.suffixed()!, "Indexed expression must be an array. Found " + arrayExpr.type()).toString()
            );
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

    visitPrimaryExpr(ctx: PrimaryExprContext): CustSpecComponent {
        return this.visit(ctx.primary());
    }

    visitIdExpr(ctx: IdExprContext): CustSpecComponent {
        const varName: string = ctx.ID().toString();
        const type: ValueType | ArrayType | undefined = this.getTCType(varName);
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

        var deepestType: ValueType;
        var dimension: number = 0;
        var currentTypeCtx: TypeContext = ctx.type();
        while (currentTypeCtx.type()) {
            dimension++;
            currentTypeCtx = currentTypeCtx.type()!;
        }
        if (currentTypeCtx.basicType()!.NUM_TYPE()) deepestType = ValueType.NUM;
        else if (currentTypeCtx.basicType()!.BOOLEAN_TYPE()) deepestType = ValueType.BOOLEAN;
        else if (currentTypeCtx.basicType()!.STRING_TYPE()) deepestType = ValueType.STRING;
        else return new ErrorComponent(
            new ErrorBuilder(ctx.type(), "Invalid type " + ctx.type().toString() + ".").toString()
        );
        const declaredType: ValueType | ArrayType = dimension == 0 ? deepestType : {type: deepestType, dimension: dimension};

        return new ValueOfExpr(expr, declaredType, this.runtime, ctx);
    }

    visitFieldSubjectExpr(ctx: FieldSubjectExprContext): CustSpecComponent {
        if (ctx.locId().CLASS())
            return new ErrorComponent(
                new ErrorBuilder(ctx, "Cannot access children class.").toString()
            );
        else {
            const locIdName: string = ctx.locId().ID() ? ctx.locId().ID()!.toString() : ctx.locId().NUM_VALUE()!.toString();
            return new FieldSubjectExpr(locIdName, this.runtime, ctx);
        }
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
        const type: ValueType | ArrayType = expr.type();
        contents.push(expr);

        for (var i = 1; i < ctx.expr().length; i++) {
            exprComp = this.visit(ctx.expr(i));
            if (exprComp instanceof ErrorComponent) return exprComp;
            expr = exprComp as Expr;
            if (JSON.stringify(type) !== JSON.stringify(expr.type()))
                return new ErrorComponent(
                    new TypeErrorBuilder(ctx.expr(i), [type], expr.type()).toString()
                );
            contents.push(expr);
        }

        return new ArrayExpr(
            contents,
            (type as any in ValueType)
            ? {type: type as ValueType, dimension: 1}
            : {type: (type as ArrayType).type, dimension: (type as ArrayType).dimension + 1}
        );
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
                if (!(expr.type() as any in ValueType) && exprs.length == 0)
                    if ((expr.type() as ArrayType).dimension > 0) break;
            case "label":
                if (expr.type() == ValueType.EDGE && exprs.length == 0) break;
            case "append": {
                const suffixedType: ValueType | ArrayType = expr.type();
                if (!(suffixedType as any in ValueType)) {
                    const suffixedArrayType : ArrayType = suffixedType as ArrayType;
                    const expectedType: ValueType | ArrayType =
                        suffixedArrayType.dimension > 1
                        ? {type: suffixedArrayType.type, dimension: suffixedArrayType.dimension - 1}
                        : suffixedArrayType.type;

                    if (exprs.length == 1) {
                        const newElementComp: CustSpecComponent = this.visit(exprs[0]);
                        if (newElementComp instanceof ErrorComponent) return newElementComp;
                        const newElementExpr: Expr = newElementComp as Expr;
                        if (JSON.stringify(newElementExpr.type()) === JSON.stringify(expectedType)) {
                            argExprs.push(newElementExpr);
                            break;
                        }
                    }
                }
            }
            case "remove": {
                const suffixedType: ValueType | ArrayType = expr.type();
                if (!(suffixedType as any in ValueType))
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
                const suffixedType: ValueType | ArrayType = expr.type();
                if (suffixedType == ValueType.NODE)
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
            default:
                return new ErrorComponent(
                    new ErrorBuilder(ruleCtx, "The property " + prop + " does not exist for expressions of type " + expr.type()).toString()
                );
        }

        return new PropExpr(expr, prop, argExprs, this.runtime, ruleCtx);
    }

    private validChar(char: string): boolean {
        return this.transformChar(char) != undefined;
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

    private getTopScopeLocation(locationName: string): Location | undefined {
        for (var location of this.topLocations) {
            if (location.getName() === locationName) return location;
        }
        return undefined;
    }

    private addTopLocation(location: Location): boolean {
        if (this.locationStack.length == 0) {
            var currentLocation: Location = location;
            var currentLocationParent: Location | undefined = location.getParent();
            while (currentLocationParent) {
                currentLocation = currentLocationParent;
                currentLocationParent = currentLocation.getParent();
            }
            if (currentLocation.getType() == LocationType.FIELD) return false;
            this.topLocations.push(currentLocation);
            return true;
        }
        return false;
        // this.locationStack.push(location);
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

    private addTCVariable(name: string, type: ValueType | ArrayType): boolean {
        if (this.locVarsStack.length == 0) return false;
        return this.locVarsStack.at(-1)!.addVariable(name, type);
    }

    private containsTCVariable(name: string): boolean {
        if (this.locVarsStack.length == 0) return false;
        return this.locVarsStack.at(-1)!.containsVariable(name);
    }

    private getTCType(name: string): ValueType | ArrayType | undefined {
        if (this.locVarsStack.length == 0) return undefined;
        return this.locVarsStack.at(-1)!.getType(name);
    }
}