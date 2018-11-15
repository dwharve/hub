class investigations extends baseset{
  constructor(){
    super('Investigations',investigation);
    this.loading = true;
    $http.get('/api/investigations').then((data)=>{
      for(var i=0;i<data.data.length;i++){
        this.add(new investigation(data.data[i]));
      }
      this.view = true;
      this.loading = false;
    });
  }
}
