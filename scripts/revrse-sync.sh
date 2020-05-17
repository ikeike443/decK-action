#!/bin/bash -l
set -e -o pipefail

curl -X POST -H "Authorization: token $1" https://api.github.com/repos/$2/dispatches -d '{ "event_type": "se-demo" }' 