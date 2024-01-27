const formElement = document.getElementById("container");
const selectElement = document.getElementById("type-selection");
const pokemonContainerElement = document.getElementById("pokemon-container");
const resetButton = document.getElementById("reset-btn");
const searchButton = document.getElementById("search-btn");

const BASE_URL = "https://pokeapi.co/api/v2/type/";
const colors = {
  normal: "#B4CCB9",
  flying: "#A8CDD8",
  fighting: "#EA526F",
  poison: "#D988C3",
  ground: "#E5C27A",
  rock: "#B49764",
  bug: "#9ABD4A",
  ghost: "#B8A5C0",
  steel: "#C0C0C0",
  fire: "#FF6347",
  water: "#00BFFF",
  grass: "#8FCC7D",
  electric: "#FFD700",
  psychic: "#FF85A2",
  ice: "#87CEEB",
  dragon: "#FFA500",
  dark: "#444444",
  fairy: "#FFB6C1",
};

let typeObject = {};

const getPokemon = async () => {
  try {
    const response = await fetch(BASE_URL);
    const { results } = await response.json();

    results.forEach((option) => {
      typeObject[option.name] = option.url;

      const options = document.createElement("option");
      options.innerText = option.name.toUpperCase();
      options.setAttribute("value", option.name);

      selectElement.appendChild(options);
    });
  } catch (error) {
    console.error("Error fetching types:", error);
  }
};

const setBackgroundColor = (element, selectedType) => {
  if (selectedType in colors) {
    element.style.background = colors[selectedType];
  }
};

const createTypeElement = (typeName) => {
  const typeElement = document.createElement("p");
  typeElement.innerText = typeName;
  return typeElement;
};

const createWeightHeightElement = (pokemonDetails) => {
  const weightHeightElement = document.createElement("div");
  weightHeightElement.innerHTML = `
    <div><p>Height:\t${pokemonDetails.height}</p> <p>Weight:\t${pokemonDetails.weight}</p></div>`;
  return weightHeightElement;
};

const createPokemonCardFront = (pokemonDetails) => {
  const frontElement = document.createElement("div");
  const numberElement = document.createElement("div");
  const imageElement = document.createElement("figure");
  const typesElement = document.createElement("div");

  numberElement.innerText = `${pokemonDetails.id}      `;
  imageElement.innerHTML = `<img src="${pokemonDetails.sprites.front_default}" 
    alt="image of ${pokemonDetails.name}">
            <imgCaption>#${pokemonDetails.name.toUpperCase()}</imgCaption>`;
  typesElement.classList.add("type");

  pokemonDetails.types.map((type) => {
    const typeElement = createTypeElement(type.type.name);
    typesElement.appendChild(typeElement);
  });

  frontElement.classList.add("pokemon-card-front");
  numberElement.classList.add("number");
  typesElement.classList.add("type");

  frontElement.append(
    numberElement,
    imageElement,
    createWeightHeightElement(pokemonDetails),
    typesElement
  );
  setBackgroundColor(frontElement, selectElement.value);

  return frontElement;
};

const createPokemonCardBack = (pokemonDetails) => {
  const backElement = document.createElement("div");
  const backInfoElement = document.createElement("div");

  backInfoElement.innerHTML = `
    <p><span>Ability:</span><span>${pokemonDetails.abilities[0].ability.name}</span></p>
    <p><span>Experience:</span><span>${pokemonDetails.base_experience}</span></p>
    <div><ul>Moves:</ul><li>${pokemonDetails.moves[0].move.name}</li> <li>${pokemonDetails.moves[1].move.name}</li> <li>${pokemonDetails.moves[2].move.name}</li></div>
    <p><span>Forms:</span><span>${pokemonDetails.forms[0].name}</span></p>`;

  backElement.classList.add("pokemon-card-back");
  backInfoElement.classList.add("back-info");

  backElement.appendChild(backInfoElement);
  setBackgroundColor(backElement, selectElement.value);

  return backElement;
};

const createPokemonCard = (pokemonDetails) => {
  const individualPokemonContainer = document.createElement("div");
  const pokemonCard = document.createElement("div");
  const frontCard = createPokemonCardFront(pokemonDetails);
  const backCard = createPokemonCardBack(pokemonDetails);

  individualPokemonContainer.classList.add("individual-pokemon-card");
  pokemonCard.classList.add("pokemon-card");

  pokemonCard.append(frontCard, backCard);
  individualPokemonContainer.appendChild(pokemonCard);

  return individualPokemonContainer;
};

const createPokemonCards = async (pokemonArray) => {
  if (pokemonArray.length === 0) {
    alert("No pokemon of this type exists");
    location.reload();
    return;
  }

  try {
    for (const pokemon of pokemonArray) {
      const response = await fetch(pokemon.url || pokemon.pokemon.url);
      const pokemonDetails = await response.json();

      const pokemonCard = createPokemonCard(pokemonDetails);
      pokemonContainerElement.appendChild(pokemonCard);
    }
  } catch (error) {
    console.error("Error fetching Pokemon details:", error);
  }
};

async function searchHandler(e) {
  e.preventDefault();

  const searchInput = document
    .querySelector("#search-input input")
    .value.trim()
    .toLowerCase();

  if (searchInput === "") {
    alert("Please enter a Pokemon name or type for search.");
    return;
  }

  const selectedType = Object.keys(typeObject).find(
    (type) => type.toLowerCase() === searchInput
  );

  if (selectedType) {
    getPokemonData(typeObject[selectedType]);
  } else {
    try {
      const response = await fetch(
        `https://pokeapi.co/api/v2/pokemon/${searchInput}`
      );
      const data = await response.json();

      pokemonContainerElement.innerHTML = "";

      createPokemonCards([
        {
          url: `https://pokeapi.co/api/v2/pokemon/${data.id}`,
        },
      ]);
    } catch (error) {
      alert("No results found. Please enter a valid Pokemon name or type.");
    }
  }
}

function getPokemonDataByType() {
  const selectedType = selectElement.value;
  if (selectedType === "type") {
    alert("Please select a valid Pokemon type");
    return;
  }

  const typeUrl = typeObject[selectedType];
  getPokemonData(typeUrl);
}

async function getPokemonData(url) {
  try {
    pokemonContainerElement.innerHTML = "Wait Pokemons are coming!!!";
    const response = await fetch(url);
    const data = await response.json();

    createPokemonCards(data.pokemon);
    pokemonContainerElement.innerText = "";
  } catch (error) {
    console.error("Error fetching Pokemon data:", error);
    alert("Error fetching Pokemon data");
    location.reload();
  }
}

resetButton.addEventListener("click", () => {
  pokemonContainerElement.innerHTML = "";
});

searchButton.addEventListener("click", searchHandler);

document.addEventListener("DOMContentLoaded", getPokemon);

formElement.addEventListener("click", (event) => {
  event.preventDefault();
  if (event.target.id === "filter-btn") {
    getPokemonDataByType();
  }
});
