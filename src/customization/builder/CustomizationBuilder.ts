import { CustSpecVisitor } from '../antlr/parser/src/customization/antlr/CustSpecVisitor';
import { AbstractParseTreeVisitor } from 'antlr4ts/tree/AbstractParseTreeVisitor'
import { CustSpecComponent } from './model/CustSpecComponent';
import { BooleanLitContext, CharLitContext, ClassLocationContext, CommandContext, ComparisonContext, ConjunctionContext, CustElementExprContext, CustLocationContext, CustSpecParser, DisjunctionContext, ExprContext, FieldLocationContext, IdRuleContext, IfCommandContext, LiteralContext, LiteralExprContext, NegationContext, NoneExprContext, NumLitContext, ParExprContext, ScopeCommandContext, StringLitContext, SumContext, TermContext, WhileCommandContext } from '../antlr/parser/src/customization/antlr/CustSpecParser';
import { BooleanLitExpr } from './model/expr/BooleanLitExpr';
import { ErrorComponent } from './model/ErrorComponent';
import { StringExpr } from './model/expr/StringExpr';
import { IntLitExpr } from './model/expr/IntLitExpr';
import { CustSpecLexer } from '../antlr/parser/src/customization/antlr/CustSpecLexer';
import { CharStreams, CommonTokenStream, Lexer } from 'antlr4ts';
import { ParseTree } from 'antlr4ts/tree/ParseTree';
import { ErrorBuilder } from './error/ErrorBuilder';
import { CharExpr } from './model/expr/CharExpr';
import { NoneExpr } from './model/expr/NoneExpr';
import { Expr } from './model/expr/Expr';
import { ValueType } from './model/expr/ValueType';
import { TypeErrorBuilder } from './error/TypeErrorBuilder';
import { NotExpr } from './model/expr/NotExpr';
import { BooleanExpr } from './model/expr/BooleanExpr';
import { NegativeExpr } from './model/expr/NegativeExpr';
import { NumExpr } from './model/expr/NumExpr';
import { BinaryNumOp, NumOp } from './model/expr/BinaryNumOp';
import { ComparisonExpr, CompOp } from './model/expr/ComparisonExpr';
import { BinaryBoolOp, BoolOp } from './model/expr/BinaryBoolOp';
import { Command } from './model/command/Command';
import { WhileCommand } from './model/command/WhileCommand';
import { IfElseCommand } from './model/command/IfElseCommand';
import { ScopeCommand } from './model/command/ScopeCommand';
import { Location } from './model/location/Location';
import { TerminalNode } from 'antlr4ts/tree/TerminalNode';
import { TCLocationScope } from './model/TCLocationScope';


// TODO: NewVarCommand
// TODO: ReassignCommand
// TODO: IdExpr
// TODO: custElement
// TODO: idRule
// TODO: dottedId
// TODO: check null
export class CustomizationBuilder extends AbstractParseTreeVisitor<CustSpecComponent> implements CustSpecVisitor<CustSpecComponent> {
    private errors: string[] = [];
    private locationStack: Location[] = [];
    private topLocations: Location[] = [];
    private locVarsStack: TCLocationScope[] = [];

    public buildCustomization(spec: string) {
        this.errors = [];
        this.locationStack = [];
        this.topLocations = [];
        this.locVarsStack = [];
        
        const lexer: Lexer = new CustSpecLexer(CharStreams.fromString(spec));
        const parser: CustSpecParser = new CustSpecParser(new CommonTokenStream(lexer));
        const tree: ParseTree = parser.start();
        this.visit(tree);
    }

    visitClassLocation(ctx: ClassLocationContext): CustSpecComponent {
        return this.createLocation(ctx.idRule(), ctx.command(), ctx.custLocation());
    }

    visitFieldLocation(ctx: FieldLocationContext): CustSpecComponent {
        return this.createLocation(ctx.idRule(), ctx.command(), ctx.custLocation());
    }

