$(document).ready(() => {

	var DATA_COLOR    = 'data-ab-color';
	var DATA_PARENT   = 'data-ab-parent';
	var DATA_CSS_BG   = 'data-ab-css-background';
	var EVENT_CF      = 'ab-color-found';

	var DEFAULTS      = {
		selector:             '[data-adaptive-background]',
		parent:               null,
		exclude:              [ 'rgb(0,0,0)', 'rgb(255,255,255)' ],
		normalizeTextColor:   false,
		normalizedTextColors:  {
			light:      "#fff",
			dark:       "#000"
		},
		lumaClasses:  {
			light:      "ab-light",
			dark:       "ab-dark"
		}
	};

	!function(n){"use strict";var t=function(){return document.createElement("canvas").getContext("2d")},e=function(n,e){var a=new Image,o=n.src||n;"data:"!==o.substring(0,5)&&(a.crossOrigin="Anonymous"),a.onload=function(){var n=t("2d");n.drawImage(a,0,0);var o=n.getImageData(0,0,a.width,a.height);e&&e(o.data)},a.src=o},a=function(n){return["rgb(",n,")"].join("")},o=function(n){return n.map(function(n){return a(n.name)})},r=5,i=10,c={};c.colors=function(n,t){t=t||{};var c=t.exclude||[],u=t.paletteSize||i;e(n,function(e){for(var i=n.width*n.height||e.length,m={},s="",d=[],f={dominant:{name:"",count:0},palette:Array.apply(null,new Array(u)).map(Boolean).map(function(){return{name:"0,0,0",count:0}})},l=0;i>l;){if(d[0]=e[l],d[1]=e[l+1],d[2]=e[l+2],s=d.join(","),m[s]=s in m?m[s]+1:1,-1===c.indexOf(a(s))){var g=m[s];g>f.dominant.count?(f.dominant.name=s,f.dominant.count=g):f.palette.some(function(n){return g>n.count?(n.name=s,n.count=g,!0):void 0})}l+=4*r}if(t.success){var p=o(f.palette);t.success({dominant:a(f.dominant.name),secondary:p[0],palette:p})}})},n.RGBaster=n.RGBaster||c}(window);


$.adaptiveBackground = {
		run: function( options ){
			var opts = $.extend({}, DEFAULTS, options);

			/* Loop over each element, waiting for it to load
				 then finding its color, and triggering the
				 color found event when color has been found.
			*/
			$( opts.selector ).each(function(index, el){
				var $this = $(this);

				/*  Small helper functions which applies
						colors, attrs, triggers events, etc.
				*/
				var handleColors = function () {
					var img = useCSSBackground() ? getCSSBackground() : $this[0];

					RGBaster.colors(img, {
						paletteSize: 20,
						exclude: opts.exclude,
						success: function(colors) {
							$this.attr(DATA_COLOR, colors.dominant);
							$this.trigger(EVENT_CF, { color: colors.dominant, palette: colors.palette });
						}
					});

				};

				var useCSSBackground = function(){
					var attr = $this.attr( DATA_CSS_BG );
					return (typeof attr !== typeof undefined && attr !== false);
				};

				var getCSSBackground = function(){
					var str = $this.css('background-image');
					var regex = /\(([^)]+)\)/;
					var match = regex.exec(str)[1].replace(/"/g, '')
					return match;
				};

				/* Subscribe to our color-found event. */
				$this.on( EVENT_CF, function(ev, data){

					// Try to find the parent.
					var $parent;
					if ( opts.parent && $this.parents( opts.parent ).length ) {
						$parent = $this.parents( opts.parent );
					}
					else if ( $this.attr( DATA_PARENT ) && $this.parents( $this.attr( DATA_PARENT ) ).length ){
						$parent = $this.parents( $this.attr( DATA_PARENT ) );
					}
					else if ( useCSSBackground() ){
						$parent = $this;
					}
					else if (opts.parent) {
						$parent = $this.parents( opts.parent );
					}
					else {
						$parent = $this.parent();
					}

					$parent.css({ backgroundColor: data.color });

					// Helper function to calculate yiq - http://en.wikipedia.org/wiki/YIQ
					var getYIQ = function(color){
						var rgb = color.match(/\d+/g);
						return ((rgb[0]*299)+(rgb[1]*587)+(rgb[2]*114))/1000;
					};

					var getNormalizedTextColor = function (color){
						return getYIQ(color) >= 128 ? opts.normalizedTextColors.dark : opts.normalizedTextColors.light;
					};

					var getLumaClass = function (color){
						return getYIQ(color) <= 128 ? opts.lumaClasses.dark : opts.lumaClasses.light;
					};

					// Normalize the text color based on luminance.
					if ( opts.normalizeTextColor )
						$parent.css({ color: getNormalizedTextColor(data.color) });

					// Add a class based on luminance.
					$parent.addClass( getLumaClass(data.color) )
								 .attr('data-ab-yaq', getYIQ(data.color));

					opts.success && opts.success($this, data);
				});

				/* Handle the colors. */
				handleColors();

			});
		}
	};



	$.fn.lightOrDark = function(){
		var r,b,g,hsp
			, a = this.css('background-color');

		if (a.match(/^rgb/)) {
			a = a.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/);
			r = a[1];
			g = a[2];
			b = a[3];
		} else {
			a = +("0x" + a.slice(1).replace( // thanks to jed : http://gist.github.com/983661
					a.length < 5 && /./g, '$&$&'
				)
			);
			r = a >> 16;
			b = a >> 8 & 255;
			g = a & 255;
		}
		hsp = Math.sqrt( // HSP equation from http://alienryderflex.com/hsp.html
			0.299 * (r * r) +
			0.587 * (g * g) +
			0.114 * (b * b)
		);
		if (hsp>127.5) {
			this.addClass('light');
		} else {
			this.addClass('dark');
		}
	}

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
	}).on('click', '.js_home', (e) => {
		transitionSearch()
	})

	$('.content').keypress((e) => {
		if(e.which == 13){
			$('.go').click()
		}
	})

	$('.go').bind('click', (e) => {
		data = {}

		if (o.selected == "title") {
			data.title = $('.content').val().trim()
			data.url = "/api/v1/title/search"
			$.ajax({
				url: data.url,
				type: "POST",
				contentType: 'application/json',
				data: JSON.stringify(data),
				success: (results) => {
					transitionResults(results, data.title)
				}
			})
		} else {
			data.id = $('.content').val().trim()
			data.url = "/api/v1/imdbid"
			$.ajax({
				url: data.url,
				type: "POST",
				contentType: 'application/json',
				data: JSON.stringify(data),
				success: (result) => {
					transitionResult(result)
				}
			})
		}
	})

	window.onpopstate =  (event) => {
		window.location.reload()
	}

	transitionSearch = () => {
		$('#result .within').empty()
		$('body').removeClass('light dark')
		$('body').css('background-color', '#fff')
		$('#results').hide()
		$('#result').slideUp(120)
		stateObj = { foo: "Slant" }
		history.pushState(stateObj, "Slant", "/")
		$('.search').slideDown(140)
	}

	transitionResults = (results, title, nRdr) => {
		$('#result, #results').hide()
		$('#results .within').empty()
		$('body').removeClass('light dark')
		$('body').css('background-color', '#fff')

		$('#results .within').append(`<div class="class="xs-12"><h3>Search results: <span>${title}</span></h3></div>`)
		results = JSON.parse(results)
		if (results.Response != 'False') {
			$('.search').hide()
			$.each(results.Search, (a,b) => {
				$('#results .within').append(`
					<a data-imdb="${b.imdbID}" class="xs-12 js_res">
						${b.Title} <span>(${b.Year})</span>
						<i class="material-icons">chevron_right</i>
					</a>
				`)
			})
			if (!nRdr) {
				stateObj = { foo: "Search results" }
				history.pushState(stateObj, "Search results", "/search/" + title)
			}
			$('#results').slideDown(140)
		} else {
			$('.search').show()
			$('.content').val(title)
			$('.content').addClass('error').delay(4000).queue(() => {
				$('.content').removeClass('error').dequeue()
			})
		}
	}

	transitionResult = (res, nRd) => {
		$('.search').hide()
		$('#result .within').empty()
		$('#results').slideUp(140)

		$.get(`https://yts.ag/api/v2/list_movies.json?sort=seeds&query_term=${res.imdbid}`, (da) => {
			da.data.movie_count == 0 ? torrURL = null : torrURL = da.data.movies[0].torrents[0].url
			appendResult(res, torrURL, nRd)
		})

	}

	appendResult = (res, torrURL, nRd) => {
		$('#result').hide()

		if (!nRd) {
			stateObj = { foo: "result" }
			history.pushState(stateObj, res.title, "/id/" + res.imdbid)
		}

		if (res.poster == "N/A") {
			res.poster = null
		} else {
			res.poster.replace('SX300', 'SX1000')
		}

		torrURL != null ? hasMagnet = `<a class="button green torrent" href="${torrURL}" target="_blank"><i class="material-icons">file_download</i> Download Torrent</a>` : hasMagnet = ''

		res.poster != null ? hasPoster = `<div class="poster" style="background-image: url(${res.poster})" data-adaptive-background data-ab-css-background></div>` : hasPoster = ''
		$('#result .within').html(`
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
			// $('#result').slideDown(140)

		} else {
			$('#result').slideDown(140)
		}
	}

})
