// Objeto que representa a camada de Visualização (View)
// Cuida de renderizar os elementos na tela, gerenciar as abas e atualizar o iframe
const AppView = {

    // Inicializa o conteúdo de todas as caixas de texto com os códigos padrões do Model
    initEditorsContent: function(codes) {
        try {
            // Preenche o valor correto (usando .value) de cada caixa de texto original
            document.getElementById('editor-html').value = codes.html;
            document.getElementById('editor-css').value = codes.css;
            document.getElementById('editor-js').value = codes.js;
            document.getElementById('editor-ajax').value = codes.ajax;
            
            // Força a atualização inicial dos números de linha para cada aba
            this.updateLineNumbers('html');
            this.updateLineNumbers('css');
            this.updateLineNumbers('js');
            this.updateLineNumbers('ajax');
        } catch (e) {
            console.error("Erro ao inicializar as caixas de texto do editor:", e);
        }
    },

    // Executado toda vez que o usuário digita algo para atualizar complementos visuais
    refreshLiveHighlight: function(tab) {
        // Captura a caixa de texto da aba que está ativa no momento
        const textarea = document.getElementById('editor-' + tab);
        
        if (textarea) {
            // Guarda a posição exata onde o seu cursor estava digitando
            const posicaoDoCursor = textarea.selectionStart;

            // ATUALIZAÇÃO REQUISITADA: Atualiza os números das linhas em tempo real enquanto digita
            this.updateLineNumbers(tab);

            // Mantém o foco nativo na caixa para o navegador não travar o deslocamento lateral
            textarea.focus();
            
            // Força o cursor a permanecer no lugar exato da digitação, liberando o fim da linha
            textarea.setSelectionRange(posicaoDoCursor, posicaoDoCursor);
        }
    },

    // Conta as quebras de linha e gera a numeração correta na barra lateral
    updateLineNumbers: function(tab) {
        const textarea = document.getElementById('editor-' + tab);
        const sidebar = document.getElementById('linhas-' + tab);
        
        if (textarea && sidebar) {
            // Conta quantas quebras de linha existem no texto atual
            const quantidadeLinhas = textarea.value.split('\n').length;
            let arrNumeros = [];
            
            // CORREÇÃO: Usando a variável correta para criar a lista de números
            for (let i = 1; i <= quantidadeLinhas; i++) {
                arrNumeros.push(i);
            }
            
            // Junta todos os números separando por uma quebra de linha visual
            sidebar.innerHTML = arrNumeros.join('<br>');
        }
    },



    // CORREÇÃO DAS ABAS: Controla a troca de abas escondendo o wrapper completo de cada uma
    updateActiveTabVisual: function(tabName) {
        // Cria uma lista com o nome de todas as nossas abas do editor
        const listaAbas = ['html', 'css', 'js', 'ajax'];

        listaAbas.forEach(aba => {
            const linkBotao = document.getElementById('tab-' + aba);
            // Captura o container completo (Wrapper) que contém a barra de números e a textarea
            const wrapperEditor = document.getElementById('wrapper-' + aba);

            if (aba === tabName) {
                // Se for a aba clicada, adiciona a classe 'active' do Bootstrap no botão
                if (linkBotao) linkBotao.classList.add('active');
                // Mostra o conjunto completo removendo a classe 'd-none'
                if (wrapperEditor) wrapperEditor.classList.remove('d-none');
                // Garante que os números estejam certos ao abrir a aba
                this.updateLineNumbers(aba);
            } else {
                // Se não for a aba clicada, remove a marcação de ativo do botão
                if (linkBotao) linkBotao.classList.remove('active');
                // Esconde o conjunto completo adicionando a classe 'd-none'
                if (wrapperEditor) wrapperEditor.classList.add('d-none');
            }
        });
    },


// Desenha o resultado atualizado combinando tudo dentro do painel do iframe
    renderIframe: function() {
        // Captura o elemento do iframe da tela pelo ID dele
        const iframe = document.getElementById('preview-janela');
        
        // Verifica se o iframe realmente existe na tela para evitar erros visuais
        if (iframe) {
            // Pede para o Model construir o modelo de texto HTML completo estruturado
            let codigoCompleto = AppModel.buildFullTemplate();
            
            // CORREÇÃO PARA O AJAX FUNCIONAR LOCALMENTE:
            // Criamos um "Mock" (um servidor fictício na memória) para interceptar o fetch do iniciante.
            // Se o código do usuário tentar fazer um fetch para qualquer lugar, nós devolvemos um dado de teste de sucesso!
            const simuladorServidorAjax = `
                <script>
                    // Captura e armazena o mecanismo fetch padrão do navegador
                    const fetchOriginal = window.fetch;
                    
                    // Substitui o fetch por uma versão simulada para testes locais do estudante
                    window.fetch = function(url, options) {
                        console.log("Requisição AJAX simulada interceptada para a URL:", url);
                        
                        // Retorna uma resposta de sucesso artificial para destravar o teste local do aluno
                        return Promise.resolve({
                            ok: true,
                            status: 200,
                            json: () => Promise.resolve({ 
                                status: "Sucesso!", 
                                mensagem: "Dados carregados via AJAX com sucesso no ambiente local!",
                                timestamp: new Date().toLocaleTimeString()
                            }),
                            text: () => Promise.resolve("Resposta de texto simulada com sucesso!")
                        });
                    };
                </script>
            `;

            // Injeta o simulador de servidor logo no início da estrutura do código para que ele filtre o AJAX do iframe
            codigoCompleto = codigoCompleto.replace('<head>', '<head>' + simuladorServidorAjax);
            
            // CORREÇÃO CRUCIAL CONTRA O ERRO DE SINTAXE:
            // Substituímos o open(), write() e close() pelo 'srcdoc'.
            // O 'srcdoc' força o iframe a reiniciar o documento do absoluto zero a cada atualização.
            // Isso limpa a constante 'fetchOriginal' da memória antiga e impede o erro de duplicidade!
            iframe.srcdoc = codigoCompleto;
        }
    },

    

    // Injeta o código completo e formatado dentro da nossa janela flutuante (Modal)
    displayFullCodeModal: function(codigoTexto) {
        const renderContainer = document.getElementById('codigo-completo-render');
        if (renderContainer) {
            // Injeta o texto puro protegendo contra quebras de caracteres usando textContent
            renderContainer.textContent = codigoTexto;
            
            // Abre o modal do Bootstrap na tela de forma nativa e limpa
            const modalElemento = new bootstrap.Modal(document.getElementById('codigoCompletoModal'));
            modalElemento.show();
        }
    }
};