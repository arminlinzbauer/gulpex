const styleFilter = objects => key => objects[key].type === 'style';
const scriptFilter = objects => key => objects[key].type === 'script';
const objectFilter = (objects, typeFilter) => {
    return Object.keys(objects).
        filter(typeFilter(objects)).
        reduce((obj, key) => {
            obj[key] = JSON.parse(JSON.stringify(objects[key]));
            return obj;
        }, {});
};

module.exports = { styleFilter, scriptFilter, objectFilter }