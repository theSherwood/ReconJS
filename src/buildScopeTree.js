// function buildScopeTree(ast, walker) {
//   // ast.fscope = ast;
//   // ast.bscope = ast;

//   walker(ast, undefined, childCB);
//   return ast;
// }

// function childCB(value, node) {
//   value.fscope = functionScopeNodes.includes(node.type) ? node : node.fscope;

//   value.bscope = blockScopeNodes.includes(node.type) ? node : node.bscope;
// }

function buildScopeTree(astArray, walker) {
  walker(astArray, node => {
    scopeHandler(astArray, node);

    // TODO: params handler ?
    // The params handler and the variables handler
    // might need to be done recursively on the tree
    // rather than iteratively on the array.
  });
}

function scopeHandler(astArray, node) {
  const parent = astArray[node.parent];
  if (parent) {
    if (parent.functionScope === undefined) console.log("fscope ", parent);
    node.functionScope = functionScopeNodes.includes(parent.type)
      ? parent.index
      : parent.functionScope;
    if (parent.blockScope === undefined) console.log("bscope ", parent);
    node.blockScope = blockScopeNodes.includes(parent.type)
      ? parent.index
      : parent.blockScope;
  } else {
    node.functionScope = node.index;
    node.blockScope = node.index;
  }
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
