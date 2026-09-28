/**
 * Simple CLI argument parser for automation scripts
 * Parses flags in format: --flag value or --flag "value with spaces"
 * Also collects positional arguments into ._
 */
function parseArgs(args = process.argv.slice(2)) {
  const result = { _: [] };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const nextArg = args[i + 1];

      // If next argument exists and does not start with '--', it's the value
      if (nextArg !== undefined && !nextArg.startsWith('--')) {
        result[key] = nextArg;
        i++;
      } else {
        result[key] = true;
      }
    } else {
      result._.push(arg);
    }
  }

  return result;
}

module.exports = {
  parseArgs
};
