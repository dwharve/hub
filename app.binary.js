function binary(){
  var that = this;
  var events = [];
  var addValid = ['filename','path','cuckoo','parent'];
  var setValid = ['md5','description'];

  this.filename = [];
  this.md5 = '';
  this.path = [];
  this.cuckoo = [];
  this.parent = [];
  this.description = '';

  this.on = (event, cb)=>{
    that.events.push({event: event, cb:cb});
  };

  var fireEvent = (event,data)=>{
    var cbs = events.filter( d => { return d.event == event; });
    if(cbs.length > 0){
      for cb in cbs {
        cb(data);
      }
    }
  };

  this.add = (kind,el)=>{
    var valid = ['ip','mac','mem_dump','disk_image','binary','hostname']
    if(!valid.includes(kind)){ return false; }
    if(that[kind].filter( d => { return d == el; } ).length > 0 ){ return false; }
    that[kind].push(el);
    fireEvent(kind,el);
    return true;
  };

  this.set = (kind,val)=>{
    var valid = ['vol_profile','description'];
    if(!valid.includes(kind)){ return false; }
    if(that[kind] == val){ return false; }
    that[kind] = val;
    fireEvent(kind,val);
    return true;
  }

}
