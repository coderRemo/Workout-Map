'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

// let map, mapEvent;

class App {
  // private instance properties (START)
  #map;
  #mapEvent;
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
    inputElevation.closest('form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('form__row').classList.toggle('form__row--hidden');
  }

  _newWorkout(e) {
    e.preventDefault();

    //   Clear input fields
    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        '';

    //   console.log(mapEvent);
    const { lat, lng } = this.#mapEvent.latlng;

    // <---- Displaying a MAP Marker (START) ---->
    //  .marker - creates the marker; .addTo - add that marker to map; .bindPopup - creates a pop-up and binds it to the Marker & withim it is the string that we wants to display when we click on the MAP / check leaflet methode to add as an object
    //   L.marker([lat, lng]).addTo(map).bindPopup('Workout').openPopup();
    L.marker([lat, lng])
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false, // closes the popup once clicked on another place in MAP
          className: 'running-popup', // A custom CSS class name to assign to the popup
        })
      )
      .setPopupContent('Workout')
      .openPopup();
    // <---- Displaying a MAP Marker (END) ---->
  }
}

const app = new App();
