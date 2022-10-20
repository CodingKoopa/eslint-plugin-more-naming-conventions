const common = require(`../Common.js`);

const variable_whitelist = [];

function CheckVariable(context, node)
{
  const source_code = context.getSourceCode();
  const variable_name = source_code.getText(node);
  if (!new RegExp(common.upper_camel_case_regex, `g`).test(variable_name))
  {
    context.report({
      node: node,
      message: `Class, function, or method '{{name}}' is not in upper camel case.`,
      data: {name: node.name},
      fix: function (original_fixer)
      {
        let new_variable_name;
        if (new RegExp(common.lower_camel_case_regex).test(variable_name))
          new_variable_name = variable_name.replace(/^[a-z]/,
            match => match.toUpperCase());
        else if (new RegExp(common.snake_case_regex).test(variable_name))
          new_variable_name = variable_name.replace(/_[a-z]/g,
            match => match[1].toUpperCase());
        else
          return null;

        return common.MakeVariableNameFixers(original_fixer, source_code.getText(), variable_name,
          new_variable_name);
      }
    });
  }
}

module.exports = {
  meta: {fixable: `code`},
  create(context)
  {
    return {
      // When a new variable is declared. This is where we whitelist nodes to check function calls of.
      VariableDeclaration: function (node)
      {
        // declarations is an array of the comma-separated variable declarations like "var foo, zero;"
        node.declarations.forEach(declaration =>
        {
          // id contains info about the variable being declared.
          const variable_name = declaration.id.name;
          // Skip if the variable is already whitelisted.
          if (variable_whitelist.indexOf(variable_name) > -1)
            return;

          // init contains info about the value being initialized to. It is null when the variable is
          // being declared without being initialized.
          // If initialization type is "CallExpression", that means that the variable is being
          // initialized to a function.
          // init.callee contains info about the function that the value is being initialized to,
          // undefined if it's not being initialized to a function, or at all.
          // So, this filters down into variables being initialized to the "require" function.
          if (declaration.init && declaration.init.type === `CallExpression` &&
            declaration.init.callee.name === `require`)
          {
            let module_name;
            // init.arguments is an array of the arguments being passed to the callee, undefined if
            // the variable isn't being initialized to a function, or at all. Unlike the declarations,
            // we won't iterate over this because we only care about the first argument.
            if (declaration.init.arguments[0].type === `TemplateLiteral`)
              // The quasis array is a bit weird. Parsed template literals have them, and the number
              // of elements is equal to the number of placeholders, plus one for the non-placeholder
              // section. However, the values of the placeholder sections are always empty, so I'm
              // not sure what purpose they serve.
              // This takes the cooked non-placeholder portion as-is.
              module_name = declaration.init.arguments[0].quasis[0].value.cooked;
            else if (declaration.init.arguments[0].type === `Literal`)
              // Literals are easy. The value is right there.
              module_name = declaration.init.arguments[0].value;
            else
              // Something other than `, ', or "? ¯\_(ツ)_/¯
              return;
            // Detect if the module is being included via a path. This means that it is a part of the
            // project, and not from an external dependency. This means that it's alright to correct
            // the case in it.
            if (module_name.includes(`/`))
              variable_whitelist.push(variable_name);
          }
        });
      },
      Identifier: function (node)
      {
        const ALLOWED_PARENTS = [
          `FunctionDeclaration`,
          `ClassDeclaration`,
          `MethodDefinition`
        ];
        if (ALLOWED_PARENTS.indexOf(node.parent.type) === -1)
          return;
        // The Espree parser will count function parameters as FunctionDeclarations here, which isn't
        // particularly desirable. The parent of a function name refers to itself, and the parent of a
        // function parameter refers to the function name (And not itself.), so we can use this to
        // exclude function parameters.
        if (node.parent.type === ALLOWED_PARENTS[0] && node.name !== node.parent.id.name)
          return;
        // Constructors have to be named the way they are.
        if (node.parent.type === ALLOWED_PARENTS[2] && node.name === `constructor`)
          return;

        CheckVariable(context, node);
      },
      CallExpression: function (node)
      {
        if (node.callee.object && variable_whitelist.indexOf(node.callee.object.name) > -1)
          CheckVariable(context, node.callee.property);
      }
    };
  }
};
