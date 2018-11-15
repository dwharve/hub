var config = require('./config.json');
function sanity(){
  var that = this;
  that.check = (names,obj)=>{
    for(i=0;i<names.length;i++){
      if(!obj.hasOwnProperty(names[i])){
        return false;
      }
      if(obj[names[i]] == ""){
        return false;
      }
    }
    return true;
  };

  that.validate = (obj) =>{
    if(!obj.hasOwnProperty('class')){ return false; }
    if(Object.values(obj).filter( d => { return d == ""; }).length > 0)
    { return false; }
    for( field in config[obj.class]){
      if(!obj.hasOwnProperty(field)){ return false; }
    }
    return true;
  };
}
module.exports = new sanity();
