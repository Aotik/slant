const express = require('express')
const router = express.Router()

router.get('/', (req, res) => {
	return res.render('main', {title: 'Slant', search: true})
})

router.get('/search/:term', (req, res) => {
	return res.render('main', {title: 'Search results', param: req.params.term})
})

router.get('/id/:id', (req, res) => {
	return res.render('main', {title: 'Slant', imdb: req.params.id})
})

module.exports = router
