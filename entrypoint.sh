#!/bin/sh -l
set -e -o pipefail

# deck validate command
deck_execute (){
    dir=$1
    ops=$2
    if [ ! -e ${dir} ]; then
        echo "${dir}: No such file or directoy exists";
        exit 1;
    fi

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