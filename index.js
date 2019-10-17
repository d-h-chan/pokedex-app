'use strict';

const url="https://pokeapi.co/api/v2/";
const aniSpriteUrl="https://play.pokemonshowdown.com/sprites/ani/";
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

function getPokeIdFromSpeciesUrl(url) {
    let res = url.split("/pokemon-species/");
    return res[1].replace("/", "");
}

function getPokeIdFromPokemonUrl(url) {
    let res = url.split("/pokemon/");
    return res[1].replace("/", "");
}

function getTypeImage(type) {
    const typeCaps = type.charAt(0).toUpperCase() + type.slice(1)
    console.log(`/assets/Icon_${typeCaps}.png`);
    return `/assets/Icon_${typeCaps}.png`;
}

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
            $("#js-pokemon-genus").text("the " + genera[i].genus);
            break;
        }
    }
}

function getFullHeightData(height) {
    let heightMeters=height/10;
    let heightFeet = heightMeters * 3.281;
    let heightInches = ((heightFeet%1) * 12).toFixed(0);
    if (heightInches == 12) {
        heightInches = 0;
    }
    return `${heightFeet.toFixed(0)}'${heightInches}" (${heightMeters}m)`;
}

function getFullWeightData(weight) {
     let weightKg = weight/10;
     let weightPounds = weightKg * 2.205;
     return `${weightPounds.toFixed(1)}lbs (${weightKg.toFixed(1)}kg)`;
 }

//name, height, weight, cry, type, abilities, dex number (id)
function populatePokemonBasicData(pokemonData) {
    $("#js-pokemon-name").text(pokemonData.name);
    $("#js-pokemon-weight").text(getFullWeightData(pokemonData.weight));
    $("#js-pokemon-height").text(getFullHeightData(pokemonData.height));
    populateCry(pokemonData);
}


function populatePokemonAttributeData(pokemonData) {
    let type1 = "";
    let type2 = ""
    if (pokemonData.types.length > 1) {
        type1 = pokemonData.types[1].type.name;
        type2 = pokemonData.types[0].type.name;
        $("#js-pokemon-type-1").attr("src",getTypeImage(type1));
        $("#js-pokemon-type-2").attr("src",getTypeImage(type2));
        $("#js-pokemon-type-2").show();
    }
    else {
        type1 =pokemonData.types[0].type.name;
        $("#js-pokemon-type-1").attr("src",getTypeImage(type1));
        $("#js-pokemon-type-2").hide();
    }

    /*
    let abilities = "";
    for (let i = 0; i < pokemonData.abilities.length; i++) {
        abilities += pokemonData.abilities[i].ability.name;
        abilities += " "
    }
    $("#js-pokemon-abilities").text(abilities);*/
}


function appendEvolutionImage(pokemonName, pokemonId) {
    let apiUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`;
    //let spriteUrl = aniSpriteUrl + pokemonName + ".png";

    $("#js-evolution-chain").append(
        `<li data-pokemon-name="${pokemonName}">
            <button>
                <figure>
                    <img class ="small-pokemon-image" src="${apiUrl}"/>
                    <figcaption class="caption">${pokemonName}</figcaption>
                </figure>
            </button>
        </li>`
    );

    /*$("#js-evolution-chain").find(`[data-pokemon-id='${pokemonId}'] img`)
        .on("error", function() {
            $(this).attr("src", apiUrl);
        }
    );*/
}

$.fn.exists = function () {
    return this.length !== 0;
}

function appendFormImage(pokemonName, pokemonId) {
    let apiUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`;
    //let spriteUrl = aniSpriteUrl + pokemonName + ".png";
    $.get(apiUrl)
    .done(function() { 
        appendFormImageUrl(pokemonName, apiUrl);
    }) 
}

function appendFormImageUrl(pokemonName, apiUrl) {
    
    $.get(apiUrl)
    .done(function() { 
        // Do something now you know the image exists.
        let element = $("ul").find(`[data-pokemon-name='${pokemonName}']`);
        if (!element.exists() && !pokemonName.includes("totem")) {
            $("#js-pokemon-forms").append(
                `<li data-pokemon-name="${pokemonName}">
                    <figure>
                        <img class ="small-pokemon-image" src="${apiUrl}"/>
                    <figcaption class="caption">${pokemonName}</figcaption>
                    </figure>                
                </li>`
            );
        }
    })
}

