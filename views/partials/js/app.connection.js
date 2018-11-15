class connection extends base {
  constructor(obj){
    if(typeof(obj) == "string"){
      super(obj);
      super.load();
    } else if(typeof(obj) == "object"){
      super(obj.id);
      this.sockets = new sockets(obj.sockets);
      this.payloads = new payloads(obj.payloads);
      this.alerts = obj.alerts;
    } else {
      super();
    }
    this.class = 'connection';
    socket.on('connection',(obj)=>{
      if(obj.id == this.id){
        var keys = Object.keys(obj);
        for(i=0;i<keys.length;i++){
          this[keys[i]] = obj[keys[i]];
        }
      }
    });
  }
}
