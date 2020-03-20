#!/bin/bash -l
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
    # echo $GITHUB_SHA
    # echo $GITHUB_REF

    # get pull number
    echo $GITHUB_EVENT_PATH
    cat $GITHUB_EVENT_PATH
    pull_number=$(cat $GITHUB_EVENT_PATH | jq .number)
    echo $pull_number

    files=$(curl https://api.github.com/repos/$GITHUB_REPOSITORY/pulls/$pull_number/files | jq -r ".[] | .filename");
    # echo $files
    for file in $files; do
        # echo $file
        # echo "${dir}/.+\.(yml|yaml)"
        if [[ $file =~ ${dir}/.+\.(yml|yaml) ]]; then
            echo $file
            deck $cmd $ops -s $file 2>&1
        fi
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