function populateEvolutionChain(pokemonSpeciesData) {
    callApi(pokemonSpeciesData.evolution_chain.url)
        .then (function(pokemonEvolutionData) {
            $("#js-evolution-chain").empty();
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
    return statValue/255*100;
}

function getStatColor(statValue) {
    if (statValue >= 200) {
        return "#02ffff";
    }
    if (statValue >= 180) {
        return "#02ffaa";
    }
    if (statValue >= 170) {
        return "#02ff7f";
    }
    if (statValue >= 160) {
        return "#02ff55";
    }
    if (statValue >= 150) {
        return "#02ff2a";
    }
    if (statValue >= 140) {
        return "#34ff00";
    }
    if (statValue >= 130) {
        return "#66ff00";
    }
    if (statValue >= 120) {
        return "#9aff00";
    }
    if (statValue >= 110) {
        return "#ccff00";
    }
    if (statValue >= 100) {
        return "#fffe00";
    }
    if (statValue >= 90) {
        return "#ffcc00";
    }
    if (statValue >= 80) {
        return "#ff9800";
    }
    if (statValue >= 70) {
        return "#ff6600";
    }
    if (statValue >= 60) {
        return "#ff3200";
    }
    return "#ff0000";
    
}

function populatePokemonStats(pokemonData){
    let arrStats = pokemonData.stats;
    for (const stat of arrStats) {
        $(`#js-${stat.stat.name}-display`)
            .width(`${getPercentageForStat(stat.base_stat)}%`)
            .css("background-color", getStatColor(stat.base_stat)); 
        $(`#js-${stat.stat.name}-value`).text(stat.base_stat);  
    }
}

function sortTable() {
    var table, rows, switching, i, x, y, shouldSwitch;
    table = document.getElementById("js-level-up-moves");
    switching = true;
    while (switching) {
      switching = false;
      rows = table.rows;
     
      for (i = 1; i < (rows.length - 1); i++) {
        shouldSwitch = false;
        x = rows[i].getElementsByTagName("TD")[0];
        y = rows[i + 1].getElementsByTagName("TD")[0];
        if (parseInt(x.innerHTML.toLowerCase(), 10) > parseInt(y.innerHTML.toLowerCase(), 10)) {
          shouldSwitch = true;
          break;
        }
      }
      if (shouldSwitch) {
        rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
        switching = true;
      }
    }
  }

function populateMoves(pokemonData) {
    let moveData = {};
    let moveUrls = [];
    for (const moves of pokemonData.moves) {
        let version_group_details = moves.version_group_details;
        for (const version_group_detail of version_group_details) {
            if (version_group_detail.version_group.name === "ultra-sun-ultra-moon" 
                && version_group_detail.move_learn_method.name === "level-up"
                && version_group_detail.level_learned_at > 1) {
                    moveData[moves.move.name] = version_group_detail.level_learned_at;
                    moveUrls.push(moves.move.url);

                }
        }
    }
    // map every url to the promise of the fetch
    let requests = moveUrls.map(url => fetch(url));

    // Promise.all waits until all jobs are resolved
    Promise.all(requests)
        .then(responses => {
            return responses;
    }).then(responses => Promise.all(responses.map(r => r.json())))
    .then(responseJsons => {
        $("#js-move-table-body tr").remove();
        for (const responseJson of responseJsons) {
            let moveNameEn = "";
            for (const name of responseJson.names) {
                if (name.language.name === "en") {
                    moveNameEn = name.name;
                    break;
                }
            }
            $("#js-move-table-body").append(
            `<tr>
                <td>${moveData[responseJson.name]}</td>
                <td>
                    <img class="pokemon-type-table" src="${getTypeImage(responseJson.type.name)}">
                </td>
                <td class="left-align left-padding">${moveNameEn}</td>
            </tr>`
            );
        }

        sortTable();
    });
}


function populatePokemonForms(pokemonSpeciesData) {
    $("#js-pokemon-forms").empty();
    let varietyUrls = [];
    for (const varieties of pokemonSpeciesData.varieties) {
        if (varieties.is_default === false) {
            appendFormImage(varieties.pokemon.name, getPokeIdFromPokemonUrl(varieties.pokemon.url));
            varietyUrls.push(varieties.pokemon.url);
        }
    }

    let requests = varietyUrls.map(url => fetch(url));
    // Promise.all waits until all jobs are resolved
    Promise.all(requests)
        .then(responses => {return responses;})
        .then(responses => Promise.all(responses.map(r => r.json())))
        .then(pokemonData => {
            let formUrls = []
            for (const item of pokemonData) {
                formUrls.push(item.forms[0].url);
            }
        
            let formRequests = formUrls.map(url => fetch(url))
            Promise.all(formRequests)
                .then(responses => {return responses;})
                .then(responses => Promise.all(responses.map(r => r.json())))
                .then(formData => {
                    for (const item of formData) {
                        if (item.sprites.front_default !== null) {
                            appendFormImageUrl(item.name,item.sprites.front_default);
                        }
                    }
                });
        });
}

function loadPage(pokemonName) {  
    $("#js-pokemon-search").val("");
    callApi(generatePokemonUrl(pokemonName))
        .then(function(pokemonData) {
            populateMainImage(pokemonData);
            populatePokemonBasicData(pokemonData);
            populatePokemonAttributeData(pokemonData);
            populatePokemonStats(pokemonData);
            populateMoves(pokemonData);
            console.log(pokemonData);
        });
    callApi(generatePokemonSpeciesUrl(pokemonName))
        .then(function(pokemonSpeciesData) {
            populatePokemonSpeciesBasicData(pokemonSpeciesData);
            populateEvolutionChain(pokemonSpeciesData);
            populatePokemonForms(pokemonSpeciesData);
            //disable current form's button
            console.log(pokemonSpeciesData);
            return pokemonSpeciesData;
        });
}

function watchForm() {
    $('form').submit(event => {
        event.preventDefault();
        const searchTerm = $('#js-pokemon-search').val();
        loadPage(searchTerm);
    });

    $('#js-evolution-chain').on('click', 'li button', function(event) {
        loadPage($(this).find(".caption").text());
    });

    $('#cry-play-button').on('click', function(event){
        $('#js-pokemon-cry-mp3')[0].play();
    });

    loadPage(1);
}

$(watchForm());

