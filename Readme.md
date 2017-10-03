# eslint-plugin-more-naming-conventions
`eslint-plugin-more-naming-conventions` is a plugin for the [ESLint](https://eslint.org/) JavaScript linting utility. It introduces rules that add more naming conventions for variables, functions, classes, and methods.

## Setup
1. Open up a terminal or command prompt in the project to lint.
2. Follow the instructions to install ESLint [here](https://eslint.org/docs/user-guide/getting-started#installation-and-usage).
3. Install `eslint-plugin-more-naming-conventions` with the [NPM](https://www.npmjs.com/) package manager:
```bash
npm install eslint-plugin-more-naming-conventions
```
4. Follow the instructions to add the plugin to your configuration file [here](https://eslint.org/docs/user-guide/configuring#configuring-plugins).
5. Follow the instructions to add the [plugin rules](#rules) to your configuration file [here](https://eslint.org/docs/user-guide/configuring#configuring-rules).

Then configure the rules you want to use under the rules section.

## Rules
All rules support fixing errors automatically.

### `snake-case-variables`
`snake-case-variables` ensures that all variables defined are in snake case, consisting of all lower case letters, with words separated by underscores (`_`s).

Good:
- `variable_name`
- `variable`
- `CONSTANT_NAME`
- `ClassName` (For when the old class syntax is used for defining a class.)

Bad:
- `variableName`

### `upper-camel-case-functions`
`upper-camel-case-functions` ensures that all functions, classes, and methods defined are in upper camel case, consisting of lower and upper case letters, with words separated by the letter changing to upper case.

Good:
- `VariableName`
- `Variable`

Bad:
- `variableName`
- `variable`
- `variable_name`

#### Automatic Fixing
The way fixing function calls work, in relation to module exports, is that the plugin scans variable definitions initialized to the value of `require()`, with arguments including the character `/`, and adds it to a whitelist. This whitelist now has variables included from other packages filtered out, so it won't try to correct case errors in other packages, or builtin objects. However, if you have a local (A JS file in your project included via a path.) that is **an extention of an object exposing camel case functions**, and those functions are called, the plugin **will** try to correct them.
