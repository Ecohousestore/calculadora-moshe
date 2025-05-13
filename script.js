// Dados dos produtos com suas características de rendimento e tamanho do balde
const PRODUCTS_DATA = {
    "Moshe 3000 Flex": {
        "type": "standard", // Indica que o rendimento é por demão e varia em uma faixa
        "base_rendimento_min_m2_per_L_per_coat": 10, // Rendimento mínimo em m²/L por demão
        "base_rendimento_max_m2_per_L_per_coat": 12, // Rendimento máximo em m²/L por demão
        "demao_options": [2, 3], // Opções de número de demãos
        "bucket_size_L": 18 // Tamanho do balde em litros
    },
    "Moshe 3000 Green": {
        "type": "standard",
        // Rendimento atualizado para 7.8 m²/L por demão
        "base_rendimento_min_m2_per_L_per_coat": 7.8,
        "base_rendimento_max_m2_per_L_per_coat": 7.8, // Usando o mesmo valor para rendimento fixo
        "demao_options": [2, 3],
        "bucket_size_L": 18
    },
    "Moshe 3000 Flex Metal": {
        "type": "standard",
        // Rendimento atualizado para 3.45 m²/L por demão
        "base_rendimento_min_m2_per_L_per_coat": 3.45,
        "base_rendimento_max_m2_per_L_per_coat": 3.45, // Usando o mesmo valor para rendimento fixo
        "demao_options": [2, 3],
        "bucket_size_L": 18
    },
    "Moshe 3000 Repel": {
        "type": "variation_rendimento", // Indica que o rendimento depende de uma opção de variação (porosidade)
        "base_rendimento_m2_per_L_per_coat_options": { // Opções de rendimento baseadas na porosidade
            "Baixa Absorção (10 m²/L/demão)": 10,
            "Média Absorção (7.5 m²/L/demão)": 7.5,
            "Alta Absorção (5 m²/L/demão)": 5
        },
        "demao_options": [1, 2], // Opções de número de demãos
        "bucket_size_L": 18
    },
    "Moshe 3000 Wood": {
        "type": "variation_rendimento",
        "base_rendimento_m2_per_L_options": { // Opções de rendimento baseadas na absorção da madeira (para uma aplicação, sem demãos explícitas)
            "Baixa Absorção (10 m²/L)": 10,
            "Média Absorção (8.5 m²/L)": 8.5,
            "Alta Absorção (7 m²/L)": 7
        },
        "demao_options": [1], // Assumindo 1 demão/aplicação para o cálculo, conforme a ficha técnica
        "bucket_size_L": 18
    }
};

