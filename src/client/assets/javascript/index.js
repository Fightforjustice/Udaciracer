// PROVIDED CODE BELOW (LINES 1 - 80) DO NOT REMOVE

// The store will hold all information needed globally
var store = {
	track_id: undefined,
	player_id: undefined,
	race_id: undefined,
	race_length: undefined // race length in global var allows for calculating percentage of race finished for each car; progress bar
}

const raceCars = {
	"Corvette ZR1": "Corvette_ZR1",
	"Ferrarri 458": "Ferrari_458",
	"Ford GT40": "Ford_GT40",
	"Lamborghini Huracan": "Lamborghini_Huracan",
	"Mercedes AMG GTR": "Mercedes_AMG_GTR" 
}

const colors = ['orange', 'red', 'white', 'green', 'yellow']

const raceTracks = {
	"Belgian Grand Prix": "belgian_grand_prix",
	"Indy 500": "2016Indy500Start",
	"Interlagos, Sao Paulo": "Interlagos_2006_aerial",
	"Monaco Grand Prix": "Monaco_grand_prix",
	"NASCAR": "nascar-334705_1920",
	"Downtown Tokyo": "Tokyo_freeway" 
}
// We need our javascript to wait until the DOM is loaded
document.addEventListener("DOMContentLoaded", function() {
	onPageLoad()
	setupClickHandlers()
})

async function onPageLoad() {
	try {
		Promise.all([getTracks(), getRacers()])
		.then(results => {
			// results.forEach(result => console.log(result))
			const tracks = results[0]
			const scenes = tracks.map((element, index) => {
					element.name = Object.keys(raceTracks)[index]
					return element
				})
			const racers = results[1]
			const sportsCars = racers.map((element, index) => {
					element.driver_name = Object.keys(raceCars)[index]
					return element
				})
			return [scenes, sportsCars]
		})
		.then(final => {
			const scenes = final[0]
			const htmls = renderTrackCards(scenes)
				//console.log(html)
				renderAt('#tracks', htmls)
				scenes.map(obj => {
					const { name, id } = obj
					let curId = document.getElementById(`track${id}`)
					/* found tips for adding handler to dynamically elements at 
					https://usefulangle.com/post/138/pure-javascript-event-handler-dynamic-element and 
					https://knowledge.udacity.com/questions/431180?utm_campaign=ret_600_auto_ndxxx_knowledge-answer-created_na&utm_source=blueshift&utm_medium=email&utm_content=ret_600_auto_ndxxx_knowledge-answer-created_na&bsft_clkid=894885db-f4dc-4574-a31e-35ffde3db51c&bsft_uid=8b823cda-bd7c-46bc-bf17-f059236ebf71&bsft_mid=0a79b0f0-87e8-4dbb-a6db-47ed7500fb9a&bsft_eid=22b8f7b6-5eac-66ee-cf9f-0d5b86b9fddc&bsft_txnid=f42044f8-9526-4eaa-bd81-dcacbdeab259&bsft_mime_type=html&bsft_ek=2020-12-31T23%3A09%3A38Z&bsft_aaid=8d7e276e-4a10-41b2-8868-423fe96dd6b2&bsft_lx=1&bsft_tv=1#431217*/
					function handler (e) {
							const selected = document.querySelector('#tracks .selected') // remove listener if any track is selected
							if (selected){
								curId.removeEventListener("mouseenter", handler, false)
							}
							else {changeImage(raceTracks[name])}	
					}
					curId.addEventListener("mouseenter", handler, false)
				})

			const cars = final[1]
			const htmlc = renderRacerCars(cars)
				renderAt('#racers', htmlc)
				cars.map(obj => {
					const { driver_name, id } = obj
					let curId = document.getElementById(`car${id}`)
					function handler (e) {
						const selected = document.querySelector('#racers .selected') // remove listener if any racer is selected; found method at https://stackoverflow.com/a/4402359
						if (selected){
							curId.removeEventListener("mouseenter", handler, false)
						}
						else {changeImage(raceCars[driver_name])}	
				}
				curId.addEventListener("mouseenter", handler, false)
				})
		}) 
		/*
		getTracks()
			.then(tracks => {// first map track names to key names from my raceTracks objects
				
				return scenes
				// console.log(tracks)
				
			})
			.then(scenes =>{
				
			})

		getRacers() // first map racer names to key names from my raceCar object
			.then((racers) => {
				
				return sportsCars
				
			})
			.then(cars => {				
				
			})*/
	} catch(error) {
		console.log("Problem getting tracks and racers ::", error.message)
		console.error(error)
	}
}

