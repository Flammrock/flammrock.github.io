function HelperPlacementSystem(world) {
  this.world = world;
}
HelperPlacementSystem.getPosition = function (world,x,y) {
  return {
    x: world.mapPosData[x+','+y].position.x*world.mapPosData[x+','+y].space*2+(world.mapPosData[x+','+y].position.y%2==0?world.mapPosData[x+','+y].space:0),
    y: (world.mapPosData[x+','+y].position.y-2)*world.mapPosData[x+','+y].space/2-world.mapPosData[x+','+y].layer*world.mapPosData[x+','+y].height
  }
}
HelperPlacementSystem.getPositionEmplacement = function (world,x,y) {
  return {
    x: world.mapPosData[x+','+y].position.x*world.mapPosData[x+','+y].space*2+(world.mapPosData[x+','+y].position.y%2==0?world.mapPosData[x+','+y].space:0),
    y: world.mapPosData[x+','+y].position.y*world.mapPosData[x+','+y].space/2-world.mapPosData[x+','+y].layer*world.mapPosData[x+','+y].height
  }
}
