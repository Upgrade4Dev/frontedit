// Criamos um objeto constante para controlar o comportamento e as regras do sistema
const AppController = {
    
    // Esta função inicializa (liga) o editor assim que a página é aberta no navegador
    init: function() {
        // CORREÇÃO CRUCIAL: Chamamos a inicialização do Model. O método '.then()' garante 
        // que a View só será preenchida quando o arquivo 'login.html' terminar de carregar da rede!
        AppModel.inicializar().then(() => {
            // Agora sim enviamos os códigos guardados no Model para serem exibidos na tela pela View
            AppView.initEditorsContent(AppModel.codes);
            
            // Renderiza (desenha) a primeira pré-visualização do site no painel lateral (lado direito)
            this.renderPreview();
        });
        
        // Ativa o funcionamento da barra arrastável que divide a tela ao meio (não depende da rede)
        this.initResizer();
    },

    // Esta função roda toda vez que o usuário digita ou apaga qualquer letra no editor
    handleCodeInput: function(tab, value) {
        // Salva a nova letra ou texto que foi digitado dentro da memória do Model
        AppModel.updateCode(tab, value);
        
        // Atualiza as cores brilhantes do código na tela (Highlight) em tempo real
        AppView.refreshLiveHighlight(tab);
        
        // Atualiza a janelinha do site do lado direito para mostrar o resultado novo
        this.renderPreview();
    },

    // Esta função serve para mudar de aba quando clicamos em HTML, CSS, JS ou AJAX
    changeTab: function(tabName) {
        // Avisa a View para mudar a cor do botão da aba que está activa no momento
        AppView.updateActiveTabVisual(tabName);
    },

    // Esta função reconstrói o site de testes dentro da janelinha (iframe)
    renderPreview: function() {
        // Diz para a View atualizar o conteúdo interno do iframe de visualização
        AppView.renderIframe();
    },

    // Esta função abre uma janela flutuante (modal) mostrando todo o código junto
    showFullCodeModal: function() {
        // Pede para o Model juntar o HTML, CSS e JS em um texto único e completo
        const compiledCodeString = AppModel.buildFullTemplate();
        
        // Pede para a View mostrar esse texto grandão dentro da tela flutuante
        AppView.displayFullCodeModal(compiledCodeString);
    },

    // Ativa e gerencia o movimento de arrastar a barra divisória central
    initResizer: function() {
        const divisor = document.getElementById('divisor-central');
        const painelEsquerdo = document.getElementById('painel-esquerdo');
        const containerPrincipal = document.getElementById('main-content-container');
        const iframePreview = document.getElementById('preview-janela');
        
        if (divisor && painelEsquerdo && containerPrincipal && iframePreview) {
            let arrastando = false;

            divisor.addEventListener('mousedown', function(e) {
                arrastando = true;
                document.body.style.cursor = 'col-resize';
                iframePreview.style.pointerEvents = 'none';
            });

            document.addEventListener('mousemove', function(e) {
                if (!arrastando) return;
                
                const limitesContainer = containerPrincipal.getBoundingClientRect();
                let novaLarguraPx = e.clientX - limitesContainer.left;
                
                if (novaLarguraPx > 150 && novaLarguraPx < (limitesContainer.width - 150)) {
                    painelEsquerdo.style.width = novaLarguraPx + 'px';
                }
            });

            document.addEventListener('mouseup', function() {
                if (arrastando) {
                    arrastando = false;
                    document.body.style.cursor = 'default';
                    iframePreview.style.pointerEvents = 'auto';
                }
            });
        }
    },

    // Esta função transforma o seu código em um arquivo real e baixa no seu computador
    saveToDisk: function() {
        const cleanHtmlOutput = AppModel.buildFullTemplate();
        const blob = new Blob([cleanHtmlOutput], { type: 'text/html' });
        const virtualLink = document.createElement('a');
        virtualLink.href = URL.createObjectURL(blob);
        virtualLink.download = 'meu-codigo-salvo.html';
        virtualLink.click();
    },

    // FUNÇÃO DO BOTÃO RESET: Limpa os dados salvos e reinicia o editor com os códigos padrões do sistema
    resetEditor: function() {
        // Exibe uma caixa de confirmação na tela para o usuário não apagar tudo por acidente
        if (confirm("Tem certeza que deseja resetar o editor? Isso apagará todos os seus códigos atuais.")) {
            
            // Limpa de forma definitiva o armazenamento local do navegador para remover códigos corrompidos
            localStorage.clear();
            
            // CORREÇÃO DO RESET: Recarrega os dados padrões do arquivo login.html assincronamente e atualiza a tela
            AppModel.inicializar().then(() => {
                AppView.initEditorsContent(AppModel.codes);
                this.renderPreview();
            });
        }
    }
};

// Configura o navegador para executar a função de inicialização assim que carregar tudo na tela
window.onload = () => AppController.init();