#!/bin/bash

dataArray=(
"[[60, 20], [90, 1]]"
)

for data in "${dataArray[@]}"
do
    echo "Data: $data"
    npm run calculate_token_shares -- -- data "[1200, 1150, 1100, 1050, 1000, 950, 900, 850, 800, 750, 700, 650, 600, 550, 500, 450, 400, 350, 300, 250, 200, 150, 100, 50, 0]" dataToRemove "$data"
    gnuplot -c plot.sh 50 "Changes of token per hodler in time. Each hodler has different seniority in start day. Hodlers are adding in time. Total token count:100 000" "./token_shares"
    timestamp="$(date +%s)"
    mv ./token_shares.png "./removing_hodlers/$timestamp-token_shares.png"
    mv ./token_shares.csv "./removing_hodlers/$timestamp-token_shares.csv"
done
