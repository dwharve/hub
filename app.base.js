function base(){
  var that = this;
  var events = [];
  var addValid = [];
  var setValid = [];

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
    if(!addValid.includes(kind)){ return false; }
    if(that[kind].filter( d => { return d == el; } ).length > 0 ){ return false; }
    that[kind].push(el);
    fireEvent(kind,el);
    return true;
  };

  this.set = (kind,val)=>{
    if(!setValid.includes(kind)){ return false; }
    if(that[kind] == val){ return false; }
    that[kind] = val;
    fireEvent(kind,val);
    return true;
  }

}
