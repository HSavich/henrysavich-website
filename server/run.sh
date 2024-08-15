#!/bin/zsh

grep_count=$(ps aux | grep "master process nginx" | wc -l | tr -d " ")
if [[ "$grep_count" == 1 ]]; then
    echo "starting nginx"
    script_path=$( cd "${0:a:h}" ; pwd -P )
    conf_path="${script_path}/nginx/nginx.conf"
    nginx -c $conf_path
fi
if [[ "$grep_count" > 1 ]]; then
    echo "Error: process with title "master process nginx" already running"
fi
echo "end"
