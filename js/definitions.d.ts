

class webkitAudioContext {
    destination: AudioDestinationNode; // readonly attribute
    sampleRate: number; // readonly attribute 
    currentTime: number; // readonly attribute
    listener: AudioListener; // readonly attribute
    activeSourceCount: number; // readonly attribute 

    createBuffer(numberOfChannels: number, length: number, sampleRate: number): AudioBuffer; // unsigned long numberOfChannels, unsigned long length, float sampleRate
    createBuffer(buffer: AudioBuffer, mixToMono: bool): AudioBuffer; // ArrayBuffer buffer, boolean mixToMono
    decodeAudioData(audioData: ArrayBuffer, successCallback: { (buffer: AudioBuffer): void; }, errorCallback?: { (): void; } ): void;
    createBufferSource(): AudioBufferSourceNode;
    createMediaElementSource(mediaElement: HTMLMediaElement): MediaElementAudioSourceNode;
    createMediaStreamSource(mediaStream: MediaStream): MediaStreamAudioSourceNode;
    createScriptProcessor(bufferSize: number, numberOfInputChannels?: number, numberOfOutputChannels?: number): ScriptProcessorNode; // unsigned long bufferSize, optional unsigned long numberOfInputChannels = 2, optional unsigned long numberOfOutputChannels = 2
    createAnalyser(): AnalyserNode;
    createGainNode(): GainNode;
    createDelay(maxDelayTime?: number): DelayNode; // optional double maxDelayTime = 1.0
    createBiquadFilter(): BiquadFilterNode;
    createWaveShaper(): WaveShaperNode;
    createPanner(): PannerNode;
    createConvolver(): ConvolverNode;
    createChannelSplitter(numberOfOutputs?: number): ChannelSplitterNode; // optional unsigned long numberOfOutputs = 6
    createChannelMerger(numberOfInputs?: number): ChannelMergerNode; // optional unsigned long numberOfInputs = 6
    createDynamicsCompressor(): DynamicsCompressorNode;
    createOscillator(): OscillatorNode;
    createWaveTable(real: number[], imag: number[]): WaveTable;
}

class AnalyserNode {
}

class AudioBuffer {
    sampleRate: number; // readonly attribute float 
    length: number; // readonly attribute long 

    // in seconds 
    duration: number; // readonly attribute double 
    numberOfChannels: number; // readonly attribute long 
    getChannelData(channel:number):number[];
}

class AudioBufferSourceNode extends AudioSourceNode {
    static UNSCHEDULED_STATE: number; // unsigned short = 0
    static SCHEDULED_STATE: number; // unsigned short = 1
    static PLAYING_STATE: number; // unsigned short = 2
    static FINISHED_STATE: number; // unsigned short = 3;

    playbackState: number; // readonly attribute unsigned short 

    buffer: AudioBuffer;

    playbackRate: AudioParam;

    loop: bool;
    loopStart: number; // attribute double 
    loopEnd: number; // attribute double 

    noteOn(when: number, offset?:number, duration?:number): void; // double when, optional double offset = 0, optional double duration
    noteOff(when: number): void ; // double when
}

class AudioListener {
     // same as OpenAL (default 1) 
    dopplerFactor: number; // attribute float 

    // in meters / second (default 343.3) 
    speedOfSound: number; // attribute float 

    // Uses a 3D cartesian coordinate system 
    setPosition(x: number, y: number, z: number);
    setOrientation(x: number, y: number, z: number, xUp: number, yUp: number, zUp: number): void;
    setVelocity(x: number, y: number, z: number): void;
}

class AudioNode {
    connect(destination:AudioNode, output?:number, input?:number): void;
    connect(destination:AudioParam, output?:number): void;
    disconnect(output?:number): void;

    context: webkitAudioContext;
    numberOfInputs: number;
    numberOfOutputs: number;
}
    
class AudioSourceNode extends AudioNode {
}

class AudioDestinationNode extends AudioNode {
    maxNumberOfChannels: number;
    numberOfChannels: number;
}

class AudioParam {
    value: number; // attribute float
    computedValue: number; // readonly attribute float
    minValue: number; // readonly attribute float
    maxValue; number; // readonly attribute float
    defaultValue: number; // readonly attribute float

    // Parameter automation. 
    setValueAtTime(value: number, startTime: number): void; // float value, double startTime
    linearRampToValueAtTime(value: number, endTime: number): void; // float value, double endTime
    exponentialRampToValueAtTime(value: number, endTime: number): void; // float value, double endTime

    // Exponentially approach the target value with a rate having the given time constant. 
    setTargetAtTime(target: number, startTime: number, timeConstant: number): void; // float target, double startTime, double timeConstant

    // Sets an array of arbitrary parameter values starting at time for the given duration. 
    // The number of values will be scaled to fit into the desired duration. 
    setValueCurveAtTime(values: number[], startTime:number, duration:number): void; // Float32Array values, double startTime, double duration

    // Cancels all scheduled parameter changes with times greater than or equal to startTime. 
    cancelScheduledValues(startTime: number): void; //double startTime
}

class BiquadFilterNode {
}

class ChannelMergerNode {
}

class ChannelSplitterNode {
}

class ConvolverNode {
}

class DelayNode {
}

class DynamicsCompressorNode {
}

class GainNode extends AudioNode {
    gain: AudioParam;
}

class MediaElementAudioSourceNode {
}

class MediaStream {
}

class MediaStreamAudioSourceNode {
}

class OscillatorNode {
}

class PannerNode extends AudioNode {
    // Panning model 
    EQUALPOWER: number; // const unsigned short = 0;
    HRTF: number; // const unsigned short = 1;
    SOUNDFIELD: number; // const unsigned short = 2;

    // Distance model 
    LINEAR_DISTANCE: number; // const unsigned short = 0;
    INVERSE_DISTANCE: number; // const unsigned short = 1;
    EXPONENTIAL_DISTANCE: number; // const unsigned short = 2;

    // Default for stereo is HRTF 
    panningModel: number; // attribute unsigned short 

    // Uses a 3D cartesian coordinate system 
    setPosition(x: number, y: number, z: number): void; // float x, float y, float z
    setOrientation(x: number, y: number, z: number): void;
    setVelocity(x: number, y: number, z: number): void;

    // Distance model and attributes 
    distanceModel: number; // attribute unsigned short 
    refDistance: number; // attribute float 
    maxDistance: number; // attribute float 
    rolloffFactor: number; // attribute float

    // Directional sound cone 
    coneInnerAngle: number; // attribute float 
    coneOuterAngle: number; // attribute float 
    coneOuterGain: number; // attribute float 
}

class ScriptProcessorNode {
}

class WaveShaperNode {
}

class WaveTable {
}