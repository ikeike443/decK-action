#!/bin/sh -l

# deck validate command
deck_validate (){
    dir=$1
    ops=$2
    echo $dir
    echo $ops
    for file in $(ls $dir); do
        echo $dir/$file
        deck validate ${ops} -s $dir/$file
    done
}

deck_sync (){
    dir=$1
    ops=$2
    echo $dir
    echo $ops
    for file in $(ls $dir); do
        echo $dir/$file
        deck sync ${ops} -s $dir/$file
    done
}

deck_diff (){
    dir=$1
    ops=$2
    echo $dir
    echo $ops
    for file in $(ls $dir); do
        echo $dir/$file
        deck diff ${ops} -s $dir/$file
    done
}


case $1 in
    "validate") deck_validate $3 "$2" ;;
    "diff") deck_diff $3 "$2" ;;
    "sync") deck_sync $3 "$2" ;;
    * ) deck $1 $2 ;;
esac



# TODO: sync -> マージ時にKongとSync
# TODO: diff -> 何らかの形でPRへフィードバック
# TODO: validate -> PRのコードレビュー画面の該当行へフィードバック
# TODO: 引数がなくても動くように