#!/bin/sh -l

deck ping --kong-addr $1 --headers $2


# TODO: sync -> マージ時にKongとSync
# TODO: diff -> 何らかの形でPRへフィードバック
# TODO: validate -> PRのコードレビュー画面の該当行へフィードバック
# TODO: 引数がなくても動くように