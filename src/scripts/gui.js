// async function initGUI() {
//   await ImGui.default();

//   const devicePixelRatio = window.devicePixelRatio || 1;
//   client.canvas.width = client.canvas.scrollWidth * devicePixelRatio;
//   client.canvas.height = client.canvas.scrollHeight * devicePixelRatio;

//   // window.addEventListener("resize", () => {
//   //   const devicePixelRatio = window.devicePixelRatio || 1;
//   //   client.canvas.width = client.canvas.scrollWidth * devicePixelRatio;
//   //   client.canvas.height = client.canvas.scrollHeight * devicePixelRatio;
//   // });

//   ImGui.CreateContext();
//   ImGui_Impl.Init(client.canvas);
//   ImGui.StyleColorsClassic();

//   const col1 = new ImGui.ImVec4(
//     client.customColor.x,
//     client.customColor.y,
//     client.customColor.z,
//     client.customColor.w
//   );
//   const col2 = new ImGui.ImVec4(
//     client.customRecursiveBezierColor.x,
//     client.customRecursiveBezierColor.y,
//     client.customRecursiveBezierColor.z,
//     client.customRecursiveBezierColor.w
//   );

//   let done = false;
//   window.requestAnimationFrame(_loop);

//   function _loop(time) {
//     // console.log("time",)
//     ImGui_Impl.NewFrame(time);
//     ImGui.NewFrame();

//     ImGui.SetNextWindowPos(new ImGui.ImVec2(20, 20), ImGui.Cond.FirstUseEver);
//     ImGui.SetNextWindowSize(
//       new ImGui.ImVec2(294, 140),
//       ImGui.Cond.FirstUseEver
//     );
//     ImGui.Begin("Controller");

//     ImGui.Text(client.MIDI);
//     let play = client.pause ? "pause" : "Play";
//     let mapShow = !client.hideMap ? "hide map" : "show map";
//     let mute = client.dragpoints.bezierPoints[client.dragPointGroup]["muted"] ? "unmute" : "mute"

//     if (ImGui.Button("+", new ImGui.ImVec2(20, 20))) { client.dragpoints.spawnNewGroup() }
//     ImGui.SameLine();
//     if (ImGui.Button(play)) { client.events.playBtnClick(); }
//     ImGui.SameLine();
//     if (ImGui.Button(mute)) { client.dragpoints.bezierPoints[client.dragPointGroup]["muted"] = !client.dragpoints.bezierPoints[client.dragPointGroup]["muted"] }

//     ImGui.SliderInt( "group", (value = client.dragPointGroup) => (client.dragPointGroup = value), 0, client.dragpoints.bezierPoints.length - 1);
//     ImGui.Checkbox( "control line", (value = client.showControlLine) => (client.showControlLine = value));
//     ImGui.Checkbox( "L points", (value = client.showLPoints) => (client.showLPoints = value));
//     ImGui.Checkbox( "R points", (value = client.showRPoints) => (client.showRPoints = value));
//     ImGui.SliderFloat("speed", (value = client.dragpoints.bezierPoints[client.dragPointGroup]["speed"]) => (client.dragpoints.bezierPoints[client.dragPointGroup]["speed"] = value), 0.0, 0.04);
//     ImGui.SliderFloat("step", (_ = client.stepSize) => (client.stepSize = _), 0.001, 1);
//     ImGui.ColorEdit4("control spline", (client.customColor = col1));
//     ImGui.ColorEdit4("casteljau spline", (client.customRecursiveBezierColor = col2));

//     if (ImGui.Button("Sandbox Window")) {
//       showSandboxWindow = true;
//     }
//     if (client.showSandboxWindow)
//       ShowSandboxWindow(
//         "Sandbox Window",
//         (value = client.showSandboxWindow) => (client.showSandboxWindow = value)
//       );
//     ImGui.SameLine();

//     // semantically we need to use ImGui.Checkbox
//     // but we can't. Since we wanted to communicate between canvas (60fps) and div,
//     // otherwise the msg will be sent 60times/sec.
//     if (ImGui.Button(mapShow)) {
//       client.hideMap = !client.hideMap;
//       document.dispatchEvent(
//         new CustomEvent("toggleMap", { detail: { hideMap: client.hideMap } })
//       );
//     }

//     ImGui.End();

//     ImGui.EndFrame();

