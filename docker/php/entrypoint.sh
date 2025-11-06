#!/bin/bash

# cronを起動
service cron start

# 元のコマンドを実行
exec "$@"