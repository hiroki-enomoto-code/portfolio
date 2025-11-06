FROM nginx

COPY ssl/server.crt /etc/nginx/ssl/server.crt
COPY ssl/server.key /etc/nginx/ssl/server.key
COPY ssl/server.password /etc/nginx/ssl/server.password

WORKDIR /var/www

ADD ./www /var/www

RUN ln -sf /var/www/backend/storage/app/public /var/www/htdocs/