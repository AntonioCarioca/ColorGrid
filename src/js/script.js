const grid = document.getElementById('colorGrid');

function gerarCorAleatoria() {
    return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
}

function ehCorValida(hex) {
    return /^#([0-9A-F]{3}){1,2}$/i.test(hex);
}

let draggedElement = null;

for (let i = 0; i < 16; i++) {
    const corInicial = gerarCorAleatoria();

    const square = document.createElement('div');
    square.className = 'square';
    square.style.backgroundColor = corInicial;
    square.setAttribute('draggable', 'true');

    const input = document.createElement('input');
    input.className = 'color-input';
    input.value = corInicial;

    const copiedLabel = document.createElement('div');
    copiedLabel.className = 'copied';
    copiedLabel.textContent = 'Copiado!';

    // Atualiza cor ao editar
    input.addEventListener('input', () => {
        const valor = input.value;
        if (ehCorValida(valor)) {
            square.style.backgroundColor = valor;
        }
    });

    // Copia cor ao clicar
    square.addEventListener('click', (e) => {
        // Evita conflito com drag
        if (e.target.tagName === 'INPUT') return;
        navigator.clipboard.writeText(input.value).then(() => {
            square.classList.add('show-copied');
            setTimeout(() => {
                square.classList.remove('show-copied');
            }, 1000);
        });
    });

    // Drag & drop
    square.addEventListener('dragstart', () => {
        draggedElement = square;
    });

    square.addEventListener('dragover', (e) => {
        e.preventDefault();
    });

    square.addEventListener('drop', () => {
        if (draggedElement && draggedElement !== square) {
            // Clona os elementos
            const clone1 = draggedElement.cloneNode(true);
            const clone2 = square.cloneNode(true);

            // Substitui no DOM
            grid.replaceChild(clone1, square);
            grid.replaceChild(clone2, draggedElement);

            // Reativar scripts nos novos elementos
            reinicializarEvento(clone1);
            reinicializarEvento(clone2);
        }
    });

    square.appendChild(copiedLabel);
    square.appendChild(input);
    grid.appendChild(square);
}

// Reativa eventos após troca
function reinicializarEvento(square) {
    const input = square.querySelector('.color-input');
    const copiedLabel = square.querySelector('.copied');

    square.setAttribute('draggable', 'true');

    input.addEventListener('input', () => {
        const valor = input.value;
        if (/^#([0-9A-F]{3}){1,2}$/i.test(valor)) {
            square.style.backgroundColor = valor;
        }
    });

    square.addEventListener('click', (e) => {
        if (e.target.tagName === 'INPUT') return;
        navigator.clipboard.writeText(input.value).then(() => {
            square.classList.add('show-copied');
            setTimeout(() => {
                square.classList.remove('show-copied');
            }, 1000);
        });
    });

    square.addEventListener('dragstart', () => {
        draggedElement = square;
    });

    square.addEventListener('dragover', (e) => e.preventDefault());

    square.addEventListener('drop', () => {
        if (draggedElement && draggedElement !== square) {
            const clone1 = draggedElement.cloneNode(true);
            const clone2 = square.cloneNode(true);
            grid.replaceChild(clone1, square);
            grid.replaceChild(clone2, draggedElement);
            reinicializarEvento(clone1);
            reinicializarEvento(clone2);
        }
    });
}