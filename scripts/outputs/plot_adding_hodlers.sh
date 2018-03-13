#!/bin/bash

dataArray=(
"[1200, 1150, 1100, 1050, 1000, 950, 900, 850, 800, 750, 700, 650, 600, 550, 500, 450, 400, 350, 300, 250, 200, 150, 100, 50, 0]"
"[1200, 1150, 1100, 1050, 1000, 950, 900, 850, 800, 750, 700, 650, 600, 550, 500, 450, 400, 350, 300, 250, 200, 150, 100, 50, 0, -50, -100]"
"[1200, 1150, 1100, 1050, 1000, 950, 900, 850, 800, 750, 700, 650, 600, 550, 500, 450, 400, 350, 300, 250, 200, 150, 100, 50, 0, -50, -100, -150, -200]"
"[1200, 1150, 1100, 1050, 1000, 950, 900, 850, 800, 750, 700, 650, 600, 550, 500, 450, 400, 350, 300, 250, 200, 150, 100, 50, 0, -50, -100, -150, -200, -250, -300]"
"[1200, 1150, 1100, 1050, 1000, 950, 900, 850, 800, 750, 700, 650, 600, 550, 500, 450, 400, 350, 300, 250, 200, 150, 100, 50, 0, -50, -100, -150, -200, -250, -300, -350]"
)

for data in "${dataArray[@]}"
do
    echo "Data: $data"
    npm run calculate_token_shares -- data "$data"
    gnuplot -c plot.sh 50 "Changes of token per hodler in time. Each hodler has different seniority in start day. Hodlers are adding in time. Total token count:100 000" "./token_shares"
    timestamp="$(date +%s)"
    mv ./token_shares.png "./adding_hodlers/$timestamp-token_shares.png"
    mv ./token_shares.csv "./adding_hodlers/$timestamp-token_shares.csv"
done
