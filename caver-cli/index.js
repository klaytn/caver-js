/*
    Copyright 2018 The caver-js Authors
    This file is part of the caver-js library.
 
    The caver-js library is free software: you can redistribute it and/or modify
    it under the terms of the GNU Lesser General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.
 
    The caver-js library is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
    GNU Lesser General Public License for more details.
 
    You should have received a copy of the GNU Lesser General Public License
    along with the caver-js. If not, see <http://www.gnu.org/licenses/>.
*/

const fs = require('fs')
const jsonFormat = require('json-format')
const _ = require('underscore')
const chalk = require('chalk')
const figlet = require('figlet')
const inquirer = require('inquirer')

const formatters = ['null', ...Object.keys(require('../index.js').formatters)]
let rpcList = require('../rpc.json')

let rpcListName = rpcList.map(({ name }) => name)

// TODO: FP paradigm
const reloadRpcFile = () => {
    delete require.cache[require.resolve('../rpc.json')]
    rpcList = require('../rpc.json')
    rpcListName = rpcList.map(({ name }) => name)
}

console.log(chalk.yellow(figlet.textSync('Onit', { horizontalLayout: 'full', font: 'Dancing Font' })))

// Select Menu
// 1) List 2) Add 3) Modify 4) Remove
const selectMenu = () =>
    inquirer.prompt({
        type: 'list',
        name: 'menu',
        message: `
      __ENG.Please choose menu, 1) List 2) Add 3) Modify 4) Remove
    KOR.메뉴를 선택해주세요. 1) 리스트 2) 추가 3) 수정 4) 삭제
    JPN.メニューを選択してください. 1)リスト 2)追加 3)修正 4)削除
    `.trim(),
        choices: ['1)List', '2)Add', '3)Modify', '4)Remove'],
        pageSize: 4,
    })

const numberMapping = {
    1: 'first',
    2: 'second',
    3: 'third',
    4: 'fourth',
    5: 'fifth',
    6: 'sixth',
    7: 'seventh',
    8: 'eighth',
    9: 'ninth',
}

const recur = () => {
    selectMenu().then(({ menu }) => {
        switch (menu) {
            case '1)List':
                rpcListName.forEach((name, idx) => console.log(`${idx}.${name}`))
                recur()
                break
            case '2)Add':
                inquirer
                    .prompt([
                        {
                            type: 'input',
                            name: 'label',
                            message: `What's your rpc call label (You will call it through onit.klay.label(...))`,
                        },
                        {
                            type: 'input',
                            name: 'call',
                            message: `What's your rpc call name`,
                        },
                        {
                            type: 'input',
                            name: 'params',
                            message: `How many parameters do you need for the call?`,
                        },
                    ])
                    .then(answers => {
                        const inputFormattersQuestion = _.range(answers.params).map((_, idx) => ({
                            type: 'list',
                            name: `${idx}inputParamFormatter`,
                            message: `Do you want to format for the ${numberMapping[idx + 1]} input parameters?`,
                            choices: formatters,
                            pageSize: 20,
                        }))

                        return Promise.all([
                            answers,
                            inquirer.prompt([
                                ...inputFormattersQuestion,
                                {
                                    type: 'list',
                                    name: 'outputResultFormatter',
                                    choices: formatters,
                                    pageSize: 20,
                                    message: 'Do you want to format for the output result?',
                                },
                            ]),
                        ])
                    })
                    .then(([meta, formatter]) => {
                        const formatters = Object.values(formatter)
                        const inputParamFormatters = _.omit(formatters, _.last(formatters))
                        const outputResultFormatter = _.last(formatters)
                        const result =
                            rpcList.push({
                                name: meta.label,
                                call: meta.call,
                                params: meta.params,
                                inputFormatter: inputParamFormatters,
                                outputFormatter: outputResultFormatter,
                            }) && rpcList

                        // console.log(result)
                        fs.writeFile('../rpc.json', jsonFormat(result), err => {
                            if (err) {
                                return console.log('error occurred!')
                            }
                            reloadRpcFile()
                            recur()
                        })
                    })
                break
            case '3)Modify':
                recur()
                break
            case '4)Remove':
                inquirer
                    .prompt([
                        {
                            type: 'checkbox',
                            name: 'removeTargets',
                            message: 'What rpc call do you want to remove?',
                            choices: rpcListName,
                            pageSize: 50,
                        },
                    ])
                    .then(({ removeTargets }) => {
                        _.chain(rpcList)
                            .reject(({ name }) => _.contains(removeTargets, name))
                            .tap(result => {
                                fs.writeFile('../rpc.json', jsonFormat(result), err => {
                                    if (err) {
                                        return console.log('error occurred!')
                                    }
                                    reloadRpcFile()
                                })
                            })

                        recur()
                    })
                break
            default:
        }
    })
}

recur()
