import destinationData from "./destinationData.js";

const nav = document.querySelector(".navbar");
const quote = document.querySelector(".center_quote");
const goBtn = document.querySelector(".btn-go");
const countries = document.querySelector(".section--1");
const card = document.querySelector(".card");
const mapContainer = document.querySelector(".map-container");
let destinationEl = document.querySelector(".container-destinations");
const mapText = document.querySelector(".map-text");
const logIn = document.querySelector(".log-in");
const btnClose = document.querySelector(".btn-close");

////Event fired when clicked on lets go button to scroll down to the section we want to display
goBtn.addEventListener("click", function () {
  countries.classList.remove("d-none");
  countries.scrollIntoView({ behavior: "smooth" });
  document.querySelector(".footer").style.marginTop = "20px !important";
  nav.classList.add("sticky-top");
});

///////////////////////////////////////////////
//MAP LOADING THE VERY FIRST TIME BUT WILL NOT RENDER RIGHT AWAY
var map = L.map("map").setView([51.505, -0.09], 2);
L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

mapContainer.classList.add("d-none");

////////////////////////////////////////////////
//COUNTRY CLASS TO MAKE OBJECTS BASED ON THIS CLASS
class Country {
  ///ASSIGNING PROPERTIES
  #flag;
  coords;
  subregion;
  ///CONSTRUCTOR TO BUILD THE PROPERTIES AND RUN THE BUILD-IN FUNCTIONS WHENEVER A CLASS IS CREATED.
  constructor(name, description) {
    this.name = name;
    this.description = description;
    this._getCountry();
  }

