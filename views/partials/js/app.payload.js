class payload extends base {
  constructor(obj){
    if(typeof(obj) == "string"){
      super(obj);
      super.load();
    } else if(typeof(obj) == "object"){
      super(obj.id);
      this.moloch_id = obj.moloch_id;
      this.payload = obj.payload;
    } else {
      super();
    }
    this.class = 'payload';
    socket.on('payload',(obj)=>{
      if(obj.id == this.id){
        var keys = Object.keys(obj);
        for(i=0;i<keys.length;i++){
          this[keys[i]] = obj[keys[i]];
        }
      }
    });
  }
}
