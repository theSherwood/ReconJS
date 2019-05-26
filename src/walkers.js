export function traverseASTArray(astArray, callback) {
  for (let i = 0; i < astArray.length; i++) {
    callback(astArray[i]);
  }
}

export function recurseAST(node, nodeCallback, childCallback, state) {
  (function recurse(node, nodeCallback, childCallback, state) {
    // Do not use Booleans or anything that evaluates to false as state
    let newState = nodeCallback ? nodeCallback(node, state) : state;
    Object.values(node).forEach(value => {
      // Iterate over properties on the node, looking for
      // child nodes.
      if (typeof value === "object" && value !== null) {
        // if (value.hasOwnProperty("index")) console.log(value);
        if (Array.isArray(value)) {
          value.forEach(arrayChild => {
            newState = childCallback
              ? childCallback(arrayChild, node, newState)
              : newState;
            recurse(arrayChild, nodeCallback, childCallback, newState);
          });
        } else {
          newState = childCallback
            ? childCallback(value, node, newState)
            : newState;
          recurse(value, nodeCallback, childCallback, newState);
        }
      }
    });
  })(node, nodeCallback, childCallback, state);
}
