#!/bin/bash

# Path to the file containing the list of IPs
IP_FILE="ip_blacklist.txt"

# Check if the file exists
if [ ! -f "$IP_FILE" ]; then
  echo "File $IP_FILE does not exist."
  exit 1
fi

# Loop through each line in the file and add it to UFW
while IFS= read -r ip; do
  if [[ ! -z "$ip" ]]; then
    echo "Blocking IP: $ip"
    sudo ufw deny from "$ip" to any port 443
    sudo ufw deny from "$ip" to any port 80
  fi
done < "$IP_FILE"

# Reload UFW to apply the changes
sudo ufw reload

echo "IP banning completed."