//     ImGui.Render();
//     const gl = ImGui_Impl.gl;
//     gl && gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
//     gl && gl.clearColor(col1.x, col1.y, col1.z, col1.w);
//     gl && gl.clearColor(col2.x, col2.y, col2.z, col2.w);
//     gl && gl.clear(gl.COLOR_BUFFER_BIT);

//     ImGui_Impl.RenderDrawData(ImGui.GetDrawData());

//     window.requestAnimationFrame(done ? _done : _loop);
//   }

//   function _done() {
//     ImGui_Impl.Shutdown();
//     ImGui.DestroyContext();
//   }

//   function ShowSandboxWindow(title, p_open = null) {
//     ImGui.SetNextWindowSize(new ImGui.Vec2(320, 240), ImGui.Cond.FirstUseEver);
//     ImGui.Begin(title, p_open);
//     ImGui.Text("Source");
//     ImGui.SameLine();
//     ShowHelpMarker("Contents evaluated and appended to the window.");
//     ImGui.PushItemWidth(-1);
//     ImGui.InputTextMultiline(
//       "##source",
//       (_ = source) => (source = _),
//       1024,
//       ImGui.Vec2.ZERO,
//       ImGui.InputTextFlags.AllowTabInput
//     );
//     ImGui.PopItemWidth();
//     try {
//       eval(source);
//     } catch (e) {
//       ImGui.TextColored(new ImGui.Vec4(1.0, 0.0, 0.0, 1.0), "error: ");
//       ImGui.SameLine();
//       ImGui.Text(e.message);
//     }
//     ImGui.End();
//   }
//   function ShowHelpMarker(desc) {
//     ImGui.TextDisabled("(?)");
//     if (ImGui.IsItemHovered()) {
//       ImGui.BeginTooltip();
//       ImGui.PushTextWrapPos(ImGui.GetFontSize() * 35.0);
//       ImGui.TextUnformatted(desc);
//       ImGui.PopTextWrapPos();
//       ImGui.EndTooltip();
//     }
//   }

//   let source = [
//     "ImGui.Text(\"selected group!\");",
//     "ImGui.SliderInt(\"selected group\",",
//     "\t(value = dragPointGroup) => (dragPointGroup = value),",
//     "\t0, 1);",
//     "",
//   ].join("\n");
// }


