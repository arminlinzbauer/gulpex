function annotate(func, name) {
    if (typeof func != 'function') {
        throw Error("Only functions can be named with annotate.");
    }
    if (name != null) {
        return Object.defineProperty(func, 'name', {
            value: name,
            configurable: true,
        })
    }
    return func;
}

module.exports = { annotate }