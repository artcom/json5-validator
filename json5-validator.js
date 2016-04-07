#!/usr/bin/env node

const concat = require("concat-stream")
const JSON5 = require("json5")

process.stdin.pipe(concat(validate))

function validate(buffer) {
  try {
    JSON5.parse(buffer)
  } catch (error) {
    console.error(error.message)
    process.exit(1)
  }
}
