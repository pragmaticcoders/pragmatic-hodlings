#!/usr/bin/gnuplot --persist
hodlersCount = 30
tokenTotalSupply = 1000
set datafile separator ","
set title "Changes of token per user in time. \n Each user has different seniority in start day. \n Total token count:".tokenTotalSupply font ",14" textcolor rgbcolor "royalblue"
set xlabel "days"
set ylabel "token count"
set grid
set key outside
set key title 'Seniority at day 0'
set term "png" size 1600,1200
set output "constant_hodlers_count.png"
plot for [n=2:hodlersCount + 1] './alg_constant.csv' u 1:n w linespoints ls n lw 1 ps 1 title columnheader(n)