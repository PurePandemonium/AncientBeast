/*
*
*	Headless abilities
*
*/
G.abilities[39] =[

// 	First Ability: Maggot Infestation
{
	//	Type : Can be "onQuery","onStartPhase","onDamage"
	trigger : "onStartPhase",

	// 	require() :
	require : function(){
		if( !this.atLeastOneTarget( this.creature.getHexMap(inlineback2hex),"ennemy" ) ) return false;
		return this.testRequirements();
	},

	//	activate() :
	activate : function() {
		var ability = this;
		var creature = this.creature;

		if( this.atLeastOneTarget( this.creature.getHexMap(inlineback2hex),"ennemy" ) ){
			this.end();
			this.setUsed(false); //Infinite triggering
		}else{
			return false;
		}

		var targets = this.getTargets(this.creature.getHexMap(inlineback2hex));

		targets.each(function(){
			if( !(this.target instanceof Creature) ) return;

			var trg = this.target;

			var effect = new Effect(
				"Infested", //Name
				creature, //Caster
				trg, //Target
				"onStartPhase", //Trigger
				{ alterations : ability.effects[0] } //Optional arguments
			);

			trg.addEffect(effect,"%CreatureName"+trg.id+"% has been infested");
		});
	},
},



// 	Second Ability: Scapel Limbs
{
	//	Type : Can be "onQuery","onStartPhase","onDamage"
	trigger : "onQuery",

	// 	require() :
	require : function(){
		var crea = this.creature;

		if( !this.testRequirements() ) return false;

		//At least one target
		if( !this.atLeastOneTarget(crea.getHexMap(frontnback2hex),"ennemy") ){
			this.message = G.msg.abilities.notarget;
			return false;
		}
		return true;
	},

	// 	query() :
	query : function(){
		var ability = this;
		var crea = this.creature;

		G.grid.queryCreature({
			fnOnConfirm : function(){ ability.animation.apply(ability,arguments); },
			team : 0, //Team, 0 = ennemies
			id : crea.id,
			flipped : crea.flipped,
			hexs : crea.getHexMap(frontnback2hex),
		});
	},


	//	activate() :
	activate : function(target,args) {
		var ability = this;
		ability.end();

		var d = { pierce : 12 };

		//Bonus for fatigued foe
		d.pierce = target.endurance <= 0 ? d.pierce * 2 : d.pierce;

		var damage = new Damage(
			ability.creature, //Attacker
			"target", //Attack Type
			d, //Damage Type
			1, //Area
			[]	//Effects
		);

		var dmg = target.takeDamage(damage);
	},
},



// 	Third Ability: Whip Move
{
	//	Type : Can be "onQuery","onStartPhase","onDamage"
	trigger : "onQuery",

	directions : [0,1,0,0,1,0],
	minRange: 3,
	range: 6,

	require : function(){
		if( !this.testRequirements() ) return false;

		var crea = this.creature;
		
		var x = (crea.player.flipped) ? crea.x-crea.size+1 : crea.x ;

		var test = this.testDirection({
			team : "both",
			flipped : crea.player.flipped,
			x : x,
			directions : this.directions,
			minDistance : this.minRange,
			distance : this.range,
			sourceCreature : this.creature,
		});

		if( !test ){
			this.message = G.msg.abilities.notarget;
			return false;
		}
		return true;
	},

	// 	query() :
	query : function(){
		var ability = this;
		var crea = this.creature;
		
		if(this.isUpgraded()) this.range = 8;

		G.grid.queryDirection({
			fnOnConfirm : function(){ ability.animation.apply(ability,arguments); },
			team : 3,  // Both
			id : crea.id,
			requireCreature : true,
			sourceCreature : crea,
			flipped: crea.player.flipped,
			x : crea.x,
			y : crea.y,
			directions : this.directions,
			minDistance : this.minRange,
			distance : this.range
		});
	},


	//	activate() :
	activate : function(path,args) {
		// new ability
		var ability = this;
		ability.end();

		var target = path.last().creature;
		path = path.filter( function(){	return !this.creature; }); //remove creatures
		console.log(path);
		
		var creatureHexes = (args.direction==4) ? crea.hexagons[crea.size-1] : crea.hexagons[0] ;
		path.filterCreature(false,false);
		path.unshift(creatureHexes); //prevent error on empty path
		
		
		// depends on target size
		var destination = path.last(); 
		
		/*
		var ability = this;
		var crea = this.creature;
		var path = path;
		var target = path.last().creature;
		path = path.filter( function(){	return !this.creature; }); //remove creatures
		ability.end();
		
		console.log(path);
		
		
		//Movement
		var creature = (args.direction==4) ? crea.hexagons[crea.size-1] : crea.hexagons[0] ;
		path.filterCreature(false,false);
		path.unshift(creature); //prevent error on empty path
		var destination = path.last();
		var x = (args.direction==4) ? destination.x+crea.size-1 : destination.x ;
		destination = G.grid.hexs[destination.y][x];
		
		crea.moveTo(destination,{
			ignoreMovementPoint : true,
			ignorePath : true,
			callback : function(){

				var interval = setInterval(function(){
					if(!G.freezedInput){
						clearInterval(interval);
						G.activeCreature.queryMove();
					}
				},100);
			},
		}); 
		*/
	},
},



// 	Fourth Ability: Boomerang Throw
{
	//	Type : Can be "onQuery","onStartPhase","onDamage"
	trigger : "onQuery",

	damages : {
		slash : 10,
		crush : 5,
	},

	map : [ [0,0,0,0,0],
		   [0,1,1,1,1],
			[0,1,1,1,1],//origin line
		   [0,1,1,1,1]],

	// 	require() :
	require : function(){
		if( !this.testRequirements() ) return false;
		return true;
	},

	// 	query() :
	query : function(){
		var ability = this;
		var crea = this.creature;

		this.map.origin = [0,2];

		G.grid.queryChoice({
			fnOnConfirm : function(){ ability.animation.apply(ability,arguments); },
			team : 3,
			requireCreature : 0,
			id : crea.id,
			flipped : crea.flipped,
			choices : [
				crea.getHexMap(this.map),
				crea.getHexMap(this.map,true),
			],
		})

	},


	//	activate() :
	activate : function(hexs) {

		damages = {
			slash : 5,
			crush : 5,
		}

		var ability = this;
		ability.end();

		ability.areaDamage(
			ability.creature, //Attacker
			"zone", //Attack Type
			damages, //Damage Type
			[],	//Effects
			ability.getTargets(hexs), //Targets
			true //Notriggers avoid double retailiation
		);

		ability.areaDamage(
			ability.creature, //Attacker
			"zone", //Attack Type
			damages, //Damage Type
			[],	//Effects
			ability.getTargets(hexs) //Targets
		);
	},
}
];
