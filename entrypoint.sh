#!/bin/sh -l
set -e -o pipefail

deck_multi_execute (){
    cmd=$1
    dir=$2
    sha=$3
    ops=$4
    if [ ! -e ${dir} ]; then
        echo "${dir}: No such file or directoy exists";
        exit 1;
    fi

    # for file in $(ls $dir); do
    for file in $(git diff --name-only ${sha} master); do
        echo $dir/$file

        deck $cmd $ops -s $dir/$file 2>&1
    done
}

case $1 in
    "validate") deck_multi_execute $1 $2 $3 "$4" ;;
    "diff") deck_multi_execute $1 $2 $3 "$4" ;;
    "sync") deck_multi_execute $1 $2 $3 "$4" ;;
    * ) deck $1 $4 ;;
esac



# TODO: 引数がなくても動くように
# TODO: Sync時にDeploy API叩く
# TODO: diffでComment入れる
# TODO: ghをいれる（GitHub CLI）