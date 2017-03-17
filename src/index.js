import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';
import cluster from 'cluster';
import indexRoutes from './routes';

if(cluster.isMaster) {
  var numWorkers = require('os').cpus().length;
  
  console.log('Master cluster setting up ' + numWorkers + ' workers...');

  for(var i = 0; i < numWorkers; i++){
    cluster.fork();
  }
  
  cluster.on('online', function(worker) {
    console.log('Worker ' + worker. process.pid + ' is online');
  });

  cluster.on('exit', function(worker, code, signal) {
    console.log('Worker ' + worker.process.pid + ' died with code: ' + code + ',and signal: ' + signal);
    console.log('Starting a new worker');
    cluster.fork();
  });
} else {
  const PORT = process.env.PORT || 8080;
  const app = express();
  app.all('/*', function(req, res) {
    res.send('process ' + process.pid + ' says hello!').end();
  });

  app
    .use(cors())
    .use(bodyParser.urlencoded({ extended: true }))
    .use(bodyParser.json())
    .use(indexRoutes);

  app.listen(PORT, function() {
    console.log('Process ' + process.pid + ' is listening to all incoming requests');
  });
}
