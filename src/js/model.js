// ==========================================
// FUNÇÕES QUE BUSCAM OU RETORNAM OS TEXTOS PADRÃO
// ==========================================

// Função assíncrona que lê o arquivo login.html de verdade usando a API Fetch moderna
async function obterHtmlPadrao() {
    // Tenta fazer a leitura do arquivo na mesma pasta
    try {
        const resposta = await fetch('login.html');
        
        // Se o arquivo foi encontrado com sucesso pelo navegador
        if (resposta.ok) {
            // Retorna o texto real de dentro do arquivo login.html
            return await resposta.text();
        }
        // Se o arquivo não existir na pasta, gera um erro amigável
        throw new Error("O arquivo 'login.html' não foi encontrado na pasta do projeto.");
        
    } catch (erro) {
        // Se cair aqui, é porque o arquivo sumiu OU o navegador bloqueou o acesso via 'file://' (Erro de CORS)
        console.warn("Erro crítico ao ler login.html via rede: ", erro.message);
        
        // Retorna um HTML visível avisando o desenvolvedor na tela do motivo do bloqueio
        return '<!-- Erro de Carregamento -->\n' +
               '<div class="container mt-5">\n' +
               '  <div class="alert alert-danger">\n' +
               '    <h4>⚠️ Erro de Segurança ou Arquivo Ausente</h4>\n' +
               '    <p>Não foi possível ler o arquivo <strong>login.html</strong> automaticamente.</p>\n' +
               '    <hr>\n' +
               '    <p class="mb-0"><strong>Motivo Comum:</strong> Você abriu o arquivo index.html clicando duas vezes nele (endereço começa com <em>file:///</em>). O navegador bloqueia acessos a arquivos locais por segurança (Erro de CORS). Para funcionar perfeitamente, rode o projeto usando a extensão <strong>Live Server</strong> do VS Code ou qualquer servidor local.</p>\n' +
               '  </div>\n' +
               '</div>';
    }
}

function obterCssPadrao() {
    return '/* Seu CSS aqui */\nbody { background-color: #f8f9fa; }';
}

function obterJsPadrao() {
    return '// Seu JavaScript aqui\n' +
           'const btn = document.getElementById("btn-cadastrar");\n' +
           'if(btn) {\n' +
           '    btn.addEventListener("click", () => {\n' +
           '        executarMinhaChamada();\n' +
           '    });\n' +
           '}';
}

function obterAjaxPadrao() {
    return '// Seu código de requisições aqui\n' +
           'function executarMinhaChamada() {\n' +
           '    alert("Que tal fazermos juntos o cadastro?");\n' +
           '}';
}

// ==========================================
// OBJETO MODELO PRINCIPAL (APPMODEL)
// ==========================================

const AppModel = {
    
    // Objeto que guarda as 4 partes do código do editor
    codes: {
        html: '',
        css: '',
        js: '',
        ajax: ''
    },

    // A função inicializar agora é assíncrona (async) para suportar a leitura do arquivo real
    inicializar: async function() {
        try {
            const saved = localStorage.getItem('webEditorCodes');
            
            if (saved) {
                const parsed = JSON.parse(saved);
                // Verifica se os dados salvos são válidos e não contêm erros antigos
                if (parsed && parsed.html && parsed.html.trim() !== "" && parsed.html !== "undefined") {
                    this.codes = parsed;
                    return;
                }
            }
        } catch (e) {
            console.error("Erro ao ler localStorage, aplicando padrões.");
        }
        
        // Força a leitura real do arquivo login.html aguardando o término do download
        this.codes = {
            html: await obterHtmlPadrao(), 
            css: obterCssPadrao(),
            js: obterJsPadrao(),
            ajax: obterAjaxPadrao()
        };
        
        // Guarda no navegador para as próximas inicializações
        this.persist();
    },

    updateCode: function(tab, newCode) {
        this.codes[tab] = newCode;
        this.persist(); 
    },

    persist: function() {
        localStorage.setItem('webEditorCodes', JSON.stringify(this.codes));
    },

    buildFullTemplate: function() {
        return '<!DOCTYPE html>\n' +
               '<html lang="pt-BR">\n' +
               '<head>\n' +
               '    <meta charset="UTF-8">\n' +
               '    <title>Visualização</title>\n' +
               '    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">\n' +
               '    <style>\n' + this.codes.css + '\n</style>\n' +
               '</head>\n' +
               '<body>\n\n' +
               this.codes.html + '\n\n' +
               '    <script>\n' + this.codes.ajax + '\n    <\/script>\n' +
               '    <script>\n' + 
               '        document.addEventListener("DOMContentLoaded", function() {\n' + 
                            this.codes.js + '\n' + 
               '        });\n' + 
               '    <\/script>\n' +
               '</body>\n' +
               '</html>';
    }
};