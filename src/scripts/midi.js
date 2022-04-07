function onEnabled() {
  const midi = document.getElementById("midi-device")
  if (WebMidi.inputs.length < 1) {
    midi.innerHTML += "No device detected.";
  } else {
    WebMidi.inputs.forEach((device, index) => {
      midi.innerHTML += `midi: ${index}: ${device.name} <br>`;
    });
  } 
}
