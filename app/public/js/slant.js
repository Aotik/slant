$(document).ready(() => {

	o = {
		selected: 'title'
	}

	$('.select').bind('click', (e) => {
		$('.select').removeClass('selected')
		o.selected = $(e.target).data('select')
		$(e.target).addClass('selected')
	})

	$('body').on('click', '.js_res', (e) => {
		data = {}

		if(e.target.tagName.toLowerCase() === 'a') {
			data.id = $(e.target).data('imdb')
		} else {
			data.id = $(e.target).closest('.js_res').data('imdb')
		}

		data.url = "/api/v1/imdbid"

		$.ajax({
			url: data.url,
			type: "POST",
			contentType: 'application/json',
			data: JSON.stringify(data),
			success: (data) => {
				$('.search').slideUp(120, () => {
					transitionResult(data)
				})
			}
		})
	})

	$('.go').bind('click', (e) => {
		data = {}

		if (o.selected == "title") {
			data.title = $('.content').val().trim()
			data.url = "/api/v1/title/search"
		} else {
			data.id = $('.content').val().trim()
			data.url = "/api/v1/imdbid"
		}

		$.ajax({
			url: data.url,
			type: "POST",
			contentType: 'application/json',
			data: JSON.stringify(data),
			success: (results) => {
				transitionResults(results)
			}
		})

	})

	transitionSearch = () => {
		$('#result .within').empty()
		$('body').removeClass('light dark')
		$('body').css('background-color', '#fff')
		$('#result').slideUp(120)
		$('.search').slideDown(140)
	}

	transitionResults = (results) => {
		$('#result, .search, #results').hide()
		$('#results .within').empty()
		$('body').removeClass('light dark')
		$('body').css('background-color', '#fff')

		$('#results .within').append('<div class="class="xs-12"><h3>Search results</h3></div>')
		results = JSON.parse(results)
		console.log(results);
		if (results.Response != 'False') {
			$.each(results.Search, (a,b) => {
				$('#results .within').append(`
					<a data-imdb="${b.imdbID}" class="xs-12 js_res">
						${b.Title} <span>(${b.Year})</span>
						<i class="material-icons">chevron_right</i>
					</a>
				`)
			})

			$('#results').slideDown(140)
		} else {
			console.log('no results')
		}
	}

	transitionResult = (res) => {
		$('#results').slideUp(140)

		$.get(`https://yts.ag/api/v2/list_movies.json?sort=seeds&query_term=${res.imdbid}`, (da) => {
			da.data.movie_count == 0 ? torrURL = null : torrURL = da.data.movies[0].torrents[0].url
			appendResult(res, torrURL)
		})

	}

	appendResult = (res, torrURL) => {
		$('#result').hide()

		if (res.poster == "N/A") {
			res.poster = null
		} else {
			res.poster.replace('SX300', 'SX1000')
		}

		torrURL != null ? hasMagnet = `<a class="button green torrent" href="${torrURL}" target="_blank"><i class="material-icons">file_download</i> Download Torrent</a>` : hasMagnet = ''

		res.poster != null ? hasPoster = `<div class="poster" style="background-image: url(${res.poster})" data-adaptive-background data-ab-css-background></div>` : hasPoster = ''

		$('#result .within').append(`
			<div class="grid-row">
				<div class="side xs-12 s-4">
					${hasPoster}
					<a class="button black imdbbtn" href="${res.imdburl}" target="_blank">View on IMDB</a>
					${hasMagnet}
					<a class="button primary reset" onclick="transitionSearch()"><i class="material-icons">arrow_back</i> Search for another movie</a>
				</div>
				<div class="info xs-12 s-8">
					<div class="grid-row">
						<div class="xs-12">
							<h3 class="title">${res.title} <span>(${res._year_data})</span></h3>
							<h5 class="genres">${res.genres}</h5>
							<h6 class="runtime">${res.runtime}</h6>
							<h3 class="sub">Actors</h3>
							<p class="actors">${res.actors}</p>
							<h3 class="sub">Synopsis</h3>
							<p class="plot">${res.plot}</p>
							<h3 class="sub">Information</h3>
						</div>
					</div>
					<div class="grid-row information">
						<div class="xs-12 s-6">
							<ul class="list">
								<li class="item"><span>Languages</span>${res.languages}</li>
								<li class="item"><span>Rated</span> ${res.rated}</li>
								<li class="item"><span>Director</span> ${res.director}</li>
								<li class="item"><span>Writers</span> ${res.writer}</li>
								<li class="item"><span>Awards</span> ${res.awards}</li>
							</ul>
						</div>
						<div class="xs-12 s-6">
							<ul class="list">
								<li class="item"><span>Metascore</span> ${res.metascore}</li>
								<li class="item"><span>IMDB Rating</span> ${res.rating}</li>
								<li class="item"><span>Ratings</span>${res.votes}</li>
							</ul>
						</div>
					</div>
				</div>
			</div>
		`)


		if (res.poster != null) {
			$.adaptiveBackground.run({
				success: ($img, data) => {
					$('body').css('background-color', data.color)
					$('body').lightOrDark()
					$('#result').slideDown(140)
				}
			})
		} else {
			$('#result').slideDown(140)
		}
	}
})
