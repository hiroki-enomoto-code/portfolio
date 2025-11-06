FROM almalinux:9

# 必要なパッケージのインストール
RUN dnf install -y epel-release && \
    dnf update -y && \
    dnf install -y \
        postfix \
        s-nail \
        cyrus-sasl \
        cyrus-sasl-plain \
        rsyslog \
        supervisor \
        net-tools \
        telnet \
        hostname && \
    dnf clean all

# Postfixの設定
RUN postconf -e "myhostname = mail.local" && \
    postconf -e "mydomain = local" && \
    postconf -e "myorigin = \$mydomain" && \
    postconf -e "inet_interfaces = all" && \
    postconf -e "mydestination = \$myhostname, localhost.\$mydomain, localhost, \$mydomain" && \
    postconf -e "mynetworks = 127.0.0.0/8, 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16" && \
    postconf -e "relay_domains = \$mydestination" && \
    postconf -e "smtpd_banner = \$myhostname ESMTP" && \
    postconf -e "home_mailbox = Maildir/" && \
    postconf -e "mailbox_size_limit = 0" && \
    postconf -e "recipient_delimiter = +" && \
    postconf -e "inet_protocols = ipv4" && \
    postconf -e "disable_vrfy_command = yes" && \
    postconf -e "smtpd_recipient_restrictions = permit_mynetworks, reject_unauth_destination" && \
    postconf -e "smtpd_relay_restrictions = permit_mynetworks, reject_unauth_destination" && \
    postconf -e "smtpd_use_tls = no" && \
    postconf -e "smtpd_tls_auth_only = no" && \
    postconf -e "smtp_use_tls = no" && \
    postconf -e "smtp_tls_security_level = none" && \
    postconf -e "smtpd_tls_security_level = none" && \
    postconf -e "smtpd_tls_cert_file = " && \
    postconf -e "smtpd_tls_key_file = " && \
    postconf -e "smtpd_tls_CAfile = " && \
    postconf -e "smtp_tls_CAfile = " && \
    postconf -e "smtpd_enforce_tls = no" && \
    postconf -e "smtp_enforce_tls = no"

# メールボックスディレクトリの作成
RUN mkdir -p /var/mail/vhosts/local && \
    groupadd -g 5000 vmail && \
    useradd -g vmail -u 5000 vmail -d /var/mail && \
    chown -R vmail:vmail /var/mail

# Supervisorの設定ファイル
COPY supervisord.conf /etc/supervisord.conf

# 起動スクリプト
COPY start.sh /start.sh
RUN chmod +x /start.sh

# ポートの公開
EXPOSE 25 587

# 起動コマンド
CMD ["/start.sh"]