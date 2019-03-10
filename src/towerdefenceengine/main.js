function create() {
  world = new World();
  world.DISPLAY_COORDINATE = false;
  // on génère la terre de façon a obtenir un carré
  Octogone.createSquare(16,function(x,y){
    new Octogone(world,{
      position: {x:x,y:y},
      width: 100,
      color: {
        r: 138,
        g: 180,
        b: 73
      },
    });
  });

  // On ajoute un nouveau type de tour
  new TypeBuilding(world,"Canon" /* Nom du Type de la tour */,{

    // SpriteSheet Settings
    path: Building1, // Building1 contain the base64 Uri of image
    data: [1,2,3,4,5,6,7,8,9,10,11], // Emplacement du SpriteSheet mis bout à bout dans l'animation
    width: 256, // Width de l'image et pas de l'image SpriteSheet
    height: 454, // Height de l'image et pas de l'image SpriteSheet
    tick: 125, // Durée d'une image
    factor: 'auto', // Coefficient d'agrandissement

    // Building Settings
    health_max: 100, // sa vie maximal
    damage: 1, // ses dégats
    level: 1, // son niveau
    timeToBeBuild: 1000 * 3 // durée de construction

  });
  new TypeBuilding(world,"Magic" /* Nom du Type de la tour */,{

    // SpriteSheet Settings
    path: Building2, // Building2 contain the base64 Uri of image
    data: [1,2,3,4,5,6], // Emplacement du SpriteSheet mis bout à bout dans l'animation
    width: 1792/7, // Width de l'image et pas de l'image SpriteSheet
    height: 512, // Height de l'image et pas de l'image SpriteSheet
    tick: 125, // Durée d'une image
    factor: 'auto', // Coefficient d'agrandissement

    // Building Settings
    health_max: 75, // sa vie maximal
    damage: 4, // ses dégats
    tickDamage: 2000,
    level: 1, // son niveau
    timeToBeBuild: 1000 * 10 // durée de construction

  });
  new TypeBuilding(world,"Store" /* Nom du Type de la tour */,{

    // SpriteSheet Settings
    path: Building3, // Building1 contain the base64 Uri of image
    data: [0], // Emplacement du SpriteSheet mis bout à bout dans l'animation
    width: 640, // Width de l'image et pas de l'image SpriteSheet
    height: 640, // Height de l'image et pas de l'image SpriteSheet
    tick: 125, // Durée d'une image
    factor: 'auto', // Coefficient d'agrandissement

    sizeEmplacement: 2, // emplacement occupé (ici 2x2)

    stockage: 500,
    onAdd: function(world) { // dès qu'un batiment de ce type est ajouté
      world.currentPlayer.BuildingStockage.push(this);
      world.currentPlayer.update();
    },

    // Building Settings
    health_max: 500, // sa vie maximal
    damage: 0, // ses dégats
    level: 1, // son niveau
    timeToBeBuild: 1000 * 30, // durée de construction,

    yCorrection: 100

  });

  // On ajoute un nouveau type de "montre"
  new IsoMetricMobGenerator(world,'Monster_1',{
    speed: 1
  });
  new IsoMetricMobGenerator(world,'Monster_2',{
    speed: 1,
    size: 5,
    health: 100,
    yCorrection: 100
  });

  // on créé un mob Mob
  //var m = new Mob(world,{x:0,y:0,type:'Monster_1'});
  //var pos = HelperPlacementSystem.getPositionEmplacement(world,2,1);
  //m.move(pos.x,pos.y-m.spriteSheet.height/2);

  // on créé un nouveau "chemin"
  var path = new Way(world);

  // on ajoute des points à notre chemin (en les coloriant, ici en blanc)
  path.addPoint(1,-7,-1,{r:0,g:0,b:255}); // Point de départ
  path.addPoint(1,-3,-1,{r:186,g:140,b:93});
  path.addPoint(-3,-3,-1,{r:186,g:140,b:93});
  path.addPoint(-3,5,-1,{r:186,g:140,b:93});
  path.addPoint(2,5,-1,{r:186,g:140,b:93});
  path.addPoint(2,8,-1,{r:255,g:0,b:255}); // Point d'arrivé

  // et on relie les points entre eux !
  path.link();

  // on fait spawn des mobs
  path.infiniteWave(5 /* count */, 1 /* level not yet connected */);

  // on créé quelque tour dès le départ
  /*new Building(world,{x:0,y:0,type:'Canon'});
  new Building(world,{x:-2,y:-7,type:'Canon'});
  new Building(world,{x:4,y:2,type:'Canon'});
  new Building(world,{x:-1,y:5,type:'Canon'});*/

  /** On créé un joueur and this name is JHON CENA!!! **/
  var jeankevin = new Player();
  jeankevin.update(); // on update l'UI pour qu'il affiche l'argent actuel, cette fonction ne sors pas de nul part regarde la classe Player
  world.currentPlayer = jeankevin;

  update();
}

function update() {
  window.requestAnimationFrame(update);

  world.draw();
}
