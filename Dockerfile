# Usa a imagem oficial do Nginx, que é um servidor web muito rápido e leve
FROM nginx:alpine

# Remove a página padrão que vem no Nginx
RUN rm -rf /usr/share/nginx/html/*

# Copia todos os arquivos do nosso projeto local para dentro do servidor Nginx
# Toda vez que iniciarmos o container, ele vai ler nossa pasta local
COPY ./src /usr/share/nginx/html

# Informa que o container vai rodar na porta 80 (padrão de sites)
EXPOSE 80