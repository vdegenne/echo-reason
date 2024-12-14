import {ReactiveController, state} from '@snar/lit';
import {type PropertyValues} from 'lit';
import {saveToLocalStorage} from 'snar-save-to-local-storage';
import {generateLogarithmicVolumeMap} from './utils.js';

declare global {
	interface Window {
		webkitAudioContext: typeof AudioContext;
	}
}

@saveToLocalStorage('something')
export class AppStore extends ReactiveController {
	@state() recording = false;
	@state() delayTime = 1;
	@state() echoLength = 15;
	@state() volume = 1;

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
			} else if (changed.has('volume')) {
				if (this.gainNode) {
					this.gainNode.gain.value = this.volume;
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

			this.microphone = this.audioContext.createMediaStreamSource(stream);

			let delayLastnode: DelayNode;
			// let gainValue = 1;
			const volumeMap = generateLogarithmicVolumeMap(this.echoLength);
			console.log(volumeMap);
			let i: number;
			for (i = 0; i < this.echoLength; i++) {
				// for (let gainValue = 1; gainValue >= 0; gainValue = this.echoLoss) {
				const delays = [];
				let remainingTime = this.delayTime;

				while (remainingTime > 0) {
					const delay = this.audioContext.createDelay();
					delay.delayTime.value = Math.min(remainingTime, 1); // Use up to 1s for each node
					delays.push(delay);
					remainingTime -= delay.delayTime.value;
				}
				const delayFirstNode = delays[0];

				// microphone -> first delay
				if (i === 0) {
					this.microphone.connect(delayFirstNode);
				}
				// or last delayLastnode -> delayFirstNode
				else {
					delayLastnode.connect(delayFirstNode);
				}
				// first delay -> last delay
				delayLastnode = delays[delays.length - 1];
				const gainNode = this.audioContext.createGain();
				gainNode.gain.value = volumeMap[i];
				delays.reduce((prev, curr) => {
					prev.connect(curr);
					return curr;
				});
				// last delay -> gain
				delayLastnode.connect(gainNode);
				// gain -> output
				gainNode.connect(this.audioContext.destination);
			}
			console.log(i);
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
