/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals Event, Node */

/**
 * Fires the `beforeinput` DOM event on the editor's editing root DOM
 * element with given data.
 *
 * @param {HTMLElement} domRoot
 * @param {Object} evtData
 * @param {String} evtData.inputType
 * @param {String} [ evtData.data ]
 * @param {DataTransfer} [ evtData.dataTransfer ]
 * @param {Array.<DOMRange>} [ evtData.ranges ]
 */
export function fireBeforeInputDomEvent( domRoot, evtData ) {
	const { inputType, data, dataTransfer, ranges } = evtData;

	const event = new Event( 'beforeinput' );

	Object.assign( event, {
		data,
		dataTransfer,
		inputType,
		getTargetRanges: () => ranges || []
	} );

	domRoot.dispatchEvent( event );
}

/**
 * Fires the `compositionend` DOM event on the editor's editing root DOM
 * element with given data.
 *
 * @param {HTMLElement} domRoot
 * @param {Object} evtData
 */
export function fireCompositionEndDomEvent( domRoot, evtData ) {
	domRoot.dispatchEvent( Object.assign( new Event( 'compositionend' ), evtData ) );
}

export class TypingSimulator {
	constructor( domRoot ) {
		this.domRoot = domRoot;
		this.domSelection = domRoot.ownerDocument.getSelection();
	}

	setCaret( domNode, offset ) {
		this.domSelection.collapse( domNode, offset );
	}

	moveCaret( shift ) {
		this.setCaret( this.domSelection.focusNode, this.domSelection.focusOffset + shift );
	}

	async typeChar( key ) {
		await this._fireKeyDownEvent( key );

		if ( await this._fireBeforeInputEvent( key, 'insertText' ) ) {
			await this._insertDomText( key );
			await this.moveCaret( 1 );
		} else {
			this._fireSelectionChangeEvent();
		}

		await this._fireKeyUpEvent( key );
	}

	async _insertDomText( data, node = this.domSelection.focusNode, offset = this.domSelection.focusOffset ) {
		if ( node.nodeType == Node.TEXT_NODE ) {
			node.insertData( offset, data );
		} else {
			throw new Error( 'not yet' );
		}
	}

	async _fireEvent( name, options, data = {} ) {
		return this.domRoot.dispatchEvent( Object.assign( new Event( name, options ), data ) );
	}

	async _fireKeyDownEvent( key, keyCode = key.charCodeAt( 0 ) ) {
		return this._fireEvent( 'keydown', {
			bubbles: true,
			cancelable: true
		}, {
			keyCode,
			key
		} );
	}

	async _fireKeyUpEvent( key, keyCode = key.charCodeAt( 0 ) ) {
		return this._fireEvent( 'keyup', {
			bubbles: true,
			cancelable: true
		}, {
			keyCode,
			key
		} );
	}

	async _fireBeforeInputEvent( data, type, ranges = [ this.domSelection.getRangeAt( 0 ) ] ) {
		return this._fireEvent( 'beforeinput', {
			bubbles: true,
			cancelable: true
		}, {
			inputType: type,
			data,
			getTargetRanges: () => ranges
		} );
	}

	async _fireSelectionChangeEvent() {
		return this.domRoot.ownerDocument.dispatchEvent( new Event( 'selectionchange' ) );
	}
}