function setupClickHandlers() {
	document.addEventListener('click', function(event) {
		// found methods for gracefully handling clicking on card elements at https://stackoverflow.com/a/38861760 and https://knowledge.udacity.com/questions/398046 
		let parent = event.target.parentElement	
		const { target } = event

		// Race track form field

		if (parent.matches('.card.track')) {
			handleSelectTrack(parent)
		}

		if (target.matches('.card.track')) {
			handleSelectTrack(target)
		}

		// Podracer form field
		if (parent.matches('.card.podracer')) {
			handleSelectPodRacer(parent)
		}

		if (target.matches('.card.podracer')) {
			handleSelectPodRacer(target)
		}

		// Submit create race form
		if (target.matches('#submit-create-race')) {
			event.preventDefault()
	
			// start race
			handleCreateRace()
		}

		// Handle acceleration click
		if (target.matches('#gas-pedal')) {
			handleAccelerate(target)
		}

	}, false)
}

async function delay(ms) {
	try {
		return await new Promise(resolve => setTimeout(resolve, ms));
	} catch(error) {
		console.log("an error shouldn't be possible here")
		console.log(error)
	}
}
// ^ PROVIDED CODE ^ DO NOT REMOVE

// This async function controls the flow of the race, add the logic and error handling
async function handleCreateRace() {
	// render starting UI
	const { player_id, track_id } = store;

	await createRace(player_id, track_id)
	.then((race_info) => {
		store.race_id = parseInt(race_info.ID)
		store.race_length = race_info.Track.segments.length
		// console.log(store)
		renderAt('#race', renderRaceStartView(race_info.Track))
	})
	.then(() => {
		// console.log(store) 
		const curTrack = Object.keys(raceTracks)[track_id - 1]
		// console.log(curTrack)
		changeImage(raceTracks[curTrack])
	})
	.catch("unable to create race")

	await runCountdown()
	.then(() => startRace(store.race_id - 1))
	.then(() => runRace(store.race_id - 1))
	.catch((err) => console.log(err))
}

async function runRace(raceID) {
	try {
		return await new Promise(resolve => {

			const raceInterval = setInterval(() => 
			{
				getRace(raceID)
				.then((raceInfo) => {
					// when race start, hide instructions if on mobile
					const mql = window.matchMedia('(max-width: 768px)')
					if (mql.matches){
						const directions = document.querySelector(`#accelerate > h2`)
						directions.style.display = "none"
						const content = document.querySelector('#accelerate > p')
						content.style.display = "none"
					}
					const { positions } = raceInfo
					const places = positions.map((elem, ind) => {
						let carKeys = Object.keys(raceCars)
						elem.driver_name = carKeys[ind]
						let carIndex = carKeys.indexOf(elem.driver_name)
						elem.color = colors[carIndex] // add car color to each racer element
						elem.icon = `/assets/images/${elem.color}_car.png` // add car icon image file to each racer element; see https://knowledge.udacity.com/questions/404695
						return elem
					})
					
					if (raceInfo.status === "in-progress"){
						renderAt('#leaderBoard', raceProgress(places))
						// console.log(document.getElementById('yellow-car').offsetWidth)
						places.map(elem => { //update progress bar for each car
							let bar = document.getElementById(elem.color)
							let container = document.getElementById(`outer-${elem.color}`)
							let curIcon = document.getElementById(`${elem.color}-car`)
							let percentage = (elem.segment * 100)/store.race_length
							bar.style.width = percentage + "%"
							if (bar.offsetWidth >= container.offsetWidth - 56){ // prevent car icon from being pushed to next line when progress bar is near end
								bar.style.float = null // found method for removing attribute at https://stackoverflow.com/a/33039348
								curIcon.style.float = null
								curIcon.style.zIndex = "10"
								curIcon.style.position = "absolute"
								curIcon.style.top = "0px"
								curIcon.style.right = "0px"
							} 
							if (percentage >= 100){
								document.getElementById(`header${elem.id}`).innerHTML = `${elem.driver_name} finished!`
							}
						})
					}
					if (raceInfo.status==="finished"){
						clearInterval(raceInterval)						
						renderAt('#race', resultsView(places))
						const bars = document.getElementsByClassName("container")
						for (let i = 0; i < bars.length; i++){
							bars[i].style.display = "none"
						}
						resolve()
				}
			}).catch(err => console.log("Error in running race", err))
			}, 500)
			})
	}catch(error){
		console.log(error);
	}

}

