import chalk from 'chalk'

/**
 * #### show debug info
 * @memberof UTILS
 * @param {string} title - debug title
 * @param {any} info - debug info
 * @returns undefined
 */
function debug (title, info) {
  if (process.env.QR_MODE === 'debug') {
    console.log(chalk.bold.magenta(`[debug-start]─────● ${title}`))
    console.log(info)
    console.log(chalk.bold.magenta(`[debug-end]─────● ${title}`))
  }
}

export { debug }
