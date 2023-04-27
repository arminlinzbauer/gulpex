exports.default = function (tasks, gulp) {

    /*
     * Add your extension tasks within this function!
     * Make sure you don't forget signaling asynchronous
     * completion. For more information regarding this
     * topic have a look here:
     *
     * https://gulpjs.com/docs/en/getting-started/async-completion
     *
     */

    function example() {
        console.info("Example Extension Task Running...");
        return Promise.resolve();
    }


    /*
     * Register your tasks here by exposing them in the
     * 'tasks'-Object that's inherited from the running
     * gulp instance.
     *
     * (Make sure you actually pass the function, not the
     * returned value of the called function.)
     *
     * Also, make sure that you don't accidentally
     * override existing tasks. This is possible and has
     * it's uses. Just make sure you only do it if you
     * really intend to.
     *
     */

    tasks.example = example;
};
