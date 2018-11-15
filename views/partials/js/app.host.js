class host extends base{
  constructor(obj){
    if(typeof(obj) == "string"){
      super(obj);
      super.load();
    } else if(typeof(obj) == "object"){
      super(obj.id);
      this.ip = obj.ip;
      this.macs = obj.macs;
      this.hostnames = obj.hostnames;
      this.mem_dumps = obj.mem_dumps;
      this.disk_images = obj.disk_images;
      this.vol_profile = obj.vol_profile;
      this.description = obj.description;
    } else {
      super();
    }
    this.class = 'host';
    socket.on('host',(obj)=>{
      if(obj.id == this.id){
        var keys = Object.keys(obj);
        for(i=0;i<keys.length;i++){
          this[keys[i]] = obj[keys[i]];
        }
      }
    });
  }
}
