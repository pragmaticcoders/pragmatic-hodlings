#!/bin/bash
npm run token_shares:adding
gnuplot -c plot.sh 35 "Changes of token per hodler in time. Each hodler has different seniority in start day. Hodlers are adding in time. Total token count:1000" "./token_shares"
timestamp="$(date +%s)"
cp ./token_shares.png "./adding_hodlers/$timestamp-token_shares.png"
cp ./token_shares.csv "./adding_hodlers/$timestamp-token_shares.csv"