#!/bin/sh -l
set -e -o pipefail

deck_multi_execute (){
    cmd=$1
    dir=$2
    # sha=$3
    ops=$3
    if [ ! -e ${dir} ]; then
        echo "${dir}: No such file or directoy exists";
        exit 1;
    fi
    echo $GITHUB_SHA
    # for file in $(ls $dir); do
    for file in $(git diff --name-only $GITHUB_SHA origin/master); do # TODO: it's not ideal
        echo $dir/$file

        deck $cmd $ops -s $dir/$file 2>&1
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
# TODO: ghをいれる（GitHub CLI）
