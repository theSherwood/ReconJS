export function traverseASTArray(astArray, callback) {
  for (let i = 0; i < astArray.length; i++) {
    callback(astArray[i]);
  }
}

export function recurseAST(node, nodeCallback, childCallback, state) {
  (function recurse(node, nodeCallback, childCallback, state) {
    nodeCallback && nodeCallback(node, state);
    Object.values(node).forEach(value => {
      // Iterate over properties on the node, looking for
      // child nodes.
      if (typeof value === "object" && value !== null) {
        if (value.hasOwnProperty("index")) return;
        if (Array.isArray(value)) {
          value.forEach(arrayChild => {
            childCallback && childCallback(arrayChild, node, state);
            recurse(arrayChild, nodeCallback, childCallback);
          });
        } else {
          childCallback && childCallback(value, node, state);
          recurse(value, nodeCallback, childCallback, state);
        }
      }
    });
  })(node, nodeCallback, childCallback, state);
}
