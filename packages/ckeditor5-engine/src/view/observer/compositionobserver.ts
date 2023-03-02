/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
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
 */
export default class CompositionObserver extends DomEventObserver<'compositionstart' | 'compositionupdate' | 'compositionend'> {
	/**
	 * @inheritDoc
	 */
	public readonly domEventType = [ 'compositionstart', 'compositionupdate', 'compositionend' ] as const;

	/**
	 * @inheritDoc
	 */
	constructor( view: View ) {
		super( view );

		const document = this.document;

		document.on<ViewDocumentCompositionStartEvent>( 'compositionstart', () => {
			// @if CK_DEBUG_TYPING // if ( ( window as any ).logCKETyping ) {
			// @if CK_DEBUG_TYPING // 	console.log( '%c[CompositionObserver] ' +
			// @if CK_DEBUG_TYPING // 		'┌───────────────────────────── isComposing = true ─────────────────────────────┐',
			// @if CK_DEBUG_TYPING // 		'font-weight: bold; color: green'
			// @if CK_DEBUG_TYPING // 	);
			// @if CK_DEBUG_TYPING // }
			document.isComposing = true;
		}, { priority: 'low' } );

		document.on<ViewDocumentCompositionEndEvent>( 'compositionend', () => {
			// @if CK_DEBUG_TYPING // if ( ( window as any ).logCKETyping ) {
			// @if CK_DEBUG_TYPING // 	console.log( '%c[CompositionObserver] ' +
			// @if CK_DEBUG_TYPING // 		'└───────────────────────────── isComposing = false ─────────────────────────────┘',
			// @if CK_DEBUG_TYPING // 		'font-weight: bold; color: green'
			// @if CK_DEBUG_TYPING // 	);
			// @if CK_DEBUG_TYPING // }
			document.isComposing = false;
		}, { priority: 'low' } );
	}

	/**
	 * @inheritDoc
	 */
	public onDomEvent( domEvent: CompositionEvent ): void {
		// @if CK_DEBUG_TYPING // if ( ( window as any ).logCKETyping ) {
		// @if CK_DEBUG_TYPING // 	console.group( `%c[CompositionObserver]%c ${ domEvent.type }`, 'color: green', '' );
		// @if CK_DEBUG_TYPING // }

		this.fire( domEvent.type, domEvent, {
			data: domEvent.data
		} );

		// @if CK_DEBUG_TYPING // if ( ( window as any ).logCKETyping ) {
		// @if CK_DEBUG_TYPING // 	console.groupEnd();
		// @if CK_DEBUG_TYPING // }
	}
}

export interface CompositionEventData extends DomEventData<CompositionEvent> {
	data: string | null;
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
 * @eventName module:engine/view/document~Document#compositionstart
 * @param data Event data.
 */
export type ViewDocumentCompositionStartEvent = {
	name: 'compositionstart';
	args: [ data: CompositionEventData ];
};

/**
 * Fired when composition is updated inside one of the editables.
 *
 * Introduced by {@link module:engine/view/observer/compositionobserver~CompositionObserver}.
 *
 * Note that because {@link module:engine/view/observer/compositionobserver~CompositionObserver} is attached by the
 * {@link module:engine/view/view~View} this event is available by default.
 *
 * @see module:engine/view/observer/compositionobserver~CompositionObserver
 * @eventName module:engine/view/document~Document#compositionupdate
 * @param data Event data.
 */
export type ViewDocumentCompositionUpdateEvent = {
	name: 'compositionupdate';
	args: [ data: CompositionEventData ];
};

/**
 * Fired when composition ends inside one of the editables.
 *
 * Introduced by {@link module:engine/view/observer/compositionobserver~CompositionObserver}.
 *
 * Note that because {@link module:engine/view/observer/compositionobserver~CompositionObserver} is attached by the
 * {@link module:engine/view/view~View} this event is available by default.
 *
 * @see module:engine/view/observer/compositionobserver~CompositionObserver
 * @eventName module:engine/view/document~Document#compositionend
 * @param data Event data.
 */
export type ViewDocumentCompositionEndEvent = {
	name: 'compositionend';
	args: [ data: CompositionEventData ];
};
