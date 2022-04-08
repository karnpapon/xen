/**
 * A simple example of MIDI Keyboard for SuperCollider 3.6.x
 */

MIDIIn.connect;
s.boot;

// (
// var keys;
// keys = Array.newClear(128);
//
// ~noteOnFunc = {arg src, chan, num, vel;
// 	var node;
// 	node = keys.at(num);
// 	if (node.notNil, {
// 		node.release;
// 		keys.put(num, nil);
// 	});
// 	node = Synth.tail(nil, "umbSinewave", [\freq, [440,410,454,345,535].choose, \amp, vel/127]);
// 	keys.put(num, node);
// 	[chan,num,vel/127].postln;
// };
// MIDIIn.addFuncTo(\noteOn, ~noteOnFunc);
//
// ~noteOffFunc = {arg src, chan, num, vel;
// 	var node;
// 	node = keys.at(num);
// 	if (node.notNil, {
// 		node.release;
// 		keys.put(num, nil);
// 	});
// };
// MIDIIn.addFuncTo(\noteOff, ~noteOffFunc);
//
// )

// If it is an sustaining envelope (e.g. Env.adsr, Env.asr), the envelope is held open until the gate becomes 0 (have to manually set gate to 0)
Env.adsr(0.01, 0.1, 0.3,1).test(1);

(
//First we create a synth definition for this example:
SynthDef(\midisynth1, {arg freq=440, amp=0.1, dec=1, rel=0.8;
    var signal, env;
    signal = VarSaw.ar([freq, freq+2], 0, XLine.ar(0.7, 0.9, 0.13));
    env = EnvGen.ar(Env.linen(0.01, 0.2, dec,rel), doneAction:2);
    Out.ar(0, signal*env*amp);
}).add;


SynthDef(\gabber, {
		arg out=0, pan, atk=0.01, sus=0.5, rel=0.25,f=50, amp=0.25, filterFreq=1550, rroom=10, rtime=2, tlo=0, thigh=0.5;
		var sig, demand, decay, env;
		sig = Impulse.ar(1);
		env = EnvGen.ar(
			Env([0,1,1,0],[atk,sus,rel]),
			doneAction:2
		);
		sig = Decay.ar(sig, TRand.ar(tlo, thigh, sig)) * Pulse.ar(f * Decay.ar(sig, 0.1, 20, 1));
		sig = sig * env * amp ;
		sig = RLPF.ar(sig, filterFreq);
		sig = Pan2.ar(sig, TRand.ar(-1, 1, sig));
		// + GVerb.ar(FreqShift.ar(sig.sum, 300), rroom, rtime)
		Out.ar(out, LeakDC.ar(tanh((16*sig) )));
	}).add;
)

Synth(\gabber)
Synth(\midisynth1) // let's try it

CmdPeriod.run

(
// and now we can play the synth
MIDIdef.noteOn(\mydef, {arg vel, key, channel, device;
	// Synth(\midisynth1, [
 //    \freq, Scale.major.degreeToFreq([ 0, 2, 4, 5, 7, 9, 11 ].choose, 20.midicps, 1), 
 //    \amp, vel/127,
 //    \rel, 0.2,
 //    \dec, 0.2
 //  ]);

  Synth(\gabber)
    // [key, vel].postln;
});
)

// cleanup
(
MIDIIn.removeFuncFrom(\noteOn, ~noteOnFunc);
MIDIIn.removeFuncFrom(\noteOff, ~noteOffFunc);
)
