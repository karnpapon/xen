(async function() {
  await ImGui.default();
  // const canvas = document.getElementById("output");
  const devicePixelRatio = window.devicePixelRatio || 1;
  canvas.width = canvas.scrollWidth * devicePixelRatio;
  canvas.height = canvas.scrollHeight * devicePixelRatio;
  window.addEventListener("resize", () => {
    const devicePixelRatio = window.devicePixelRatio || 1;
    canvas.width = canvas.scrollWidth * devicePixelRatio;
    canvas.height = canvas.scrollHeight * devicePixelRatio;
  });

  ImGui.CreateContext();
  ImGui_Impl.Init(canvas);

  ImGui.StyleColorsClassic();

  const clear_color = new ImGui.ImVec4(0.45, 0.55, 0.60, 1.00);

  let buf = "Quick brown fox";
  let f = 0.6;
  distSpeed = 0.004

  let done = false;
  window.requestAnimationFrame(_loop);
  function _loop(time) {
    ImGui_Impl.NewFrame(time);
    ImGui.NewFrame();

    ImGui.SetNextWindowPos(new ImGui.ImVec2(20, 20), ImGui.Cond.FirstUseEver);
    ImGui.SetNextWindowSize(new ImGui.ImVec2(294, 140), ImGui.Cond.FirstUseEver);
    ImGui.Begin("Controller");

    ImGui.Text(midi)
    let play = Pause ? "Pause" : "Play"
    if(ImGui.Button(play)){
      playBtnClick()
    }

    ImGui.InputText("some title", (_ = buf) => buf = _, 156)
    ImGui.SliderFloat("speed", (_ = distSpeed) => distSpeed = _ ,0.0,0.05)
    ImGui.ColorEdit4("clear color", clear_color)

    try {
      // eval(editor.getValue());
    } catch (e) {
      ImGui.TextColored(new ImGui.ImVec4(1.0,0.0,0.0,1.0), "error: ");
      ImGui.SameLine();
      ImGui.Text(e.message);
    }

    ImGui.End();

    ImGui.EndFrame();

    ImGui.Render();
    const gl = ImGui_Impl.gl;
    gl && gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl && gl.clearColor(clear_color.x, clear_color.y, clear_color.z, clear_color.w);
    gl && gl.clear(gl.COLOR_BUFFER_BIT);
    //gl.useProgram(0); // You may want this if using this code in an OpenGL 3+ context where shaders may be bound

    ImGui_Impl.RenderDrawData(ImGui.GetDrawData());

    window.requestAnimationFrame(done ? _done : _loop);
  }

  function _done() {
    ImGui_Impl.Shutdown();
    ImGui.DestroyContext();
  }
})();