const poke_container = document.getElementById('poke-container');
const loading = document.getElementById('loading');
const loadMoreBtn = document.getElementById('load-more');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const modal = document.getElementById('pokemon-modal');
const closeButton = document.querySelector('.close-button');
const POKEMON_PER_PAGE = 20;
let currentPage = 1;
let allPokemons = [];
const colors = {
    fire: '#FF9C54',
    grass: '#63BB5B',
    electric: '#F3D23B',
    water: '#4D90D5',
    ground: '#D97746',
    rock: '#C7B78B',
    fairy: '#EC8FE6',
    poison: '#AB6AC8',
    bug: '#90C12C',
    dragon: '#0A6DC4',
    psychic: '#F97176',
    flying: '#92AADE',
    fighting: '#CE4069',
    normal: '#9298A4',
    ice: '#74CEC0',
    ghost: '#5269AC',
    dark: '#5A5366',
    steel: '#5A8EA1'
};

// Fetch Pokemon data
async function fetchPokemons(page = 1) {
    try {
        loading.style.display = 'block';
        const start = (page - 1) * POKEMON_PER_PAGE + 1;
        const end = start + POKEMON_PER_PAGE - 1;
        const promises = [];
        for (let i = start; i <= end; i++) {
            promises.push(getPokemon(i));
        }
        const pokemons = await Promise.all(promises);
        allPokemons = [...allPokemons, ...pokemons];
        displayPokemons(pokemons);
    } catch (error) {
        console.error('Error fetching Pokemon:', error);
    } finally {
        loading.style.display = 'none';
    }
}

async function getPokemon(id) {
    const url = `https://pokeapi.co/api/v2/pokemon/${id}`;
    const response = await fetch(url);
    const pokemon = await response.json();
    return pokemon;
}

function displayPokemons(pokemons) {
    pokemons.forEach(pokemon => {
        createPokemonCard(pokemon);
    });
}

function createPokemonCard(pokemon) {
    const pokemonEl = document.createElement('div');
    pokemonEl.classList.add('pokemon');
    pokemonEl.onclick = () => showPokemonDetails(pokemon);
    const name = pokemon.name[0].toUpperCase() + pokemon.name.slice(1);
    const id = pokemon.id.toString().padStart(3, '0');
    const types = pokemon.types.map(type => type.type.name);
    const mainType = types[0];
    const color = colors[mainType] || '#A8A878';
    pokemonEl.style.backgroundColor = color;
    const pokemonInnerHTML = `
        <div class="img-container">
            <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png" 
                 alt="${name}"
                 onerror="this.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png'">
        </div>
        <div class="info">
            <span class="number">#${id}</span>
            <h3 class="name">${name}</h3>
            <div class="types">
                ${types.map(type => `
                    <span class="type" style="background-color: ${colors[type]}">${type}</span>
                `).join('')}
            </div>
        </div>
    `;
    pokemonEl.innerHTML = pokemonInnerHTML;
    poke_container.appendChild(pokemonEl);
}

async function showPokemonDetails(pokemon) {
    const modalContent = document.getElementById('pokemon-detail');
    const speciesUrl = pokemon.species.url;
    const evolutionData = await getEvolutionChain(speciesUrl);
    
    const detailHTML = `
        <div class="pokemon-detail" style="color: ${colors[pokemon.types[0].type.name]}">
            <h2>${pokemon.name.toUpperCase()}</h2>
            <div class="detail-container">
                <div class="detail-images">
                    <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png" 
                         alt="${pokemon.name}" class="main-image">
                    <div class="sprite-images">
                        <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png" alt="Default sprite">
                        <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${pokemon.id}.png" alt="Shiny sprite">
                    </div>
                </div>
                <div class="pokemon-info">
                    <div class="basic-info">
                        <p><strong>Height:</strong> ${pokemon.height / 10}m</p>
                        <p><strong>Weight:</strong> ${pokemon.weight / 10}kg</p>
                        <p><strong>Base Experience:</strong> ${pokemon.base_experience}</p>
                    </div>
                    
                    <div class="abilities">
                        <h3>Abilities:</h3>
                        <ul>
                            ${pokemon.abilities.map(ability => 
                                `<li>${ability.ability.name.replace('-', ' ')}</li>`
                            ).join('')}
                        </ul>
                    </div>
                    <div class="stats-container">
                        <h3>Base Stats:</h3>
${pokemon.stats.map(stat => 
    `<div class="stat-group">
        <span class="stat-name">${stat.stat.name.replace('-', ' ')}:</span>
        <div class="stat-bar">
            <div class="stat-fill" style="width: ${(stat.base_stat / 255) * 100}%; background-color: ${colors[pokemon.types[0].type.name]}">
                ${stat.base_stat}
            </div>
        </div>
    </div>`
).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;
    modalContent.innerHTML = detailHTML;
    modal.style.display = 'block';
}

async function getEvolutionChain(speciesUrl) {
    try {
        const response = await fetch(speciesUrl);
        const speciesData = await response.json();
        const evolutionChainUrl = speciesData.evolution_chain.url;
        
        const evolutionResponse = await fetch(evolutionChainUrl);
        const evolutionData = await evolutionResponse.json();
        
        return evolutionData;
    } catch (error) {
        console.error('Error fetching evolution chain:', error);
        return null;
    }
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
function handleSearch() {
    const searchTerm = searchInput.value.toLowerCase();
    poke_container.innerHTML = '';
    
    if (searchTerm === '') {
        displayPokemons(allPokemons.slice(0, currentPage * POKEMON_PER_PAGE));
        return;
    }
    const filteredPokemons = allPokemons.filter(pokemon => 
        pokemon.name.toLowerCase().includes(searchTerm) || 
        pokemon.id.toString() === searchTerm
    );
    if (filteredPokemons.length === 0) {
        poke_container.innerHTML = '<p class="no-results">No Pokémon found</p>';
    } else {
        displayPokemons(filteredPokemons);
    }
}
// Event Listeners
searchInput.addEventListener('input', debounce(handleSearch, 300));
searchBtn.addEventListener('click', () => handleSearch());
closeButton.onclick = () => {
    modal.style.display = 'none';
};
window.onclick = (event) => {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
};
loadMoreBtn.addEventListener('click', () => {
    currentPage++;
    fetchPokemons(currentPage);
});
// Initialize the application
fetchPokemons();