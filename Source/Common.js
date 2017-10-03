function FormatRegexCaptureGroup(regex_string)
{
  return `(^${regex_string}$)`;
}

const CAMEL_CASE_COMMON_REGEX = `[A-Z]|[a-z]|[0-9]`;
const lower_camel_case_regex = FormatRegexCaptureGroup(`[a-z](${CAMEL_CASE_COMMON_REGEX})*`);
// Underscores are allowed, for CONSTANT_VARIABLE_NAME.
const upper_camel_case_regex = FormatRegexCaptureGroup(`[A-Z](${CAMEL_CASE_COMMON_REGEX}|_)*`);

const snake_case_regex = FormatRegexCaptureGroup(`[a-z]([a-z]|[0-9]|_)*`);

function MakeVariableNameFixers(original_fixer, source_code_text, variable_name, new_variable_name)
{
  var match_start;
  var match_end = 0;
  var fixers = [];
  while ((match_start = source_code_text.indexOf(variable_name, match_end)) > -1)
  {
    match_end = match_start + variable_name.length;
    fixers.push(original_fixer.replaceTextRange([
      match_start,
      match_end
    ],
    new_variable_name));
  }

  return fixers;
}

module.exports = {
  lower_camel_case_regex,
  upper_camel_case_regex,
  snake_case_regex,
  MakeVariableNameFixers
};
