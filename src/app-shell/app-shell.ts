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
			<div class="flex items-center mx-3 my-5">
				<md-list-item inert>
					<div slot="headline">Echo time</div>
					<div slot="supporting-text">Time between repeats</div>
				</md-list-item>
				<md-slider
					ticks
					labeled
					value=${store.delayTime}
					${bindInput(store, 'delayTime')}
					max="10"
					class="flex-1"
				></md-slider>
			</div>
			<div class="flex items-center mx-3 my-5">
				<md-list-item inert>
					<div slot="headline">Echo loss</div>
					<div slot="supporting-text">Volume loss between repeats</div>
				</md-list-item>
				<md-slider
					ticks
					labeled
					min="0"
					max="2"
					step="0.1"
					value=${store.gain}
					${bindInput(store, 'gain')}
					max="10"
					class="flex-1"
				></md-slider>
			</div>
			<!-- -->`;
	}
}

export const app = (window.app = new AppShell());
