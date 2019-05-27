/*
  Adds up to 4 properties on a node:
    1. functionScope: (required)
        the index of the node providing 
        function scope
    2. blockScope: (required)
        the index of the node providing
        block scope
    3. scopedParams: (optional)
        array of identifiers safe to use within
        a scope on account of being parameters
    4. declaredIdentifiers: (optional)
        array of identifiers declared within
        that scope
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
    // find functionScope
    node.functionScope = functionScopeNodes.includes(parent.type)
      ? node.index
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
  const scopedParams = [];
  // Get params from functions
  if (node.hasOwnProperty("params")) {
    const params = node.params;
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
  }
  // Get param from catch block
  if (node.hasOwnProperty("param")) {
    scopedParams.push(node.param.name);
  }

  if (scopedParams.length) {
    node.scopedParams = scopedParams;
  }
}

/*
  Find all declarations and push the declared identifiers 
  to an array that's a property on the node that creates
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
    case "FunctionExpression":
      if (node.id) {
        addAsValue(
          astArray[node.functionScope],
          "declaredIdentifiers",
          node.id.name
        );
      }
      break;
    case "ClassDeclaration":
      addAsValue(
        astArray[node.functionScope],
        "declaredIdentifiers",
        node.id.name
      );
      break;
    case "ImportDeclaration":
      node.specifiers.forEach(specifier => {
        addAsValue(
          astArray[node.functionScope],
          "declaredIdentifiers",
          specifier.local.name
        );
      });
    case "VariableDeclaration":
      handleVariableDeclaration(astArray, node);
      break;
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
        if (declaration.id.type === "Identifier") {
          // Simple variable declaration
          addAsValue(scopeNode, "declaredIdentifiers", declaration.id.name);
        } else if (declaration.id.type === "ArrayPattern") {
          // Array desctructuring declaration
          declaration.id.elements.forEach(element => {
            if (element.type === "Identifier") {
              addAsValue(scopeNode, "declaredIdentifiers", element.name);
            }
          });
        }
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
  if (
    !(
      object.hasOwnProperty(propertyName) && Array.isArray(object[propertyName])
    )
  ) {
    object[propertyName] = [value];
  } else {
    object[propertyName].push(value);
  }
}

const functionScopeNodes = [
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
