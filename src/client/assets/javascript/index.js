// PROVIDED CODE BELOW (LINES 1 - 80) DO NOT REMOVE

// The store will hold all information needed globally
var store = {
	track_id: undefined,
	player_id: undefined,
	race_id: undefined,
}

const raceCars = {}

const raceTracks = {

}
// We need our javascript to wait until the DOM is loaded
document.addEventListener("DOMContentLoaded", function() {
	onPageLoad()
	setupClickHandlers()
})

async function onPageLoad() {
	try {
		getTracks()
			.then(tracks => {// first map track names to key names from my raceTracks objects
				const scenes = tracks.map((element, index) => {
					element.name = Object.keys(raceTracks)[index]
					return element
				})
				return scenes
				// console.log(tracks)
				
			})
			.then(scenes =>{
				const html = renderTrackCards(scenes)
				console.log(html)
				renderAt('#tracks', html)
				return scenes
			})
			.then(scenes => {
				scenes.map(obj => {
					const { name, id } = obj
					let curId = document.getElementById(`${id}`)
					curId.addEventListener("mouseenter", function(e) {
						if (e.target.id === `${id}`){
							changeImage(raceTracks[name])
						}	
					})
				})
			})

		getRacers() // first map racer names to key names from my raceCar object
			.then((racers) => {
				const sportsCars = racers.map((element, index) => {
					element.driver_name = Object.keys(raceCars)[index]
					return element
				})
				return sportsCars
				
			})
			.then(cars => {				
				const html = renderRacerCars(cars)
				renderAt('#racers', html)
				return cars
			})
			.then(cars => {
				cars.map(obj => {
					const { driver_name, id } = obj
					let curId = document.getElementById(`${id}`)
					curId.addEventListener("mouseenter", function(e){
						if (e.target.id === `${id}`){
						changeImage(raceTracks[driver_name])
						}
					})
				})
			})
	} catch(error) {
		console.log("Problem getting tracks and racers ::", error.message)
		console.error(error)
	}
}

function setupClickHandlers() {
	document.addEventListener('click', function(event) {
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
		if (target.matches('#gas-peddle')) {
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
	

	// TODO - Get player_id and track_id from the store
	const { player_id, track_id } = store; 

	await createRace(player_id, track_id)
	.then((race_info) => {
	// const race = TODO - invoke the API call to create the race, then save the result
	// TODO - update the store with the race id
		console.log(race_info)

		store.race_id = parseInt(race_info.ID)
		renderAt('#race', renderRaceStartView(race_info.Track))
		console.log(store)
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
				.then((raceInfo) => {console.log(`Race ${raceInfo.status}`)
				if (raceInfo.status === "in-progress"){
					renderAt('#leaderBoard', raceProgress(raceInfo.positions))
				}
				if (raceInfo.status==="finished"){
					clearInterval(raceInterval)
					renderAt('#race', resultsView(raceInfo.positions))
					resolve()
				}
			}).catch(err => console.log("Error in running race", err))
			}, 500)
		/* 
			TODO - if the race info status property is "in-progress", update the leaderboard by calling:

			renderAt('#leaderBoard', raceProgress(res.positions))
		*/

		/* 
			TODO - if the race info status property is "finished", run the following:

			clearInterval(raceInterval) // to stop the interval from repeating
			renderAt('#race', resultsView(res.positions)) // to render the results view
			reslove(res) // resolve the promise
		*/
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
	console.log("selected a race car", target.id)

	// remove class selected from all racer options
	const selected = document.querySelector('#racers .selected')
	if(selected) {
		selected.classList.remove('selected')
	}

	// add class selected to current target
	target.classList.add('selected')

	// update store with racer id
	store.player_id = parseInt(target.id)
	//console.log(store)
}

function handleSelectTrack(target) {
	console.log("selected a track", target.id)

	// remove class selected from all track options
	const selected = document.querySelector('#tracks .selected')
	if(selected) {
		selected.classList.remove('selected')
	}

	// add class selected to current target
	target.classList.add('selected')

	// TODO - save the selected track id to the store
	store.track_id = parseInt(target.id)
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
		<li class="card podracer" id="${id}">
			<h3>${driver_name}</h3>
			<p>${top_speed}</p>
			<p>${acceleration}</p>
			<p>${handling}</p>
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
		<li id="${id}" class="card track">
			<h3>${name}</h3>
		</li>
	`
}

function changeImage(image){
	console.log("hello")
	const mainImage = document.querySelector('header')
	mainImage.style.backgroundImage = image	
}

function renderCountdown(count) {
	return `
		<h2>Race Starts In...</h2>
		<p id="big-numbers">${count}</p>
	`
}

function renderRaceStartView(track) {
	return `
		<header>
			<h1>Race: ${track.name}</h1>
		</header>
		<main id="two-columns">
			<section id="leaderBoard">
				${renderCountdown(3)}
			</section>

			<section id="accelerate">
				<h2>Directions</h2>
				<p>Click the button as fast as you can to make your racer go faster!</p>
				<button id="gas-peddle">Click Me To Win!</button>
			</section>
		</main>
		<footer></footer>
	`
}

function resultsView(positions) {
	positions.sort((a, b) => (a.final_position > b.final_position) ? 1 : -1)

	return `
		<header>
			<h1>Race Results</h1>
		</header>
		<main>
			${raceProgress(positions)}
			<a href="/race">Start a new race</a>
		</main>
	`
}

function raceProgress(positions) {
	let userPlayer = positions.find(e => e.id === store.player_id)
	userPlayer.driver_name += " (you)"

	positions = positions.sort((a, b) => (a.segment > b.segment) ? -1 : 1)
	let count = 1

	const results = positions.map(p => {
		return `
			<tr>
				<td>
					<h3>${count++} - ${p.driver_name}</h3>
				</td>
			</tr>
		`
	})

	return `
		<main>
			<h3>Leaderboard</h3>
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

function getTracks() {
	return fetch(`${SERVER}/api/tracks`)
	.then(res => res.json())
	.catch(err => console.log("Problem with getTracks request::", err))
}

function getRacers() {
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
