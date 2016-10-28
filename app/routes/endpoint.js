const express = require('express')
const router = express.Router()

const imdb = require('imdb-api')

router.post('/title', (req, res) => {
	imdb.get(req.body.title).then((data) => {
		console.log(data)
		return res.send(data)
	})

})

module.exports = router
