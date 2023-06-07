#!/usr/bin/env bash

# arg 1 filename, arg 2 min time, arg 3 + arg2 = max time

FILENAME=$1
echo "starting at $STARTLINE"
i=0

start=$(date +%s)

while read line; do
    cleanline=$(echo "$line" | tr -d '"')
    url="http://localhost:3000/tab/$cleanline/"
    sleeptime=$(($RANDOM % ${4:-20} + ${3:-5}))

    echo -e "#$((++i))\turl:$cleanline"
    if [[ $i -lt ${2:-1} ]]; then
        continue
    fi

    curl -o /dev/null -s -w "\t%{http_code} %{time_total}sec\n" -L "$url"
    echo -e "\tsleep $sleeptime" "secs"
    sleep $sleeptime
done <"$FILENAME"

end=$(date +%s)

runtime=$((end - start))
echo "Polling ran for $runtime"
