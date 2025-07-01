const grid = document.getElementById('grid');
const formatoBtns = document.querySelectorAll('.formato-btn');

let ativo = null;
let cores = [];
let formato = 'hex';

function gerarCor() {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    const a = +(Math.random().toFixed(2));
    return { r, g, b, a };
}

function formatarCor(cor) {
    const { r, g, b, a } = cor;
    if (formato === 'rgb') return `rgb(${r}, ${g}, ${b})`;
    if (formato === 'rgba') return `rgba(${r}, ${g}, ${b}, ${a})`;
    return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

function setFormato(novoFormato) {
    formato = novoFormato;

    formatoBtns.forEach(btn => {
        const ativo = btn.dataset.formato === formato;
        btn.classList.toggle('ativo', ativo);
        btn.disabled = ativo;
    });

    const squares = document.querySelectorAll('.square');
    squares.forEach((square, index) => {
        const cor = cores[index];
        const novaCor = formatarCor(cor);
        square.style.backgroundColor = novaCor;

        const input = square.querySelector('.value-label');
        input.value = novaCor;
    });
}


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
        valueLabel.readOnly = true;
        // Adicionar proteção ao input
        valueLabel.addEventListener('click', e => e.stopPropagation());

        // Criar label de COPY
        const copyLabel = document.createElement('div');
        copyLabel.className = 'copy-btn';
        copyLabel.textContent = 'Copy!';

        // Copiar valor ao clicar no quadrado
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

setFormato(formato);
gerarGrids();