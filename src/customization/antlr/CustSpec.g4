grammar CustSpec;

// TODO: Allow to get and set node labels
// TODO: Custom descriptions
// ================================Grammar================================
start   : custLocation*;

custLocation: locId (DOT locId)* LCURL command* custLocation* RCURL;

command
    : LCURL command* RCURL                                                          # ScopeCommand
    | type ID ASS expr SEMI                                                         # NewVarCommand
    | ID ASS expr SEMI                                                              # ReassignCommand
    | expr (LBRAC expr RBRAC)+ ASS expr SEMI                                        # ArrayIndexReassignCommand
    | IF LPAR expr RPAR command (ELSE IF LPAR expr RPAR command)* (ELSE command)?   # IfCommand
    | WHILE LPAR expr RPAR command                                                  # WhileCommand
    | ADD expr SEMI                                                                 # AddCommand
    | OMIT expr SEMI                                                                # OmitCommand
    | suffixed DOT ID LPAR (expr (COMMA expr)*)? RPAR                               # PlainPropCallCommand
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
    : suffixed DOT (ID LPAR (expr (COMMA expr)*)? RPAR | locId) # PropSuffix
    | suffixed LBRAC expr RBRAC                                 # ArrayAccessSuffix // TODO: Get Subject in array of subjects
    | primary                                                   # PrimaryExpr
    ;

primary
    : ID                                # IdExpr
    | NEW_NODE expr                     # NewNodeExpr
    | NEW_EDGE expr expr expr           # NewEdgeExpr
    | PARENTS                           # ParentsExpr
    | PARENTS_OF expr                   # ParentsOfExpr
    | HERE                              # HereExpr
    | CHILDREN                          # ChildrenExpr
    | CHILDREN_OF expr                  # ChildrenOfExpr
    | VALUE_OF expr type                # ValueOfExpr
    | locId                             # FieldSubjectExpr
    | NODE_OF expr                      # NodeOfExpr
    | EDGES_OF expr expr                # EdgesOfExpr
    | literal                           # LiteralExpr
    | LPAR expr RPAR                    # ParExpr
    | LBRAC (expr (COMMA expr)*)? RBRAC # ArrayExpr
    ;

locId   : (CLASS | FIELD) (ID | NUM_VALUE) ; // TODO: METHOD, PARAM, and LOCAL

literal : numLit | stringLit | booleanLit ;

numLit  : NUM_VALUE;

stringLit   : STRING_VALUE;

booleanLit  : TRUE | FALSE ;

type        : basicType | type LBRAC RBRAC;

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
PARENTS     : 'parents';
PARENTS_OF  : 'parentsOf';
CHILDREN    : 'children';
CHILDREN_OF : 'childrenOf';
NODE_OF     : 'nodeOf';
EDGES_OF    : 'edgesOf';
VALUE_OF    : 'valueOf';
NEW_NODE    : 'newNode';
NEW_EDGE    : 'newEdge';

IF      : 'if';
ELSE    : 'else';
FOR     : 'for';
WHILE   : 'while';
TRUE    : 'true';
FALSE   : 'false';

SHORT_TYPE  : 'short';
NUM_TYPE    : 'num';
CHAR_TYPE   : 'char';
BOOLEAN_TYPE: 'boolean';
STRING_TYPE : 'String';
NODE_TYPE   : 'Node';
EDGE_TYPE   : 'Edge';
SUBJECT_TYPE: 'Subject';

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