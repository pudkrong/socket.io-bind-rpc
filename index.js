process
  .on('unhandledRejection', (err) => {
    console.error('unhandledRejection', err);
  })
  .on('uncaughtException', (err) => {
    console.error('uncaughtException', err);
  });

const app = require('express')();
const httpServer = require('http').createServer(app);
const io = require('socket.io')(httpServer, {
});

if (global.gc) {
  setInterval(() => {
    global.gc();
  }, 15000);
}

io.on('connection', (socket) => {
  console.log('clients connected: ', io.sockets.sockets.size);
  socket.user = socket.handshake.query.user;
  socket.on('echo', async (...args) => {
    console.log(`Received echo event from ${socket.user}`);
    await new Promise(r => setTimeout(r, Math.random() * 1000));
    const ack = args.slice(-1)[0];
    ack(args);
  });

  socket.on('total', (ack) => {
    console.log('Return total connections', io.sockets.sockets.size);
    ack(io.sockets.sockets.size);
  });

  socket.on('gc', (ack) => {
    if (global.gc) {
      gc();
    }
    ack('done');
  });
  // socket.onAny((event, ...args) => {
  //   console.log('event from socket io', event, args);
  //   socket.send(args);
  // });
  socket.on('disconnect', () => {
    socket.removeAllListeners();
    console.log(`${socket.user} is disconnected`, io.sockets.sockets.size);
  });
});

httpServer.listen(3000);