    private createLocation(idRule: IdRuleContext, commands: CommandContext[], custLocations: CustLocationContext[]): CustSpecComponent {
        if (idRule.ID()) {
            var newLocationName: string = idRule.ID()!.toString();

            const newLocation: Location = new Location(newLocationName, false);
            if (this.locationStack.length > 0) {
                var currentLocation: Location | undefined = this.locationStack.at(-1)!;
                newLocation.setParent(currentLocation);
                if (!currentLocation.addChild(newLocation))
                    return new ErrorComponent(
                        new ErrorBuilder(idRule, "Location with name " + newLocationName + " already exists in location " + currentLocation.getName()).toString()
                    );
            }

            // Replace a temporary location with the same name in the same location if it exists
            const toInspect: Location[] = this.locationStack.length == 0 ? this.topLocations : this.locationStack.at(-1)!.getChildren();
            var toSwap: number = -1;
            for (var i = 0; i < toInspect.length; i++) {
                const location: Location = toInspect[i];
                if (location.isPlaceholder() && location.getName() === newLocationName) {
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
            }

            this.locationStack.push(newLocation);
        } else {
            const newLocationName: string = idRule.dottedId()!.ID(idRule.dottedId()!.ID().length - 1).toString();

            var currentLocation: Location | undefined = this.locationStack.length > 0 ? this.locationStack.at(-1)! : undefined;
            var foundDirectParent: boolean = false;
            const ids: TerminalNode[] = idRule.dottedId()!.ID();
            var idIndex: number = 0;
            for (; idIndex < ids.length - 1; idIndex++) {
                const nextLocation: Location | undefined = currentLocation == undefined
                        ? this.getTopScopeLocation(ids[idIndex].toString())
                        : currentLocation.getChild(ids[idIndex].toString());

                if (nextLocation) {
                    currentLocation = nextLocation;
                    if (idIndex >= ids.length - 2) {
                        foundDirectParent = true;
                        break;
                    }
                } else break;
            }

            if (!foundDirectParent) {
                for (; idIndex < ids.length - 1; idIndex++) {
                    const newLocation: Location = new Location(ids[idIndex].toString(), true);
                    if (currentLocation) {
                        currentLocation.addChild(newLocation);
                        newLocation.setParent(currentLocation);
                    }
                    currentLocation = newLocation;
                }

                const newLocation: Location = new Location(newLocationName, false, currentLocation);
                if (currentLocation) currentLocation.addChild(newLocation); // Can be null?
                else return new ErrorComponent(new ErrorBuilder(idRule, "Bug with type checker. Found undefined where there shouldn't be.").toString());
                this.locationStack.push(newLocation);
            } else {
                var toSwap: number = -1;
                for (var i = 0; i < currentLocation!.getChildren().length; i++) {
                    const currentCurrentLocationChild: Location = currentLocation!.getChildren()[i];
                    if (currentCurrentLocationChild.isPlaceholder()
                            && currentCurrentLocationChild.getName() === newLocationName) {
                        toSwap = i;
                        break;
                    }
                }
                const newLocation: Location = new Location(newLocationName, false, currentLocation);
                if (toSwap > -1) {
                    const oldLocation: Location = currentLocation!.getChildren()[toSwap];
                    newLocation.setParent(oldLocation.getParent());
                    newLocation.setChildren(oldLocation.getChildren());
                    newLocation.setCommands(oldLocation.getCommands());
                    currentLocation!.getChildren()[toSwap] = newLocation;

                }
                currentLocation!.addChild(newLocation);
                this.locationStack.push(newLocation);
            }
        }

        this.openLocation();
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
        if (!this.closeLocation()) {
            return new ErrorComponent(
                new ErrorBuilder(idRule, "Type-checker has a bug where locations are closed more than they are opened.").toString()
            );
        }
        return this.locationStack.pop()!;
    }

    private getTopScopeLocation(locationName: string): Location | undefined {
        for (var location of this.topLocations) {
            if (location.getName() === locationName) return location;
        }
        return undefined;
    }

    private openLocation() {
        this.locVarsStack.push(new TCLocationScope());
    }

    private closeLocation(): boolean {
        if (this.locVarsStack.length == 0) return false;
        this.locVarsStack.pop();
        return true;
    }

    visitScopeCommand(ctx: ScopeCommandContext): CustSpecComponent {
        const commands: Command[] = [];
        for (var commandCtx of ctx.command()) {
            const comp: CustSpecComponent = this.visit(commandCtx);
            if (comp instanceof ErrorComponent) return comp;
            commands.push(comp as Command);
        }
        return new ScopeCommand(commands);
    }

    visitIfCommand(ctx: IfCommandContext): CustSpecComponent {
        const booleanExprs: BooleanExpr[] = [];
        const commands: Command[] = [];
        for (var i = 0; i < ctx.expr().length; i++) {
            const exprComp: CustSpecComponent = this.visit(ctx.expr(i));
            if (exprComp instanceof ErrorComponent) return exprComp;
            const expr: Expr = exprComp as Expr;
            if (expr.type() != ValueType.BOOLEAN)
                return new ErrorComponent(
                    new TypeErrorBuilder(ctx.expr(i), [ValueType.BOOLEAN], expr.type()).toString()
                );
            booleanExprs.push(expr as BooleanExpr);
            
            const commandComp: CustSpecComponent = this.visit(ctx.command(i));
            if (commandComp instanceof ErrorComponent) return commandComp;
            commands.push(commandComp as Command);
        }

        if (ctx.command().length > ctx.expr().length) {
            const commandComp: CustSpecComponent = this.visit(ctx.command(ctx.command().length - 1));
            if (commandComp instanceof ErrorComponent) return commandComp;
            commands.push(commandComp as Command);
        }

        return new IfElseCommand(booleanExprs, commands);
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

        return new WhileCommand(exprComp as BooleanExpr, command);
    }

    visitExpr(ctx: ExprContext): CustSpecComponent{
        return this.visit(ctx.disjunction());
    }

    visitDisjunction(ctx: DisjunctionContext): CustSpecComponent {
        if (ctx.OR().length == 0) {
            return this.visit(ctx.conjunction(0));
        } else {
            const booleanExprs: BooleanExpr[] = [];
            for (var compCtx of ctx.conjunction()) {
                const comp: CustSpecComponent = this.visit(compCtx);
                if (comp instanceof ErrorComponent) return comp;
                const expr: Expr = comp as Expr;
                if (expr.type() != ValueType.BOOLEAN)
                    return new ErrorComponent(
                        new TypeErrorBuilder(compCtx, [ValueType.BOOLEAN], expr.type()).toString()
                    );
                booleanExprs.push(expr as BooleanExpr);
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
            const booleanExprs: BooleanExpr[] = [];
            for (var compCtx of ctx.comparison()) {
                const comp: CustSpecComponent = this.visit(compCtx);
                if (comp instanceof ErrorComponent) return comp;
                const expr: Expr = comp as Expr;
                if (expr.type() != ValueType.BOOLEAN)
                    return new ErrorComponent(
                        new TypeErrorBuilder(compCtx, [ValueType.BOOLEAN], expr.type()).toString()
                    );
                booleanExprs.push(expr as BooleanExpr);
            }

            var result = booleanExprs[booleanExprs.length - 1];
            for (var i = booleanExprs.length - 2; i >= 0; i--)
                result = new BinaryBoolOp(booleanExprs[i], result, BoolOp.AND);
            return result;
        }
    }

    visitComparison(ctx: ComparisonContext): CustSpecComponent {
        if (ctx._left == null || ctx._left == undefined) {
            return this.visit(ctx.sum(0));
        } else {
            const leftComp: CustSpecComponent = this.visit(ctx._left);
            if (leftComp instanceof ErrorComponent) return leftComp;
            const leftExpr: Expr = leftComp as Expr;
            if (leftExpr.type() != ValueType.NUM && leftExpr.type() != ValueType.CHAR)
                return new ErrorComponent(
                    new TypeErrorBuilder(ctx._left, [ValueType.NUM, ValueType.CHAR], leftExpr.type()).toString()
                );
            
            const rightComp: CustSpecComponent = this.visit(ctx._right);
            if (rightComp instanceof ErrorComponent) return rightComp;
            const rightExpr: Expr = rightComp as Expr;
            if (rightExpr.type() != ValueType.NUM && rightExpr.type() != ValueType.CHAR)
                return new ErrorComponent(
                    new TypeErrorBuilder(ctx._right, [ValueType.NUM, ValueType.CHAR], rightExpr.type()).toString()
                );
            
            if (leftExpr.type() != rightExpr.type()) {
                return new ErrorComponent(
                    new TypeErrorBuilder(ctx._right, [leftExpr.type()], rightExpr.type()).toString()
                );
            }

            var op: CompOp;
            if (ctx.LESS() != undefined) op = CompOp.LESS;
            else if (ctx.LEQ() != undefined) op = CompOp.LEQ;
            else if (ctx.EQUAL() != undefined) op = CompOp.EQUAL;
            else if (ctx.NEQ() != undefined) op = CompOp.NEQ;
            else if (ctx.GEQ() != undefined) op = CompOp.GEQ;
            else op = CompOp.GREATER;

            return new ComparisonExpr(leftExpr, rightExpr, op);
        }
    }

    visitSum(ctx: SumContext): CustSpecComponent {
        if (ctx._left == null || ctx._left == undefined) {
            return this.visit(ctx.term());
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
                leftExpr as NumExpr,
                rightExpr as NumExpr,
                ctx.PLUS() != undefined ? NumOp.ADD : NumOp.SUB
            );
        }
    }

    visitTerm(ctx: TermContext): CustSpecComponent {
        if (ctx._left == null || ctx._left == undefined) {
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
                leftExpr as NumExpr,
                rightExpr as NumExpr,
                ctx.TIMES() != undefined ? NumOp.MULT : NumOp.DIV
            );
        }
    }

