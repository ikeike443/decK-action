#!/bin/sh -l

echo "Hello $1"
time=$(date)
echo ::set-output name=time::$time

deck ping --kong-addr "http://ikeike443-demo.net:8001" 