function onEnabled() {
  if (WebMidi.inputs.length < 1) {
    MIDI = "No device detected.";
  } else {
    WebMidi.inputs.forEach((device, index) => {
      MIDI = `MIDI: ${index}: ${device.name}`;
    });
  } 
}

function enableMidi(){
  WebMidi.enable()
    .then(onEnabled)
    .catch((err) => alert(err));
}
