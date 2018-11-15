class base{
  constructor(id){
    this.id = id;
    this.class = '';
    this.description = '';
    this.edited = '';
    this.editingDescription = false;
    this.loading = false;
  }

  editDescription(){
    this.edited = this.description;
    this.editingDescription = true;
  }

  cancelEditDescription(){
    this.edited = '';
    this.editingDescription = false;
  }

  load(){
    if(this.id == null){return;}
    if(typeof(this.id) != "string"){return;}
    if(this.id == ''){return;}
    this.loading = true;
    $http.post('/api/ids',{ids:[this.id]}).then((data)=>{
      this.loading = false;
      if(data.hasOwnProperty('error')){
        $scope.alert.show(data.message);
        return;
      }
      if(!data.hasOwnProperty('data')){return;}
      if(data.data.length < 1){return;}
      var keys = Object.keys(data.data[0]);
      for(var i=0;i<keys.length;i++){
        this[keys[i]] = data.data[0][keys[i]];
      }
    });
  };

  serialize(){
    var tmp = JSON.parse(JSON.stringify(this));
    var keys = Object.keys(tmp);
    for(var i=0;i<keys.length;i++){
      if(tmp[keys[i]].hasOwnProperty('collection')){
        tmp[keys[i]] = Object.keys(this[keys[i]].collection);
      }
    }
    if(tmp.edited != ''){tmp.description = tmp.edited};
    delete tmp.commit;
    delete tmp.load;
    delete tmp.loading;
    delete tmp.this;
    delete tmp.edited;
    delete tmp.editDescription;
    delete tmp.editingDescription;
    delete tmp.$$hashKey;
    return tmp;
  }

  commit(){
    if(this.id == null || this.class == null){return;}
    if(typeof(this.id) != "string" || typeof(this.class) != "string"){return;}
    if(this.id == '' || this.class == ''){return;}
    var obj = this.serialize();
    socket.emit('update',obj);
    this.edited = '';
    this.editingDescription = false;
  };
  
}
