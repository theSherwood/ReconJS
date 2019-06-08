'use strict';var acorn=require('acorn');var whitelist = [
  "do",
  "if",
  "in",
  "for",
  "let",
  "new",
  "try",
  "var",
  "case",
  "else",
  "enum",
  "null",
  "true",
  "void",
  "with",
  "await",
  "break",
  "catch",
  "class",
  "const",
  "false",
  "super",
  "throw",
  "while",
  "yield",
  "delete",
  "export",
  "import",
  "public",
  "return",
  "static",
  "switch",
  "typeof",
  "default",
  "extends",
  "finally",
  "package",
  "private",
  "continue",
  "debugger",
  "function",
  "arguments",
  "interface",
  "protected",
  "implements",
  "instanceof",
  "undefined",
  "NaN",
  "Math",
  "Number",
  "Object",
  "Array",
  "Set",
  "Map",
  "Date",
  "alert",
  "console",
  "decodeURI",
  "decodeURIComponent",
  "encodeURI",
  "encodeURIComponent",
  "JSON",
  "parseFloat",
  "parseInt",
  "prototype",
  "String",
  "setTimeout",
  "setInterval",
  "isPrototypeOf",
  "isNaN",
  "toString",
  "of",
  "Boolean",
  "RegExp",
  "Infinity",
  "isFinite",
  "Function",
  "Symbol",
  "Error",
  "BigInt",
  "Generator",
  "GeneratorFunction",
  "Promise",
  "async",
  "await",
  "AsyncFunction",
  "SyntaxError",
  "TypeError",
  "ReferenceError",
  "InternalError",
  "RangeError",
  "URIError"
];/*
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
    node.params.forEach(param => {
      if (param.type === "Identifier") {
        scopedParams.push(param.name);
      } else if (param.type === "AssignmentPattern") {
        if (param.left.type === "Identifier") {
          scopedParams.push(param.left.name);
        }
      } else if (param.type === "ArrayPattern") {
        handleDestructuredArray(param, name => {
          scopedParams.push(name);
        });
        // paramDestructuredArray(param, scopedParams);
      } else if (param.type === "ObjectPattern") {
        handleDestructuredObject(param, name => {
          scopedParams.push(name);
        });
        // paramDestructuredObject(param, scopedParams);
      }
    });
  }
  // Get param from catch block
  if (node.hasOwnProperty("param")) {
    scopedParams.push(node.param.name);
  }

  if (scopedParams.length) {
    node.scopedParams = scopedParams;
  }
}

function handleDestructuredArray(arrayPattern, callback) {
  arrayPattern.elements.forEach(element => {
    if (element.type === "Identifier") {
      callback(element.name);
    } else if (element.type === "RestElement") {
      if (element.argument.type === "Identifier") {
        callback(element.argument.name);
      }
    }
  });
}

function handleDestructuredObject(objectPattern, callback) {
  objectPattern.properties.forEach(property => {
    if (property.value.type === "Identifier") {
      callback(property.value.name);
    }
  });
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
          handleDestructuredArray(declaration.id, name => {
            addAsValue(scopeNode, "declaredIdentifiers", name);
          });
        } else if (declaration.id.type === "ObjectPattern") {
          handleDestructuredObject(declaration.id, name => {
            addAsValue(scopeNode, "declaredIdentifiers", name);
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
];function checkWords(astArray, walker, whitelist, allowedIdentifiers, options) {
  allowedIdentifiers = Array.isArray(allowedIdentifiers)
    ? new Set(allowedIdentifiers)
    : new Set();
  const illicitWords = [];
  walker(
    astArray[0],
    (node, state) => {
      // Return if the node is not a real node:
      // (scopedParams or declaredIdentifiers)
      if (node.index === undefined) return;

      const scopedIdentifiers = buildIdentifierSet(node, state);

      // Check identifiers against permitted usage
      if (node.type === "Identifier") {
        let illicit = true;
        const parent = astArray[node.parent];
        // Check against identifiersInScope
        if (illicit && scopedIdentifiers.has(node.name)) illicit = false;
        // Check against whitelist
        if (illicit && whitelist.has(node.name)) illicit = false;
        // Check against outside allowedIdentifiers
        if (illicit && allowedIdentifiers.has(node.name)) illicit = false;
        // Check if used as a key on an object or class
        if (illicit && parent.key === node) illicit = false;
        // Check if used as a property
        if (illicit && parent.property === node) illicit = false;
        // Check if used as aliased import ('foo' in 'foo as bar')
        if (illicit && parent.imported === node) illicit = false;
        // Check if used as export alias ('bar' in 'foo as bar')
        if (illicit && parent.exported === node) illicit = false;
        // Check if used as a label
        if (illicit && parent.label === node) illicit = false;

        if (illicit) {
          illicitWords.push(node);
        }
      }

      // Check for 'this' keyword
      if (node.type === "ThisExpression" && options.allowThis !== true) {
        illicitWords.push(node);
      }

      return scopedIdentifiers;
    },
    undefined
  );
  return simplifyResults(illicitWords);
}

/*
  Create new state set containing identifiers
  (params or declared identifiers) that are
  safe to use in the current and descendant 
  scopes.
*/
function buildIdentifierSet(node, state) {
  const scopedIdentifiers = new Set();
  // Add ancestor scope identifiers, if any
  if (state && state.toString() === "[object Set]") {
    state.forEach(identifier => {
      scopedIdentifiers.add(identifier);
    });
  }
  // Add declaredIdentifiers, if any
  if (node.declaredIdentifiers) {
    node.declaredIdentifiers.forEach(identifier => {
      scopedIdentifiers.add(identifier);
    });
  }
  // Add scopedParams, if any
  if (node.scopedParams) {
    node.scopedParams.forEach(identifier => {
      scopedIdentifiers.add(identifier);
    });
  }
  return scopedIdentifiers;
}

