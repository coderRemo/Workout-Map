'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

class Workout {
  date = new Date();
  id = (Date.now() + '').slice(-10);

  constructor(coords, distance, duration) {
    // this.date = ...
    // this.id = ...
    this.coords = coords; // [lat, longitude]
    this.distance = distance; // in km
    this.duration = duration; // in min
  }
}

class Running extends Workout {
  type = 'running';
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
  }

  calcPace() {
    // min/km
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

class Cycling extends Workout {
  type = 'cycling';
  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    this.calcSpeed();
  }

  calcSpeed() {
    // km/hr
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}

// <--- testing --->
// const run = new Running([39, -12], 5.2, 24, 178);
// const cycle = new Cycling([39, -12], 27, 95, 523);
// console.log(run, cycle);

///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////
// APPLICATION ARCHITECTURE

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

class App {
  //region private instance properties (START)
  #map;
  #mapEvent;
  #workouts = [];
  // private instance properties (END)

  constructor() {
    this._getPosition();
    form.addEventListener('submit', this._newWorkout.bind(this));
    inputType.addEventListener('change', this._toggleElevationField);
  }

  _getPosition() {
    // GEOLOCATION API
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert('Could not get your Current Position');
        }
      );
  }

  _loadMap(position) {
    // console.log(position);
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    // https://www.google.com/maps/@22.6506584,88.4337222,17z?entry=ttu
    console.log(`https://www.google.com/maps/@${latitude},${longitude}`);

    // <---- displaying a MAP using leaflet library (START) ---->
    const coords = [latitude, longitude];
    this.#map = L.map('map').setView(coords, 13); // 'map' is the id in HTML
    // console.log(map);

    // .tileLayer - add the titlelayer; .addTo - addds that titlelayer to the MAP
    L.tileLayer('https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    // L.marker(coords)
    //   .addTo(map)
    //   .bindPopup('A pretty CSS popup.<br> Easily customizable.')
    //   .openPopup();

    // <---- Handling Clicks on MAP (START) ---->
    this.#map.on('click', this._showForm.bind(this));

    // <---- displaying a MAP using leaflet library (END) ---->
  }

  _showForm(mapEvnt) {
    this.#mapEvent = mapEvnt;
    form.classList.remove('hidden'); // once clicked on map the input form is visible on left side that was initially hidden
    inputDistance.focus(); // once clicked on map, the cursor starts blinking on Distance input as it focuses on it
    // <---- Handling Clicks on MAP (END) ---->
  }

  _toggleElevationField() {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }

  _newWorkout(e) {
    const validInputs = (...inputs) =>
      inputs.every(inp => Number.isFinite(inp));

    const allPositive = (...inputs) => inputs.every(inp => inp > 0);

    e.preventDefault();

    // Get data from form
    const type = inputType.value;
    const distance = +inputDistance.value; // '+' converts string to integer
    const duration = +inputDuration.value;
    const { lat, lng } = this.#mapEvent.latlng;
    let workout;

    // If workout running. create running object
    if (type === 'running') {
      const cadence = +inputCadence.value;
      // check if data is valid
      if (
        // !Number.isFinite(distance) ||
        // !Number.isFinite(duration) ||
        // !Number.isFinite(cadence)
        !validInputs(distance, duration, cadence) ||
        !allPositive(distance, duration, cadence)
      )
        return alert('Input have to be positive numbers!');

      workout = new Running([lat, lng], distance, duration, cadence);
    }

    // If workout cycling, create cycling object
    if (type === 'cycling') {
      const elevation = +inputElevation.value;
      // check if data is valid
      if (
        // !Number.isFinite(distance) ||
        // !Number.isFinite(duration) ||
        // !Number.isFinite(elevation)
        !validInputs(distance, duration, elevation) ||
        !allPositive(distance, duration, elevation)
      )
        return alert('Input have to be positive numbers!');

      workout = new Cycling([lat, lng], distance, duration, elevation);
    }

    // Add new object to Workout Array
    this.#workouts.push(workout);
    console.log(workout);

    // Render workout on MAP as marker
    this.renderWorkoutMarker(workout);

    // Render workout on list

    //   Clear input fields
    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        '';

    //   console.log(mapEvent);
  }

  renderWorkoutMarker(workout) {
    // <---- Displaying a MAP Marker (START) ---->
    //  .marker - creates the marker; .addTo - add that marker to map; .bindPopup - creates a pop-up and binds it to the Marker & withim it is the string that we wants to display when we click on the MAP / check leaflet methode to add as an object
    //   L.marker([lat, lng]).addTo(map).bindPopup('Workout').openPopup();
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false, // closes the popup once clicked on another place in MAP
          className: `${workout.type}-popup`, // A custom CSS class name to assign to the popup
        })
      )
      .setPopupContent(workout.type) // the string that need to be seen on screen
      .openPopup();
    // <---- Displaying a MAP Marker (END) ---->
  }
}

const app = new App();
