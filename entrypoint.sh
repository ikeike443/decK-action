#!/bin/bash -l
set -e -o pipefail

main (){
    cmd=$1
    dir=$2
    ops=$3
    token=$4
    if [ ! -e ${dir} ]; then
        echo "${dir}: No such file or directoy exists";
        exit 1;
    fi

    # get the pull request number
    pull_number=$(cat $GITHUB_EVENT_PATH | jq .number)

    # get file lists on the pull request we're on
    files=$(curl -H "Authorization: token $token" https://api.github.com/repos/$GITHUB_REPOSITORY/pulls/$pull_number/files | jq -r ".[] | .filename");
    
    # execute deck command only for the files in the configured directry
    for file in $files; do
        if [[ $file =~ ${dir}/.+\.(yml|yaml) ]]; then
            echo $file
            case $cmd in
                "validate"|"diff") deck $cmd $ops $file ;;
                "sync") deploy $cmd $ops $file ;;
                * ) echo "deck $cmd is not supported." && exit 1 ;;
            esac
        fi
    done
}

# decK sync after dry-run and use GitHub Deployment API for visibility
deploy () {
    # dry-run
    deck diff $ops -s $file --non-zero-exit-code

    # only if there is a diff present, then start the process
    if [[ $? = 2 ]]; then
        # create deployment on github
        dep_id=$(curl -X POST https://api.github.com/repos/$GITHUB_REPOSITORY/deployments -H "Authorization: token  $token" -d '{ "ref": "'$GITHUB_REF'", "payload": { "deploy": "migrate" }, "description": "Executing decK sync..." }' | jq -r ".id")

        echo $dep_id

        # deck sync
        deck $cmd $ops -s $file

        # update deployment on github
        curl -X POST  https://api.github.com/repos/$GITHUB_REPOSITORY/deployments/$dep_id/statuses -H "Authorization: token  $token" -d '{ "state": "success", "environment_url": "'$ENV_URL'" }'
    else
        echo "There is no diff to sync"
    fi

  
}


# TODO: コメント直す。とりあえず当初はいらないかも。
# comment () {
#     deck $cmd $ops -s $file
#     # out=$(deck $cmd $ops -s $file | sed -e "s/\"//g")
#     out=$(deck $cmd $ops -s $file)
#     echo $out
#     if [ -n "$out" ]; then
#         # body_txt="{ \"body\": \"${out}\" }"
#         # echo $body_txt
#         s_code=$(curl -X POST https://api.github.com/repos/$GITHUB_REPOSITORY/issues/$pull_number/comments -H "Authorization: token $token" -d '{ "body": "'${out}'" }' -o /dev/null -w '%{http_code}\n' -s)

#         if [[ ! $s_code =~ ^2.. ]]; then
#             echo "GitHub API Error, status code:$s_code"
#             exit 1
#         fi
#     fi
# }

case $1 in
    "ping") deck $1 $3;;
    "validate"|"diff"|"sync") main $1 $2 "$3" $4;;
    * ) echo "deck $1 is not supported." && exit 1 ;;
esac