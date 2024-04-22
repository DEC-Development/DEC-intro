import * as fs from 'fs'
import * as path from 'path'

export default class Gen {
    #resources;
    #behavior;
    #locales;
    #outpath;

    constructor(resources, behavior, outpath) {
        this.#resources = resources;
        this.#behavior = behavior;
        this.#outpath = outpath;
        this.#locales = []
    }

    genMeta() {
        const data = JSON.parse(fs.readFileSync(path.join(this.#resources, "manifest.json")))
        return {
            "name": data['header']['name'],
            "description": data['header']['description']
        }
    }

    genItems() {
        const textureData = JSON.parse(fs.readFileSync(path.join(this.#resources, 'textures/item_texture.json')))

        fs.mkdirSync(path.join(this.#outpath, 'img/items'), { recursive: true })
        fs.mkdirSync(path.join(this.#outpath, 'def/items'), { recursive: true })

        return fs.readdirSync(path.join(this.#behavior, 'items')).map((file, i) => {
            const fullPath = path.join(this.#behavior, 'items', file);
            const result = JSON.parse(fs.readFileSync(fullPath));

            const id = result["minecraft:item"]["description"]["identifier"];
            const locKey = result["minecraft:item"]["components"]["minecraft:display_name"]["value"];
            this.#locales.push(locKey)

            const src = path.join(
                this.#resources,
                textureData["texture_data"][
                result["minecraft:item"]["components"]["minecraft:icon"]["texture"]
                ]["textures"] + ".png"
            )

            const dst = path.join(this.#outpath, 'img/items', i + '.png')

            fs.copyFileSync(src, dst)
            fs.copyFileSync(fullPath, path.join(this.#outpath, 'def/items', file))

            return {
                "id": id,
                "texture": i,
                "locKey": locKey,
                "file": file
            }
        })
    }

    genLocale() {
        fs.mkdirSync(path.join(this.#outpath, 'locale/'), { recursive: true })
        fs.readdirSync(path.join(this.#resources, 'texts')).map((file, i) => {
            const fullPath = path.join(this.#resources, 'texts', file);
            // Read the entire file synchronously
            const fileContent = fs.readFileSync(fullPath, 'utf8');

            // Split the file content into an array of lines
            const lines = fileContent.split('\n');

            const localeMap = {}

            lines.forEach(line => {
                const e = line.trim().split('=');
                localeMap[e[0]] = e[1]
            })

            const shakedMap = {}

            this.#locales.forEach(key => {
                shakedMap[key] = localeMap[key]
            })

            fs.writeFileSync(path.format({
                dir: path.join(this.#outpath, 'locale/'),
                name: path.basename(file, path.extname(file)),
                ext: '.json'
            }), JSON.stringify(shakedMap))
        })

    }

    getRecipe(obj) {
        if (obj['minecraft:recipe_shaped']) {
            return {
                type: "shaped",
                shape: obj['minecraft:recipe_shaped'].pattern,
                in: obj['minecraft:recipe_shaped'].key,
                out: obj['minecraft:recipe_shaped'].result
            }
        }
    }

    genRecipes() {
        const recipes = {
            "recipes": [],
            "indexes": {
                "in": {},
                "out": {}
            }
        }
        let index = 0;
        fs.readdirSync(path.join(this.#behavior, 'recipes')).map((file, i) => {
            const fullPath = path.join(this.#behavior, 'recipes', file);

            const fileContent = JSON.parse(fs.readFileSync(fullPath, 'utf8'));

            const recipe = this.getRecipe(fileContent)

            if (recipe) {
                recipes.recipes.push(recipe)

                switch (recipe.type) {
                    case "shaped":
                        Object.values(recipe.in).map(e => e.item).forEach(item => {
                            if (!recipes.indexes[item]) {
                                recipes.indexes[item] = { in: [], out: [] }
                            }
                            recipes.indexes[item].in.push(index);
                        });
                        if (!recipes.indexes[recipe.out.item]) {
                            recipes.indexes[recipe.out.item] = { in: [], out: [] }
                        }
                        recipes.indexes[recipe.out.item].out.push(index)
                        break
                }
                index++;
            }
        })

        fs.writeFileSync(path.join(this.#outpath, "recipes.json"), JSON.stringify(recipes))
    }

    generate() {
        const items = this.genItems()
        this.genLocale();
        this.genRecipes()

        fs.writeFileSync(path.join(this.#outpath, "index.json"), JSON.stringify({
            "meta": this.genMeta(),
            "items": items
        }))
    }
}