#!/usr/bin/env bash

FILENAME=$1
i=0

while read line; do
    cleanline=$(echo "$line" | tr -d '"')
    url="http://localhost:3000/tab/$cleanline/"
    sleeptime=$(($RANDOM % 20 + 5))

    echo "line:$((++i)) sleep:$sleeptime url:$cleanline"
    curl -o /dev/null -s -w "%{http_code}\n" -L "$url"
    sleep $sleeptime
done <"$FILENAME"
