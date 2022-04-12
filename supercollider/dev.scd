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
)


x = Synth("mi-plaits");
g = Synth("midisynth1");
x.set(\gate, 1)
g.set(\gate, 0)

//set the action:
(
~noteOn = {arg src, chan, num, vel;
	if ( chan == 0, {
		// x.set(\freq, num.midicps / 4.0);
	  x.set(\gate, 1);
		"chan = 0 mi-plaits!".postln;
	},{});

	if ( chan == 1, {
		// x.set(\freq, num.midicps / 4.0);
	  g.set(\gate, 1);
		"chan = 1 midisynth1!".postln;
	},{});
};
MIDIIn.addFuncTo(\noteOn, ~noteOn);

~noteOff = { arg src,chan,num,vel;
	if ( chan == 0, {
		// x.set(\freq, num.midicps / 4.0);
	  x.set(\gate, 0);
		"chan = 0 noteOff!".postln;
	},{});

	if ( chan == 1, {
	  g.set(\freq, Scale.major.degreeToFreq([ 0, 2, 4, 5, 7, 9, 11 ].choose, 44.midicps, 1));
	  g.set(\gate, 0);
		"chan = 1 noteOff!".postln;
	},{});
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