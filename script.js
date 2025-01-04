const pokeContainer = document.getElementById('poke-container');
const searchInput = document.getElementById('search');
const searchBtn = document.getElementById('searchBtn');
const modal = document.getElementById('details-modal');
const modalClose = document.getElementById('modal-close');
const detailsContent = document.getElementById('details-content');

/**
 * Change this to however many Pokemon you want.
 * Gen 1 has 151, or you can try 898 for the full set
 */
const POKEMON_COUNT = 151;

// Color mapping by type
const colors = {
  fire: '#FDDFDF',
  grass: '#DEFDE0',
  electric: '#FCF7DE',
  water: '#DEF3FD',
  ground: '#f4e7da',
  rock: '#d5d5d4',
  fairy: '#fceaff',
  poison: '#98d7a5',
  bug: '#f8d5a3',
  dragon: '#97b3e6',
  psychic: '#eaeda1',
  flying: '#F5F5F5',
  fighting: '#E6E0D4',
  normal: '#F5F5F5'
};

const mainTypes = Object.keys(colors);

// Fetch all Pokémon on page load
fetchPokemons();

// Add event listeners
searchBtn.addEventListener('click', () => {
  const query = searchInput.value.trim().toLowerCase();
  searchPokemon(query);
});

searchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const query = searchInput.value.trim().toLowerCase();
    searchPokemon(query);
  }
});

// Close the modal
modalClose.addEventListener('click', () => {
  closeModal();
});

// Clicking outside modal also closes it
window.addEventListener('click', (event) => {
  if (event.target === modal) {
    closeModal();
  }
});

/**
 * Fetch all Pokémon up to POKEMON_COUNT
 */
async function fetchPokemons() {
  for (let i = 1; i <= POKEMON_COUNT; i++) {
    await getPokemon(i);
  }
}

/**
 * Get a single Pokemon by ID (or name)
 */
async function getPokemon(idOrName) {
  const url = `https://pokeapi.co/api/v2/pokemon/${idOrName}`;
  const res = await fetch(url);
  const data = await res.json();
  createPokemonCard(data);
}

/**
 * Create a card in the grid for the given Pokemon data
 */
function createPokemonCard(pokemon) {
  const pokemonEl = document.createElement('div');
  pokemonEl.classList.add('pokemon');

  const name = pokemon.name;
  const pokeID = pokemon.id.toString().padStart(3, '0');
  const pokeTypes = pokemon.types.map((type) => type.type.name);
  const type = mainTypes.find((t) => pokeTypes.indexOf(t) > -1);
  const color = colors[type] || '#F5F5F5';

  pokemonEl.style.backgroundColor = color;

  // Use a stable sprite URL from PokeAPI’s GitHub
  // This is the official front default sprite
  // (You can also use 'official-artwork' or others from the Pokemon API)
  const imageURL = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`;

  const pokemonInnerHTML = `
    <div class="img-container">
      <img src="${imageURL}" alt="${name}"/>
    </div>
    <div class="info">
      <span class="number">#${pokeID}</span>
      <h3 class="name">${name}</h3>
      <big class="type"><span>${type}</span></big>
    </div>
  `;

  pokemonEl.innerHTML = pokemonInnerHTML;

  // Clicking the card => Show modal with more details
  pokemonEl.addEventListener('click', () => {
    showDetails(pokemon);
  });

  pokeContainer.appendChild(pokemonEl);
}

/**
 * Search a Pokemon by name/ID: Clear container, then fetch that single Pokemon
 */
async function searchPokemon(query) {
  if (!query) return;
  // Clear existing cards
  pokeContainer.innerHTML = '';

  try {
    await getPokemon(query);
  } catch (error) {
    pokeContainer.innerHTML = '<p style="color:white;">No Pokémon found.</p>';
  }
}

/**
 * Show detailed info about a Pokemon in a modal (abilities, stats, etc.)
 */
function showDetails(pokemon) {
  const name = pokemon.name;
  const pokeID = pokemon.id.toString().padStart(3, '0');
  const pokeTypes = pokemon.types.map((t) => t.type.name).join(', ');
  const imageURL = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`;

  // Build abilities list
  const abilities = pokemon.abilities
    .map((ab) => ab.ability.name)
    .join(', ');

  // Build stats list
  const statsHtml = pokemon.stats
    .map(
      (statObj) => `
      <div class="stat-item">
        <span>${statObj.stat.name}:</span> ${statObj.base_stat}
      </div>
    `
    )
    .join('');

  // Modal content
  detailsContent.innerHTML = `
    <div class="details-header">
      <img src="${imageURL}" alt="${name}">
      <div>
        <h2>${name} (#${pokeID})</h2>
        <p><strong>Type:</strong> ${pokeTypes}</p>
        <p><strong>Abilities:</strong> ${abilities}</p>
      </div>
    </div>
    <div class="details-info">
      <h3>Base Stats:</h3>
      <div class="stats-list">
        ${statsHtml}
      </div>
    </div>
  `;

  modal.style.display = 'flex';
}

/**
 * Close the modal
 */
function closeModal() {
  modal.style.display = 'none';
  detailsContent.innerHTML = '';
}
