/*
 *The structure defining the layout and behaviour of a slot
 *that can either be switched On, or Off
 */
class Slot {
  constructor() {
    this.clicked = false;
    this.lit = false;
  }
  init( oGame ) {
    this.oGame = oGame;
    this.layout = document.createElement( 'DIV' );
    this.layout.classList.add( 'slot' );
    const id = `slot${Date.now()}`;
    this.layout.setAttribute( 'id', id );
    this.layout.addEventListener( 'click', e => {
      return this.click();
    } );
    return this;
  }
  deafen() {
    //remove event listeners
  }
  click() {
    const player = this.oGame.player;
    const ref = Reference.get( this.oGame )
      .objectivity;
    if ( this.lit ) {
      //add to score
      player.score += ref.scorePerSuccess;
    } else {
      //delete from score;
      player.score += ref.scorePerFailure;
    }
    const scorer = document.querySelector( '.score' );
    scorer.innerHTML = '';
    scorer.innerHTML = `<h2>${player.score}</h2>`;
  }
  switchOn() {
    this.lit = true;
    this.layout.classList.add( 'lit' );
  }
  switchOff() {
    this.lit = false;
    this.layout.classList.remove( 'lit' );
  }
}
/*
 *The game engine
 *defines the flow and keeps time
 */
class Game {
  constructor() {}
  /*
   *@init resets statistics and scores before initating a new level of play
   */
  init() {
    this.grid = document.querySelector( `.grid` );
    this.slots = [];
    this.clicks = 0;
    this.time = 0;
    this.time_before = false;
    this.timeOver = false;
    this.interval = null;
    this.player = new Player();
    return this;
  }
  /*
   *borrowed as is from MDN to generate random indices
   */
  getRandomIndex( min, max ) {
    min = Math.ceil( min );
    max = Math.floor( max );
    return Math.floor( Math.random() * ( max - min + 1 ) ) + min;
  }
  /*
   *@levelOne defines the parameters of the game on level 1
   */
  levelOne() {
    //set level of play - used to restart a game
    Reference.set( this, {
      level: 1,
      objectivity: {
        passingScore: 755,
        scorePerFailure: -5,
        scorePerSuccess: 25
      }
    } );
    this.initMatrixRows = 3;
    this.initMatrixCols = 3;
    this.draw();
    this.keepTime();
    this.randomize();
  }
  /*
   *@levelTwo defines the parameters of the game on level two of play
   */
  levelTwo() {
    //set level of play - used to restart a game
    Reference.set( this, {
      level: 2,
      objectivity: {
        passingScore: 1755,
        scorePerFailure: -25,
        scorePerSuccess: 75
      }
    } );
    this.initMatrixRows = 6;
    this.initMatrixCols = 3;
    this.draw();
    this.keepTime();
    this.randomize();
  }

  randomize() {
    this.interval = setInterval( _ => {
      const slots = this.slots;
      const len = slots.length;
      const randomIndex = this.getRandomIndex( 0, len - 1 );
      this.highlight( randomIndex );
    }, 1200 );
  }

  draw() {
    this.grid.innerHTML = '';
    const scorer = document.querySelector( '.score' );
    scorer.innerHTML = '';
    let rows = 0;
    while ( rows < this.initMatrixRows ) {
      for ( let cols = 0; cols < this.initMatrixCols; cols++ ) {
        const card = new Slot()
          .init( this );
        this.grid.appendChild( card.layout );
        this.slots.push( card );
      }
      rows++;
    }
  }
  highlight( index = 0 ) {
    const slot = this.slots[ index ];
    const layout = slot.layout;
    this.slots.map( slot => {
      slot.switchOff();
    } );
    slot.switchOn();
  }
  keepTime() {
    //time this animation frame
    const time_now = Date.now();
    //time last animation frame
    this.time_before = ( this.time_before === false ) ? time_now : this.time_before;
    //diff in time between two frames
    const diff_in_time = time_now - this.time_before;
    //set time last animation frame to time now this animation frame
    //on the next frame, it is handy to find the diff
    this.time_before = time_now;
    //Actual time elapsed since the game began
    //sum of differences between animation frames
    this.time += diff_in_time;
    const nextFrame = () => {
      this.ticktock = window.requestAnimationFrame( () => {
        //update panel time
        this.tick();
        //keep counting
        return this.keepTime();
      } );
    };
    const finish = () => {
      this.ticktock = window.cancelAnimationFrame( this.ticktock );
      return this.finish();
    }; //is the game time limit reached?
    const gameOver = this.objectiveMet() || this.isTheGameTimeLimitMet();
    return ( gameOver ) ?
      //if time is up, stop the game
      //show stats
      finish() :
      //count down/up timers
      nextFrame();

  }
  isTheGameTimeLimitMet() {
    if ( this.time >= 60060 ) {
      return true;
    }
    return false;
  }
  objectiveMet() {
    const referee = Reference.get( this );
    const levelOfPlay = referee.level;
    const passingScore = referee.objectivity.passingScore;
    if ( this.player.score >= passingScore ) {
      return true;
    }
    return false;
  }
  finish() {
    clearInterval( this.interval );
    const level = Reference.get( this )
      .level;
    if ( level === 1 && !this.isTheGameTimeLimitMet() ) {
      this.init()
        .levelTwo();
    }
    //remove event listeners
    this.slots.map( slot => {
      slot.deafen();
    } );
    //store scores
    if ( window.localStorage ) {
      window.localStorage.setItem( `level${level}:-:${this.player.name}`, `${this.player.score}` );
    }
  }
  tick() {
    const panelTimer = document.querySelector( '.timer' );
    let readableStatsTime = new Date( this.time )
      .toISOString()
      .slice( 11, -5 );
    panelTimer.innerHTML = `<h2>${readableStatsTime}</h2>`
  }

}

class Player {
  constructor( name = 'Player1' ) {
    this.name = name;
    this.score = 0;
  }
}