async function runCountdown() {
	try {
		// wait for the DOM to load
		await delay(1000)
		let timer = 3

		return await new Promise(resolve => {
			// TODO - use Javascript's built in setInterval method to count down once per second

			// run this DOM manipulation to decrement the countdown for the user
			let i = setInterval(() => {
				document.getElementById('big-numbers').innerHTML = --timer
				if (timer < 1){
					clearInterval(i)
					resolve()
				}


			}, 1000)
			// TODO - if the countdown is done, clear the interval, resolve the promise, and return

		})
	} catch(error) {
		console.log(error);
	}
}

function handleSelectPodRacer(target) {
	console.log("selected a race car", target.innerText)

	// remove class selected from all racer options
	const selected = document.querySelector('#racers .selected')
	if(selected) {
		selected.classList.remove('selected')
	}

	// add class selected to current target
	target.classList.add('selected')

	// update store with racer id
	const racerId = parseInt(target.id.slice(-1))
	
	store.player_id = racerId

	const html = `You have selected ${Object.keys(raceCars)[racerId - 1]} as your car!`

	renderAt("#choose-racer > h3", html)
	// display new text for two seconds before hiding current section and showing next
	setTimeout(() => {
		document.getElementById("choose-racer").style.display = "none"
		document.getElementById("submit-create-race").style.display = "block"
	}, 2000)
	//console.log(store)
}

function handleSelectTrack(target) {
	console.log("selected a track", target.innerHTML)

	// remove class selected from all track options
	const selected = document.querySelector('#tracks .selected')
	if(selected) {
		selected.classList.remove('selected')
	}

	// add class selected to current target
	target.classList.add('selected')

	// TODO - save the selected track id to the store

	let curTrack = target.innerText

	store.track_id = parseInt(target.id.slice(-1))

	const html = `You have selected ${curTrack} as your track!`

	renderAt("#choose-track > h3", html)
	// display new text for two seconds before hiding current section and showing next
	setTimeout(() => {
		document.getElementById("choose-track").style.display = "none"
		document.getElementById("choose-racer").style.display = "block"
	}, 2000)
	//console.log(store)
}

function handleAccelerate() {
	console.log("accelerate button clicked")
	accelerate(store.race_id - 1)
	// TODO - Invoke the API call to accelerate
}

// HTML VIEWS ------------------------------------------------
// Provided code - do not remove

function renderRacerCars(racers) {
	if (!racers.length) {
		return `
			<h4>Loading Racers...</4>
		`
	}



	const results = racers.map(renderRacerCard).join('')

	return `
		<ul id="racers">
			${results}
		</ul>
	`
}

function renderRacerCard(racer) {
	const { id, driver_name, top_speed, acceleration, handling } = racer

	return `
		<li class="card podracer" id="car${id}">
			<h3>${driver_name}</h3>
			<p>Top Speed: ${top_speed}</p>
			<p>Acceleration: ${acceleration}</p>
			<p>Handling: ${handling}</p>
		</li>
	`
}

function renderTrackCards(tracks) {
	if (!tracks.length) {
		return `
			<h4>Loading Tracks...</4>
		`
	}

//	const scenes = []
	

	const results = tracks.map(renderTrackCard).join('')

	return `
		<ul id="tracks">
			${results}
		</ul>
	`
}

