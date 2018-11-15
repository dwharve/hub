class payloads extends baseset{
  constructor(ids){
    super('Moloch Sessions',connection);
    super.load(ids);
  }
}
