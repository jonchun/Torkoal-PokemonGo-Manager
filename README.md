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
```
Parameters
```
{
    auth: this.auth,
    username: this.username,
    password: this.password,
    gcode: this.gcode,
}
```

```sh
/fetch/profile
```
Parameters
```
data: {
    auth: this.auth,
    token: this.token
}
```

```sh
/fetch/inventory
```

Parameters
```
data: {
    auth: this.auth,
    token: this.token
}
```

```sh
/action/evolve
```
Parameters
```
data: {
    auth: this.auth,
    token: this.token,
    id: id
}
```

```sh
/fetch/release
```

Parameters
```
data: {
    auth: this.auth,
    token: this.token,
    id: id
}
```
