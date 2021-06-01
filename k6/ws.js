import { randomString, randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.1.0/index.js';
import ws from 'k6/ws';
import { check, sleep } from 'k6';

let sessionDuration = randomIntBetween(10000, 60000); // user session between 10s and 1m

// export let options = {
//   vus: 100000,
//   durations: '10m',
//   iterations: 100000
// };

export default function () {
  let url = `ws://localhost:3000/socket.io/?EIO=4&transport=websocket&user=user${__VU}`;

  let res = ws.connect(url, {}, function (socket) {
    socket.on('open', function open () {
      console.log(`VU ${__VU}: connected`);

      socket.send('40');
      // socket.send('42'JSON.stringify({'event': 'SET_NAME', 'new_name': `Croc ${__VU}`}));

      let i = 0;
      const echoMsg = () => {
        socket.setTimeout(function timeout () {
          socket.send(`42${i++}["echo", "${__VU} is saying ${randomString(1000)}"]`);
          // socket.send(JSON.stringify({'event': 'SAY', 'message': `I'm saying ${randomString(5)}`}));
          echoMsg();
        }, randomIntBetween(100, 200)); // say something every 2-8seconds
      }
      echoMsg();
    });

    socket.on('ping', function () {
      socket.send('3');
      console.log('PING!');
    });

    socket.on('pong', function () {
      console.log('PONG!');
    });

    socket.on('close', function () {
      console.log(`VU ${__VU}: disconnected`);
    });

    socket.on('message', function (message) {
      if (message === '2') {
        console.log('sending pong');
        socket.send('3');
      } else {
        const matches = /43(\d+)(.*)/.exec(message);
        if (matches) {
          const msgId = matches[1];
          const data = JSON.parse(matches[2]);
          // console.log(data);

          console.log(`VU ${__VU} received on id ${msgId}:`);
        }
      }
    });

    // socket.setTimeout(function () {
    //   console.log(`VU ${__VU}: ${sessionDuration}ms passed, leaving the chat`);
    //   socket.send(JSON.stringify({'event': 'LEAVE'}));
    // }, sessionDuration);

    // socket.setTimeout(function () {
    //   console.log(`Closing the socket forcefully 3s after graceful LEAVE`);
    //   socket.close();
    // }, sessionDuration + 3000);
  });

  check(res, { 'Connected successfully': (r) => r && r.status === 101 });
}
