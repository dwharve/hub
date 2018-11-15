class sites extends baseset{
  constructor(ids){
    super('Sites',site);
    this.loading = true;
    $http.get('/api/sites').then((data)=>{
      for(var i=0;i<data.data.length;i++){
        this.add(new site(data.data[i]));
      }
      this.view = true;
      this.loading = false;
    });
  }
}
