#!/bin/bash

script_path=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )
conf_path="${script_path}/nginx/nginx.conf"
echo $conf_path
nginx -c $conf_path