  ///rendering the country on the screen
  _getCountry = async function () {
    const res = await fetch(`https://restcountries.com/v2/name/${this.name}`);
    const data = await res.json();
    const i = this.name === "India" ? 1 : 0;
    this.coords = data[i].latlng;
    this.#flag = data[i].flag;
    this.subregion = data[i].subregion;
    //////adding the necessary html to display card for each country available
    const markup = `
    <div class="col-md-4 col-sm-12">
          <div class="card text-center" style="width: 18rem;">
                <img src=${this.#flag} class="card-img-top" alt="${this.name}"/>
                <div class="card-body">
                    <h5 class="card-title">${this.name} (${this.subregion})</h5>
                    <p class="card-text">${this.description}</p>
                    <button class="btn btn-country btn-secondary"
                    >Visit ${this.name.toUpperCase()}</button>
                    </div>     
                    </div>
                    </div>
                    `;

    countries.insertAdjacentHTML("afterbegin", markup);
    /////when clicked on country, will navigate to map with marker on that particular country
    const goToCountry = document.querySelector(".btn-country");
    goToCountry.addEventListener("click", () => {
      mapContainer.classList.remove("d-none");
      mapText.classList.remove("d-none");
      L.marker(this.coords).addTo(map).bindPopup(`${this.name}`);
      mapContainer.scrollIntoView({ behavior: "smooth" });
    });
  };
}
////initiating two countries
const canada = new Country("Canada", "Très Bienvenu");
const india = new Country("India", "Atithi Devo Bhava");
const us = new Country("USA", "All Within Your Reach");
///////CREATING DESTINATION CLASSES BY IMPORTING DATA FROM DIFFERENT FILE
class Destination {
  state;
  country;
  language;
  images;
  description;
  coords;
  constructor(destination) {
    this.destination = destination;
    this.loadValues();
    this.renderMarkers();
  }
  /////LOAD THE VALUES FROM DATA FILE CREEATED SEPARATELY
  ////ASYNC AWAIT FUNCTION WHICH STOPS THE LOADING TILL THE PROMISE IS FULFILLED
  ////TRY AND CATCH INCLUDED TO RENDER THE FULFFILED OR REJECTED PROMISE
  loadValues = async function () {
    try {
      destinationData.map((place) => {
        if (place.placeName.toLowerCase() === this.destination.toLowerCase()) {
          this.destination = place.placeName;
          this.state = place.placeState;
          this.country = place.placeCountry;
          this.language = place.language;
          this.images = place.images;
          this.description = place.description;
          this.coords = place.coords;
        }
      });
    } catch (err) {
      alert(`Sorry Could not able to set destination because of ${err}`);
    }
  };
  //////////////////////////////////////////
  //WHEN CLICKED ON THE MAP MARKER, THAT PARTICULAR DESTINATION WILL RENDER ON THE SCREEN
  renderDestination = function () {
    destinationEl.classList.remove("hidden");
    destinationEl.scrollIntoView({ behavior: "smooth" });
    destinationEl.innerHTML = "";
    const markup = `
    <div class="container-fluid destination">
    <div class="slide">
    <button class="bi bi-chevron-left pic-icon"></button>
    <div class='photos d-flex'></div>
    <button class="bi bi-chevron-right pic-icon"></button>
    </div>
    <div class='dots container-fluid'></div>
    <p>${this.destination}<p>
    <p>${this.state}, ${this.country}<p>
    <p>${this.description}<p>
    </div>
    `;
    destinationEl.insertAdjacentHTML("afterbegin", markup);
    this.images.forEach((img, i) => {
      var image = document.createElement("img");
      image.setAttribute("src", img);
      image.setAttribute("class", "destination-img");
      document.querySelector(".photos").appendChild(image);
    });
    const dotContainer = document.querySelector(".dots");
    const curImage = document.querySelectorAll(".destination-img");
    const btnLeft = document.querySelector(".bi-chevron-left");
    const btnRight = document.querySelector(".bi-chevron-right");
    ////////Initiating curSlide to 0 for render index 0 pic by default
    let curSlide = 0;
    ///////////////////////////////////////////////////////
    ///////FUNCTION TO GO TO THE CURRENT PHOTO
    const goToSlide = function (photo) {
      curImage.forEach((image, i) =>
        image.setAttribute(
          "style",
          `transform: translateX(${100 * (i - photo)}%)`
        )
      );
    };

    ///////////////////////////////////////////////////
    ////CREATE DOT BUTTONS TO GO TO PHOTOS
    const createDots = function () {
      curImage.forEach((_, i) => {
        const dots = `
        <button class='dots_dot' data-photo='${i}'></button>
        `;
        dotContainer.insertAdjacentHTML("beforeend", dots);
        console.log(dots);
      });
    };
    ////////////////////////////////////////////////////////
    ///////Function to activate dot for particular image
    const dotActive = function (curSlide) {
      document
        .querySelectorAll(".dots_dot")
        .forEach((dot) => dot.classList.remove("dots_dot--active"));
      document
        .querySelector(`.dots_dot[data-photo='${curSlide}']`)
        .classList.add("dots_dot--active");
    };
    const initialize = function () {
      goToSlide(0);
      createDots();
      /////////Activate dot at index 0 for default
      dotActive(0);
    };
    initialize();
    //////////////////////////////////////////////////////////////////
    ///////ON CLICKING THE NEXT ARROW, FUNCTION TO DISPLAY NEXT PHOTO
    const nextPhoto = function () {
      if (curSlide === curImage.length - 1) curSlide = 0;
      else curSlide++;
      curImage.forEach((img, i) => {
        img.style.transform = `translateX(${100 * (i - curSlide)}%)`;
      });

      dotActive(curSlide);
    };
    ////////////////////////////////////////////////////////////////
    /////ON CLICKING THE PREV ARROW, FUNCTION TO DISPLAY PREV PHOTO
    const prevPhoto = function () {
      if (curSlide === 0) curSlide = curImage.length - 1;
      else curSlide--;
      curImage.forEach((img, i) => {
        img.style.transform = `translateX(${100 * (i - curSlide)}%)`;
      });
      dotActive(curSlide);
    };
    btnRight.addEventListener("click", nextPhoto);
    btnLeft.addEventListener("click", prevPhoto);

    ///////////////////////////////////////////////////////////
    //CAN SHUFFLE THROUGH PHOTOS USING DOTS
    dotContainer.addEventListener("click", function (e) {
      console.log(e.target);
      if (e.target.classList.contains("dots_dot")) {
        const photo = e.target.dataset.photo;
        console.log(photo);
        goToSlide(photo);
        dotActive(photo);
      } else console.log("fjh");
    });
  };
  ////////////////////////////////////////////////////////
  /////FUNCTION TO RENDER MARKERS ON THE LOCATION COORDINATES ON THE MAP
  renderMarkers = function () {
    var popupText = `${this.destination}`;
    L.marker(this.coords)
      .addTo(map)
      .bindPopup(popupText)
      .addEventListener("click", this.renderDestination.bind(this));
  };
}
const dharamshala = new Destination("DHARAmshala");
const spiti = new Destination("Lahaul Spiti");
const leh = new Destination("Leh");
const chamba = new Destination("chamba");
const manali = new Destination("manali");
const nainital = new Destination("nainital");
const mussoorie = new Destination("mussoorie");
const banff = new Destination("banff");
const tobermory = new Destination("tobermory");
const bM = new Destination("Blue Mountains");
const niagara = new Destination("Niagara Falls");
const toronto = new Destination("toronto");

logIn.addEventListener("click", function () {
  document.querySelector(".modal").style.display = "flex";
});
btnClose.addEventListener("click", function () {
  document.querySelector(".modal").style.display = "none";
});
document.querySelector(".overlay").addEventListener("click", function () {
  document.querySelector(".modal").style.display = "none";
});
