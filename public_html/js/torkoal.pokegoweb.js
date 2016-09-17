var Torkoal = Torkoal || {};

$( document ).ready(function() {
	var PokeGoWeb = new Torkoal.PokeGoWeb();
	var cookie = PokeGoWeb.checkCookie();
	if(cookie) {
		var obj = JSON.parse(cookie);
		PokeGoWeb.auth = obj.auth;
		PokeGoWeb.token = obj.token;
		PokeGoWeb.getProfile();
	} else {
		$('#loading').fadeOut();
		$('#login').fadeIn();
	}

	// Add Event Listener for pokegologin
	$('#ptcButton').click(function(event) {
  		event.preventDefault();
  		$('#loginbuttons').fadeOut(200);
  		setTimeout(function() {
  			$('#ptcLogin').fadeIn(200);
  			$('#goback').fadeIn(200);
		}, 200);
	});
	$('#googleButton').click(function(event) {
  		$('#loginbuttons').fadeOut(200);
  		setTimeout(function() {
  			$('#googleLogin').fadeIn(200);
  			$('#goback').fadeIn(200);
		}, 200);
	});
	// Add Event Listener for pokegologin
	$('#goback').click(function(event) {
  		event.preventDefault();
  			$('#googleLogin').fadeOut(200);
  			$('#ptcLogin').fadeOut(200);
  			$('#goback').fadeOut(200);
  		setTimeout(function() {
  			$('#loginbuttons').fadeIn(200);
		}, 200);
	});

	// Add Event Listener for Login
	$('#pokegoForm').submit(function(event) {
  		event.preventDefault();
  		PokeGoWeb.signin('ptc');
	    console.log(PokeGoWeb);
	});
	// Add Event Listener for Login
	$('#googleForm').submit(function(event) {
  		event.preventDefault();
  		PokeGoWeb.signin('googlecode');
	    console.log(PokeGoWeb);
	});
	// Add Event Listener for Logout
	$('#logoutlink').click(function(event) {
  		event.preventDefault();
	    PokeGoWeb = new Torkoal.PokeGoWeb();
	    cookie = PokeGoWeb.checkCookie();
	    $('#party').html("");
  		PokeGoWeb.signout();
	});
});

Torkoal.PokeGoWeb = function () {
	//init
	this.pokemonparty = [];
}

