import requests
from bs4 import BeautifulSoup

URL = 'https://pokemondb.net/pokedex/national'
page = requests.get(URL)

soup = BeautifulSoup(page.content, 'html.parser')

pokemon_divs = soup.find_all("div", class_="infocard")


text_file = open("pokemons.txt", "w")

for pokemon_div in pokemon_divs:
    pokemon_name = pokemon_div.find_all("span", class_="infocard-lg-data")[0].find_all("a", class_="ent-name")[0].get_text()
    print(pokemon_name)
    for char in pokemon_name:
        try:
            text_file.write(char)
        except Exception as e:
            pass
    text_file.write("\n")

    pokemon_img_span = pokemon_div.find_all("span", class_="infocard-lg-img")[0]
    pokemon_img_a = pokemon_img_span.find_all("a")[0]
    pokemon_img_src = pokemon_img_a.find_all("span")[0]["data-src"]

    with open("pokemons/" + pokemon_name + ".png", "wb") as f:
        res = requests.get(pokemon_img_src)
        f.write(res.content)