#!/bin/bash
npm run token_shares:constant
gnuplot -c plot.sh 30 "Changes of token per user in time. Each user has different seniority in start day. Total token count:1000" "./token_shares"
timestamp="$(date +%s)"
cp ./token_shares.png "./constant_hodlers/$timestamp-token_shares.png"
cp ./token_shares.csv "./constant_hodlers/$timestamp-token_shares.csv"