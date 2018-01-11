/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/model/documentselection
 */

import mix from '@ckeditor/ckeditor5-utils/src/mix';
import EmitterMixin from '@ckeditor/ckeditor5-utils/src/emittermixin';
import LiveSelection from './liveselection';

export default class DocumentSelection {
	/**
	 * Creates an empty live selection for given {@link module:engine/model/document~Document}.
	 *
	 * @param {module:engine/model/document~Document} doc Document which owns this selection.
	 */
	constructor( doc ) {
		/**
		 * TODO
		 *
		 * @protected
		 */
		this._selection = new LiveSelection( doc );

		this._selection.delegate( 'change:range' ).to( this );
		this._selection.delegate( 'change:attribute' ).to( this );
	}

	get isCollapsed() {
		return this._selection.isCollapsed;
	}

	get anchor() {
		return this._selection.anchor;
	}

	get focus() {
		return this._selection.focus;
	}

	get rangeCount() {
		return this._selection.rangeCount;
	}

	get hasOwnRange() {
		return this._selection.hasOwnRange;
	}

	get isBackward() {
		return this._selection.isBackward;
	}

	/**
	 * Used for Selection.isEqual fn.
	 *
	 * @protected
	*/
	get _ranges() {
		return this._selection._ranges;
	}

	getRanges() {
		return this._selection.getRanges();
	}

	getFirstPosition() {
		return this._selection.getFirstPosition();
	}

	getFirstRange() {
		return this._selection.getFirstRange();
	}

	getLastRange() {
		return this._selection.getLastRange();
	}

	getSelectedBlocks() {
		return this._selection.getSelectedBlocks();
	}

	containsEntireContent( element ) {
		return this._selection.containsEntireContent( element );
	}

	getLastPosition() {
		return this._selection.getLastPosition();
	}

	_moveFocusTo( itemOrPosition, offset ) {
		this._selection.moveFocusTo( itemOrPosition, offset );
	}

	_setTo( selectable, backwardSelectionOrOffset ) {
		this._selection.setTo( selectable, backwardSelectionOrOffset );
	}

	destroy() {
		this._selection.destroy();
	}

	getAttributeKeys() {
		return this._selection.getAttributeKeys();
	}

	getAttributes() {
		return this._selection.getAttributes();
	}

	getAttribute( key ) {
		return this._selection.getAttribute( key );
	}

	hasAttribute( key ) {
		return this._selection.hasAttribute( key );
	}

	_setAttribute( key, value ) {
		this._selection.setAttribute( key, value );
	}

	_removeAttribute( key ) {
		this._selection.removeAttribute( key );
	}

	_clearAttributes() {
		this._selection.clearAttributes();
	}

	_getStoredAttributes() {
		return this._selection._getStoredAttributes();
	}

	_setAttributesTo( attrs ) {
		return this._selection.setAttributesTo( attrs );
	}

	/**
	 * Generates and returns an attribute key for selection attributes store, basing on original attribute key.
	 *
	 * @protected
	 * @param {String} key Attribute key to convert.
	 * @returns {String} Converted attribute key, applicable for selection store.
	 */
	static _getStoreAttributeKey( key ) {
		return LiveSelection._getStoreAttributeKey( key );
	}

	/**
	 * Checks whether the given attribute key is an attribute stored on an element.
	 *
	 * @protected
	 * @param {String} storePrefix
	 * @returns {Boolean}
	 */
	static _isStoreAttributeKey( storePrefix ) {
		return LiveSelection._isStoreAttributeKey( storePrefix );
	}
}

mix( DocumentSelection, EmitterMixin );
