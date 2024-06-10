/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/view/observer/editcontextobserver
 */

import DomEventObserver from './domeventobserver.js';
import { env, isEventTarget } from '@ckeditor/ckeditor5-utils';

// @if CK_DEBUG_TYPING // const { _debouncedLine } = require( '../../dev-utils/utils.js' );

/**
 * TODO
 */
export default class EditContextObserver extends DomEventObserver<'textupdate'> {
	/**
	 * @inheritDoc
	 */
	public readonly domEventType = [ 'textupdate' ] as const;

	/**
	 * @inheritDoc
	 */
	public onDomEvent( domEvent: CompositionEvent ): void {
		// @if CK_DEBUG_TYPING // if ( ( window as any ).logCKETyping ) {
		// @if CK_DEBUG_TYPING // 	_debouncedLine();
		// @if CK_DEBUG_TYPING // 	console.group( `%c[EditContextObserver]%c ${ domEvent.type }`, 'color: green', '' );
		// @if CK_DEBUG_TYPING // }

		console.log(
			`The user entered the text: ${ _escapeTextNodeData( domEvent.text ) } ` +
			`at [${ domEvent.updateRangeStart } - ${ domEvent.updateRangeEnd }] offset.` +
			`Selection: [${ domEvent.selectionStart } - ${ domEvent.selectionEnd }] offset`
		);

		// const parent = this.document.selection.getFirstPosition()!.parent;
		// const parentElement = parent.is( 'element' ) ? parent : parent.parent;

		// this.fire( 'insertText', new DomEventData( this.view, {}, {
		// 	text: domEvent.text,
		// 	selection: this.view.createSelection(
		// 		this.view.createRangeIn( parentElement )
		// 	)
		// } ) );

		this.fire( domEvent.type, domEvent, {
			data: domEvent.data
		} );

		// @if CK_DEBUG_TYPING // if ( ( window as any ).logCKETyping ) {
		// @if CK_DEBUG_TYPING // 	console.groupEnd();
		// @if CK_DEBUG_TYPING // }
	}

	/**
	 * @inheritDoc
	 */
	public override observe( domElement: HTMLElement | EventTarget ): void {
		// if ( env.features.isEditContextSupported && !domElement.editContext ) {
		// 	// TODO this should be added to all nested editables
		// 	( domElement as any ).editContext = new ( window as any ).EditContext();
		// }

		if ( 'editContext' in domElement && isEventTarget( domElement.editContext ) ) {
			super.observe( domElement.editContext );
		}
	}

	/**
	 * @inheritDoc
	 */
	public override stopObserving( domElement: HTMLElement | EventTarget ): void {
		super.stopObserving( domElement );

		if ( 'editContext' in domElement && isEventTarget( domElement.editContext ) ) {
			super.stopObserving( domElement.editContext );
		}
	}
}

function _escapeTextNodeData( text ) {
	const escapedText = text
		.replace( /&/g, '&amp;' )
		.replace( /\u00A0/g, '&nbsp;' )
		.replace( /\u2060/g, '&NoBreak;' );

	return `"${ escapedText }"`;
}
