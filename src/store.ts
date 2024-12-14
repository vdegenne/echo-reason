import {ReactiveController, state} from '@snar/lit';
import {type PropertyValues} from 'lit';
import {saveToLocalStorage} from 'snar-save-to-local-storage';

declare global {
	interface Window {
		webkitAudioContext: typeof AudioContext;
	}
}

@saveToLocalStorage('something')
export class AppStore extends ReactiveController {
	@state() recording = false;
	@state() delayTime = 2;
	@state() gain = 1;

	// Audio-related properties
	audioContext: AudioContext | null = null;
	microphone: MediaStreamAudioSourceNode | null = null;
	delayNode: DelayNode | null = null;
	gainNode: GainNode | null = null;
	mediaStream: MediaStream | null = null;

	update() {
		if (!this.hasUpdated) {
			this.recording = false;
		}
	}

	toggleRecording() {
		if (this.recording) {
			this.stop();
		} else {
			this.start();
		}
	}

	#firstTimeUpdated = true;
	updated(changed: PropertyValues<this>) {
		if (!this.#firstTimeUpdated) {
			if (changed.has('delayTime')) {
				if (this.delayNode) {
					this.delayNode.delayTime.value = this.delayTime;
				}
			} else if (changed.has('gain')) {
				if (this.gainNode) {
					this.gainNode.gain.value = this.gain;
				}
			}
		}
		this.#firstTimeUpdated = false;
	}

	async start() {
		try {
			// Get the media stream from the microphone
			const stream = await navigator.mediaDevices.getUserMedia({audio: true});

			// Store the media stream
			this.mediaStream = stream;

			// Create audio context
			this.audioContext = new (window.AudioContext ||
				window.webkitAudioContext)();

			// Create microphone input from the stream
			this.microphone = this.audioContext.createMediaStreamSource(stream);

			this.gainNode = this.audioContext.createGain();
			this.gainNode.gain.value = this.gain;

			const delays = Array.from({length: this.delayTime}, () => {
				const delay = this.audioContext.createDelay();
				delay.delayTime.value = 1;
				return delay;
			});
			const delayFirstNode = delays[0];
			const delayLastnode = delays[delays.length - 1];

			// microphone -> first delay
			this.microphone.connect(delayFirstNode);
			// first delay -> last delay
			delays.reduce((prev, curr) => {
				prev.connect(curr);
				return curr;
			});
			// last delay -> gain
			delayLastnode.connect(this.gainNode);
			// gain -> output
			this.gainNode.connect(this.audioContext.destination);

			this.recording = true;
		} catch (err) {
			console.log('Error accessing microphone: ', err);
		}
	}

	async stop() {
		if (this.mediaStream) {
			// Stop the media stream
			this.mediaStream
				.getTracks()
				.forEach((track: MediaStreamTrack) => track.stop());
			if (this.audioContext) {
				await this.audioContext.close(); // Close the audio context
			}
		}

		// Reset states
		this.recording = false;
		this.microphone = null;
		this.delayNode = null;
		this.gainNode = null;
		this.mediaStream = null;
	}
}

export const store = new AppStore();
