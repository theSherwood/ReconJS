function checkIdentifiers(astArray, walker, whitelist, allowedIdentifiers) {
  allowedIdentifiers = Array.isArray(allowedIdentifiers)
    ? new Set(allowedIdentifiers)
    : new Set();
  const illicitIdentifiers = [];
  walker(
    astArray[0],
    (node, state) => {
      // Return if the node is not a real node:
      // (scopedParams or declaredIdentifiers)
      if (node.index === undefined) return;

      const identifiersInScope = buildIdentifierSet(node, state);

      if (node.type === "Identifier") {
        // Check the identifier against permitted usage
        let illicit = true;
        const parent = astArray[node.parent];
        // Check against identifiersInScope
        if (illicit && identifiersInScope.has(node.name)) illicit = false;
        // Check against whitelist
        if (illicit && whitelist.hasOwnProperty(node.name)) illicit = false;
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
          console.log(node.name);
          illicitIdentifiers.push(node);
        }
      }

      return identifiersInScope;
    },
    undefined
  );
  return illicitIdentifiers;
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
  // Add scopedParams, if any
  if (node.scopedParams) {
    node.scopedParams.forEach(identifier => {
      identifiersInScope.add(identifier);
    });
  }
  return identifiersInScope;
}

export default checkIdentifiers;
