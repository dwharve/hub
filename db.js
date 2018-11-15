var elasticsearch = require('elasticsearch');
var bodybuilder = require('bodybuilder');
function db(es_instances){
  var that = this;
  var index = 'tickets';
  var clients = [];
  for(var i=0;i<es_instances.length;i++){
    clients.push(new elasticsearch.Client({
      host: es_instances[i]
    }));
  }

  var client = clients[0];

  that.changeDB = async (ind)=>{
    index = ind;
    var resp = await client.indices.exists({'index': index});
    if(!resp){
      resp = await client.indices.create({
        index:index,
        body:{
          settings:{
            index:{
              number_of_shards:1,
              number_of_replicas:1
            }
          },
          mappings:{
            _doc:{
              properties:{
                class: { type: "text" },
                name: { type: "text" },
                ip: { type: "ip" },
              }
            }
          }
        }
      });
      if(!resp){
        console.log("Unable to create index, exiting..."); process.exit();
      }else{
        console.log("Created index " + index);
      }
    }
  };

  that.get = async (id)=>{
    var res = await that.search({id:id});
    if(res.hits.total > 0){ return res.hits.hits[0]; }
    return null;
  }

  that.add = async (obj)=>{
    try{
      var res = obj;
      var id = await that.index(res);
      if(id.result == "created"){ res['id'] = id._id; return res; }
      return {error: true, message:"Unable to add "+res.class};
    } catch {
      return {error: true, message:"DB - Server error"};
    }
  }

  that.exists = async (obj)=>{
    try{
      if(obj.hasOwnProperty('id')){
        if(obj.id){
          return await client.exists({index:index,id:obj.id});
        }
      }
      var resp =  await that.search(obj,['id']);
      return resp.length > 0;
    } catch {
      return null;
    }
  }

  that.mget = async (ids) => {
    try{
      var res = await client.mget({index:index,type:'_doc',body:{ids:ids}});
      for(i=0;i<res.docs.length;i++){
        res.docs[i]._source['id'] = res.docs[i]._id;
        res.docs[i] = res.docs[i]._source;
      }
      return res.docs;
    } catch {
      return {error: true, message: "DB - Server error"};
    }
  };

  that.search = async (query,storedFields) => {
    try{
      var built = bodybuilder();
      if(typeof(query) != 'object'){return {error:true,message:"DB - Server search error"};}
      var keys = Object.keys(query);
      for(var i=0;i<keys.length;i++){
        built = built.addQuery('match',keys[i],query[keys[i]]);
      }
      built = built.build();
      var res = {};
      if(storedFields){
        built['stored_fields'] = storedFields;
        res = await client.search({index:index,body:built});
      }else{
        res = await client.search({index:index,body:built});
      }
      for(var i=0;i<res.hits.hits.length;i++){
        res.hits.hits[i]._source['id'] = res.hits.hits[i]._id;
        res.hits.hits[i] = res.hits.hits[i]._source;
      }
      return res.hits.hits;
    } catch(error){
      return {error: true, message: error.message};
    }
  }

  that.index = async (obj) => {
    try{
      return await client.index({index:index,type:'_doc',body:obj});
    } catch {
      return {result: "error"};
    }
  };

  that.update = async (obj) => {
    try{
      var res = await client.update({index:index,type:'_doc',id:obj.id,body:{doc:obj}});
      if(res.result != "updated"){return {error: true, message:"Unable to update "+obj.class}; }
      res = await client.get({index:index,type:'_doc',id:obj.id});
      res._source['id'] = obj.id;
      return res._source;
    } catch(error){
      return {error: true, message: error.message};
    }
  };

}

module.exports = (es_instances)=>{return new db(es_instances)};
