const io = require('socket.io-client');

const socket = io('ws://localhost:8080', {
  reconnectionDelayMax: 10000,
});

socket
  .on('connect', async () => {
    console.log('connected');
    let i = 0;
    while (true) {
      const msg = `message ${i}`;
      console.log('sending ', msg);
      socket.emit('echo', msg, (...args) => {
        console.log(`callback: ${i++}`, args);
      });
      await new Promise(r => setTimeout(r, 1000));
    }
  })
  .on('message', (...args) => {
    console.log('received', args);
  })
  .on('disconnect', () => {
    console.log('disconnect');
  });
