/*
  Adds up to three properties on a node:
    1. functionScope: (required)
        the index of the node providing 
        function scope
    2. blockScope: (required)
        the index of the node providing
        block scope
    3. scopedParams: (optional)
        array of identifiers safe to use within
        a scope on account of being parameters
*/
function buildScopeTree(astArray, walker) {
  walker(astArray, node => {
    scopeHandler(astArray, node);
    paramsHandler(node);
  });
}

/* 
    The astArray is a tree structure flattened into an array.
    For any node x, the nodes in the subtree of x must all
    have higher indices than the index of x.

    For any node x, functionScope and blockScope property 
    values are the index of the ancestor node in the array 
    that creates that scope for the node in question.
*/
function scopeHandler(astArray, node) {
  const parent = astArray[node.parent];
  if (parent) {
    node.functionScope = functionScopeNodes.includes(parent.type)
      ? parent.index
      : parent.functionScope;

    // blockScope must be at least as specific as functionScope (it cannot be a lower number)
    node.blockScope = Math.max(
      blockScopeNodes.includes(parent.type) ? parent.index : parent.blockScope,
      node.functionScope
    );
  } else {
    node.functionScope = node.index;
    node.blockScope = node.index;
  }
}

/*
    The ast already contains a params object on function
    nodes. However, not all identifiers within that object
    need to be cleared for use within the function. For
    example: the left side identifier of an AssignmentPattern is free to use inside the function. Such params will be added to an array called scopedParams. The right side, however, may pose a security threat.
  */
function paramsHandler(node) {
  if (node.hasOwnProperty("params")) {
    const params = node.params;
    const scopedParams = [];
    for (let i = 0; i < params.length; i++) {
      const param = params[i];
      if (param.type === "Identifier") {
        scopedParams.push(param.name);
      } else if (param.type === "AssignmentPattern") {
        if (param.left.type === "Identifier") {
          scopedParams.push(param.left.name);
        }
      }
    }
    node.scopedParams = scopedParams;
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
