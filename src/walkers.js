export function traverseASTArray(astArray, callback) {
  for (let i = 0; i < astArray.length; i++) {
    callback(astArray[i]);
  }
}

export function recurseAST(node, nodeCallback, childCallback, state) {
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
}
