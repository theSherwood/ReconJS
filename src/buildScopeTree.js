/*
  Adds up to 3 properties on a node:
    1. functionScope: (required)
        the index of the node providing 
        function scope
    2. blockScope: (required)
        the index of the node providing
        block scope
    3. scopedParams: (optional)
        array of identifiers safe to use within
        a scope on account of being parameters

    TODO: declarations
*/
function buildScopeTree(astArray, walker) {
  walker(astArray, node => {
    scopeHandler(astArray, node);
    paramsHandler(node);
    declarationsHandler(astArray, node);
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

/*
  Find all declarations and push the declared identifiers 
  to an array that's a property on the nodes that creates
  the scope.
*/
function declarationsHandler(astArray, node) {
  switch (node.type) {
    case "FunctionDeclaration":
      addAsValue(
        astArray[node.functionScope],
        "declaredIdentifiers",
        node.id.name
      );
      break;
    case "ClassDeclaration":
      addAsValue(
        astArray[node.functionScope],
        "declaredIdentifiers",
        node.id.name
      );
      break;
    case "VariableDeclaration":
      handleVariableDeclaration(astArray, node);
      break;
    // TODO: modules: import and export
    // TODO: labeled statements
    default:
      break;
  }
}

function handleVariableDeclaration(astArray, node) {
  // differentiate between block and function scope
  let scopeNode;
  if (node.kind === "const" || node.kind === "let") {
    scopeNode = astArray[node.blockScope];
  } else if (node.kind === "var") {
    scopeNode = astArray[node.functionScope];
  }
  if (scopeNode) {
    node.declarations.forEach(declaration => {
      if (declaration.type === "VariableDeclarator") {
        addAsValue(scopeNode, "declaredIdentifiers", declaration.id.name);
      }
    });
  }
}

/*
  If the object has a property of propertyName, push value 
  onto the end of that array. If not, initialize propertyName
  as an array property of the object with value as its first
  value.
*/
function addAsValue(object, propertyName, value) {
  if (!(object.hasOwnProperty(propertyName) && Array.isArray(undefined))) {
    object[propertyName] = [value];
  } else {
    object[propertyName].push(value);
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

const declarationTypes = [
  "VariableDeclaration",
  "FunctionDeclaration",
  "ClassDeclaration",

  // TODO:  module vs import vs export ?
  "ModuleDeclaration",
  "ImportDeclaration"
  // TODO: LabeledStatement ?
];

export default buildScopeTree;
