import {beep} from '../../util/common';

export default class SoundIndicator {
    constructor(amplitude = 0, duration = 0, intervalTime = 1000, numInSec = 1) {
        this.playerSettings = {
            amplitude,
            duration,
            intervalTime,
            numInSec,
            group: 0,
        };
        this.playing = false;
        this.timer = null;
        this.osc = null;
        this.audioContext = null;
        this.gain = null;
    }

    isPlaying() {
        return this.playing;
    }

    disconnectNode() {
        if (this.audioContext) {
            try {
                this.osc.stop();
                this.osc.disconnect();
                this.gain.disconnect();
                this.audioContext.close();
                delete this.osc;
                delete this.gain;
                delete this.audioContext;
            } finally {
                this.osc = null;
                this.gain = null;
                this.audioContext = null;
            }
        }
    }

    setValue(vol) {
        this.playerSettings = {
            ...this.playerSettings,
            vol,
        };
    }

    changeConfig(obj) {
        const changedIntervalTime = obj.group !== this.playerSettings.group;
        if (!changedIntervalTime) return;
        this.playerSettings = {
            ...this.playerSettings,
            ...obj,
        };
        if (changedIntervalTime && this.playing) {
            this.resetTimer();
        }
    }

    resetTimer() {
        if (this.playerSettings.intervalTime === 0) return;
        this.disconnectNode();
        clearInterval(this.timer);
        this.timer = null;
        this.start();
    }

    playOnce() {
        const {
            amplitude,
            vol,
            duration,
        } = this.playerSettings;
        beep(amplitude, vol, duration);
    }

    playOneSec() {
        const {
            intervalTime,
            vol,
            duration,
            amplitude,
        } = this.playerSettings;
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.osc = this.audioContext.createOscillator();
        this.gain = this.audioContext.createGain();
        this.osc.type = 'square';
        this.osc.frequency.value = amplitude;
        this.osc.connect(this.gain);
        this.gain.connect(this.audioContext.destination);
        this.osc.start();
        this.osc.stop(this.audioContext.currentTime + 1);
        const count = parseInt(1000 / intervalTime, 10);
        let t = 0;
        for (let i = 0; i < count; i += 1) {
            this.gain.gain.setValueAtTime(vol * 0.01, this.audioContext.currentTime + t);
            t += duration * 0.001;
            this.gain.gain.setValueAtTime(0, this.audioContext.currentTime + t);
            t += (intervalTime - duration) * 0.001;
        }
    }

    start() {
        this.playing = true;
        this.playOneSec();
        this.timer = setInterval(() => {
            this.disconnectNode();
            this.playOneSec();
        }, 1000);
    }

    stop() {
        this.disconnectNode();
        clearInterval(this.timer);
        this.timer = null;
        this.playing = false;
    }
}
