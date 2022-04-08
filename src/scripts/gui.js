async function initGUI() {
  await ImGui.default();
  
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

  const col1 = new ImGui.ImVec4(customColor.x,customColor.y,customColor.z,customColor.w);
  const col2 = new ImGui.ImVec4(customRecursiveBezierColor.x,customRecursiveBezierColor.y,customRecursiveBezierColor.z,customRecursiveBezierColor.w);
  
  let hideMap = false;
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
    let mapShow = !hideMap ? "hide map" : "show map"

    if(ImGui.Button(play)){ playBtnClick() }
   
    // semantically we need to use ImGui.Checkbox 
    // but we can't. Since we wanted to communicate between canvas (60fps) and div, 
    // otherwise the msg will be sent 60times/sec.
    if (ImGui.Button(mapShow)) {
      hideMap = !hideMap
      canvas.dispatchEvent(new CustomEvent('toggleMap', {detail: { hideMap: hideMap }}))
    } 
    ImGui.Checkbox("Show L points",(value = ShowLPoints) => ShowLPoints = value)
    ImGui.Checkbox("Show R points",(value = ShowRPoints) => ShowRPoints = value)
    ImGui.SliderFloat("speed", (_ = distSpeed) => distSpeed = _ ,0.0,0.05)
    ImGui.SliderFloat("step", (_ = stepSize) => stepSize = _ ,0.001,1)
    ImGui.ColorEdit4("control spline", customColor = col1)
    ImGui.ColorEdit4("casteljau spline", customRecursiveBezierColor = col2)

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
    gl && gl.clearColor(col1.x, col1.y, col1.z, col1.w);
    gl && gl.clearColor(col2.x, col2.y, col2.z, col2.w);
    gl && gl.clear(gl.COLOR_BUFFER_BIT);

    ImGui_Impl.RenderDrawData(ImGui.GetDrawData());

    window.requestAnimationFrame(done ? _done : _loop);
  }

  function _done() {
    ImGui_Impl.Shutdown();
    ImGui.DestroyContext();
  }
};