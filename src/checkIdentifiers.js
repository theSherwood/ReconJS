function checkIdentifiers(astArray, walker, whitelist, variables) {
  variables = Array.isArray(variables) ? new Set(variables) : new Set();
  const illicitIdentifiers = [];
  walker(
    astArray[0],
    (node, state) => {
      // Return if the node is not a real node:
      // (scopedParams or declaredIdentifiers)
      if (node.index === undefined) return;

      const identifiersInScope = buildIdentifierSet(node, state);

      if (node.type === "Identifier") {
        let illicit = true;
        const parent = astArray[node.parent];
        // Check against identifiersInScope
        if (identifiersInScope.has(node.name)) illicit = false;
        // Check against whitelist
        if (illicit && whitelist.hasOwnProperty(node.name)) illicit = false;
        // Check against outside variables
        if (illicit && variables.has(node.name)) illicit = false;
        // Check if used as a key on an object or class
        if (illicit && parent.key === node) illicit = false;
        // Check if used as a property
        if (illicit && parent.property === node) illicit = false;

        if (illicit) {
          console.log(node.name);
          illicitIdentifiers.push(node);
        }
      }

      // console.log("index: ", node.index);
      // console.log("state: ", node, identifiersInScope);
      return identifiersInScope;
    },
    undefined
  );
  console.log(illicitIdentifiers);
}

/*
  Create new state set containing identifiers
  (params or declared identifiers) that are
  safe to use in the current and descendant 
  scopes.
*/
function buildIdentifierSet(node, state) {
  const identifiersInScope = new Set();
  // Add ancestor scope identifiers, if any
  if (state && state.toString() === "[object Set]") {
    state.forEach(identifier => {
      identifiersInScope.add(identifier);
    });
  }
  // Add declaredIdentifiers, if any
  if (node.declaredIdentifiers) {
    node.declaredIdentifiers.forEach(identifier => {
      identifiersInScope.add(identifier);
    });
  }
  // Add declaredIdentifiers, if any
  if (node.declaredIdentifiers) {
    node.declaredIdentifiers.forEach(identifier => {
      identifiersInScope.add(identifier);
    });
  }
  // Add scopedParams, if any
  if (node.scopedParams) {
    node.scopedParams.forEach(identifier => {
      identifiersInScope.add(identifier);
    });
  }
  return identifiersInScope;
}

export default checkIdentifiers;
