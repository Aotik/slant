$(document).ready(() => {

	o = {
		selected: 'title'
	}

	$('.select').bind('click', (e) => {
		$('.select').removeClass('selected')
		o.selected = $(e.target).data('select')
		$(e.target).addClass('selected')
	})

	$('.go').bind('click', (e) => {
		data = {}

		if (o.selected == "title") {
			data.title = $('.content').val().trim()
			data.url = "/api/v1/title"
		} else {
			data.id = $('.content').val().trim()
			data.url = "/api/v1/imdbid"
		}

		$.ajax({
			url: data.url,
			type: "POST",
			contentType: 'application/json',
			data: JSON.stringify(data),
			success: (data) => {
				$('.search').slideUp(120, () => {
					transitionResults(data)
				})
			}
		})

	})

	transitionSearch = () => {
		$('#results').empty()
		$('body').removeClass('light dark')
		$('body').css('background-color', '#fff')
		$('#results').slideUp(120)
		$('.search').slideDown(140)
	}

	transitionResults = (res) => {
		res.poster.replace('SX300', 'SX6000')
		$('#results').append(`
			<div class="grid-row">
				<div class="side xs-12 s-4">
					<div class="poster" style="background-image: url(${res.poster.replace('SX300', 'SX1000')})" data-adaptive-background data-ab-css-background></div>
					<a class="button black imdbbtn" href="${res.imdburl}" target="_blank">View on IMDB</a>
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

		$('#results').hide()

		$.adaptiveBackground.run({
			success: ($img, data) => {
				$('body').css('background-color', data.color)
				$('body').lightOrDark()
				$('#results').slideDown(140)
			}
		})

	}
})
