/**
 * @summary Show help info
 * @async
 * @memberof CLIcommands
 * @returns undefined
 */
async function help () {
  console.log('\nUsage: quick-release [OPTIONS]\n')
  console.log(`Options:
-v, --version  Print version information and quit
-h, --help     Print help information and quit
-i, --info     Print release information and quit
-d, --debug    Print debug information and quit
  `)
}

export { help }
