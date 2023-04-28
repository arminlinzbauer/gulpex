function end(message) {
    console.log(message);
    this.emit('end');
};

function err(error) {
    console.error(error);
    this.emit('end');
};

module.exports = { end, err }