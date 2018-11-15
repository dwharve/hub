class hosts extends baseset{
  constructor(ids){
    super('Hosts',host);
    super.load(ids);
    socket.on('host',(data)=>{
      if(this.view && this.selected.id == data.id){
        flashPage('rgb(163, 213, 255)',3,200);
      }
    });
  }
}
