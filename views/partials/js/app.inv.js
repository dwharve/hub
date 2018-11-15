class investigation extends base {
  constructor(obj){
    if(typeof(obj) == "string"){
      super(obj);
      super.load();
    } else if(typeof(obj) == "object"){
      super(obj.id);
      this.name = obj.name;
      this.hosts = new hosts(obj.hosts);
      this.connections = new connections(obj.connections);
      this.binaries = new binaries(obj.binaries);
      this.description = obj.description;
    } else {
      super();
    }
    this.class = 'investigation';
    this.newConnection = {
      view: false,
      loading: false,
      site: '',
      a_ip: '',
      a_port: '',
      b_ip: '',
      b_port: '',
      discard: ()=>{
        this.newConnection.site = '';
        this.newConnection.a_ip = '';
        this.newConnection.a_port = '';
        this.newConnection.b_ip = '';
        this.newConnection.b_port = '';
        this.newConnection.view = false;
        this.newConnection.loading = false;
      },
      add: ()=>{
        if(!$scope.newConnForm.$valid){
          $scope.alert.show("Invalid connection details");
          return;
        }
        this.newConnection.loading = true;
        $http.post('/add/host',{ip:this.newConnection.a_ip}).then((a_host)=>{
          if(a_host.data.error){$scope.alert.show(a_host.data.message);return;}
          $http.post('/add/host',{ip:this.newConnection.b_ip}).then((b_host)=>{
            if(b_host.data.error){$scope.alert.show(b_host.data.message);return;}
            $http.post('/add/socket',{host:a_host.data.id,port:this.newConnection.a_port}).then((a_socket)=>{
              if(a_socket.data.error){$scope.alert.show(a_socket.data.message);return;}
              $http.post('/add/socket',{host:b_host.data.id,port:this.newConnection.b_port}).then((b_socket)=>{
                if(b_socket.data.error){$scope.alert.show(b_socket.data.message);return;}
                $http.post('/add/connection',{sockets:[a_socket.data.id,b_socket.data.id],payloads:[],alerts:[]}).then((conn)=>{
                  JSON.stringify(conn);
                  if(conn.data.error){$scope.alert.show(conn.data.message);return;}
                  var newInv = this.serialize();
                  newInv.connections.push(conn.data.id);
                  console.log(JSON.stringify(newInv));
                  $http.post('/update/investigation',newInv).then((data)=>{
                    if(data.data.error){$scope.alert.show(data.data.message);return;}
                    this.newConnection.loading = false;
                    this.newConnection.a_ip = '';
                    this.newConnection.b_ip = '';
                    this.newConnection.a_port = '';
                    this.newConnection.b_port = '';
                    this.newConnection.view = false;
                  });
                });
              });
            });
          });
        });
      }
    };
    socket.on('investigation',(obj)=>{
      if(obj['error']){$scope.alert.show(obj.message);return;}
      if(this.id == obj.id){
        this.name = obj.name;
        this.hosts = new hosts(obj.hosts);
        this.connections = new connections(obj.connections);
        this.binaries = new binaries(obj.binaries);
        this.description = obj.description;
        flashPage('bluegreen',3,1000);
      }
    });
  }

  serialize(){
    var tmp = super.serialize();
    delete tmp.newConnection;
    return tmp;
  }

  remove(obj){
    if(typeof(obj) != 'object'){return;}
    var tmp = this.serialize();
    if(tmp.hosts.indexOf(obj.id) >= 0){tmp.hosts.splice(tmp.hosts.indexOf(obj.id),1);}
    if(tmp.connections.indexOf(obj.id) >= 0){tmp.connections.splice(tmp.connections.indexOf(obj.id),1);}
    if(tmp.binaries.indexOf(obj.id) >= 0){tmp.binaries.splice(tmp.binaries.indexOf(obj.id),1);}

  }
}
