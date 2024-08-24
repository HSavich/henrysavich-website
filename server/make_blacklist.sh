#!/bin/bash
maybelist=$(grep -o '[0-9]\{1,3\}\.[0-9]\{1,3\}\.[0-9]\{1,3\}\.[0-9]\{1,3\}' /var/log/nginx/access.log | sort | uniq)
whitelist=$(cat /var/log/nginx/access.log | grep "fifteen" | grep -o '[0-9]\{1,3\}\.[0-9]\{1,3\}\.[0-9]\{1,3\}\.[0-9]\{1,3\}' | sort | uniq)
blacklist=$(echo "$maybelist $whitelist" | tr " " "\n" | sort | uniq -u) 
echo "Number of IPs that have visited the IP address:"
echo $maybelist | wc -w
echo "Number of IPs that have visited the fifteen puzzle"
echo $whitelist | wc -w
echo "Number of IPs that have visited the IP address but not the fifteen puzzle"
echo $blacklist | wc -w
echo $whitelist | tr " " "\n" > ip_whitelist.txt
echo $blacklist | tr " " "\n"  > ip_blacklist.txt
