var server = require('./server')

function initStart(time) {
    console.log('Start at: '+ time)
}

function globalfunction() {
    //global object
    setTimeout();
    clearTimeout();
    setInterval();
    clearInterval();
}

initStart(new Date());

server;