/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/view/observer/compositionobserver
 */

import DomEventObserver from './domeventobserver';
import type View from '../view';
import type DomEventData from './domeventdata';

/**
 * {@link module:engine/view/document~Document#event:compositionstart Compositionstart},
 * {@link module:engine/view/document~Document#event:compositionupdate compositionupdate} and
 * {@link module:engine/view/document~Document#event:compositionend compositionend} events observer.
 *
 * Note that this observer is attached by the {@link module:engine/view/view~View} and is available by default.
 *
 * @extends module:engine/view/observer/domeventobserver~DomEventObserver
 */
export default class CompositionObserver extends DomEventObserver<'compositionstart' | 'compositionupdate' | 'compositionend'> {
	constructor( view: View ) {
		super( view );

		this.domEventType = [ 'compositionstart', 'compositionupdate', 'compositionend' ];
		const document = this.document;

		document.on<CompositionObserverEvent>( 'compositionstart', () => {
			document.isComposing = true;
		} );

		document.on<CompositionObserverEvent>( 'compositionend', () => {
			document.isComposing = false;
		} );
	}

	public onDomEvent( domEvent: CompositionEvent ): void {
		this.fire( domEvent.type, domEvent );
	}
}

export type CompositionObserverEvent = {
	name: 'compositionstart' | 'compositionupdate' | 'compositionend';
	args: [ data: DomEventData<CompositionEvent> ];
};

/**
 * Fired when composition starts inside one of the editables.
 *
 * Introduced by {@link module:engine/view/observer/compositionobserver~CompositionObserver}.
 *
 * Note that because {@link module:engine/view/observer/compositionobserver~CompositionObserver} is attached by the
 * {@link module:engine/view/view~View} this event is available by default.
 *
 * @see module:engine/view/observer/compositionobserver~CompositionObserver
 * @event module:engine/view/document~Document#event:compositionstart
 * @param {module:engine/view/observer/domeventdata~DomEventData} data Event data.
 */

/**
 * Fired when composition is updated inside one of the editables.
 *
 * Introduced by {@link module:engine/view/observer/compositionobserver~CompositionObserver}.
 *
 * Note that because {@link module:engine/view/observer/compositionobserver~CompositionObserver} is attached by the
 * {@link module:engine/view/view~View} this event is available by default.
 *
 * @see module:engine/view/observer/compositionobserver~CompositionObserver
 * @event module:engine/view/document~Document#event:compositionupdate
 * @param {module:engine/view/observer/domeventdata~DomEventData} data Event data.
 */

/**
 * Fired when composition ends inside one of the editables.
 *
 * Introduced by {@link module:engine/view/observer/compositionobserver~CompositionObserver}.
 *
 * Note that because {@link module:engine/view/observer/compositionobserver~CompositionObserver} is attached by the
 * {@link module:engine/view/view~View} this event is available by default.
 *
 * @see module:engine/view/observer/compositionobserver~CompositionObserver
 * @event module:engine/view/document~Document#event:compositionend
 * @param {module:engine/view/observer/domeventdata~DomEventData} data Event data.
 */