Torkoal.PokeGoWeb.prototype = {
	signin : function (authtype) {
		$('#login').fadeOut();
		$('#loading').fadeIn();

		this.auth = authtype.toLowerCase();
		this.username = $('#user').val();
		this.password = $('#pass').val();
		this.gcode = $('#gcode').val();
		this.ign = '';
		this.authenticate();
	},
	checkCookie : function () {
		var cookie = getCookie('torkoal');
		if(cookie == "") {
			return false;
		} else {
			return cookie;
		}
	},
	authenticate : function() {
		var data = {
		        auth: this.auth,
		        username: this.username,
		        password: this.password,
		        gcode: this.gcode,
		    }
		$.ajax({
		    url: "https://www.torkoal.com/api/login",
		    data: data,
		    type: "POST",
		    dataType: "json",
        	context : this,
	        complete : function (data) {
	        	if(data.status == 200 && data.responseJSON.message == "token") {
	        		this.token = data.responseJSON.data;
	        		var cookie = {
	        			auth: this.auth,
	        			token: this.token,
	        		};
	        		setCookie('torkoal', JSON.stringify(cookie), 1);
	        		$('#loggedin').fadeIn();
	        		console.log(Torkoal);
					this.getProfile();
	        	} else {
    				$('#loading').fadeOut();
					$('#login').fadeIn();
					console.log(data);
					setCookie('torkoal', '', 1);
					var errorHTML = '<div class="alert alert-danger">\
					  <a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>\
					  <strong>Login Failed!</strong> Please try again.\
					</div>';

					$('#loginerror').html(errorHTML);
					$('[data-dismiss="alert"]').on('click', function(e) {
					    $(this).parent().hide();
					});
	        	}
	        }
	    });
	},
	getProfile : function() {
		$.ajax({
		    url: "https://www.torkoal.com/api/fetch/inventory",
		    data: {
		        auth: this.auth,
		        token: this.token
		    },
		    type: "POST",
		    dataType: "json",
        	context : this,
	        complete : function (data) {
	        	if(data.status == 200 && data.responseJSON.message == "inventory") {
	        		this.bag = data.responseJSON.data.bag;
	        		this.candies = data.responseJSON.data.candies;
	        		this.pkmn = data.responseJSON.data.pokemon;
	        		this.profile = data.responseJSON.data.player_stats;
	        		this.loadProfile();
	        	} else {
    				$('#loading').fadeOut();
					$('#login').fadeIn();
					var errorHTML = '<div class="alert alert-danger">\
					  <a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>\
					  <strong>ERROR: </strong> Problem retrieving data.\
					</div>';

					$('#loginerror').html(errorHTML);
					$('[data-dismiss="alert"]').on('click', function(e) {
					    $(this).parent().hide();
					});
	        	}
	        }
	    });
	},
	loadProfile : function () {
		//this.ign = this.profile.username;
		//this.pokecoin = (typeof this.profile.currencies[0].amount != "undefined") ? this.profile.currencies[0].amount : 0;
		//this.stardust = (typeof this.profile.currencies[1].amount != "undefined") ? this.profile.currencies[1].amount : 0;
		if(this.pkmn == []) {
			// empty party
		} else {
		    var candies = this.candies;

		    for (var i in this.pkmn) {
		        // skip loop if the property is from prototype
		        if (!this.pkmn.hasOwnProperty(i)) continue;   

		        var pokemon = this.pkmn[i];
		        this.pokemonparty.push(pokemon);
		    }

		    // Sort
		    this.pokemonparty.sort(sortById);

		    for (var i in this.pokemonparty) {
		        if (!this.pokemonparty.hasOwnProperty(i)) continue;   

		        var pokemon = this.pokemonparty[i];

		        var pokedexentry = Torkoal.pokedex[pokemon.pokemon_id];
		        var typeclass = pokedexentry.type.split(" / ")[0].toLowerCase();

		        var move1 = Torkoal.moves[pokemon.move_1]
		        var move2 = Torkoal.moves[pokemon.move_2]

		        var candyid = pokemon.pokemon_id;
		        if(typeof pokedexentry.prev_evolution != "undefined") {
		            candyid = parseInt(pokedexentry.prev_evolution[0].num);
		        }

		        var template = $("#pokemontemplate").html();
		        var view = {
		          typeclass : typeclass,
		          cp : pokemon.cp,
		          pictureid : pokedexentry.num,
		          nickname : pokemon.nickname ? pokemon.nickname : pokedexentry.name,
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
		          id : pokemon.id_str,
		        };

		        var output = Mustache.render(template, view);
				$('#loggedin').fadeIn();
				$('#party').hide();
				$('#loading').fadeOut();
		        $('#party').append(output);
				$('#party').fadeIn();
		        //console.log(output);
		    }

		    var self = this;
			$('.pokeWrapper').each(function() {
				var id = $(this).attr('id');

				$('#evolve' + id).click(function(){
					self.evolve(id);
				});
				$('#transfer' + id).click(function(){
					self.transfer(id);
				});
			})
		}
	},
	evolve: function(id) {
		$('#' + id).fadeOut(200);
		$.ajax({
		    url: "https://www.torkoal.com/api/action/evolve",
		    data: {
		        auth: this.auth,
		        token: this.token,
		        id: id
		    },
		    type: "POST",
		    dataType: "json",
        	context : this,
	        complete : function (data) {
	        	if(data.status == 200) {
	        		console.log(data);
	        	} else {
	        		console.log('Error');
	        		console.log(data);
	        	}
	        }
	    });
	},
	transfer: function(id) {
		$('#' + id).fadeOut(200);
		$.ajax({
		    url: "https://www.torkoal.com/api/action/release",
		    data: {
		        auth: this.auth,
		        token: this.token,
		        id: id
		    },
		    type: "POST",
		    dataType: "json",
        	context : this,
	        complete : function (data) {
	        	if(data.status == 200) {
	        		console.log(data);
	        	} else {
	        		console.log('Error');
	        		console.log(data);
	        	}
	        }
	    });
		
	},
	signout: function () {
		$('#party').fadeOut();
		$('#loading').fadeOut();
		$('#loggedin').fadeOut();
		$('#login').fadeIn();
		setCookie('torkoal', '', 1);
		var errorHTML = '<div class="alert alert-info">\
		  <a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>\
		  Successfully Logged Out.\
		</div>';

		$('#loginerror').html(errorHTML);
		$('[data-dismiss="alert"]').on('click', function(e) {
		    $(this).parent().hide();
		});
	}

};

Torkoal.PokeGoWeb.prototype.constructor = Torkoal.PokeGoWeb;