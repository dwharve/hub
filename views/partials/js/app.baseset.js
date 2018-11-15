class baseset{
  constructor(name,colClass){
    this.displayName = name;
    this.collectionClass = colClass;
    this.collection = {};
    this.length = 0;
    this.loading = false;
    this.view = false;
  }

  toArray(){
    return Object.entries(this.collection);
  }

  select(el){
    this.selected = el;
  }

  load(ids){
    if(ids == null){return;}
    if(typeof(ids) != "object"){return;}
    if(ids.length < 1){return;}
    $http.post('/api/ids',{ids:ids}).then((data)=>{
      if(data.data.hasOwnProperty('error')){
        $scope.alert.show(data.data.message);
        return;
      }
      for(var i=0;i<data.data.length;i++){
        this.add(new this.collectionClass(data.data[i]));
      }
      this.loading = false;
    });
  };

  get(id){
    if(id == null){return;}
    if(typeof(id) != "string"){return;}
    if(!this.collection.hasOwnProperty(id)){return;}
    return this.collection[id];
  }

  add(item){
    if(item == null){return;}
    if(typeof(item) != "object"){return;}
    if(!item.hasOwnProperty('id')){return;}
    this.collection[item.id] = item;
    this.length = Object.keys(this.collection).length;
  };

  remove(item){
    if(item == null){return;}
    if(typeof(item) != typeof(this.collectionClass)){return;}
    if(!item.hasOwnProperty('id')){return;}
    delete this.collection[item.id];
    this.length = Object.keys(this.collection).length;
  }

  flush(){
    this.collection = {};
    this.length = Object.keys(this.collection).length;
  }
}
