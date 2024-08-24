#!/bin/bash
maybelist=$(grep -o '[0-9]\{1,3\}\.[0-9]\{1,3\}\.[0-9]\{1,3\}\.[0-9]\{1,3\}' /var/log/nginx/access.log | sort | uniq)
whitelist=$(cat /var/log/nginx/access.log | grep "fifteen" | grep -o '[0-9]\{1,3\}\.[0-9]\{1,3\}\.[0-9]\{1,3\}\.[0-9]\{1,3\}' | sort | uniq)
blacklist=$(echo "$maybelist $whitelist" | tr " " "\n" | sort | uniq -u) 
echo $maybelist | wc -w
echo $whitelist | wc -w
echo $blacklist | wc -w
echo $blacklist | tr " " "\n"  > bash_blacklist.txt
