function onEnabled() {
  if (WebMidi.inputs.length < 1) {
    midi = "No device detected.";
  } else {
    WebMidi.inputs.forEach((device, index) => {
      midi = `midi: ${index}: ${device.name}`;
    });
  } 
}

function enableMidi(){
  WebMidi.enable()
    .then(onEnabled)
    .catch((err) => alert(err));
}