// Espera o carregamento completo do DOM antes de executar o script
document.addEventListener('DOMContentLoaded', () => {
    // Obtém referências aos elementos HTML
    const productSelect = document.getElementById('product');
    const areaInput = document.getElementById('area');
    const applicationVariationsDiv = document.getElementById('application-variations');
    const calculateBtn = document.getElementById('calculate-btn');
    const resultsDiv = document.getElementById('results');

    // Função para atualizar as opções de variação de aplicação com base no produto selecionado
    function updateApplicationVariations() {
        const selectedProduct = productSelect.value;
        applicationVariationsDiv.innerHTML = ''; // Limpa as opções anteriores
        resultsDiv.style.display = 'none'; // Esconde os resultados ao mudar o produto

        if (selectedProduct && PRODUCTS_DATA[selectedProduct]) {
            const productData = PRODUCTS_DATA[selectedProduct];

            // Adiciona a seleção de Demãos
            if (productData.demao_options && productData.demao_options.length > 0) {
                const demaoLabel = document.createElement('label');
                demaoLabel.textContent = 'Número de Demãos:';
                applicationVariationsDiv.appendChild(demaoLabel);

                productData.demao_options.forEach(demao => {
                    const optionDiv = document.createElement('div');
                    optionDiv.className = 'variation-option';
                    const input = document.createElement('input');
                    input.type = 'radio';
                    input.name = 'demao_count';
                    input.value = demao;
                    input.id = `demao-${demao}`;
                    if (demao === productData.demao_options[0]) { // Seleciona a primeira opção por padrão
                        input.checked = true;
                    }

                    const label = document.createElement('label');
                    label.htmlFor = `demao-${demao}`;
                    label.textContent = `${demao} Demão(s)`;

                    optionDiv.appendChild(input);
                    optionDiv.appendChild(label);
                    applicationVariationsDiv.appendChild(optionDiv);
                });
            }

            // Adiciona variações de rendimento específicas para Repel e Wood
            if (productData.type === 'variation_rendimento') {
                const variationLabel = document.createElement('label');
                variationLabel.textContent = 'Tipo de Superfície/Absorção:';
                applicationVariationsDiv.appendChild(variationLabel);

                const optionsContainer = productData.base_rendimento_m2_per_L_per_coat_options || productData.base_rendimento_m2_per_L_options;
                if (optionsContainer) {
                    for (const [label, value] of Object.entries(optionsContainer)) {
                        const optionDiv = document.createElement('div');
                        optionDiv.className = 'variation-option';
                        const input = document.createElement('input');
                        input.type = 'radio';
                        input.name = 'rendimento_variation';
                        input.value = value;
                        input.id = `rendimento-${value.toString().replace('.', '-')}`; // Cria um ID único
                         if (label.includes('Média Absorção') || label.includes('Média')) { // Seleciona "Média Absorção" por padrão
                            input.checked = true;
                        } else if (!document.querySelector('input[name="rendimento_variation"]:checked')) { // Se não houver "Média Absorção", seleciona a primeira
                             input.checked = true;
                        }


                        const labelElement = document.createElement('label');
                        labelElement.htmlFor = `rendimento-${value.toString().replace('.', '-')}`;
                        labelElement.textContent = label;

                        optionDiv.appendChild(input);
                        optionDiv.appendChild(labelElement);
                        applicationVariationsDiv.appendChild(optionDiv);
                    }
                }
            }
        }
    }

    // Adiciona um "ouvinte de evento" para quando o produto é alterado
    productSelect.addEventListener('change', updateApplicationVariations);

    // Adiciona um "ouvinte de evento" para o botão de cálculo
    calculateBtn.addEventListener('click', () => {
        const selectedProduct = productSelect.value;
        const area = parseFloat(areaInput.value);
        let errorMessage = ''; // Variável para armazenar mensagens de erro

        // Validações básicas
        if (!selectedProduct) {
            errorMessage = 'Por favor, selecione um produto.';
        } else if (isNaN(area) || area <= 0) {
            errorMessage = 'Por favor, insira uma área válida (número positivo).';
        }

        // Exibe erro se houver e para a execução
        if (errorMessage) {
            resultsDiv.className = 'results error'; // Adiciona a classe 'error'
            resultsDiv.innerHTML = `<p>${errorMessage}</p>`;
            resultsDiv.style.display = 'block';
            return;
        }

        const productData = PRODUCTS_DATA[selectedProduct];
        let rendimentoM2PerL = 0; // Rendimento em m²/L
        // Obtém o número de demãos selecionado, ou o primeiro da lista como padrão
        const selectedDemaoCount = parseInt(document.querySelector('input[name="demao_count"]:checked')?.value || productData.demao_options[0]);

        if (productData.type === 'standard') {
            // Para produtos "standard", usa a média do rendimento min/max por demão
            // Como agora min e max são iguais para Green e Metal, o rendimento será o valor fixo
            rendimentoM2PerL = (productData.base_rendimento_min_m2_per_L_per_coat + productData.base_rendimento_max_m2_per_L_per_coat) / 2;
        } else if (productData.type === 'variation_rendimento') {
            // Para produtos com variação de rendimento, obtém o valor selecionado pelo rádio button
            const selectedRendimentoOption = document.querySelector('input[name="rendimento_variation"]:checked');
            if (!selectedRendimentoOption) {
                 errorMessage = 'Por favor, selecione o tipo de superfície/absorção.';
            } else {
                rendimentoM2PerL = parseFloat(selectedRendimentoOption.value);
            }
        }

        // Exibe erro se houver e para a execução (específico para variações)
        if (errorMessage) {
            resultsDiv.className = 'results error';
            resultsDiv.innerHTML = `<p>${errorMessage}</p>`;
            resultsDiv.style.display = 'block';
            return;
        }


        // Calcula o total de litros necessários
        const totalLiters = (area / rendimentoM2PerL) * selectedDemaoCount;

        // Calcula o número total de baldes (arredonda para cima)
        const totalBuckets = Math.ceil(totalLiters / productData.bucket_size_L);

        // Exibe os resultados
        resultsDiv.className = 'results'; // Remove a classe 'error' se estava presente
        resultsDiv.innerHTML = `
            <p><strong>Produto:</strong> ${selectedProduct}</p>
            <p><strong>Área:</strong> ${area} m²</p>
            <p><strong>Número de Demãos:</strong> ${selectedDemaoCount}</p>
            <p><strong>Rendimento Base (aprox.):</strong> ${rendimentoM2PerL} m²/L ${productData.type === 'standard' || selectedProduct === "Moshe 3000 Repel" ? 'por demão' : ''}</p>
            <p><strong>Consumo Estimado:</strong> ${totalLiters.toFixed(2)} Litros</p>
            <p><strong>Número de Baldes (${productData.bucket_size_L}L):</strong> ${totalBuckets} Balde(s)</p>
        `;
        resultsDiv.style.display = 'block'; // Torna os resultados visíveis
    });

    // Inicializa as opções de variação de aplicação ao carregar a página
    updateApplicationVariations();
});
