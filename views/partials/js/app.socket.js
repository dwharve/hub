class hsocket extends base {
  constructor(obj){
    if(typeof(obj) == "string"){
      super(obj);
      super.load();
    } else if(typeof(obj) == "object"){
      super(obj.id);
      this.host = new host(obj.host);
      this.port = obj.port;
    } else {
      super();
    }
    this.class = 'socket';
    socket.on('socket',(obj)=>{
      if(obj.id == this.id){
        this.host = new host(obj.host);
        this.port = obj.port;
      }
    });
  }
}
