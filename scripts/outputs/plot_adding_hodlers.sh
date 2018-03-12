#!/bin/bash
npm run calculate_token_shares -- -- data "[
    1500, 1450,
    1400, 1350,
    1300, 1250,
    1200, 1150,
    1100, 1050,
    1000, 950,
    900, 850,
    800, 750,
    700, 650,
    600, 550,
    500, 450,
    400, 350,
    300, 250,
    200, 150,
    100, 50,
    0,
    -50, -100,
    -150, -200,
    -250, -300,
    -350, -400
    ]"
gnuplot -c plot.sh 50 "Changes of token per hodler in time. Each hodler has different seniority in start day. Hodlers are adding in time. Total token count:1000" "./token_shares"
timestamp="$(date +%s)"
mv ./token_shares.png "./adding_hodlers/$timestamp-token_shares.png"
mv ./token_shares.csv "./adding_hodlers/$timestamp-token_shares.csv"