    visitNegation(ctx: NegationContext): CustSpecComponent {
        const comp: CustSpecComponent = this.visit(ctx.primary());
        if (comp instanceof ErrorComponent) return comp;
        const expr: Expr = comp as Expr;

        if (ctx.MIN() != undefined) {
            // Expr must be a number
            if (expr.type() != ValueType.NUM)
                return new ErrorComponent(
                    new TypeErrorBuilder(ctx.primary(), [ValueType.NUM], expr.type()).toString()
                );
            return new NegativeExpr((expr as NumExpr).value());
        } else {
            // Expr must be a boolean
            if (expr.type() != ValueType.BOOLEAN)
                return new ErrorComponent(
                    new TypeErrorBuilder(ctx.primary(), [ValueType.BOOLEAN], expr.type()).toString()
                );
            return new NotExpr((expr as BooleanExpr).value());
        }
    }

    visitCustElementExpr(ctx: CustElementExprContext): CustSpecComponent {
        return this.visit(ctx.custElement());
    }

    visitLiteralExpr(ctx: LiteralExprContext): CustSpecComponent {
        return this.visit(ctx.literal());
    }

    visitParExpr(ctx: ParExprContext): CustSpecComponent {
        return this.visit(ctx.expr());
    }

    visitNoneExpr(ctx: NoneExprContext): CustSpecComponent {
        return new NoneExpr();
    }

