MIDIIn.connect
s.boot

(
SynthDef("mi-plaits", { |out=0, freq = 440, gate = 0, bwfreq = 800|
	var sig;
    var harm = LFNoise2.kr(0.5).range(0,0.5);
    var timbre = 0.173;
    var morph = 0.827;
    /*var trigger = Impulse.kr(8);*/
    var lev = TRand.kr(trig: gate).squared;
    sig = MiPlaits.ar(47, 14, harm, timbre, morph, gate, lev, fm_mod: 0.2, timb_mod: 0.43, decay: 0.4);
    Out.ar(out, sig);
}).add;

SynthDef(\midisynth1, {arg freq=440, amp=0.1, dec=1, rel=0.8, gate=0;
    var signal, env;
    signal = VarSaw.ar([freq, freq+2], 0, XLine.ar(0.7, 0.9, 0.13));
    env = EnvGen.ar(Env.adsr(0.01, 0.2, dec,rel),gate);
    Out.ar(0, signal*env*amp);
}).add;

SynthDef("mi-pluck", { 
  | gate=0, out=0, pitch=60, bright=0.4, damp=0.3, model=5, intern_exciter=1, poly=4 |
  var sig;
  var input = PinkNoise.ar(0.2);
  var struct = LFNoise1.kr(0.4).range(0,1);
  var pos = LFNoise2.kr(0.1).range(0,1);
  sig = MiRings.ar(input, gate, pitch, struct, bright, damp, pos, model, poly, intern_exciter);
  Out.ar(out, sig);
}).add;
)

CmdPeriod.run

// (    // string_and_reverb
// {
//     var input = PinkNoise.ar(0.2);
//     var trig = Dust.kr(0.7);
//     var struct = LFNoise1.kr(0.4).range(0,1);
//     var pos = LFNoise2.kr(0.1).range(0,1);
//     // note: force 'internal exciter'
//     MiRings.ar(input, trig, 60, struct, 0.5, 0.7, pos, intern_exciter: 1, model:5, poly: 4)
// }.play
// )

CmdPeriod.run
s.meter;
s.plotTree

(    // drone
     // set damp to 1.0 to get a sustaining sound that doesn't need to be triggered
{
    var struct = LFNoise2.kr(0.2).range(0,1);
    var brightness = LFNoise1.kr(0.5).range(0,1);

    MiRings.ar(pit: 40, struct: struct, bright: brightness, pos: 0.9, damp: 1.0, poly: 2, model: 2, easteregg: 1)
}.play
)

(   // scanning
{
    var timb = LFNoise1.kr(0.3,0.5,0.5);
    var color = LFNoise1.kr(0.3,0.5,0.5);
    var pit = MouseY.kr(33,72);
    var model = MouseX.kr(0, 47);
    MiBraids.ar(pit, timb, color, model, mul: 0.2) ! 2;
}.play
)

(   // kick it
{
    var trig =  Impulse.kr(4);
    var pit = Latch.kr(PinkNoise.kr(), trig).range(30, 50).round;
    var timb = LFNoise1.kr(0.4,0.5,0.5);
    var color = LFNoise1.kr(0.3,0.5,0.5);

    MiBraids.ar(pit, timb, color, 34, trig, mul: 0.5) ! 2;
}.play
)

(   // sample rate, bit reduction and distortion
{
    var trig =  CoinGate.kr(0.3, Impulse.kr(4));
    var decim = TRand.kr(1,32,trig);
    var dist = LFTri.kr(0.2).range(0,1);

    MiBraids.ar(40, 0.7, 0.7, 34, trig, resamp: 2, decim: decim, bits: 3, ws: dist, mul: 0.5) ! 2;
}.play
)


x = Synth("mi-plaits");
g = Synth("midisynth1");
~mi_pluck = Synth("mi-pluck");
CmdPeriod.run
~mi_pluck.set(\pitch, Scale.harmonicMinor.degrees.choose + 30);
~mi_pluck.set(\gate, 0);
~mi_pluck.set(\bright, 0.4);
~mi_pluck.set(\damp, 0.3);
~mi_pluck.set(\model, 5);
~mi_plug.set(\intern_exciter, 1);
// g.set(\gate, 0);

Scale.minor.degrees.choose + 60;
//set the action:
(
~noteOn = {arg src, chan, num, vel;
	if ( chan == 0, {
		// x.set(\freq, num.midicps / 4.0);
	  x.set(\gate, 1);
		// "chan = 0 mi-plaits!".postln;
	},{});

	if ( chan == 1, {
		// x.set(\freq, num.midicps / 4.0);
	  g.set(\gate, 1);
		// "chan = 1 midisynth1!".postln;
	},{});

  if (chan == 2, {
    ~mi_pluck.set(\gate, 1);
    ~mi_pluck.set(\pitch, Scale.minor.degrees.choose + [20,30,40].choose);
  });
};
MIDIIn.addFuncTo(\noteOn, ~noteOn);

~noteOff = { arg src,chan,num,vel;
	if ( chan == 0, {
		// x.set(\freq, num.midicps / 4.0);
	  x.set(\gate, 0);
		// "chan = 0 noteOff!".postln;
	},{});

	if ( chan == 1, {
	  g.set(\freq, Scale.major.degreeToFreq([ 0, 2, 4, 5, 7, 9, 11 ].choose, 44.midicps, 1));
	  g.set(\gate, 0);
		// "chan = 1 noteOff!".postln;
	},{});

  if (chan == 2, {
    ~mi_pluck.set(\gate, 0);
  })
};
MIDIIn.addFuncTo(\noteOff, ~noteOff);

// ~bend = { arg src,chan,val;
// 	//(val * 0.048828125).postln;
// 	x.set(\bwfreq, val * 0.048828125 );
// };
// MIDIIn.addFuncTo(\bend, ~bend);
)

//cleanup
MIDIIn.removeFuncFrom(\noteOn, ~noteOn);
MIDIIn.removeFuncFrom(\noteOff, ~noteOff);
// MIDIIn.removeFuncFrom(\bend, ~bend);
