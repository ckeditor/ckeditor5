/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/view/observer/compositionobserver
 */

import DomEventObserver from './domeventobserver';
import DomEventData from './domeventdata';

/**
 * {@link module:engine/view/document~Document#event:compositionstart Compositionstart},
 * {@link module:engine/view/document~Document#event:compositionupdate compositionupdate} and
 * {@link module:engine/view/document~Document#event:compositionend compositionend} events observer.
 *
 * Note that this observer is attached by the {@link module:engine/view/view~View} and is available by default.
 *
 * @extends module:engine/view/observer/domeventobserver~DomEventObserver
 */
export default class CompositionObserver extends DomEventObserver {
	constructor( view ) {
		super( view );

		this.domEventType = [ 'compositionstart', 'compositionupdate', 'compositionend' ];
		const document = this.document;

		document.on( 'compositionstart', () => {
			document.isComposing = true;
		} );

		document.on( 'compositionend', ( evt, { domEvent } ) => {
			// TODO maybe this should be after 'insertText'
			document.isComposing = false;

			const domSelection = domEvent.target.ownerDocument.defaultView.getSelection();
			const firstDomRange = domSelection.getRangeAt( 0 );

			console.log( 'firstDomRange', firstDomRange );

			// In case of aborted composition.
			if ( !domEvent.data ) {
				return;
			}

			console.log( '[CompositionObserver] insertText', {
				text: domEvent.data,
				selection: document.selection
			} );

			// TODO maybe we should not pass the DOM event and only translate what we could need in the view/model
			document.fire( 'insertText', new DomEventData( document, domEvent, {
				text: domEvent.data,
				selection: document.selection
			} ) );
		} );

		document.on( 'compositionupdate', ( evt, { domEvent } ) => {
			console.log( 'compositionupdate', domEvent );
			const domSelection = domEvent.target.ownerDocument.defaultView.getSelection();
			const firstDomRange = domSelection.getRangeAt( 0 );

			if ( domSelection.isCollapsed ) {
				console.log( 'compositionupdate in collapsed selection: aborting' );
				return;
			}

			console.log( 'getFirstRange', view.domConverter.domSelectionToView( domSelection ).getFirstRange() );

			document.fire( 'insertText', new DomEventData( document, domEvent, {
				text: domEvent.data,
				selection: view.domConverter.domSelectionToView( domSelection )
			} ) );
		} );
	}

	onDomEvent( domEvent ) {
		this.fire( domEvent.type, domEvent );
	}
}

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
