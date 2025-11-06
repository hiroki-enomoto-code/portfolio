FROM php:8.2-fpm-bullseye
COPY php.ini /usr/local/etc/php/

RUN apt-get update && \
  apt-get -y install --no-install-recommends \
    git \
    unzip \
    libzip-dev \
    libicu-dev \
    libonig-dev \
    # GD用のパッケージを追加
    libfreetype6-dev \
    libjpeg62-turbo-dev \
    libpng-dev \
        # cron用のパッケージ（cronではなくcron-daemonを使用）
    cron \
    && \
  apt-get clean && \
  rm -rf /var/lib/apt/lists/* && \
  # GD拡張のインストールを追加
  docker-php-ext-configure gd --with-freetype --with-jpeg && \
  docker-php-ext-install \
    intl \
    pdo_mysql \
    zip \
    bcmath \
    gd

RUN pecl install redis && \
    docker-php-ext-enable redis

#Composer install
COPY --from=composer /usr/bin/composer /usr/bin/composer

ENV COMPOSER_ALLOW_SUPERUSER 1

ENV COMPOSER_HOME /composer

ENV PATH $PATH:/composer/vendor/bin


# entrypointスクリプトとcrontabをコピー
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
COPY crontab /etc/cron.d/laravel-cron

RUN chmod +x /usr/local/bin/entrypoint.sh && \
    chmod 0644 /etc/cron.d/laravel-cron && \
    crontab /etc/cron.d/laravel-cron

RUN touch /var/log/cron.log

WORKDIR /var/www

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["php-fpm"]