function renderTrackCard(track) {
	const { id, name } = track

	return `
		<li id="track${id}" class="card track">
			<h3>${name}</h3>
		</li>
	`
}

function changeImage(image){
	console.log(image)
	const mainImage = document.querySelector('header')
	mainImage.style.backgroundImage = `url(/assets/images/${image}.jpg)`
}



function renderCountdown(count) {
	return `
		<h2>Race Starts In...</h2>
		<p id="big-numbers">${count}</p>
	`
}

function renderRaceStartView(track) {
	/* The server always returns track 1, so track id must be gotten from store */
	const {track_id} = store
	const curTrack = Object.keys(raceTracks)[track_id]
	return `
		<header>
			<h1>Race: &nbsp ${curTrack}</h1>
		</header>
		<main id="two-columns">
			<section id="leaderBoard">
				${renderCountdown(3)}
			</section>

			<section id="accelerate">
				<h2>Directions</h2>
				<p>Click the button as fast as you can to make your racer go faster!</p>
				<button id="gas-pedal">Click Me To Win!</button>
			</section>
		</main>
		<footer></footer>
	`
}

function resultsView(positions) {
	positions.sort((a, b) => (a.final_position > b.final_position) ? 1 : -1)

	return `
		<header>
			<h1>Race &nbsp Results</h1>
		</header>
		<main>
			${raceProgress(positions)}
			<a href="/race">Start a new race</a>
		</main>
	`
}

function raceProgress(positions) {
	positions = positions.sort((a, b) => (a.segment > b.segment) ? -1 : 1)
	let count = 1

	const results = positions.map(p => {
		if (p.id === store.player_id){
			p.driver_name += " (you)"
		}
		return `
			<h3 id = "header${p.id}">${count++} - ${p.driver_name}</h3>
				<div id = "outer-${p.color}" class = "container">
					<div id = "${p.color}" class = "bars" style = "background-color: ${p.color}"></div>
					<div  id = "${p.color}-car" class = "icon"><img src = "${p.icon}"></div>

				</div>
		`
	}) 

	return `
		<main>
			<h3 style = "font-family: 'Faster One', cursive; font-size: 50px">Leaderboard</h3>
			<section id="leaderBoard">
				${results}
			</section>
		</main>
	`
}

function renderAt(element, html) {
	const node = document.querySelector(element)

	node.innerHTML = html
}

// ^ Provided code ^ do not remove


// API CALLS ------------------------------------------------

const SERVER = 'http://localhost:8000'

function defaultFetchOpts() {
	return {
		mode: 'cors',
		headers: {
			'Content-Type': 'application/json',
			'Access-Control-Allow-Origin' : SERVER,
		},
	}
}

// TODO - Make a fetch call (with error handling!) to each of the following API endpoints 

const getTracks = () => {
	return fetch(`${SERVER}/api/tracks`)
	.then(res => res.json())
	.catch(err => console.log("Problem with getTracks request::", err))
}

const getRacers = () => {
	return fetch(`${SERVER}/api/cars`)
	.then(res => res.json())
	.catch(err => console.log("Problem with getRacers request::", err))
	
}

function createRace(player_id, track_id) {
	player_id = parseInt(player_id)
	track_id = parseInt(track_id)
	const body = { player_id, track_id }
	
	return fetch(`${SERVER}/api/races`, {
		method: 'POST',
		...defaultFetchOpts(),
		dataType: 'jsonp',
		body: JSON.stringify(body)
	})
	.then(res => res.json())
	.catch(err => console.log("Problem with createRace request::", err))
}

function getRace(id) {
	return fetch(`${SERVER}/api/races/${id}`)
	.then(res => res.json())
	.catch(err => console.log("Problem with get Race request::", err))
}

function startRace(id) {
	return fetch(`${SERVER}/api/races/${id}/start`, {
		method: 'POST',
		...defaultFetchOpts(),
	})
	.catch(err => console.log("Problem with startRace request::", err))
}

function accelerate(id) {
	return fetch(`${SERVER}/api/races/${id}/accelerate`, {
		method: 'POST',
		...defaultFetchOpts()
	})
	.catch(err => console.log("Problem with accelerate request::", err))
}
