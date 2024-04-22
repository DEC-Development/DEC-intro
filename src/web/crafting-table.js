export class CraftingTable {
    constructor() {
        // 创建一个新的<div>元素，并添加crafting类
        this.element = document.createElement('div');
        this.element.classList.add('crafting');

        // 创建一个<table>元素
        const table = document.createElement('table');

        // 创建<tbody元素
        const body = document.createElement('tbody');

        // 将<table>元素添加到this.element
        this.element.appendChild(table);

        // 定义一个slots对象，包含输入和输出槽位
        this.slots = {
            inputs: [],
            output: null
        }

        // 创建一个3x3的表格格子，包括输入槽位
        for (let i = 0; i < 3; i++) {
            const tr = document.createElement('tr');
            const row = [];
            for (let j = 0; j < 3; j++) {
                const td = document.createElement('td');
                td.classList.add('slot');
                tr.appendChild(td);
                row.push(td);
            }
            this.slots.inputs.push(row);
            body.appendChild(tr);
        }

        // 将tbody添加到<table>
        table.append(body);

        // 创建一个带有箭头的<div>元素
        const arrow = document.createElement('div');
        arrow.classList.add('arrow');
        arrow.innerText = ">";

        // 将箭头<div>元素添加到this.element
        this.element.appendChild(arrow);

        // 创建一个输出槽位，并添加到this.element
        const product = document.createElement('div');
        product.classList.add('slot');
        this.element.appendChild(product);

        // 将输出槽位与slots对象关联
        this.slots.output = product;
    }

    // 设置指定位置的输入槽位的图像
    setInput(x, y, imgurl, block = false) {
        const img = document.createElement('img');
        img.src = imgurl;

        // 清空槽位，然后添加图像
        const element = this.slots.inputs[y][x];
        element.innerHTML = '';
        element.appendChild(img);
    }

    // 设置输出槽位的图像
    setOutput(imgurl, amount = 1, block = false) {
        const img = document.createElement('img');
        img.src = imgurl;

        // 清空槽位，然后添加图像
        const element = this.slots.output;
        element.innerHTML = '';
        element.appendChild(img);

        if (amount > 1) {
            const a = document.createElement('div')
            a.className = 'item-amount'
            a.textContent = amount
            element.appendChild(a)
        }
    }

    getInputElement(x, y) {
        return this.slots.inputs[y][x].querySelector('img')
    }

    getOutputElement(){
        return this.slots.output;
    }
}

export class BlockImageRenderer {
    // 渲染图像的方法，返回一个Promise
    render(imgurl, width) {
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.src = imgurl;
            image.onload = function () {
                // 创建一个画布
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = canvas.width * 1.078125;
                const ctx = canvas.getContext('2d');
                ctx.imageSmoothingEnabled = false;

                // 正六边形的边长
                const side = 2 / Math.sqrt(3);

                // 绘制顶面
                ctx.translate(canvas.width / 2, 0);
                ctx.scale(2, 1);
                ctx.rotate(45 * (Math.PI / 180));
                ctx.drawImage(image, 0, 0, canvas.width / 4 * Math.SQRT2, canvas.width / 4 * Math.SQRT2);

                // 绘制左面
                ctx.setTransform(1, 0.5, 0, 1, 0, 0);
                ctx.translate(0, canvas.width / 4);
                ctx.drawImage(image, 0, 0, canvas.width / 2, canvas.width / 2 * side);
                ctx.fillStyle = '#00000060'
                ctx.fillRect(0, 0, canvas.width / 2, canvas.width / 2 * side)

                // 绘制右面
                ctx.setTransform(1, -0.5, 0, 1, 0, 0);
                ctx.translate(canvas.width / 2, canvas.width / 2 + canvas.width / 4);
                ctx.drawImage(image, 0, 0, canvas.width / 2, canvas.width / 2 * side);
                ctx.fillStyle = '#00000090'
                ctx.fillRect(0, 0, canvas.width / 2, canvas.width / 2 * side)

                // 将绘制结果转换为DataURL并解析Promise
                resolve(canvas.toDataURL());
            }
            image.onerror = reject;
        });
    }
}