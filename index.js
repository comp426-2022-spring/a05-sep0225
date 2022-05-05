const minimist = require('minimist')
const express = require('express')
const fs = require('fs')
const morgan = require('morgan')
const logdb = require('./src/services/database.js')

const app = express()

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const args = require('minimist')(process.argv.slice(2))

const port = args.port || process.env.PORT || 3000;

const debug = args.debug || false
const log = args.log || true

if (args.help || args.h) {
  const help = (`server.js [options]

  --port		Set the port number for the server to listen on. Must be an integer
              	between 1 and 65535.

  --debug	If set to true, creates endlpoints /app/log/access/ which returns
              	a JSON access log from the database and /app/error which throws 
              	an error with the message "Error test successful." Defaults to 
		false.

  --log		If set to false, no log files are written. Defaults to true.
		Logs are always written to database.

  --help	Return this message and exit.`)
  console.log(help)
  process.exit(0)
}

const server = app.listen(port, () => {
    console.log(`<!DOCTYPE html>`)
})

if (args.debug) {
    app.get('/app/log/access', (req, res) => {
      try {
        const stmt = db.prepare('SELECT * FROM accesslog').all()
        res.status(200).json(stmt)
      } catch {
        console.error(e)
      }
    });
    
    app.get('/app/error', (req, res) => {
      res.status(500);
      throw new Error('Error test completed successfully.')
    })
  }

if (log != 'false') {
    app.use((req, res, next) => {
        let logdata = {remoteaddr: req.ip,
                      remoteuser: req.user,
                      time: Date.now(),
                      method: req.method,
                      url: req.url,
                      protocol: req.protocol,
                      httpversion: req.httpVersion,
                      status: res.statusCode,
                      referer: req.headers['referer'],
                      useragent: req.headers['user-agent']
                    }
        const stmt = db.prepare(`INSERT INTO accesslog (remoteaddr, remoteuser, time, method, url, protocol, httpversion, status, referer, useragent)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`)
        const info = stmt.run(logdata.remoteaddr, logdata.remoteuser, logdata.time, logdata.method, logdata.url,
        logdata.protocol, logdata.httpversion, logdata.status, logdata.referer, logdata.useragent)
        next()
    })
}

app.get('/app/', (req, res) => {
    res.statusCode = 200;
    res.statusMessage = 'OK';
    res.writeHead( res.statusCode, { 'Content-Type' : 'text/plain' });
    res.end(res.statusCode+ ' ' +res.statusMessage)
});

app.get('/app/flip/', (req, res) => {
const flip = coinFlip()
res.status(200).json({'flip' : flip})
});

app.get('/app/flips/:number/', (req, res) => {
const flips = coinFlips(req.params.number)
const total = countFlips(flips)
res.status(200).json({'raw' : flips, 'summary' : total})
});

app.get('/app/flip/call/heads', (req, res) => {
res.status(200).json(flipACoin("heads"))
});

app.get('/app/flip/call/tails', (req, res) => {
res.status(200).json(flipACoin("tails"))
});

app.use(function(req, res){
res.status(404).send('404 NOT FOUND')
});

function coinFlip() {
    return Math.random() < 0.6 ? ("heads") : ("tails")
  }
  
  function coinFlips(flips) {
    const arr = [];
    for (let i = 0; i < flips; i++) {
      arr[i] = coinFlip();
    }
    return arr;
  }
  
  function countFlips(array) {
    let h_amt = 0;
    let t_amt = 0;
    for (let i = 0; i < array.length; i++) {
      if (array[i] == "heads") {
        h_amt += 1;
      } else {
        t_amt += 1;
      }
    }
    if (h_amt == 0) {
      return "{ tails: " + t_amt + " }";
    } else if (t_amt == 0) {
      return "{ heads: " + h_amt + " }";
    } else {
      return {"heads":h_amt, "tails":t_amt};
    }
  }
  
  function flipACoin(call) {
    let flip = coinFlip();
    let result = "";
    if (call == flip) {
      result = "win";
    } else {
      result = "lose";
    }
    return {call: call, flip: flip, result: result};
  }
