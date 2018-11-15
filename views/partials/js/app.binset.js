class binaries extends baseset{
  constructor(ids){
    super('Binaries',binary);
    super.load(ids);
    socket.on('binary',(data)=>{
      if(this.view && this.selected.id == data.id){
        flashPage('rgb(163, 213, 255)',3,200);
      }
    });
  }
}
