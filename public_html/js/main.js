var moves, pokedex;
var pokemonparty = [];

$.getJSON( "js/moves.json", function( data ) {
    moves = data;
});
$.getJSON( "js/pokedex.json", function( data ) {
    pokedex = data;
});

$.ajax({
    // The URL for the request
    url: "http://localhost:5000/login",
    // The data to send (will be converted to a query string)
    data: {
        a: "google",
        u: "jonchunpokego@gmail.com",
        p: "iloveangel121"
    },
    // Whether this is a POST or GET request
    type: "POST",
    // The type of data we expect back
    dataType: "json",
})
.done(function(resp) {
    getInfo(resp);
})
.fail(function(xhr, status, errorThrown) {
    console.log("Error: " + errorThrown);
    console.log("Status: " + status);
});

var getInfo = function(resp) {
    $.ajax({
        // The URL for the request
        url: "http://localhost:5000/getinfo",
        // The data to send (will be converted to a query string)
        data: {
            a: resp.auth,
            token: resp.token
        },
        // Whether this is a POST or GET request
        type: "POST",
        // The type of data we expect back
        dataType: "json",
    })
    .done(function(resp) {
        parseProfile(resp);
    })
    .fail(function(xhr, status, errorThrown) {
        console.log("Error: " + errorThrown);
        console.log("Status: " + status);
    });
}

var parseProfile = function(resp) {
    //console.log(resp);
    //console.log(moves);
    //console.log(pokedex);

    var candies = resp.candies;
    for (var i in resp.pkmn) {
        // skip loop if the property is from prototype
        if (!resp.pkmn.hasOwnProperty(i)) continue;   

        var pokemon = resp.pkmn[i];
        pokemonparty.push(pokemon);
    }
    pokemonparty.sort(sortById);
    for (var i in pokemonparty) {
        if (!pokemonparty.hasOwnProperty(i)) continue;   

        var pokemon = pokemonparty[i];

        var pokedexentry = pokedex[pokemon.pokemon_id];
        var typeclass = pokedexentry.type.split(" / ")[0].toLowerCase();

        var move1 = moves[pokemon.move_1]
        var move2 = moves[pokemon.move_2]

        var candyid = pokemon.pokemon_id;
        if(typeof pokedexentry.prev_evolution != "undefined") {
            candyid = parseInt(pokedexentry.prev_evolution[0].num);
        }

        var template = $("#pokemontemplate").html();
        var view = {
          typeclass : typeclass,
          cp : pokemon.cp,
          pictureid : pokedexentry.num,
          nickname : (typeof pokemon.nickname != "undefined") ? pokemon.nickname : pokedexentry.name,
          hppercent : Math.floor((pokemon.stamina/pokemon.stamina_max)*100),
          currenthp : pokemon.stamina,
          maxhp : pokemon.stamina_max,
          m1 : move1.name,
          m1type : move1.type,
          m1power : move1.power,
          m2 : move2.name,
          m2type : move2.type,
          m2power : move2.power,
          ivattack : (typeof pokemon.individual_attack != "undefined") ? pokemon.individual_attack : 0,
          ivdefense : (typeof pokemon.individual_defense != "undefined") ? pokemon.individual_defense : 0,
          ivstamina : (typeof pokemon.individual_stamina != "undefined") ? pokemon.individual_stamina : 0,
          candies : candies[candyid],
          id : pokemon.id,
        };

        var output = Mustache.render(template, view);
        $('#party').append(output);
        //console.log(output);
    }
}


function sortById(obj1, obj2){
    if(obj1.pokemon_id > obj2.pokemon_id)
        return 1;
    if(obj2.pokemon_id > obj1.pokemon_id)
        return -1;

    // obj1.RemindingTimestamp == obj2.RemindingTimestamp

    if(obj1.cp > obj2.cp)
        return -1;
    if(obj2.cp > obj1.cp)
        return 1;

    return 0;
}

