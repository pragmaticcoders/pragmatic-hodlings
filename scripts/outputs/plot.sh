#!/usr/bin/gnuplot --persist
hodlersCount = ARG1
tokenTotalSupply = ARG2
set datafile separator ","
set title ARG2 font ",14" textcolor rgbcolor "royalblue"
set xlabel "days"
set ylabel "token count"
set grid
set key outside
set key title 'Seniority at day 0'
set term "png" size 1600,1200
set output ARG3.".png"
plot for [n=2:hodlersCount + 1] ARG3.".csv" u 1:n w linespoints ls n lw 1 ps 1 title columnheader(n)