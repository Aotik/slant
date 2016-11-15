const express = require('express')
const router = express.Router()

const request = require('request')
const imdb = require('imdb-api')

router.post('/title', (req, res) => {
	imdb.get(req.body.title).then((data) => {
		return res.send(data)
	})
})

router.post('/imdbid', (req, res) => {
	console.log(req.body.id);
	imdb.getById(req.body.id).then((data) => {
		return res.send(data)
	})
})

router.post('/title/search', (req, res) => {
	request('http://www.omdbapi.com/?s=' + req.body.title, (error, response, body) => {
		if (!error && response.statusCode == 200) {
			return res.send(body)
		}
	})
})

module.exports = router
