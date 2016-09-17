var express    = require('express');        
var app        = express();                 
var bodyParser = require('body-parser');
var Long = require("long");
var striptags = require('striptags');


const pogobuf = require('pogobuf'),
    POGOProtos = require('node-pogo-protos');

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router


// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {              
    throw new Error('Invalid Endpoint');
});

router.route('/login')
    .post(function(req, res, next) {
        var error = false;

        if(req.body.auth == null || req.body.auth == "") {
            error = true;
            throw new Error('Authentication Type is required');
        }
        if(req.body.auth != "ptc" && req.body.auth != "google" && req.body.auth != "googlecode") {
            error = true;
            throw new Error('Authentication Type is invalid' + req.body.auth);
        }
        if(req.body.auth != "googlecode" && (req.body.username == null || req.body.username == "" || req.body.password == null || req.body.password == "")) {
            error = true;
            throw new Error('Username and Password are required');
        }
        if(req.body.auth == "googlecode" && (req.body.gcode == null || req.body.gcode == "")) {
            error = true;
            throw new Error('Code is required');
        }

        if(!error) {
            // Helper Function to return the right token based on authtype
            authenticator(req)
            .then(token => {
                res.json({ 
                    message: 'token',
                    data: token,
                }); 
            })
            .catch(function(e) {
                next(e);
            });
        } else {
            throw new Error('Unknown Error');
        }
    });

router.route('/fetch')
    .post(function(req, res, next) {
        throw new Error('Command is required');
    });

router.route('/fetch/:command')
    .post(function(req, res, next) {
        var error = false;
        if(req.body.auth != "ptc" && req.body.auth != "google" && req.body.auth != "googlecode") {
            error = true;
            throw new Error('Authentication Type is invalid');
        }
        if(req.body.token == null || req.body.token == "") {
            error = true;
            throw new Error('Token is required');
        }
        if(!error) {    
            var token = req.body.token;

            var client = new pogobuf.Client();
            var login = new pogobuf.GoogleLogin();
            var auth = req.body.auth;
            if(req.body.auth == "googlecode") {
                auth = "google";
            }
            client.setAuthInfo(auth, token);
            if(req.params.command == "profile") {
                client.init()
                .then(() => {
                    return client.batchStart()
                            .getPlayer()
                            .getPlayerProfile()
                            .batchCall();            
                })
                .then(batchresponse => {
                    res.json({ 
                        message: 'profile',
                        data: {
                            player: batchresponse[0].player_data,
                            profile: batchresponse[1],
                        },
                    }); 
                })
                .catch(function(e) {
                    next(e);
                });
            } else if (req.params.command == "inventory") {
                client.init()
                .then(() => {
                    return client.getInventory(0);        
                })
                .then(response => {
                    var bag = {};
                    var pokemon = [];
                    var eggs = [];
                    var player_stats = [];
                    var pokedex = {};
                    var candies = {};
                    var other = [];
                    response.inventory_delta.inventory_items.forEach(function(value) {
                        if(value.inventory_item_data.item != null) {
                            bag[value.inventory_item_data.item.item_id] = {
                                count: value.inventory_item_data.item.count,
                                unseen: value.inventory_item_data.item.unseen
                            }
                        } else if(value.inventory_item_data.pokemon_data != null) {
                            if(value.inventory_item_data.pokemon_data.is_egg) {
                                eggs.push(value.inventory_item_data.pokemon_data);
                            } else {
                                var idLong = new Long(value.inventory_item_data.pokemon_data.id.low, value.inventory_item_data.pokemon_data.id.high, value.inventory_item_data.pokemon_data.id.unsigned);
                                value.inventory_item_data.pokemon_data.id_str = idLong.toString();
                                pokemon.push(value.inventory_item_data.pokemon_data);
                            }
                        } else if(value.inventory_item_data.player_stats != null) {
                            player_stats.push(value.inventory_item_data.player_stats);
                        } else if(value.inventory_item_data.pokedex_entry != null) {
                            pokedex[value.inventory_item_data.pokedex_entry.pokemon_id] = value.inventory_item_data.pokedex_entry;
                            delete pokedex[value.inventory_item_data.pokedex_entry.pokemon_id].pokemon_id;
                        } else if(value.inventory_item_data.pokemon_family != null) {
                            candies[value.inventory_item_data.pokemon_family.family_id] = value.inventory_item_data.pokemon_family.candy;
                        } else {
                            other.push(value);
                        }

                    })

                    res.json({ 
                        message: 'inventory',
                        data: {
                            bag: bag,
                            eggs: eggs,
                            pokemon: pokemon,
                            player_stats: player_stats,
                            pokedex: pokedex,
                            candies: candies,
                            other: other,
                        }
                    }); 
                })
                .catch(function(e) {
                    next(e);
                });
            } else {
                throw new Error('Unknown Command');
            }

        } else {
            throw new Error('Unknown Error');
        }
    });

