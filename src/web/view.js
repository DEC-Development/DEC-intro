import '../../resources/style.css';
import { CraftingTable } from './crafting-table.js';
import { convertToTitleCase as pretty, getValueByJsonPath as getJSONValue } from './utils.js';

const query = location.search.slice(1).split("&").map(e => e.split('=')).reduce((acc, [key, value]) => {
    acc[key] = value;
    return acc;
}, {});

console.log(query)

async function fetchData(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch data from ${url}`);
    }
    return response.json();
}

async function renderItem() {
    try {
        const indexData = await fetchData('index.json');
        const localeData = await fetchData('locale/zh_CN.json');

        const item = indexData.items.filter(e => e.id == query.item)[0]
        if (item) {
            document.getElementById('item-name').textContent = localeData[item.locKey]
            document.getElementById('item-id').textContent = item.id
            document.getElementById('item-img').src = `img/items/${item.texture}.png`;

            const itemData = (await fetchData('def/items/' + item.file))["minecraft:item"]['components'];

            const props = document.getElementById('item-props')
            function addProp(name, value, defaultValue = null) {
                if (value || defaultValue) {
                    const p = document.createElement('div')
                    p.className = 'item-prop'
                    p.textContent = `${name}: ${value ? value : defaultValue}`
                    props.appendChild(p)
                }
            }

            if (itemData['minecraft:foil']) document.getElementById('item-img').classList.add('enchanted')

            addProp('最大堆叠数量', getJSONValue(itemData, "minecraft:max_stack_size"), 64)
            addProp('攻击力', getJSONValue(itemData, "minecraft:damage"))
            addProp('耐久值', getJSONValue(itemData, "minecraft:durability.max_durability"))
            addProp('附魔类型', pretty(getJSONValue(itemData, "minecraft:enchantable.slot")))
            addProp('附魔等级', getJSONValue(itemData, "minecraft:enchantable.value"))
            addProp('冷却类型', pretty(getJSONValue(itemData, "minecraft:cooldown.category")))
            addProp('冷却时间', getJSONValue(itemData, "minecraft:cooldown.duration"))
            addProp('营养', getJSONValue(itemData, "minecraft:food.nutrition"))
            addProp('食物类型', pretty(getJSONValue(itemData, "minecraft:food.saturation_modifier")))
            addProp('使用时间', getJSONValue(itemData, "minecraft:use_duration"))

            function populateRecipe(recipe) {

                switch (recipe.type) {
                    case "shaped":
                        const table = new CraftingTable()

                        const tableDescription = document.createElement('div')
                        tableDescription.textContent = "有序合成："
                        table.element.prepend(tableDescription)

                        for (let y = 0; y < recipe.shape.length; y++) {
                            for (let x = 0; x < recipe.shape[y].length; x++) {
                                const char = recipe.shape[y][x]
                                if (char && char != '' && recipe.in[char]) {
                                    const ingredientId = recipe.in[char].item

                                    const itemDes = indexData.items.filter(e => e.id == ingredientId)[0]

                                    if (itemDes) {
                                        table.setInput(x, y, `img/items/${itemDes.texture}.png`)
                                        const inputElement = table.getInputElement(x, y)
                                        inputElement.title = localeData[itemDes.locKey]

                                        inputElement.addEventListener('click', e => {
                                            location.href = `view.html?item=${itemDes.id}`
                                        })
                                    }
                                }
                            }
                        }
                        const itemDes = indexData.items.filter(e => e.id == recipe.out.item)[0]
                        table.setOutput(`img/items/${itemDes.texture}.png`, recipe.out.count)
                        const outputElement = table.getOutputElement()
                        outputElement.title = localeData[itemDes.locKey]

                        outputElement.addEventListener('click', e => {
                            location.href = `view.html?item=${itemDes.id}`
                        })
                        return table.element
                }
            }


            const acquire = document.getElementById('item-acquire')
            const ingredient = document.getElementById('item-ingredient')
            const recipeData = await fetchData('recipes.json')
            const recipeIndexes = recipeData.indexes[item.id]

            if (recipeIndexes) {
                recipeIndexes.out.forEach(element => {
                    const recipe = recipeData.recipes[element];
                    console.log(recipe)
                    acquire.appendChild(populateRecipe(recipe))
                });

                recipeIndexes.in.forEach(element => {
                    const recipe = recipeData.recipes[element];
                    ingredient.appendChild(populateRecipe(recipe))
                });
            }

        }

    }
    catch (e) {
        console.error(e)
    }
}

renderItem()