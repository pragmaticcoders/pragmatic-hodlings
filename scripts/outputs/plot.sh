#!/usr/bin/gnuplot --persist
set datafile separator ","
set title "Token shares" font ",14" textcolor rgbcolor "royalblue"
set xlabel "days"
set ylabel "token count"
set grid
set term "png"
set output "lol.png"
plot for [n=2:25] './alg_constant.csv' u 1:n w lines ls n