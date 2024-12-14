import {withController} from '@snar/lit';
import {html, LitElement} from 'lit';
import {withStyles} from 'lit-with-styles';
import {customElement} from 'lit/decorators.js';
import {materialShellLoadingOff} from 'material-shell';
import {store} from '../store.js';
import styles from './app-shell.css?inline';
import {bindInput} from 'relit';

declare global {
	interface Window {
		app: AppShell;
	}
	interface HTMLElementTagNameMap {
		'app-shell': AppShell;
	}
}

@customElement('app-shell')
@withStyles(styles)
@withController(store)
export class AppShell extends LitElement {
	firstUpdated() {
		materialShellLoadingOff.call(this);
	}

	render() {
		return html`<!-- -->
			<div class="m-7 mb-2">
				<md-filled-button
					autofocus
					?error=${store.recording}
					@click=${() => {
						store.toggleRecording();
					}}
				>
					${store.recording
						? html`<!-- -->
								<md-icon slot="icon">stop</md-icon> Stop
								<!-- -->`
						: html`<!-- -->
								<md-icon slot="icon">mic</md-icon> Hear your mind
								<!-- -->`}
				</md-filled-button>
			</div>
			<div style="max-width:1200px">
				<div class="flex flex-col mx-7 my-5">
					<md-list-item inert>
						<div slot="headline">Echo time</div>
						<div slot="supporting-text">Time between repeats</div>
						<div slot="end" secondary>${store.delayTime}s</div>
					</md-list-item>
					<md-slider
						?disabled=${store.recording}
						ticks
						labeled
						value=${store.delayTime}
						${bindInput(store, 'delayTime')}
						min="0.1"
						max="20"
						step="0.1"
						class="flex-1"
					></md-slider>
				</div>
				<div class="flex flex-col mx-7 my-5">
					<md-list-item inert>
						<div slot="headline">Number of repeats</div>
						<div slot="supporting-text">
							How many times would the echoing echo?
						</div>
						<div slot="end" secondary>${store.echoLength} times</div>
					</md-list-item>
					<md-slider
						?disabled=${store.recording}
						labeled
						min="5"
						max="20"
						step="1"
						value=${store.echoLength}
						${bindInput(store, 'echoLength')}
						max="10"
						class="flex-1"
					></md-slider>
				</div>

				<div class="m-12">
					<div class="mb-3">Presets</div>
					<div class="flex gap-2">
						<md-filled-button
							?disabled=${store.recording}
							@click=${() => {
								store.delayTime = 0.1;
								store.echoLength = 20;
							}}
						>
							Karaoke
						</md-filled-button>

						<md-filled-button
							?disabled=${store.recording}
							@click=${() => {
								store.delayTime = 0.5;
								store.echoLength = 15;
							}}
						>
							Void
						</md-filled-button>

						<md-filled-button
							?disabled=${store.recording}
							@click=${() => {
								store.delayTime = 1;
								store.echoLength = 9;
							}}
						>
							Mountain
						</md-filled-button>

						<md-filled-button
							?disabled=${store.recording}
							@click=${() => {
								store.delayTime = 2;
								store.echoLength = 10;
							}}
						>
							Meditation
						</md-filled-button>

						<md-filled-button
							?disabled=${store.recording}
							@click=${() => {
								store.delayTime = 4;
								store.echoLength = 7;
							}}
						>
							Reasoning
						</md-filled-button>

						<md-filled-button
							?disabled=${store.recording}
							@click=${() => {
								store.delayTime = 15;
								store.echoLength = 7;
							}}
						>
							Reminder
						</md-filled-button>
					</div>
				</div>
			</div>
			<!-- -->`;
	}
}

export const app = (window.app = new AppShell());
