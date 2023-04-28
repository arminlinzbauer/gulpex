const fs = require('fs');

function findExtensions(rootDir, config) {
    try {
        if (fs.existsSync(`${rootDir}/.gulp/extensions/autoload`)) {
            let autoloadPaths = fs.readdirSync(`${rootDir}/.gulp/extensions/autoload`);
            autoloadPaths = autoloadPaths.map(v => `autoload/${v}`);
            return [...autoloadPaths, ...config.extensions];
        }
        return config.extensions;
    } catch (e) {
        return [];
    }
}

function loadExtension(extensionFile, extensionName, rootDir, options) {
    extensionFile = `${rootDir}/.gulp/extensions/${extensionFile}`;

    if (extensionFile.substr(-3, 3).toLowerCase() === '.js') {
        extensionFile = extensionFile.substr(0, extensionFile.length - 3);
    }

    try {
        console.log(`[GulpEx] Loading extension '${extensionName}'`);
        require(extensionFile).default({ ...options });
    } catch (error) {
        console.error(error);
        console.error(`[GulpEx] Failed to load extension '${extensionName}'`);
    }
};

function guardConfig(config, extensionName) {
    function guardedConfig() {
        if (
            config.security.extensions.allowConfigAccess === true ||
            Array.isArray(config.security.extensions.allowConfigAccess) &&
            config.security.extensions.allowConfigAccess.includes(extensionName)
        ) {
            return {...config};
        }
        console.error(`[${extensionName}] Config access for extensions disabled.`);
    }
    return guardedConfig;
}

module.exports = { findExtensions, loadExtension, guardConfig }