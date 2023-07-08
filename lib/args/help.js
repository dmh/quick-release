/**
 * #### Show help info
 * @async
 * @memberof COMMANDS
 * @returns undefined
 */
function help () {
  console.log('\nUsage: quick-release [OPTIONS]\n')
  console.log(`Options:
-v, --version  Print version information and quit
-h, --help     Print help information and quit
-i, --info     Print projected information for a new potential release and quit
-d, --debug    Print additional debug information during the release process
  `)
}

export { help }
