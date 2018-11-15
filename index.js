var path = require('path');
var express = require('express');
var app = express();
var fs = require('fs');
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var bodyParser = require('body-parser');
var sanity = require('./sanity.js');
var config = require('./config.json');
var db = require('./db.js')(config.es_instances);
var port = 8080;
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())

db.changeDB(config.es_index);

var agents = {
  io: io.of('agent').on('connection', async (socket) =>{
    console.log('Agent connected');
    socket.on('site',async (name)=>{
      try{
        var obj = await db.search({class:'site',name:name});
        if(obj.length < 1){
          obj = db.add({class:'site',name:name,connected:true});
        } else {
          obj = obj[0];
          obj.connected = true;
          await db.update(obj);
        }
        socket.site = name;
        agents.list[name] = {site:name,id:obj.id,sock:socket};
        clients.emit('agent',obj);
      } catch(error){
        console.log(error.message);
      }
    });
    socket.on('disconnect', async ()=>{
      try {
        var res = db.update({class:'site',id:agents.list[socket.site].id,connected:false});
        delete agents.list[socket.name];
        clients.emit('agent',res);
      } catch(error){
        console.log(error.message);
      }
    });
  }),
  list: {}
}

try{
  var clients = io.of('clients');
  clients.on('connection', async (socket) => {
    socket.on('add', async (obj) =>{
      try {
        if(obj['class'] == 'message'){ obj['datetime'] = new Date(); }
        if(!sanity.validate(obj)){ socket.emit('err',_response.bad_args); return; }
        var res = await db.add(obj);
        if(res.hasOwnProperty('err')){ socket.emit('err',res); return; }
        clients.emit(obj.class,res);
      } catch(error){
        socket.emit('error',{error: true, message: error.message});
      }
    });
    socket.on('update', async (obj) =>{
      try {
        if(!obj.hasOwnProperty('id')){ socket.emit('err',_response.bad_args); return; }
        if(!sanity.validate(obj)){ socket.emit('err',_response.bad_args); return; }
        var res = await db.update(obj);
        if(res.hasOwnProperty('error')){ socket.emit('error',res); return; }
        clients.emit(obj.class,res);
      } catch(error){
        socket.emit('error',{error: true, message: error.message});
      }
    });

    socket.on('search', async (query) =>{
      try {
        var res = await db.search(query);
        socket.emit('search',res);
      } catch(error){
        socket.emit('error',{error: true, message: error.message});
      }
    });

    socket.on('reqMessages', async (obj)=>{
      try {
        var res = await db.search({class:'message',parent:obj.id});
        socket.emit('messages',res);
      } catch(error){
        socket.emit('error',{error: true, message: error.message});
      }
    });

    socket.on('addConn', async (obj)=>{
      try {
        var res = {a:{},b:{}};
        agents.emit('host:info',obj.a_ip, async (info)=>{
          if(info.error){return;}
          res.a['host'] = await db.add(info.data);
          res.a['socket'] = await db.add({class:'socket',host:res.a.host.id,port:obj.a_port});
          agents.emit('host:info',obj.b_ip,async (info)=>{
            if(info.error){return;}
            res.b['host'] = await db.add(info.data);
            res.b['socket'] = await db.add({class:'socket',host:res.b.host.id,port:obj.b_port});
            res['connection'] = await db.add({class:'connection',sockets: [res.a.socket,res.b.socket]})
            obj.inv.con.push(res.connection.id);
            await db.update({class:'investigation',id:obj.inv.id,connections:obj.inv.con});
            clients.emit('investigation',await db.get(obj.inv.id));
          });
        });
        var res = await db.add({class:'host'});
        res = await db.add({class:'host'});
        res = await db.add({class:'socket'});
      } catch(error){
        console.log(error.message);
        socket.emit('error',{error: true, message: error.message});
      }
    });
  });
} catch(error){
  console.log(error.message);
}

app.get('/', async (req,res)=>{
  res.render('pages/index',{
    title:'Hub',
    sites: (await db.search({class:'site'})),
    investigations: (await db.search({class:'investigation'})),
    actors: (await db.search({class:'actors'})),
    hosts: (await db.search({class:'hosts'}))
  });
});

app.get('/api/investigations', async (req,res)=>{
  try{
    res.send(await db.search({class:'investigation'}));
  } catch (error){
    res.send({error:true,message:error.message});
  }
});
app.get('/api/sites', async (req,res)=>{
  try{
    res.send(await db.search({class:'site'}));
  } catch (error){
    res.send({error:true,message:error.message});
  }
});

app.post('/api/ids', async (req,res)=>{
  try{
    res.send(await db.mget(req.body.ids));
  } catch (error){
    res.send({error:true,message:error.message});
  }
});

app.post('/update/:class', async (req,res)=>{
  try{
    var data = req.body;
    data['class'] = req.params.class;
    var data = req.body;
    var dbres = await db.update(data);
    res.send(dbres);
    if(dbres.hasOwnProperty('error')){return;}
    console.log(JSON.stringify(dbres));
    clients.emit(dbres.class,dbres);
  } catch (error){
    res.send({error:true,message:error.message});
  }
});

app.post('/add/:class', async (req,res)=>{
  try{
    var data = req.body;
    data['class'] = req.params.class;
    var dbres = await db.exists(data);
    if(dbres){res.send(await db.search(data));return;}
    dbres = await db.add(data);
    if(!dbres.hasOwnProperty('error')){ clients.emit(dbres.class,dbres); }
    res.send(dbres);
  } catch (error){
    res.send({error:true,message:error.message});
  }
});

var _response = {
  bad_args: {
    error: true,
    message: 'Bad arguments'
  },
  success: {
    error: false,
    message: 'OK'
  },
  failed_reindex: {
    error: true,
    message: 'Failed reindexing, settings unchanged'
  },
  server_error: {
    error: true,
    message: 'Server error occured'
  },
  exists: {
    error: true,
    message: 'Already exists'
  }
}

app.use('/js',express.static(path.join(__dirname, 'node_modules','angular')));
app.use('/css',express.static(path.join(__dirname, 'node_modules','font-awesome','css')));
app.use('/fonts',express.static(path.join(__dirname, 'node_modules','font-awesome','fonts')));
app.use('/js',express.static(path.join(__dirname, 'node_modules','d3','dist')));
app.use('/js',express.static(path.join(__dirname, 'node_modules','jquery','dist')));
app.use('/js',express.static(path.join(__dirname, 'node_modules','jquery-ui-dist')));
app.use('/css',express.static(path.join(__dirname, 'node_modules','jquery-ui-dist')));
app.use('/js',express.static(path.join(__dirname, 'node_modules','popper.js','dist')));
app.use('/js',express.static(path.join(__dirname, 'node_modules','bootstrap','dist','js')));
app.use('/css',express.static(path.join(__dirname, 'node_modules','bootstrap','dist','css')));
app.use('/js',express.static(path.join(__dirname, 'js')));
app.use('/css',express.static(path.join(__dirname, 'css')));
app.use('/js',express.static(path.join(__dirname,'node_modules','socket.io-client','dist')));
app.use('/css',express.static(path.join(__dirname,'node_modules','video.js','dist')));
app.use('/js',express.static(path.join(__dirname,'node_modules','video.js','dist')));
app.use('/images',express.static(path.join(__dirname, 'images')));
app.use('/webfonts',express.static(path.join(__dirname, 'webfonts')));

server.listen(port, () => console.log(`Frontend app listening on port ${port}!`));
