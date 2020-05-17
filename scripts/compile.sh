#!/bin/bash -l
set -e -o pipefail

npm install

ncc build action/src -o action/dist;