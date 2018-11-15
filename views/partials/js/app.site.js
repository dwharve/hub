class site extends base {
  constructor(obj){
    if(typeof(obj) == "string"){
      super(obj);
      super.load();
    } else if(typeof(obj) == "object"){
      super(obj.id);
      this.name = obj.name;
    } else {
      super();
    }
    this.class = 'site';
    socket.on('site',(obj)=>{
      if(obj.id == this.id){
        var keys = Object.keys(obj);
        for(i=0;i<keys.length;i++){
          this[keys[i]] = obj[keys[i]];
        }
      }
    });
  }
}
