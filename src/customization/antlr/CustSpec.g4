grammar CustSpec;

// ================================Grammar================================
start   : statement*;

statement   : custLocation | command;

custLocation: locId (DOT locId)* LCURL statement* RCURL;

command
    : LCURL command* RCURL                                                          # ScopeCommand
    | IF LPAR expr RPAR command (ELSE IF LPAR expr RPAR command)* (ELSE command)?   # IfCommand
    | WHILE LPAR expr RPAR command                                                  # WhileCommand
    | forLoop                                                                       # ForCommand
    | semiLessCommand SEMI                                                          # SemiCommand
    ;

forLoop
    : FOR LPAR forInit? SEMI expr? SEMI forUpdate? RPAR command # ConditionForLoop
    | FOR LPAR type ID COLON expr RPAR command                  # CollectionForLoop
    ;
forInit     : semiLessCommand;
forUpdate   : semiLessCommand;

semiLessCommand
    : type ID ASS expr                                  # NewVarCommand
    | ID ASS expr                                       # ReassignCommand
    | expr (LBRAC expr RBRAC)+ ASS expr                 # ArrayIndexReassignCommand
    | (PARENT DOT)+ ID ASS expr                         # ParentVarAssignCommand
    | ADD expr                                          # AddCommand
    | OMIT expr                                         # OmitCommand
    | suffixed DOT ID LPAR (expr (COMMA expr)*)? RPAR   # PlainPropCallCommand
    | plusPlus                                          # PlusPlusCommand
    | shortcut                                          # ShortcutCommand
    ;

shortcut
    : SET_IMMUTABLE expr    # SetImmutableShortcut // <subject(s) to set immutable>
    | MERGE expr            # MergeShortcut // <subject(s) to merge to parents>
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

negation: (MIN | NOT)? suffixed ;

suffixed
    : suffixed DOT ID LPAR (expr (COMMA expr)*)? RPAR               # PropSuffix
    | suffixed LBRAC expr RBRAC                                     # ArrayAccessSuffix // TODO: Get Subject in array of subjects
    | suffixed (DOT fieldLocId)+                                    # FieldChainSuffix
    | primary                                                       # PrimaryExpr
    ;

primary
    : ID                                    # IdExpr
    | NEW_NODE expr                         # NewNodeExpr
    | NEW_EDGE expr expr expr               # NewEdgeExpr
    | PARENTS                               # ParentsExpr
    | PARENTS_OF expr                       # ParentsOfExpr
    | HERE                                  # HereExpr
    | CHILDREN                              # ChildrenExpr
    | CHILDREN_OF expr                      # ChildrenOfExpr
    | VALUE_OF expr type                    # ValueOfExpr
    | singleSubject                         # SingleSubjectExpr
    | NODE_OF expr                          # NodeOfExpr
    | NODES_OF expr                         # NodesOfExpr
    | EDGES_OF expr expr                    # EdgesOfExpr
    | literal                               # LiteralExpr
    | LPAR expr RPAR                        # ParExpr
    | LBRAC (expr (COMMA expr)*)? RBRAC     # ArrayExpr
    | (PARENT DOT)+ ID                      # ParentVarExpr
    | IS_NULL expr                          # IsNullExpr
    | NEW_MAP LESS type COMMA type GREATER  # NewMapExpr
    | plusPlus                              # PlusPlusExpr
    ;

plusPlus
    : ID PLUS PLUS                          # GetIncExpr
    | PLUS PLUS ID                          # IncGetExpr
    | ID MIN MIN                            # GetDecExpr
    | MIN MIN ID                            # DecGetExpr
    ;

locId   : classLocId | fieldLocId | methodLocId | localLocId ; // TODO: PARAM
classLocId  : CLASS ID;
fieldLocId  : FIELD (ID | NUM_VALUE);
methodLocId : METHOD ID LPAR (ID (LBRAC RBRAC)* (COMMA ID (LBRAC RBRAC)*)*)? RPAR;
localLocId  : LOCAL ID;
singleSubject   : classLocId | fieldLocId | localLocId;

literal : numLit | stringLit | booleanLit ;

numLit  : NUM_VALUE;

stringLit   : STRING_VALUE;

booleanLit  : TRUE | FALSE ;

type        : basicType | type LBRAC RBRAC | MAP LESS type COMMA type GREATER;

basicType   : NUM_TYPE | BOOLEAN_TYPE | STRING_TYPE | NODE_TYPE | EDGE_TYPE | SUBJECT_TYPE ;


// ================================Tokens================================
fragment LETTER     : [a-zA-Z$_] ;
fragment DIGIT      : [0-9] ;
fragment NONZERO    : [1-9] ;
fragment ANY_CHAR   : '\\"' | '\\\'' | '\\\\' | '\\t' | '\\b' | '\\r' | '\\f' | '\\n' | ~["'\\];

NUM_VALUE   : ((NONZERO DIGIT+) | DIGIT) (DOT DIGIT*)?;
CHAR_VALUE  : APO ANY_CHAR APO;
STRING_VALUE: QUOTE ANY_CHAR* QUOTE;

CLASS   : 'c:';
FIELD   : 'f:';
METHOD  : 'm:';
PARAM   : 'p:';
LOCAL   : 'l:';

ADD         : 'add';
OMIT        : 'omit';
HERE        : 'here';
PARENT      : 'parent';
PARENTS     : 'parents';
PARENTS_OF  : 'parentsOf';
CHILDREN    : 'children';
CHILDREN_OF : 'childrenOf';
NODE_OF     : 'nodeOf';
NODES_OF    : 'nodesOf';
EDGES_OF    : 'edgesOf';
VALUE_OF    : 'valueOf';
NEW_NODE    : 'newNode';
NEW_EDGE    : 'newEdge';
IS_NULL     : 'isNull';

IF      : 'if';
ELSE    : 'else';
FOR     : 'for';
WHILE   : 'while';
TRUE    : 'true';
FALSE   : 'false';

NUM_TYPE    : 'num';
BOOLEAN_TYPE: 'bool';
STRING_TYPE : 'string';
NODE_TYPE   : 'Node';
EDGE_TYPE   : 'Edge';
SUBJECT_TYPE: 'Subject';
MAP         : 'Map';
NEW_MAP     : 'newMap';

SET_IMMUTABLE   : 'setImmutable';
MERGE           : 'merge';

COLON       : ':';
SEMI        : ';';
DOT         : '.';
COMMA       : ',';
APO         : '\'';
QUOTE       : '"';
LESS        : '<';
LEQ         : '<=';
EQUAL       : '==';
NEQ         : '!=';
GEQ         : '>=';
ASS         : '=';
GREATER     : '>';
PLUS        : '+';
MIN         : '-';
TIMES       : '*';
DIV         : '/';
NOT         : '!';
OR          : '||';
AND         : '&&';
LPAR        : '(';
RPAR        : ')';
LCURL       : '{';
RCURL       : '}';
LBRAC       : '[';
RBRAC       : ']';
DSLASH      : '//';
SLASH_STAR  : '/*';
STAR_SLASH  : '*/';

ID      : LETTER (LETTER | DIGIT)* ;

// skip comments
COMMENT_LINE    : DSLASH (~'\n')* '\n' -> skip ;
COMMENT_BLOCK   : SLASH_STAR .*? STAR_SLASH -> skip ;

// skip all whitespace
WS  : (' ' | '\r' | '\t' | '\n' | '\f')+ -> skip ;