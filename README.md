# Intro to Recon _beta_

Reconjs is a module for statically analyzing arbitrary javascript code for security threats. This is can be useful when you wish to run user code on your app and provide that code with access to certain functions/objects/data or when you wish to install a plugin that you might not trust.

Recon is not a replacement for writing software with poor security. It is simply an aid to flag dangerous code before it is run and to help the user/developer identify which lines of code pose the threat.

# Usage

Recon exposes a few methods, but the primary one is `check`.

```
import Recon from "reconjs";

const r = new Recon()
r.check(codeToCheck /*, options, allowedIdentifiers */)
```

Calling `check` on a string will return an array of illicit nodes with location information, or `false` if reconjs finds no threats.

```
import Recon from "reconjs";

const dangerousCode = "console.log(privateData)";
const safeCode = "1 + 1";

const r = new Recon()
r.check(dangerousCode)
// => [{"illicit":"privateData","line":1,"startColumn":12,"endColumn":18}]

r.check(safeCode)
// => false
```

Recon also makes use of a whitelist of identifiers that are deemed safe.

# Options

Recon passes on any options to the Acorn parser. If you wish to affect the parser's behavior, this is the way to do that, though I would keep it simple. I won't cover all Acorn options here.

| Option       | Values                                   | Behavior                                                                                                                                                                                                                                     |
| ------------ | ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sourceType` | `"module"` (_default_)<br/>or `"script"` | This is an Acorn configuration. `"script"` will throw errors if import or export are used. Recon will not catch these errors.                                                                                                                |
| `locations`  | `true` (_default_)<br/>or `false`        | `true` will cause Recon to return line location data on illicit words.                                                                                                                                                                       |
| `allowThis`  | `false` (_default_)<br/>or `true`        | `false` will cause Recon to consider all usage of the `this` keyword to be illicit. It is recommended that you use the default. If not, please consider using `"use script";` in your code and take other security precautions as necessary. |

# Allowed Identifiers

`check` can take a third argument of `allowedIdentifiers`. These are variable, class, and function identifiers that you wish the checked code to have access to. Recon will not flag these identifiers as illicit should they appear anywhere in the code.

# Dependencies

Recon has a hard dependency on Acorn. However, it only uses Acorn's parser, and walks the resulting AST with custom walkers.

Recon will not attempt to catch errors thrown by Acorn. If you're checking arbitrary code, you should be sure to implement that yourself.

# Limitations

### Modern Language Features

At present, reconjs does not support some cutting edge features of javascript, including but not limited to the following:

- class fields
- complex destructuring (either nested or with default values)

It will be overly sensitive, rather than too lax, on features it does not support.

### Property Restrictions

At present, granting Recon access to an identifier means granting it access to any and all properties on that object. This may change in the future, but at present, if you can't allow access to a property, you must disallow the entire object.

### Acorn Config

Not all options that can be passed into Acorn will be supported by Recon. I recommend keeping it simple. There's probably no reason to check code that can't run even if Acorn can be configured to parse it.
