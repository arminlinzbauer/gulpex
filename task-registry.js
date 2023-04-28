const { annotate } = require('./annotate');

let taskRegistry = {};

function register(name, task) {
    taskRegistry[name] = task;
}

function retain(name) {
    return taskRegistry[name];
}

function lookup(name) {
    return annotate(async done => {
        return taskRegistry[name](done)
    }, name);
}

function apply(exports) {
    Object.assign(exports, taskRegistry);
}

function reset() {
    taskRegistry = Object.create();
}

module.exports = { register, retain, lookup, apply, reset }