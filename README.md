# Torkoal - PokemonGo Web Manager
https://www.torkoal.com/

### Installation Instructions
  - Todo

### Structure
Node API server is located in server directory. By default, listens on port 80. 

The client is located in public_html (it is mostly just jquery and html/css)

### Endpoints

```sh
/login

Request:
{
    auth: this.auth,
    username: this.username,
    password: this.password,
    gcode: this.gcode,
}

Response:
{
    message: 'token',
    data: token,
}
```

```
/fetch/profile

Request:
data: {
    auth: this.auth,
    token: this.token
}

Response: (the methods are from PogoBuf)
{
    player: getPlayer().player_data,
    profile: getPlayerProfile(),
}
```

```
/fetch/inventory

Request: 
{
    auth: this.auth,
    token: this.token
}

Response:
{ 
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
}
```

```
/action/evolve

Request: 
{
    auth: this.auth,
    token: this.token,
    id: id
}
```

```
/fetch/release

data: {
    auth: this.auth,
    token: this.token,
    id: id
}
```

### Credits
  - Jonathan Chun
  - PogoBuf (https://github.com/cyraxx/pogobuf/wiki/pogobuf.Client-Pok%C3%A9mon-Go-API-Methods)