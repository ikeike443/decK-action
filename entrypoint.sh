#!/bin/sh -l
set -e -o pipefail

# deck validate command
deck_multi_execute (){
    cmd=$1
    dir=$2
    ops=$3
    if [ ! -e ${dir} ]; then
        echo "${dir}: No such file or directoy exists";
        exit 1;
    fi

    for file in $(ls $dir); do
        echo $dir/$file

        deck $cmd $ops -s $dir/$file
    done
}

case $1 in
    "validate") deck_multi_execute $1 $2 "$3" ;;
    "diff") deck_multi_execute $1 $2 "$3" ;;
    "sync") deck_multi_execute $1 $2 "$3" ;;
    * ) deck $1 $3 ;;
esac



# TODO: 引数がなくても動くように
# TODO: Sync時にDeploy API叩く
# TODO: diffでComment入れる