/* global ImGui, ImGui_Impl */
/* global client */

function GUI() {

  this.dir = {
    None:-1,
    Left:0,
    Right:1,
    Up:2,
    Down:3,
    COUNT:4
  };

  this.TabBarFlags =
{
    None: 0,
    Reorderable: 1 << 0,
        // Allow manually dragging tabs to re-order them + New tabs are
        // appended at the end of list
    AutoSelectNewTabs: 1 << 1,   // Automatically select new tabs when they appear
    TabListPopupButton: 1 << 2,
    NoCloseWithMiddleMouseButton: 1 << 3,
        // Disable behavior of closing tabs (that are submitted with
        // p_open != NULL) with middle mouse button. You can still
        // repro this behavior on user's side with if
        // (IsItemHovered() && IsMouseClicked(2)) *p_open = false.
    NoTabListScrollingButtons: 1 << 4,
    NoTooltip: 1 << 5,   // Disable tooltips when hovering a tab
    FittingPolicyResizeDown: 1 << 6,   // Resize tabs when they don't fit
    FittingPolicyScroll: 1 << 7,   // Add scroll buttons when tabs don't fit
};

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

    this.msgProtocol = "MIDI"

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

    ImGui.Text(client.io.midi.outputDevice()?.name || "no MIDI OUT selected");
    let play = client.clock?.isPaused ? "pause" : "Play";
    let mapShow = !client?.hideMap ? "hide map" : "show map";
    let mute = client.dragpoints.bezierPoints[client.dragPointGroup]["muted"]
      ? "unmute"
      : "mute";

    if (ImGui.Button("+", new ImGui.ImVec2(20, 20))) {
      client.dragpoints.spawnNewGroup();
    }
    ImGui.SameLine();
    if (ImGui.Button(play)) {
      client.events.playBtnClick();
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
      (value = client.dragpoints.bezierPoints[client.dragPointGroup]["toggle"]["showControlLine"]) => (client.dragpoints.bezierPoints[client.dragPointGroup]["toggle"]["showControlLine"] = value)
    );
    ImGui.Checkbox(
      "L points",
      (value = client.dragpoints.bezierPoints[client.dragPointGroup]["toggle"]["showLPoints"]) => (client.dragpoints.bezierPoints[client.dragPointGroup]["toggle"]["showLPoints"] = value)
    );
    ImGui.Checkbox(
      "R points",
      (value = client.dragpoints.bezierPoints[client.dragPointGroup]["toggle"]["showRPoints"]) => (client.dragpoints.bezierPoints[client.dragPointGroup]["toggle"]["showRPoints"] = value)
    );

    if (ImGui.BeginTabBar("##tabs", this.TabBarFlags.None)) {
      if (ImGui.BeginTabItem("MIDI")) { 
        ImGui.Checkbox("active", (value = client.midiActived) => (client.midiActived = value) )
        ImGui.Text("MIDI CHANNEL: [0-16]");
        ImGui.AlignTextToFramePadding();
        ImGui.Text("LINE:");
        ImGui.SameLine();
        ImGui.SameLine();
        if (ImGui.ArrowButton("##left", this.dir.Left)) {  
          client.dragpoints.bezierPoints[client.dragPointGroup]["midi"]["chan"] = (((client.dragpoints.bezierPoints[client.dragPointGroup]["midi"]["chan"] - 1) % 16) + 16 ) % 16
        }
        ImGui.PopButtonRepeat();
        ImGui.SameLine();
        if (ImGui.ArrowButton("##right", this.dir.Right)) { 
          client.dragpoints.bezierPoints[client.dragPointGroup]["midi"]["chan"] = (client.dragpoints.bezierPoints[client.dragPointGroup]["midi"]["chan"]  + 1) % 16 
        }
        ImGui.SameLine();
        ImGui.Text((client.dragpoints.bezierPoints[client.dragPointGroup]["midi"]["chan"]).toString() || "0");

        ImGui.AlignTextToFramePadding();
        ImGui.Text("POINT:");
        ImGui.SameLine();
        if (ImGui.ArrowButton("#left", 0)) {  
          client.dragpoints.bezierPoints[client.dragPointGroup]["midi"]["chanPoints"] = (((client.dragpoints.bezierPoints[client.dragPointGroup]["midi"]["chanPoints"] - 1) % 16) + 16 ) % 16
        }
        ImGui.PopButtonRepeat();
        ImGui.SameLine();
        if (ImGui.ArrowButton("#right", 1)) { 
          client.dragpoints.bezierPoints[client.dragPointGroup]["midi"]["chanPoints"] = (client.dragpoints.bezierPoints[client.dragPointGroup]["midi"]["chanPoints"]  + 1) % 16 
        }
        ImGui.SameLine();
        ImGui.Text((client.dragpoints.bezierPoints[client.dragPointGroup]["midi"]["chanPoints"]).toString() || "0");
        ImGui.EndTabItem();
      }
      if (ImGui.BeginTabItem("OSC")) { 
        ImGui.Checkbox("active", (value = client.oscActived) => (client.oscActived = value) )
        ImGui.InputText("##osc-line", (_ = client.oscMsgLine) => (client.oscMsgLine = _));
        ImGui.SameLine();
        ImGui.Text("LINE:");
        ImGui.InputText("##osc-point", (_ = client.oscMsgPoint) => (client.oscMsgPoint = _));
        ImGui.SameLine();
        ImGui.Text("POINT:");
        ImGui.EndTabItem();
      }
      
      ImGui.EndTabBar();
    }
    ImGui.Separator();
    ImGui.SliderFloat( "speed",
      (
        value = client.dragpoints.bezierPoints[client.dragPointGroup]["speed"]
      ) =>
        (client.dragpoints.bezierPoints[client.dragPointGroup]["speed"] =
          value),
      0.0,
      0.04
    );
    ImGui.SliderInt(
      "step",
      (_ = client.stepSize) => (client.stepSize = _),
      1,
      99
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
      this.ShowSandboxWindow(
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