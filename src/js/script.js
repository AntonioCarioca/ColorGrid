// Elementos principais da interface
const grid = document.getElementById('grid');
const formatoBtns = document.querySelectorAll('.formato-btn');

// Estado global da aplicação
let cores = [];
let formato = 'hex';

// Gera uma cor aleatória em RGBA
function gerarCor() {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    const a = +(Math.random().toFixed(2));
    return { r, g, b, a };
}

// Converte o objeto de cor para o formato selecionado (HEX, RGB ou RGBA)
function formatarCor(cor) {
    const { r, g, b, a } = cor;
    if (formato === 'rgb') return `rgb(${r}, ${g}, ${b})`;
    if (formato === 'rgba') return `rgba(${r}, ${g}, ${b}, ${a})`;
    return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

// Limita um número dentro de um intervalo
function limitar(valor, min, max) {
    return Math.min(max, Math.max(min, valor));
}

// Tenta converter texto em um objeto de cor válido
function parseCor(valor) {
    const texto = valor.trim();

    const hex = texto.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
    if (hex) {
        let v = hex[1];
        if (v.length === 3) v = v.split('').map(char => char + char).join('');
        return {
            r: parseInt(v.slice(0, 2), 16),
            g: parseInt(v.slice(2, 4), 16),
            b: parseInt(v.slice(4, 6), 16),
            a: 1
        };
    }

    const rgb = texto.match(/^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i);
    if (rgb) {
        return {
            r: limitar(parseInt(rgb[1], 10), 0, 255),
            g: limitar(parseInt(rgb[2], 10), 0, 255),
            b: limitar(parseInt(rgb[3], 10), 0, 255),
            a: 1
        };
    }

    const rgba = texto.match(/^rgba\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*((?:0|1)(?:\.\d+)?)\s*\)$/i);
    if (rgba) {
        return {
            r: limitar(parseInt(rgba[1], 10), 0, 255),
            g: limitar(parseInt(rgba[2], 10), 0, 255),
            b: limitar(parseInt(rgba[3], 10), 0, 255),
            a: limitar(parseFloat(rgba[4]), 0, 1)
        };
    }

    return null;
}

// Aplica o valor digitado no input, atualizando card e estado global
function aplicarEdicaoCor(index, square, input) {
    const corEditada = parseCor(input.value);
    if (!corEditada) {
        input.classList.add('invalid');
        input.value = formatarCor(cores[index]);
        return;
    }

    input.classList.remove('invalid');
    cores[index] = corEditada;
    const corFormatada = formatarCor(corEditada);
    square.style.backgroundColor = corFormatada;
    input.value = corFormatada;
}

// Exporta a paleta atual como imagem PNG
function exportarPaletaPNG() {
    if (!cores.length) return;

    const colunas = 5;
    const linhas = 4;
    const larguraCard = 320;
    const alturaCard = 220;
    const largura = colunas * larguraCard;
    const altura = linhas * alturaCard;

    const canvas = document.createElement('canvas');
    canvas.width = largura;
    canvas.height = altura;

    const contexto = canvas.getContext('2d');
    if (!contexto) return;

    contexto.font = 'bold 28px sans-serif';
    contexto.textAlign = 'center';
    contexto.textBaseline = 'middle';

    cores.forEach((cor, index) => {
        const x = (index % colunas) * larguraCard;
        const y = Math.floor(index / colunas) * alturaCard;
        const corFormatada = formatarCor(cor);

        // Pinta o card de fundo
        contexto.fillStyle = corFormatada;
        contexto.fillRect(x, y, larguraCard, alturaCard);

        // Escolhe texto claro/escuro para contraste
        const luminancia = (0.299 * cor.r + 0.587 * cor.g + 0.114 * cor.b);
        contexto.fillStyle = luminancia > 160 ? '#111111' : '#ffffff';
        contexto.fillText(corFormatada.toUpperCase(), x + larguraCard / 2, y + alturaCard / 2);
    });

    const link = document.createElement('a');
    link.download = `colorgrid-paleta-${new Date().toISOString().slice(0, 10)}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
}

// Atualiza formato ativo e re-renderiza os cards já existentes
function setFormato(novoFormato) {
    formato = novoFormato;

    formatoBtns.forEach(btn => {
        const ativo = btn.dataset.formato === formato;
        btn.classList.toggle('ativo', ativo);
        btn.disabled = ativo;
    });

    const squares = document.querySelectorAll('.square');
    // Sincroniza fundo e texto de cada card com o novo formato
    squares.forEach((square, index) => {
        const cor = cores[index];
        const novaCor = formatarCor(cor);
        square.style.backgroundColor = novaCor;

        const input = square.querySelector('.value-label');
        input.value = novaCor;
    });
}


// Cria os 20 cards de cor e configura os eventos de cópia
function gerarGrids() {
    grid.innerHTML = '';
    cores = [];

    for (let i = 0; i < 20; i++) {

        // Criar quadrado da cor
        const square = document.createElement('div');
        square.className = 'square';
        const cor = gerarCor();
        cores.push(cor); // salva a cor gerada
        const corFormatada = formatarCor(cor);
        square.style.background = corFormatada;

        // Criar valor da cor
        const valueLabel = document.createElement('input');
        valueLabel.className = 'value-label';
        valueLabel.value = corFormatada;
        valueLabel.spellcheck = false;
        // Adicionar proteção ao input
        valueLabel.addEventListener('click', e => e.stopPropagation());
        valueLabel.addEventListener('input', () => valueLabel.classList.remove('invalid'));
        valueLabel.addEventListener('keydown', e => {
            e.stopPropagation();
            if (e.key === 'Enter') valueLabel.blur();
        });
        valueLabel.addEventListener('blur', () => aplicarEdicaoCor(i, square, valueLabel));

        // Criar label de COPY
        const copyLabel = document.createElement('div');
        copyLabel.className = 'copy-btn';
        copyLabel.textContent = 'Copy!';

        // Copia o valor da cor e mostra feedback temporário
        square.addEventListener('click', () => {
            navigator.clipboard.writeText(valueLabel.value).then(() => {
                copyLabel.textContent = 'Copiado!';
                setTimeout(() => {
                    copyLabel.textContent = 'Copy!';
                }, 1000);
            });
        });

        square.appendChild(copyLabel);
        square.appendChild(valueLabel);
        grid.appendChild(square);
    }
}

// Inicialização da interface
setFormato(formato);
gerarGrids();
