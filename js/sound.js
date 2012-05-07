//from http://www.html5rocks.com/en/tutorials/canvas/notearsgame/
var Sound = (function($) {
  var format = $.browser.webkit ? ".mp3" : ".wav";
  var soundPath = "audio/";
  var sounds = {};

  function loadSoundChannel(name,volume) {
    var sound = $('<audio />').get(0);
    sound.src = soundPath + name + format;
    sound.volume = volume || 1;

    return sound;
  }
  
  function Sound(name, maxChannels) {
    return {
      play: function() {
        Sound.play(name, maxChannels);
      },

      stop: function() {
        Sound.stop(name);
      }
    }
  }

  return $.extend(Sound, {
    play: function(name, volume, maxChannels) {
      // Note: Too many channels crash browsers
      maxChannels = maxChannels || 4;

      if(!sounds[name]) {
        sounds[name] = [loadSoundChannel(name,volume)];
      }

      var freeChannels = $.grep(sounds[name], function(sound) {
        return sound.currentTime == sound.duration || sound.currentTime == 0
      });

      if(freeChannels[0]) {
        try {
          freeChannels[0].currentTime = 0;
        } catch(e) {
        }
        freeChannels[0].play();
      } else {
        if(!maxChannels || sounds[name].length < maxChannels) {
          var sound = loadSoundChannel(name,volume);
          sounds[name].push(sound);
          sound.play();
        }
      }
    },

    stop: function(name) {
      if(sounds[name]) {
        $(sounds[name]).get(0).pause();
      }
    }
  });
}(jQuery));
