/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module utils/keystrokehandler
 */

import DomEmitterMixin, { type DomEmitter } from './dom/emittermixin.js';
import type { Emitter } from './emittermixin.js';
import { getCode, parseKeystroke, type KeystrokeInfo } from './keyboard.js';
import type { PriorityString } from './priorities.js';

/**
 * Keystroke handler allows registering callbacks for given keystrokes.
 *
 * The most frequent use of this class is through the {@link module:core/editor/editor~Editor#keystrokes `editor.keystrokes`}
 * property. It allows listening to keystrokes executed in the editing view:
 *
 * ```ts
 * editor.keystrokes.set( 'Ctrl+A', ( keyEvtData, cancel ) => {
 * 	console.log( 'Ctrl+A has been pressed' );
 * 	cancel();
 * } );
 * ```
 *
 * However, this utility class can be used in various part of the UI. For instance, a certain {@link module:ui/view~View}
 * can use it like this:
 *
 * ```ts
 * class MyView extends View {
 * 	constructor() {
 * 		this.keystrokes = new KeystrokeHandler();
 *
 * 		this.keystrokes.set( 'tab', handleTabKey );
 * 	}
 *
 * 	render() {
 * 		super.render();
 *
 * 		this.keystrokes.listenTo( this.element );
 * 	}
 * }
 * ```
 *
 * That keystroke handler will listen to `keydown` events fired in this view's main element.
 *
 */
export default class KeystrokeHandler {
	/**
	 * Listener used to listen to events for easier keystroke handler destruction.
	 */
	private readonly _listener: DomEmitter;

	/**
	 * Creates an instance of the keystroke handler.
	 */
	constructor() {
		this._listener = new ( DomEmitterMixin() )();
	}

	/**
	 * Starts listening for `keydown` events from a given emitter.
	 */
	public listenTo( emitter: Emitter | HTMLElement | Window ): void {
		// The #_listener works here as a kind of dispatcher. It groups the events coming from the same
		// keystroke so the listeners can be attached to them with different priorities.
		//
		// E.g. all the keystrokes with the `keyCode` of 42 coming from the `emitter` are propagated
		// as a `_keydown:42` event by the `_listener`. If there's a callback created by the `set`
		// method for this 42 keystroke, it listens to the `_listener#_keydown:42` event only and interacts
		// only with other listeners of this particular event, thus making it possible to prioritize
		// the listeners and safely cancel execution, when needed. Instead of duplicating the Emitter logic,
		// the KeystrokeHandler re–uses it to do its job.
		this._listener.listenTo( emitter as HTMLElement | Window, 'keydown', ( evt, keyEvtData ) => {
			this._listener.fire( '_keydown:' + getCode( keyEvtData ), keyEvtData );
		} );
	}

	/**
	 * Registers a handler for the specified keystroke.
	 *
	 * @param keystroke Keystroke defined in a format accepted by
	 * the {@link module:utils/keyboard~parseKeystroke} function.
	 * @param callback A function called with the
	 * {@link module:engine/view/observer/keyobserver~KeyEventData key event data} object and
	 * a helper function to call both `preventDefault()` and `stopPropagation()` on the underlying event.
	 * @param options Additional options.
	 */
	public set(
		keystroke: string | ReadonlyArray<string | number>,
		callback: ( ev: KeyboardEvent, cancel: () => void ) => void,
		options: KeystrokeHandlerOptions = {}
	): void {
		const keyCode = parseKeystroke( keystroke );
		const priority = options.priority;

		// Execute the passed callback on KeystrokeHandler#_keydown.
		// TODO: https://github.com/ckeditor/ckeditor5-utils/issues/144
		this._listener.listenTo( this._listener, '_keydown:' + keyCode, ( evt, keyEvtData: KeyboardEvent ) => {
			if ( options.filter && !options.filter( keyEvtData ) ) {
				return;
			}

			callback( keyEvtData, () => {
				// Stop the event in the DOM: no listener in the web page
				// will be triggered by this event.
				keyEvtData.preventDefault();
				keyEvtData.stopPropagation();

				// Stop the event in the KeystrokeHandler: no more callbacks
				// will be executed for this keystroke.
				evt.stop();
			} );

			// Mark this keystroke as handled by the callback. See: #press.
			evt.return = true;
		}, { priority } );
	}

	/**
	 * Triggers a keystroke handler for a specified key combination, if such a keystroke was {@link #set defined}.
	 *
	 * @param keyEvtData Key event data.
	 * @returns Whether the keystroke was handled.
	 */
	public press( keyEvtData: Readonly<KeystrokeInfo> ): boolean {
		return !!this._listener.fire( '_keydown:' + getCode( keyEvtData ), keyEvtData );
	}

	/**
	 * Stops listening to `keydown` events from the given emitter.
	 */
	public stopListening( emitter?: Emitter | HTMLElement | Window ): void {
		this._listener.stopListening( emitter );
	}

	/**
	 * Destroys the keystroke handler.
	 */
	public destroy(): void {
		this.stopListening();
	}
}

/**
 * {@link module:utils/keystrokehandler~KeystrokeHandler#set} method options.
 */
export interface KeystrokeHandlerOptions {

	/**
	 * The priority of the keystroke callback. The higher the priority value the sooner the callback will be executed.
	 * Keystrokes having the same priority are called in the order they were added.
	 */
	readonly priority?: PriorityString;

	/**
	 * An optional callback function allowing for filtering keystrokes based on arbitrary criteria.
	 * The callback function receives `keydown` DOM event as a parameter.
	 */
	readonly filter?: ( keyEvtData: KeyboardEvent ) => boolean;
}
