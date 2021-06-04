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

// if (global.gc) {
//   setInterval(() => {
//     global.gc();
//   }, 15000);
// }

io.on('connection', (socket) => {
  // In socket.io version 2.4.1 io.sockets.socket.size does not work
  console.log('clients connected: ', io.engine.clientsCount);
  socket.user = socket.handshake.query.user;
  for (let i = 0; i < 150; i++) {
    socket.on(`method${i}`, console.log);
  }

  // socket.onpacketOrg = socket.onpacket;
  // socket.onpacket = (packet) => {
  //   if (packet.type === 2) {
  //     packet.data = ['rpc'].concat(packet.data);
  //   }
  //   socket.onpacketOrg(packet);
  // };
  // socket.on('rpc', async (method, ...args) => {
  //   console.log(`Received rpc => ${method} from ${socket.user}`);
  //   await new Promise(r => setTimeout(r, Math.random() * 1000));
  //   const ack = args.slice(-1)[0];
  //   ack(args);
  // });

  socket.on('echo', async (...args) => {
    console.log(`Received echo event from ${socket.user}`);
    await new Promise(r => setTimeout(r, Math.random() * 1000));
    const ack = args.slice(-1)[0];
    ack(args);
  });

  socket.on('total', (ack) => {
    console.log('Return total connections', io.engine.clientsCount);
    ack(io.sockets.sockets.size);
  });

  // socket.on('gc', (ack) => {
  //   if (global.gc) {
  //     gc();
  //   }
  //   ack('done');
  // });
  // socket.onAny((event, ...args) => {
  //   console.log('event from socket io', event, args);
  //   socket.send(args);
  // });
  socket.on('error', (error) => {
    socket.error(error.message);
  });

  socket.on('disconnect', () => {
    socket.removeAllListeners();
    console.log(`${socket.user} is disconnected`, io.engine.clientsCount);
  });
});

httpServer.listen(3000);
