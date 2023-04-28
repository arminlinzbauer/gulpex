/*
 * Import additional modules required for your
 * extension here.
 *
 */
const extractCriticalCss = require('gulp-extract-critical-css');

exports.default = function ({ plugin, register, retain }) {

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
        console.info("[ExamplePlugin] Example Extension Task Running...");
        return Promise.resolve();
    }

    /*
     * Register your tasks here by calling register()
     * with a task name and the executor function.
     *
     * (Make sure you actually pass the function, not
     * call it).
     *
     * Also, make sure that you don't accidentally
     * override existing tasks. This is possible (as shown
     * below with the 'convert-css' task) and it does have
     * it's uses. Just make sure you only do it if you
     * really intend to. This will replace the original task.
     *
     * Otherwise, pick any new task name and execute it
     * separately with `gulp <task-name>`.
     *
     */
    register('convert-css', gulp.series(retain('convert-css'), example));

    /*
     * You can even extend existing pipelines (for now,
     * only the convert-css one).
     *
     * To do this, destructure the `plugin` object from the
     * method parameter (as shown above) and destructure it into
     * its components:
     *
     */
    const { registerPipe, createPipe, defineTask, err } = plugin;

    /*
     * Now, you can call `registerPipe` to "hook" into existing
     * pipelines at certain steps to extend their behavior.
     *
     * Be very careful, as you can end up with very unexpected
     * results if you don't fully understand what you're doing:
     */
    registerPipe('style.build.minify.before', createPipe(
        defineTask(extractCriticalCss(), err)
    ));
};
