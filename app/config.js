const nconf = require('nconf')
const jetpack = require('fs-jetpack')

const jt = jetpack.cwd('./app/')

nconf.argv()
	.env()
	.file({
		file: jt.path('/app/configs/settings.json')
	});

module.exports = nconf
