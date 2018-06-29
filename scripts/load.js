const Reference = new WeakMap();
window.addEventListener( 'DOMContentLoaded', ( interact ) => {
  const game = new Game()
    .init();
  game.levelOne();
} );