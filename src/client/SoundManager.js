/**
 * @author John Walley / http://www.walley.org.uk/
 */
 
define(function () { 

  var BLOOPS = ['../assets/sounds/bloop1.wav', '../../assets/sounds/bloop2.wav',
      '../../assets/sounds/bloop3.wav', '../../assets/sounds/bloop4.wav', '../../assets/sounds/bloop5.wav'];

  function SoundManager() {
    this.audio = document.createElement('audio');
    this.soundtrack = document.createElement('audio');
    this.soundtrack.setAttribute('loop', true);
    this.soundtrack.src = '../assets/sounds/soundtrack.mp3';
    this.soundtrack.volume = 0.5;
  }

  SoundManager.prototype.playBloop = function() {
    var url = BLOOPS[0];
    this.audio.src = url;
    this.audio.play();
  };

  SoundManager.prototype.playJoin = function() {
  };

  SoundManager.prototype.toggleSoundtrack = function() {
    if (this.soundtrack.paused) {
      this.soundtrack.play();
    } else {
      this.soundtrack.pause();
    }
  };

  return SoundManager;

});