# pokemon-generator

This is a Pokemon name generator that works in the browser in the form of a Vue app. It uses TensorFlow.js for all of the deep learning code. The neural network is composed of an LSTM layer for processing a Dense layer for the output.

This project was made for this YouTube video: 

It's deployed here, if you want to check it out: https://poke-generator.herokuapp.com/

![alt text](https://github.com/dokasov/pokemon-generator/blob/master/git.png)

I tried to make all of the deep learning code as independent from the Vue code as possible, so it's all in the `learn` folder inside `src`. I also included in the `pokemons-scraper` folder the web scraper I used to get all of the Pokemon names from this database: https://pokemondb.net/pokedex/national

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
