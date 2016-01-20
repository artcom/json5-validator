#!/usr/bin/env node

const fs = require("fs")
const join = require("path").join

const docopt = require("docopt").docopt
const flatten = require("flatten")
const glob = require("glob").glob
const JSON5 = require("json5")
const Promise = require("bluebird")

const globAsync = Promise.promisify(glob)
const readFileAsync = Promise.promisify(fs.readFile)

const options = docopt(`
  usage: json5-validator <path>...
`)

main(options)

function main(options) {
  const paths = options["<path>"]

  const files = Promise
    .map(paths, listFiles)
    .then(flatten)

  const errors = files
    .reduce(collectErrors(validate), [])

  return errors
    .each(printError)
    .then(setExitCode)
}

function listFiles(path) {
  if (path.endsWith(".json") || path.endsWith(".json5")) {
    return Promise.resolve([path])
  } else {
    return globAsync(join(path, "**", "*.json?(5)"))
  }
}

function collectErrors(predicate) {
  return function(errors, item) {
    return predicate(item)
      .then(() => errors)
      .catch((error) => [error, ...errors])
  }
}

function validate(file) {
  return readFileAsync(file).then(function(buffer) {
    try {
      JSON5.parse(buffer)
    } catch (error) {
      throw new Error(`Invalid JSON5 in file "${file}": ${error}`)
    }
  })
}

function printError(error) {
  console.error(error.message)
}

function setExitCode(errors) {
  if (errors.length > 0) {
    process.exitCode = 1
  }
}
