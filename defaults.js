const defaults = {
    projectRoot: '.',
    documentRoot: './html',
    assetDirectory: './html/assets',
    nodeModules: './node_modules',
    cssDirectory: './html/css',
    scriptsDir: './html/js',
    bundles: {},
    assets: [],
    includePaths: [],
    security: {
        extensions: {
            allowConfigAccess: false
        }
    }
};

module.exports = { defaults }