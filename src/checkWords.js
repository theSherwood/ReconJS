function checkWords(astArray, walker, whitelist, allowedIdentifiers, options) {
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
          console.log(node.name);
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
  return illicitWords;
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

export default checkWords;