/*
  Remove unnecessary properties from illicitWords objects.
*/
function simplifyResults(nodeArray) {
  if (!nodeArray.length) {
    return false;
  }
  const results = [];
  nodeArray.forEach(node => {
    const nodeResult = {};
    if (node.type === "Identifier") {
      nodeResult.illicit = node.name;
    } else if ((node.type = "ThisExpression")) {
      nodeResult.illicit = "this";
    }
    if (node.hasOwnProperty("loc")) {
      nodeResult.line = node.loc.start.line;
      nodeResult.startColumn = node.loc.start.column;
      nodeResult.endColumn = node.loc.end.column;
    } else {
      nodeResult.start = node.start;
      nodeResult.end = node.end;
    }
    results.push(nodeResult);
  });
  return results;
}function traverseASTArray(astArray, callback) {
  for (let i = 0; i < astArray.length; i++) {
    callback(astArray[i]);
  }
}

function recurseAST(node, nodeCallback, childCallback, state) {
  (function recurse(node, nodeCallback, childCallback, state) {
    /*
      Do not use Booleans or anything that evaluates to false as state
      If you need to have access to falsy values, wrap your state
      in an object.
    */
    let newState = nodeCallback ? nodeCallback(node, state) : state;
    Object.values(node).forEach(value => {
      // Iterate over properties on the node, looking for
      // child nodes.
      if (typeof value === "object" && value !== null) {
        if (Array.isArray(value)) {
          // value isn't a node. It is an array of nodes.
          // Skip the array and start on the children.
          value.forEach(arrayChild => {
            newState = childCallback
              ? childCallback(arrayChild, node, newState)
              : newState;
            recurse(arrayChild, nodeCallback, childCallback, newState);
          });
        } else if (!value.hasOwnProperty("type")) {
          // If value isn't an object with 'type' property, it
          // isn't a proper node. Abort.
          return;
        } else {
          // value is a proper AST node.
          newState = childCallback
            ? childCallback(value, node, newState)
            : newState;
          recurse(value, nodeCallback, childCallback, newState);
        }
      }
    });
  })(node, nodeCallback, childCallback, state);
}class Recon {
  constructor() {
    this.resetWhitelist();
    this.defaultOptions = {
      sourceType: "module",
      locations: true,
      allowThis: false
    };
  }

  check(str, options, allowedIdentifiers) {
    options = { ...this.defaultOptions, ...options };
    if (typeof str === "string") {
      this.getScopeTree(str, options);
    }
    if (!this.astArray) return;
    const illicitIdentifiers = checkWords(
      this.astArray,
      recurseAST,
      this.whitelist,
      allowedIdentifiers,
      options
    );
    return illicitIdentifiers;
  }

  getScopeTree(str, options) {
    options = { ...this.defaultOptions, ...options };
    if (typeof str === "string") {
      this.parse(str, options);
    }
    if (!this.astArray) return;
    buildScopeTree(this.astArray, traverseASTArray);
    return this.ast;
  }

  resetWhitelist() {
    this.whitelist = new Set(whitelist);
  }

  removeFromWhitelist(arg) {
    if (Array.isArray(arg)) {
      arg.forEach(word => {
        this.whitelist.delete(word);
      });
    } else if (typeof arg === "string") {
      this.whitelist.delete(arg);
    } else {
      throw new Error(
        "ReconJS: removeFromWhitelist only accepts a string or an array of strings as an argument"
      );
    }
  }

  addToWhitelist(arg) {
    if (Array.isArray(arg)) {
      arg.forEach(word => {
        this.whitelist.add(word);
      });
    } else if (typeof arg === "string") {
      this.whitelist.add(arg);
    } else {
      throw new Error(
        "ReconJS: addToWhitelist only accepts a string or an array of strings as an argument"
      );
    }
  }

  parse(string, options) {
    options = { ...this.defaultOptions, ...options };
    this.ast = acorn.parse(string, options);
    this.buildASTArray(this.ast);
    return this.ast;
  }

  /*
    Build an array of the ast with each node holding
    the index of the parent in a property called 'parent'.
    This makes backtracking comparatively low cost.
  */
  buildASTArray(ast) {
    this.astArray = [ast];
    ast.index = 0;
    ast.parent = null;
    let index = 1;
    recurseAST(ast, undefined, (child, node) => {
      if (child.hasOwnProperty("index")) {
        /*
          Replace the child with a clone if the child
          has already been visited (there are duplicates).
          ```
          const obj = { prop } 
          ```
          for example, will create one node for prop,
          but reference it from the parent on both
          the 'key' and 'value' properties. Clone the
          key so that the value node has a different 
          index.
        */
        Object.entries(node).find(([key, value]) => {
          if (value === child) {
            child = { ...child };
            node[key] = child;
            return true;
          }
        });
      }
      child.parent = node.index;
      child.index = index;
      index++;
      if (index > 100000) throw new Error("Too much code to parse");
      this.astArray.push(child);
    });

    for (let i = 0; i < this.astArray.length; i++) {
      if (this.astArray[i].index !== i) throw new Error("not matching");
    }
  }
}module.exports=Recon;