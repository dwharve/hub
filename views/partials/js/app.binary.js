function binary(obj){
  var that = this;
  var events = [];

  this.filenames = obj.filenames;
  this.md5 = obj.md5;
  this.hosts = obj.hosts;
  this.cuckoo_ids = obj.cuckoo_ids;
  this.cuckoo_scores = obj.cuckoo_scores;
  this.parent_child = obj.parent_child;
  this.pids = obj.pids;
  this.description = obj.description;

  this.description = {
    value: inv.description,
    edit: null,
    save: ()=>{
      if(that.description.edit != null){
        socket.emit('update',{class:'binary',id:that.id,description:that.description.edit});
        that.description.edit = null;
      }
    }
  };

  socket.on('binary',(data)=>{
    if(data.id == that.id){
      this.filenames = data.filenames;
      this.md5 = data.md5;
      this.hosts = data.hosts;
      this.cuckoo_ids = data.cuckoo_ids;
      this.parent_child = data.parent_child;
      this.pids = data.pids;
      this.description = data.description;
    }
  });

  this.on = (event, cb)=>{
    that.events.push({event: event, cb:cb});
  };

  var fireEvent = (event,data)=>{
    var cbs = events.filter( d => { return d.event == event; });
    if(cbs.length > 0){
      for (cb in cbs) {
        cb(data);
      }
    }
  };

}
