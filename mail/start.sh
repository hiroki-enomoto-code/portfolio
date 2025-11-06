#!/bin/bash

# Postfixの設定を環境変数で更新
if [ ! -z "$MAIL_DOMAIN" ]; then
    postconf -e "mydomain = $MAIL_DOMAIN"
    postconf -e "myorigin = $MAIL_DOMAIN"
fi

if [ ! -z "$MAIL_HOSTNAME" ]; then
    postconf -e "myhostname = $MAIL_HOSTNAME"
fi

# TLS設定を確実に無効化
postconf -e "smtpd_use_tls = no"
postconf -e "smtp_use_tls = no"
postconf -e "smtpd_tls_security_level = none"
postconf -e "smtp_tls_security_level = none"
postconf -e "smtpd_enforce_tls = no"
postconf -e "smtp_enforce_tls = no"
postconf -e "smtpd_tls_auth_only = no"

# メールログディレクトリの作成
mkdir -p /var/log/supervisor
touch /var/log/maillog

# Postfixのマスタープロセスファイルをクリーンアップ
rm -f /var/spool/postfix/pid/master.pid

# Supervisordを起動
exec /usr/bin/supervisord -c /etc/supervisord.conf