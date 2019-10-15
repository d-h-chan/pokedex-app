'use strict';

const url="https://pokeapi.co/api/v2/";
const aniSpriteUrl="https://play.pokemonshowdown.com/sprites/ani/";
const staticSpriteUrl="https://play.pokemonshowdown.com/sprites/dex/";
const aniCryUrl="https://play.pokemonshowdown.com/audio/cries/";


async function callApi(url) {
    try {
        let response = await fetch(url);
        return await response.json();
    } catch(err){
        console.error(err);
    }
}

function generatePokemonUrl(strPokemonName) {
    return url + "pokemon/" + strPokemonName;
}

function generatePokemonSpeciesUrl(strPokemonName) {
    return url + "pokemon-species/" + strPokemonName;
}

function getPokeApiSprite(id) {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
}

function getPokeIdFromSpeciesUrl(url) {
    let res = url.split("/pokemon-species/");
    return res[1].replace("/", "");
}
//"https://pokeapi.co/api/v2/pokemon-species/61/"


function populateMainImage(pokemonData) {
    $("#js-pokemon-image")
        .attr("src", aniSpriteUrl + pokemonData.name + ".gif")
        .on("error", function() {
            $(this).attr("src", pokemonData.sprites.front_default);;
        });
}

function populateCry(pokemonData) {    
    $("#js-pokemon-cry-mp3")
        .attr("src", aniCryUrl + pokemonData.name + ".mp3");
}

//genus, flavor text
function populatePokemonSpeciesBasicData(pokemonSpeciesData) {
    let flavorTextEntries = pokemonSpeciesData.flavor_text_entries;
    for (let i = 0; i < flavorTextEntries.length; i++) {
        if (flavorTextEntries[i].language.name === "en") {
            $("#js-pokedex-entry").text(flavorTextEntries[i].flavor_text);
            break;
        }
    }
    let genera = pokemonSpeciesData.genera;
    for (let i = 0; i < genera.length; i++) {
        if (genera[i].language.name === "en") {
            $("#js-pokemon-genus").text(genera[i].genus);
            break;
        }
    }
}

//name, height, weight, cry, type, abilities, dex number (id)
function populatePokemonBasicData(pokemonData) {
    $("#js-pokemon-name").text(pokemonData.name);
    $("#js-pokemon-weight").text(pokemonData.weight);
    $("#js-pokemon-height").text(pokemonData.height);
    populateCry(pokemonData);
}

function populatePokemonAttributeData(pokemonData) {
    let types = "";
    for (let i = pokemonData.types.length - 1; i >= 0; i--) {
        types += pokemonData.types[i].type.name;
        types += " "
    }
    $("#js-pokemon-types").text(types);
    let abilities = "";
    for (let i = 0; i < pokemonData.abilities.length; i++) {
        abilities += pokemonData.abilities[i].ability.name;
        abilities += " "
    }
    $("#js-pokemon-abilities").text(abilities);
}

function appendEvolutionImage(pokemonName, pokemonId) {
    let apiUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`;
    let spriteUrl = staticSpriteUrl + pokemonName + ".png";

    $("#js-evolution-chain").append(
        `<li data-pokemon-id="${pokemonId}"><img src="" alt=""></li>`
    );
    $("#js-evolution-chain").find(`[data-pokemon-id='${pokemonId}'] img`)
        .attr("src", apiUrl)
        .on("error", function() {
            $(this).attr("src", apiUrl);
        }
    );

}

function getEvolutionChain(pokemonSpeciesData) {
    callApi(pokemonSpeciesData.evolution_chain.url)
        .then (function(pokemonEvolutionData) {
            //first form data. .url for species
            appendEvolutionImage(pokemonEvolutionData.chain.species.name, getPokeIdFromSpeciesUrl(pokemonEvolutionData.chain.species.url));
            //loop through
            for (let i = 0; i < pokemonEvolutionData.chain.evolves_to.length; i++) {
                let stage2 = pokemonEvolutionData.chain.evolves_to[i];
                appendEvolutionImage(stage2.species.name, getPokeIdFromSpeciesUrl(stage2.species.url));
                for (let j = 0; j < stage2.evolves_to.length; j++) {
                    let stage3 = stage2.evolves_to[j];
                    appendEvolutionImage(stage3.species.name, getPokeIdFromSpeciesUrl(stage3.species.url));
                    for (let k = 0; k < stage3.evolves_to.length; k++) {
                        let stage4 = stage3.evolves_to[k];
                        appendEvolutionImage(stage4.species.name, getPokeIdFromSpeciesUrl(stage4.species.url));
                    }
                }
            }
        });
}

function getPercentageForStat(statValue) {
    return statValue/200*100;
}

function getStatColor(statValue) {
    //
}

function populatePokemonStats(pokemonData){
    let arrStats = pokemonData.stats;
    for (const stat of arrStats) {
        $(`#js-${stat.stat.name}-display`).width(`${getPercentageForStat(stat.base_stat)}%`); 
        $(`#js-${stat.stat.name}-value`).text(stat.base_stat);  
    }
}

function watchForm(pokemonName) {  
    callApi(generatePokemonUrl(pokemonName))
        .then(function(pokemonData) {
            populateMainImage(pokemonData);
            populatePokemonBasicData(pokemonData);
            populatePokemonAttributeData(pokemonData);
            populatePokemonStats(pokemonData);
            console.log(pokemonData);
        });
    callApi(generatePokemonSpeciesUrl(pokemonName))
        .then(function(pokemonSpeciesData) {
            populatePokemonSpeciesBasicData(pokemonSpeciesData);
            getEvolutionChain(pokemonSpeciesData);
            console.log(pokemonSpeciesData);
        });
}

$(watchForm("cloyster"));
