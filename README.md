# xen

an implementation on [ De Casteljau's ](https://en.wikipedia.org/wiki/De_Casteljau%27s_algorithm) algorithm, capable of sending MIDI, [OSC](https://en.wikipedia.org/wiki/Open_Sound_Control) to target client/server, eg.[SuperCollider](https://supercollider.github.io/), Currently no built-in audio-engine since xen is intentionally used for live performance.

<img src="./src/imgs/ss3.gif">

## Run

```
git clone https://github.com/karnpapon/xen.git
cd xen
npm install
node bridge.js  # in order to send OSC
npm run start
```

## Usage
- **play/pause**: `spacebar`
- **add new point**: `cmd` + `left click`
- **remove point**: `right click` at target point.
- **switch between point group**: `tab`, selected group will be highlighted in `BLUE` color `rgb(0,0,255)`

## File/Folder

- **/src**: main xen's sourcecode.
- **/tool**: for test sending msg(osc).
- **bridge.js**: for receiving msg(osc) from browser and forward to target server.


### IO

- **midi**.
- **osc**: Sends OSC message, **NOTE** run `node bridge.js` first. in order to send OSC out to host.

# Resources
- https://pomax.github.io/bezierinfo/#decasteljau
- https://www.khanacademy.org/computing/pixar/animate/parametric-curves/a/equations-from-de-casteljaus-algorithm
- https://www.youtube.com/watch?v=aVwxzDHniEw
- https://webmidijs.org/docs/getting-started/basics/