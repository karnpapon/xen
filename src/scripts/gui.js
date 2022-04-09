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

  const col1 = new ImGui.ImVec4(
    customColor.x,
    customColor.y,
    customColor.z,
    customColor.w
  );
  const col2 = new ImGui.ImVec4(
    customRecursiveBezierColor.x,
    customRecursiveBezierColor.y,
    customRecursiveBezierColor.z,
    customRecursiveBezierColor.w
  );

  distSpeed = 0.004;
  let done = false;
  window.requestAnimationFrame(_loop);

  function _loop(time) {
    ImGui_Impl.NewFrame(time);
    ImGui.NewFrame();

    ImGui.SetNextWindowPos(new ImGui.ImVec2(20, 20), ImGui.Cond.FirstUseEver);
    ImGui.SetNextWindowSize(
      new ImGui.ImVec2(294, 140),
      ImGui.Cond.FirstUseEver
    );
    ImGui.Begin("Controller");

    ImGui.Text(MIDI);
    let play = pause ? "pause" : "Play";
    let mapShow = !hideMap ? "hide map" : "show map";

    if (ImGui.Button("+", new ImGui.ImVec2(20, 20))) { dragpoints.spawnNewGroup() }
    if (ImGui.Button(play)) { playBtnClick(); }

    // semantically we need to use ImGui.Checkbox
    // but we can't. Since we wanted to communicate between canvas (60fps) and div,
    // otherwise the msg will be sent 60times/sec.
    if (ImGui.Button(mapShow)) {
      hideMap = !hideMap;
      canvas.dispatchEvent(
        new CustomEvent("toggleMap", { detail: { hideMap: hideMap } })
      );
    }

    ImGui.SliderInt( "selected group", (value = dragPointGroup) => (dragPointGroup = value), 0, dragpoints.bezierPoints.length - 1);
    ImGui.Checkbox( "control line", (value = showControlLine) => (showControlLine = value));
    ImGui.Checkbox( "L points", (value = showLPoints) => (showLPoints = value));
    ImGui.Checkbox( "R points", (value = showRPoints) => (showRPoints = value));
    ImGui.SliderFloat("speed", (_ = distSpeed) => (distSpeed = _), 0.0, 0.04);
    ImGui.SliderFloat("step", (_ = stepSize) => (stepSize = _), 0.001, 1);
    ImGui.ColorEdit4("control spline", (customColor = col1));
    ImGui.ColorEdit4("casteljau spline", (customRecursiveBezierColor = col2));

    if (ImGui.Button("Sandbox Window")) {
      show_sandbox_window = true;
    }
    if (show_sandbox_window)
      ShowSandboxWindow(
        "Sandbox Window",
        (value = show_sandbox_window) => (show_sandbox_window = value)
      );

    try {
      // eval(editor.getValue());
    } catch (e) {
      ImGui.TextColored(new ImGui.ImVec4(1.0, 0.0, 0.0, 1.0), "error: ");
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

  function ShowSandboxWindow(title, p_open = null) {
    ImGui.SetNextWindowSize(new ImGui.Vec2(320, 240), ImGui.Cond.FirstUseEver);
    ImGui.Begin(title, p_open);
    ImGui.Text("Source");
    ImGui.SameLine();
    ShowHelpMarker("Contents evaluated and appended to the window.");
    ImGui.PushItemWidth(-1);
    ImGui.InputTextMultiline(
      "##source",
      (_ = source) => (source = _),
      1024,
      ImGui.Vec2.ZERO,
      ImGui.InputTextFlags.AllowTabInput
    );
    ImGui.PopItemWidth();
    try {
      eval(source);
    } catch (e) {
      ImGui.TextColored(new ImGui.Vec4(1.0, 0.0, 0.0, 1.0), "error: ");
      ImGui.SameLine();
      ImGui.Text(e.message);
    }
    ImGui.End();
  }
  function ShowHelpMarker(desc) {
    ImGui.TextDisabled("(?)");
    if (ImGui.IsItemHovered()) {
      ImGui.BeginTooltip();
      ImGui.PushTextWrapPos(ImGui.GetFontSize() * 35.0);
      ImGui.TextUnformatted(desc);
      ImGui.PopTextWrapPos();
      ImGui.EndTooltip();
    }
  }

  let source = [
    "ImGui.Text(\"selected group!\");",
    "ImGui.SliderInt(\"selected group\",",
    "\t(value = dragPointGroup) => (dragPointGroup = value),",
    "\t0, 1);",
    "",
  ].join("\n");
}