router.route('/action/:command')
    .post(function(req, res, next) {
        var error = false;

        if(req.body.auth != "ptc" && req.body.auth != "google" && req.body.auth != "googlecode") {
            error = true;
            throw new Error('Authentication Type is invalid');
        }
        if(req.body.token == null || req.body.token == "") {
            error = true;
            throw new Error('Token is required');
        }
        if(req.body.id == null || req.body.id == "") {
            error = true;
            throw new Error('Pokemon ID is required');
        }

        if(!error) { 
            var token = req.body.token;
            var pid = req.body.id;
            var client = new pogobuf.Client();
            var auth = req.body.auth;
            if(auth == "googlecode") {
                auth = "google";
            }
            client.setAuthInfo(auth, token);

            if(req.params.command == "release") {
                client.init()
                .then(() => {
                    client.releasePokemon(pid);            
                })
                .then(boop => {
                    res.json({ 
                        message: 'release',
                        data: pid,
                    }); 
                })
                .catch(function(e) {
                    next(e);
                });
            } 
            else if(req.params.command == "evolve") {
                client.init()
                .then(() => {
                    return client.evolvePokemon(pid);            
                })
                .then(response => {     
                    if(response.result != 1) {
                        var err;
                        switch(response.result) {
                            case 0:
                                err = "Unset Error";
                                break;
                            case 2:
                                err = "Pokemon Missing";
                                break;
                            case 3:
                                err = "Not enough candies";
                                break;
                            case 4:
                                err = "Pokemon cannot evolve";
                                break;
                            case 5:
                                err = "Pokemon is deployed";
                                break;
                            default:
                                err = "Unknown Error Code: " + response.result;
                        }
                        throw new Error(err);
                    }
                    res.json({ 
                        message: 'evolve',
                        data: {
                            evolved_pokemon: response.evolved_pokemon_data,
                            exp: response.experience_awarded,
                            candy: response.candy_awarded,
                        },
                    }); 
                })
                .catch(function(e) {
                    next(e);
                });
            } else {
                throw new Error('Unknown Command');
            }
        }   
    });

router.use(function(err, req, res, next) {
    if(!err) return next(); 
    console.log(err);
    var message = err.message;

    if(message == "Request count does not match response count") {
        message = "Invalid Response from Server. Try generating new token";
    }
    if(message == "Error: 403 error from server" || message == "Invalid response received from PTC login") {
        message = "Authentication Failed";
    }

    res.json({ 
        message: message,
        error: true,
    });   
});
// more routes for our API will happen here

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Starting ApiServer ' + port);

var authenticator = function (req) {
    if(req.body.auth == "ptc") {      
        var login = new pogobuf.PTCLogin();      
        return login.login(req.body.username , req.body.password)
    }
    else if(req.body.auth == "google") {    
        var login = new pogobuf.GoogleLogin();
        return login.login(req.body.username , req.body.password);
    }
    else if(req.body.auth == "googlecode") {    
        var googleToken = req.body.gcode;

        return new Promise((resolve, reject) => {
            var endpoint = 'https://www.googleapis.com/oauth2/v4/token'
            var client_id = '848232511240-73ri3t7plvk96pj4f85uj8otdat2alem.apps.googleusercontent.com';
            var client_secret = 'NCjF1TLi2CcY6t5mt0ZveuL7';

            var request = require('request');
            request.post(
                endpoint,
                { form: { 
                    code: googleToken,
                    client_id: client_id,
                    client_secret: client_secret,
                    redirect_uri:'urn:ietf:wg:oauth:2.0:oob',
                    grant_type:'authorization_code',            }
                },
                function (error, response, body) {
                    if (!error && response.statusCode == 200) {
                        var json = JSON.parse(body);
                        console.log(json);
                        return resolve(json.id_token);
                    } else {
                        var json = JSON.parse(body);
                        return reject(new Error(json.error_description));
                    }
                }
            );
        });
        }
    else {
        return new Promise((resolve, reject) => {
            return resolve(false);
        });
    }
}