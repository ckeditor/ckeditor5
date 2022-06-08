/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/view/observer/compositionobserver
 */

import DomEventObserver from './domeventobserver';
import env from '@ckeditor/ckeditor5-utils/src/env';

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
		// const document = this.document;
		//
		// if ( !env.isAndroid ) {
		// 	document.on( 'compositionstart', () => {
		// 		document.isComposing = true;
		// 	} );
		//
		// 	document.on( 'compositionend', () => {
		// 		document.isComposing = false;
		// 	} );
		// }
	}

	onDomEvent( domEvent ) {
		console.group( '[CompositionObserver]', domEvent.type );
		console.groupCollapsed( '[CompositionObserver] DOM event' );
		console.dir( domEvent );
		console.groupEnd();

		let anchorViewPosition = null;

		if ( this.view.document.selection.isFake ) {
			// Future-proof: in case of multi-range fake selections being possible.
			anchorViewPosition = this.view.document.selection.anchor;

			console.info( '[CompositionObserver] using fake selection', anchorViewPosition );
		} else {
			const domSelection = domEvent.target.ownerDocument.defaultView.getSelection();

			try {
				anchorViewPosition = this.view.domConverter.domPositionToView( domSelection.anchorNode, domSelection.anchorOffset );

				console.info( '[CompositionObserver] using DOM selection', anchorViewPosition );
			} catch ( err ) {
				console.warn( '[CompositionObserver] can\'t map dom selection anchor to view',
					domSelection.anchorNode, domSelection.anchorOffset
				);
			}
		}

		this.fire( domEvent.type, domEvent, {
			targetRangeStart: anchorViewPosition
		} );

		console.groupEnd();
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
