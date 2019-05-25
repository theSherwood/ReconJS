function buildScopeTree(ast, walker) {
  // ast.fscope = ast;
  // ast.bscope = ast;

  walker(ast, undefined, childCB);
  return ast;
}

function childCB(value, node) {
  value.fscope = functionScopeNodes.includes(node.type) ? node : node.fscope;

  value.bscope = blockScopeNodes.includes(node.type) ? node : node.bscope;
}

const functionScopeNodes = [
  "Program",
  "ClassDeclaration",
  "FunctionDeclaration",
  "FunctionExpression",
  "ArrowFunctionExpression"
];

const blockScopeNodes = [
  "BlockStatement",
  "ForStatement",
  "ForInStatement",
  "ForOfStatement",
  "SwitchStatement",
  "CatchClause"
];

export default buildScopeTree;