function GUI() {
  this.init = async () => {
    await ImGui.default();

    this.devicePixelRatio = window.devicePixelRatio || 1;
    client.canvas.width = client.canvas.scrollWidth * this.devicePixelRatio;
    client.canvas.height = client.canvas.scrollHeight * this.devicePixelRatio;

    ImGui.CreateContext();
    ImGui_Impl.Init(client.canvas);
    ImGui.StyleColorsClassic();

    this.col1 = new ImGui.ImVec4(
      client.customColor.x,
      client.customColor.y,
      client.customColor.z,
      client.customColor.w
    );
    this.col2 = new ImGui.ImVec4(
      client.customRecursiveBezierColor.x,
      client.customRecursiveBezierColor.y,
      client.customRecursiveBezierColor.z,
      client.customRecursiveBezierColor.w
    );

    this.done = false;
    this.source = [
      'ImGui.Text("selected group!");',
      'ImGui.SliderInt("selected group",',
      "\t(value = dragPointGroup) => (dragPointGroup = value),",
      "\t0, 1);",
      "",
    ].join("\n");
  };

  this.update = () => {
    // window.requestAnimationFrame(this._loop);
    this._loop(client.frames.f)
  };

  this._loop = (time) => {
    ImGui_Impl.NewFrame(time);
    ImGui.NewFrame();

    ImGui.SetNextWindowPos(new ImGui.ImVec2(20, 20), ImGui.Cond.FirstUseEver);
    ImGui.SetNextWindowSize(
      new ImGui.ImVec2(294, 140),
      ImGui.Cond.FirstUseEver
    );
    ImGui.Begin("Controller");

    ImGui.Text(client.MIDI);
    let play = client.pause ? "pause" : "Play";
    let mapShow = !client.hideMap ? "hide map" : "show map";
    let mute = client.dragpoints.bezierPoints[client.dragPointGroup]["muted"]
      ? "unmute"
      : "mute";

    if (ImGui.Button("+", new ImGui.ImVec2(20, 20))) {
      client.dragpoints.spawnNewGroup();
    }
    ImGui.SameLine();
    if (ImGui.Button(play)) {
      playBtnClick();
    }
    ImGui.SameLine();
    if (ImGui.Button(mute)) {
      client.dragpoints.bezierPoints[client.dragPointGroup]["muted"] =
        !client.dragpoints.bezierPoints[client.dragPointGroup]["muted"];
    }

    ImGui.SliderInt(
      "group",
      (value = client.dragPointGroup) => (client.dragPointGroup = value),
      0,
      client.dragpoints.bezierPoints.length - 1
    );
    ImGui.Checkbox(
      "control line",
      (value = client.showControlLine) => (client.showControlLine = value)
    );
    ImGui.Checkbox(
      "L points",
      (value = client.showLPoints) => (client.showLPoints = value)
    );
    ImGui.Checkbox(
      "R points",
      (value = client.showRPoints) => (client.showRPoints = value)
    );
    ImGui.SliderFloat(
      "speed",
      (
        value = client.dragpoints.bezierPoints[client.dragPointGroup]["speed"]
      ) =>
        (client.dragpoints.bezierPoints[client.dragPointGroup]["speed"] =
          value),
      0.0,
      0.04
    );
    ImGui.SliderFloat(
      "step",
      (_ = client.stepSize) => (client.stepSize = _),
      0.001,
      1
    );
    ImGui.ColorEdit4("control spline", (client.customColor = this.col1));
    ImGui.ColorEdit4(
      "casteljau spline",
      (client.customRecursiveBezierColor = this.col2)
    );

    if (ImGui.Button("Sandbox Window")) {
      client.showSandboxWindow = true;
    }
    if (client.showSandboxWindow)
      ShowSandboxWindow(
        "Sandbox Window",
        (value = client.showSandboxWindow) => (client.showSandboxWindow = value)
      );
    ImGui.SameLine();

    // semantically we need to use ImGui.Checkbox
    // but we can't. Since we wanted to communicate between canvas (60fps) and div,
    // otherwise the msg will be sent 60times/sec.
    if (ImGui.Button(mapShow)) {
      client.hideMap = !client.hideMap;
      client.canvas.dispatchEvent(
        new CustomEvent("toggleMap", { detail: { hideMap: client.hideMap } })
      );
    }

    ImGui.End();

    ImGui.EndFrame();

    ImGui.Render();
    const gl = ImGui_Impl.gl;
    gl && gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl && gl.clearColor(this.col1.x, this.col1.y, this.col1.z, this.col1.w);
    gl && gl.clearColor(this.col2.x, this.col2.y, this.col2.z, this.col2.w);
    gl && gl.clear(gl.COLOR_BUFFER_BIT);

    ImGui_Impl.RenderDrawData(ImGui.GetDrawData());

    // window.requestAnimationFrame(this.done ? this._done : this._loop);
  };

  this._done = () => {
    ImGui_Impl.Shutdown();
    ImGui.DestroyContext();
  };

  this.ShowSandboxWindow = (title, p_open = null) => {
    ImGui.SetNextWindowSize(new ImGui.Vec2(320, 240), ImGui.Cond.FirstUseEver);
    ImGui.Begin(title, p_open);
    ImGui.Text("Source");
    ImGui.SameLine();
    this.ShowHelpMarker("Contents evaluated and appended to the window.");
    ImGui.PushItemWidth(-1);
    ImGui.InputTextMultiline(
      "##source",
      (_ = this.source) => (this.source = _),
      1024,
      ImGui.Vec2.ZERO,
      ImGui.InputTextFlags.AllowTabInput
    );
    ImGui.PopItemWidth();
    try {
      eval(this.source);
    } catch (e) {
      ImGui.TextColored(new ImGui.Vec4(1.0, 0.0, 0.0, 1.0), "error: ");
      ImGui.SameLine();
      ImGui.Text(e.message);
    }
    ImGui.End();
  };
  this.ShowHelpMarker = (desc) => {
    ImGui.TextDisabled("(?)");
    if (ImGui.IsItemHovered()) {
      ImGui.BeginTooltip();
      ImGui.PushTextWrapPos(ImGui.GetFontSize() * 35.0);
      ImGui.TextUnformatted(desc);
      ImGui.PopTextWrapPos();
      ImGui.EndTooltip();
    }
  };
}