    visitLiteral(ctx: LiteralContext): CustSpecComponent {
        return this.visit(ctx.getChild(0));
    }

    visitNumLit(ctx: NumLitContext): CustSpecComponent {
        const value: number = +ctx.NUM_VALUE().toString();
        if (value === NaN)
            return new ErrorComponent(
                new ErrorBuilder(ctx, "Invalid number literal " + ctx.NUM_VALUE().toString()).toString()
            );
        return new IntLitExpr(value);
    }

    visitCharLit(ctx: CharLitContext): CustSpecComponent {
        const totalLength: number = ctx.CHAR_VALUE().toString().length;
        const contents: string = ctx.CHAR_VALUE().toString().substring(1, totalLength - 1);
        const transformed: string | undefined = this.transformChar(contents);
        
        if (transformed == undefined) return new ErrorComponent(new ErrorBuilder(ctx, "Unknown character " + contents).toString());
        return new CharExpr(transformed);
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
                if (transformed == undefined)
                    return new ErrorComponent(new ErrorBuilder(ctx, "Unknown character " + currChar + nextChar).toString());
                finalString += transformed;
            } else finalString += currChar;
        }

        return new StringExpr(finalString);
    }
    
    visitBooleanLit(ctx: BooleanLitContext): CustSpecComponent {
        return new BooleanLitExpr(ctx.TRUE() != undefined);
    }

    protected defaultResult(): CustSpecComponent {
        throw new Error('Method not implemented.');
    }


    // ========================Helpers========================
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
}