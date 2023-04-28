let hooks = {};

class PipeTask {
    constructor(fn, err, end) {
        this.fn = fn;
        this.err = err;
        this.end = end;
    }

    get task() {
        return { fn: this.fn, err: this.err, end: this.end };
    }
}

class PipeHook {
    constructor(name) {
        this._name = name;
    }

    get name() {
        return this._name;
    }

    get pipes() {
        return hooks[this.name] ?? [];
    }
}

class Pipe {
    _recipe = [];

    constructor(recipe = []) {
        this._recipe = recipe;
    }

    addTask(fn, err, end) {
        this._recipe.push(new PipeTask(fn, err, end))
    }

    addHook(name) {
        this._recipe.push(new PipeHook(name))
    }

    execute(vinylStream) {
        this._recipe.forEach(step => {
            if(step instanceof PipeTask) {
                const { fn, err, end } = step.task;
                vinylStream = vinylStream.pipe(fn);
                if(err != null) {
                    vinylStream = vinylStream.on('error', err)
                }
                if(end != null) {
                    vinylStream = vinylStream.on('end', end)
                }
            }

            if(step instanceof PipeHook) {
                step.pipes.forEach(pipe => {
                    console.log(`[GulpEx] Running plugin pipes for hook [${step.name}] ...`)
                    vinylStream = pipe.execute(vinylStream)
                })
            }
        })

        return vinylStream;
    }
}

function clearHooks() {
    hooks = Object.create()
}

function registerPipe(hookName, pipe) {
    if(!Array.isArray(hooks[hookName])) {
        hooks[hookName] = [];
    }

    hooks[hookName].push(pipe);
}

function createPipe(...recipe) {
    return new Pipe(recipe);
}

function executePipe(pipe, vinylStream) {
    return pipe.execute(vinylStream);
}

function defineTask(fn, err, end) {
    return new PipeTask(fn, err, end);
}

function buildHookDefiner(prefix = "extension") {
    return function defineHook(name) {
        return new PipeHook(`${prefix}.${name}`);
    }
}

function defineHook(name) {
    return new PipeHook(name);
}

module.exports = { createPipe, executePipe, defineTask, defineHook, registerPipe, buildHookDefiner, clearHooks }
