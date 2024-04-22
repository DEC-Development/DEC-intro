import '../../resources/style.css';

const container = document.getElementById('content');

async function fetchData(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch data from ${url}`);
    }
    return response.json();
}

async function renderItems() {
    try {
        const indexData = await fetchData('index.json');
        const localeData = await fetchData('locale/zh_CN.json');

        indexData.items.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'item';

            const img = document.createElement('img');
            const text = document.createElement('a');
            img.className = 'item-icon';
            img.src = `img/items/${item.texture}.png`;
            img.loading = 'lazy';
            itemDiv.appendChild(img);

            text.textContent = localeData[item.locKey];
            text.className = 'item-name';
            text.href = `view.html?item=${item.id}`;
            itemDiv.appendChild(text);

            container.appendChild(itemDiv);
        });

        console.log('Rendering complete.');
    } catch (error) {
        console.error('Error:', error.message);
    }
}

renderItems();