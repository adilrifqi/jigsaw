grammar CustSpec;

// ================================Grammar================================
start   : custLocation*;

custLocation
    : CLASS idRule LCURL command* custLocation* RCURL   # ClassLocation
    | FIELD idRule LCURL command* custLocation* RCURL   # FieldLocation
    // TODO: METHOD, PARAM, and LOCAL
    ;

command
    : LCURL command* RCURL                                                          # ScopeCommand
    | type ID ASS expr SEMI                                                         # NewVarCommand
    | ID ASS expr SEMI                                                              # ReassignCommand
    | IF LPAR expr RPAR command (ELSE IF LPAR expr RPAR command)* (ELSE command)?   # IfCommand
    | WHILE LPAR expr RPAR command                                                  # WhileCommand
    ;

expr: disjunction;

disjunction : conjunction (OR conjunction)*;

conjunction : comparison (AND comparison)*;

comparison
    : left=sum LESS right=sum
    | left=sum LEQ right=sum
    | left=sum EQUAL right=sum
    | left=sum NEQ right=sum
    | left=sum GEQ right=sum
    | left=sum GREATER right=sum
    | sum
    ;

sum : left=sum PLUS right=term
    | left=sum MIN right=term
    | term
    ;

term: left=term TIMES right=negation
    | left=term DIV right=negation
    | negation
    ;

negation: (MIN | NOT)? primary ;

primary
    : ID                # IdExpr
    | custElement       # CustElementExpr
    | literal           # LiteralExpr
    | LPAR expr RPAR    # ParExpr
    | NONE              # NoneExpr
    // TODO: Add the expression for the value of a location
    ;

custElement
    : NEW_NODE LPAR expr RPAR               # NewNode
    | NEW_EDGE LPAR expr COMMA expr RPAR    # NewEdge
    // TODO: More
    ;

idRule  : ID | dottedId;
dottedId: ID (DOT ID)+;

literal : numLit | charLit | stringLit | booleanLit ;

numLit  : NUM_VALUE;

charLit : CHAR_VALUE;

stringLit   : STRING_VALUE;

booleanLit  : TRUE | FALSE ;

type: NUM_TYPE | CHAR_TYPE | BOOLEAN_TYPE | STRING_TYPE | NODE_TYPE | EDGE_TYPE ;


// ================================Tokens================================
fragment LETTER     : [a-zA-Z$_] ;
fragment DIGIT      : [0-9] ;
fragment NONZERO    : [1-9] ;
fragment ANY_CHAR   : '\\"' | '\\\'' | '\\\\' | '\\t' | '\\b' | '\\r' | '\\f' | '\\n' | ~["'\\];

NUM_VALUE   : NONZERO DIGIT* (DOT DIGIT*)?;
CHAR_VALUE  : APO ANY_CHAR APO;
STRING_VALUE: QUOTE ANY_CHAR* QUOTE;

CLASS   : 'class';
FIELD   : 'field';
METHOD  : 'method';
PARAM   : 'param';
LOCAL   : 'local';

PARENT  : 'parent';
NEW_NODE: 'newNode';
NEW_EDGE: 'newEdge';

IF      : 'if';
ELSE    : 'else';
FOR     : 'for';
WHILE   : 'while';
TRUE    : 'true';
FALSE   : 'false';
NONE    : 'none';

SHORT_TYPE  : 'short';
NUM_TYPE    : 'num';
CHAR_TYPE   : 'char';
BOOLEAN_TYPE: 'boolean';
STRING_TYPE : 'String';
NODE_TYPE   : 'Node';
EDGE_TYPE   : 'Edge';

SEMI    : ';';
DOT     : '.';
COMMA   : ',';
APO     : '\'';
QUOTE   : '"';
LESS    : '<';
LEQ     : '<=';
EQUAL   : '==';
NEQ     : '!=';
GEQ     : '>=';
ASS     : '=';
GREATER : '>';
PLUS    : '+';
MIN     : '-';
TIMES   : '*';
DIV     : '/';
NOT     : '!';
OR      : '||';
AND     : '&&';
LPAR    : '(';
RPAR    : ')';
LCURL   : '{';
RCURL   : '}';

ID          : LETTER (LETTER | DIGIT)* ;

// skip all whitespace
WS : (' ' | '\r' | '\t' | '\n' | '\f')+ -> skip ;