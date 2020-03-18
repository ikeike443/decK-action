#!/bin/sh -l

# deck validate command
deck_execute (){
    dir=$1
    ops=$2
    echo $dir
    echo $ops
    for file in $(ls $dir); do
        echo $dir/$file
        deck validate ${ops} -s $dir/$file
    done
}

case $1 in
    "validate") deck_execute $2 "$3" ;;
    "diff") deck_execute $2 "$3" ;;
    "sync") deck_execute $2 "$3" ;;
    * ) deck $1 $3 ;;
esac


# TODO: 引数がなくても動くように