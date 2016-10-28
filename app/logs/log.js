const winston = require('winston')
const jetpack = require('fs-jetpack')

const jt = jetpack.cwd('./app/')

winston.emitErrs = true

logger = (module) => {
	return new winston.Logger({
		transports : [
			new winston.transports.File({
				level: 'info',
				filename: jt.path('./logs/debug/all.log'),
				handleException: true,
				json: true,
				maxSize: 5242880,
				maxFiles: 2,
				colorize: false
			}),
			new winston.transports.Console({
				level: 'debug',
				label: getFilePath(module),
				handleException: true,
				json: false,
				colorize: true
			})
		],
		exitOnError: false
	})
}

getFilePath = (module) => {
	return module.filename.split('/').slice(-2).join('/')
}

module.exports = logger
