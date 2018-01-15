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

	/**
	 * Returns whether the selection is collapsed. Selection is collapsed when there is exactly one range which is
	 * collapsed.
	 *
	 * @readonly
	 * @type {Boolean}
	 */
	get isCollapsed() {
		return this._selection.isCollapsed;
	}

	get anchor() {
		return this._selection.anchor;
	}

	get focus() {
		return this._selection.focus;
	}

	/**
	 * Returns number of ranges in selection.
	 *
	 * @readonly
	 * @type {Number}
	 */
	get rangeCount() {
		return this._selection.rangeCount;
	}

	get hasOwnRange() {
		return this._selection.hasOwnRange;
	}

	/**
	 * Specifies whether the {@link #focus}
	 * precedes {@link #anchor}.
	 *
	 * @readonly
	 * @type {Boolean}
	 */
	get isBackward() {
		return this._selection.isBackward;
	}

	/**
	 * Used for the compatibility with the {@link module:engine/model/selection~Selection#isEqual} method.
	 *
	 * @protected
	 */
	get _ranges() {
		return this._selection._ranges;
	}

	/**
	 * Returns an iterable that iterates over copies of selection ranges.
	 *
	 * @returns {Iterable.<module:engine/model/range~Range>}
	 */
	getRanges() {
		return this._selection.getRanges();
	}

	/**
	 * Returns the first position in the selection.
	 * First position is the position that {@link module:engine/model/position~Position#isBefore is before}
	 * any other position in the selection.
	 *
	 * Returns `null` if there are no ranges in selection.
	 *
	 * @returns {module:engine/model/position~Position|null}
	 */
	getFirstPosition() {
		return this._selection.getFirstPosition();
	}

	/**
	 * Returns the last position in the selection.
	 * Last position is the position that {@link module:engine/model/position~Position#isAfter is after}
	 * any other position in the selection.
	 *
	 * Returns `null` if there are no ranges in selection.
	 *
	 * @returns {module:engine/model/position~Position|null}
	 */
	getLastPosition() {
		return this._selection.getLastPosition();
	}

	/**
	 * Returns a copy of the first range in the selection.
	 * First range is the one which {@link module:engine/model/range~Range#start start} position
	 * {@link module:engine/model/position~Position#isBefore is before} start position of all other ranges
	 * (not to confuse with the first range added to the selection).
	 *
	 * Returns `null` if there are no ranges in selection.
	 *
	 * @returns {module:engine/model/range~Range|null}
	 */
	getFirstRange() {
		return this._selection.getFirstRange();
	}

	/**
	 * Returns a copy of the last range in the selection.
	 * Last range is the one which {@link module:engine/model/range~Range#end end} position
	 * {@link module:engine/model/position~Position#isAfter is after} end position of all other ranges (not to confuse with the range most
	 * recently added to the selection).
	 *
	 * Returns `null` if there are no ranges in selection.
	 *
	 * @returns {module:engine/model/range~Range|null}
	 */
	getLastRange() {
		return this._selection.getLastRange();
	}

	/**
	 * Gets elements of type "block" touched by the selection.
	 *
	 * This method's result can be used for example to apply block styling to all blocks covered by this selection.
	 *
	 * **Note:** `getSelectedBlocks()` always returns the deepest block.
	 *
	 * In this case the function will return exactly all 3 paragraphs:
	 *
	 *		<paragraph>[a</paragraph>
	 *		<quote>
	 *			<paragraph>b</paragraph>
	 *		</quote>
	 *		<paragraph>c]d</paragraph>
	 *
	 * In this case the paragraph will also be returned, despite the collapsed selection:
	 *
	 *		<paragraph>[]a</paragraph>
	 *
	 * **Special case**: If a selection ends at the beginning of a block, that block is not returned as from user perspective
	 * this block wasn't selected. See [#984](https://github.com/ckeditor/ckeditor5-engine/issues/984) for more details.
	 *
	 *		<paragraph>[a</paragraph>
	 *		<paragraph>b</paragraph>
	 *		<paragraph>]c</paragraph> // this block will not be returned
	 *
	 * @returns {Iterator.<module:engine/model/element~Element>}
	 */
	getSelectedBlocks() {
		return this._selection.getSelectedBlocks();
	}

	/**
	 * Checks whether the selection contains the entire content of the given element. This means that selection must start
	 * at a position {@link module:engine/model/position~Position#isTouching touching} the element's start and ends at position
	 * touching the element's end.
	 *
	 * By default, this method will check whether the entire content of the selection's current root is selected.
	 * Useful to check if e.g. the user has just pressed <kbd>Ctrl</kbd> + <kbd>A</kbd>.
	 *
	 * @param {module:engine/model/element~Element} [element=this.anchor.root]
	 * @returns {Boolean}
	 */
	containsEntireContent( element ) {
		return this._selection.containsEntireContent( element );
	}

	/**
	 * Moves {@link module:engine/model/documentselection~DocumentSelection#focus} to the specified location.
	 * Should be used only within the {@link module:engine/model/writer~Writer#setSelectionFocus} method.
	 *
	 * The location can be specified in the same form as {@link module:engine/model/position~Position.createAt} parameters.
	 *
	 * @see {module:engine/model/writer~Writer#setSelectionFocus}
	 * @protected
	 * @param {module:engine/model/item~Item|module:engine/model/position~Position} itemOrPosition
	 * @param {Number|'end'|'before'|'after'} [offset] Offset or one of the flags. Used only when
	 * first parameter is a {@link module:engine/model/item~Item model item}.
	 */
	_moveFocusTo( itemOrPosition, offset ) {
		this._selection.moveFocusTo( itemOrPosition, offset );
	}

	/**
	 * Sets this selection's ranges and direction to the specified location based on the given
	 * {@link module:engine/model/selection~Selection selection}, {@link module:engine/model/position~Position position},
	 * {@link module:engine/model/element~Element element}, {@link module:engine/model/position~Position position},
	 * {@link module:engine/model/range~Range range}, an iterable of {@link module:engine/model/range~Range ranges} or null.
	 * Should be used only within the {@link module:engine/model/writer~Writer#setSelection} method.
	 *
	 * @see {module:engine/model/writer~Writer#setTo}
	 * @protected
	 * @param {module:engine/model/selection~Selection|module:engine/model/selection~DocumentSelection|
	 * module:engine/model/position~Position|module:engine/model/element~Element|
	 * Iterable.<module:engine/model/range~Range>|module:engine/model/range~Range|null} selectable
	 * @param {Boolean|Number|'before'|'end'|'after'} [backwardSelectionOrOffset]
	 */
	_setTo( selectable, backwardSelectionOrOffset ) {
		this._selection.setTo( selectable, backwardSelectionOrOffset );
	}

	/**
	 * Unbinds all events previously bound by document selection.
	 */
	destroy() {
		this._selection.destroy();
	}

	getAttributeKeys() {
		return this._selection.getAttributeKeys();
	}

	/**
	 * Returns iterable that iterates over this selection's attributes.
	 *
	 * Attributes are returned as arrays containing two items. First one is attribute key and second is attribute value.
	 * This format is accepted by native `Map` object and also can be passed in `Node` constructor.
	 *
	 * @returns {Iterable.<*>}
	 */
	getAttributes() {
		return this._selection.getAttributes();
	}

	/**
	 * Gets an attribute value for given key or `undefined` if that attribute is not set on the selection.
	 *
	 * @param {String} key Key of attribute to look for.
	 * @returns {*} Attribute value or `undefined`.
	 */
	getAttribute( key ) {
		return this._selection.getAttribute( key );
	}

	/**
	 * Checks if the selection has an attribute for given key.
	 *
	 * @param {String} key Key of attribute to check.
	 * @returns {Boolean} `true` if attribute with given key is set on selection, `false` otherwise.
	 */
	hasAttribute( key ) {
		return this._selection.hasAttribute( key );
	}

	/**
	 * Sets attribute on the selection. If attribute with the same key already is set, it's value is overwritten.
	 * Should be used only within the {@link module:engine/model/writer~Writer#setSelectionAttribute} method.
	 *
	 * @see {module:engine/model/writer~Writer#setSelectionAttribute}
	 * @protected
	 * @param {String} key Key of the attribute to set.
	 * @param {*} value Attribute value.
	 */
	_setAttribute( key, value ) {
		this._selection.setAttribute( key, value );
	}

	/**
	 * Removes an attribute with given key from the selection.
	 * If the given attribute was set on the selection, fires the {@link #event:change} event with
	 * removed attribute key.
	 * Should be used only within the {@link module:engine/model/writer~Writer#removeSelectionAttribute} method.
	 *
	 * @see {module:engine/model/writer~Writer#removeSelectionAttribute}
	 * @protected
	 * @param {String} key Key of the attribute to remove.
	 */
	_removeAttribute( key ) {
		this._selection.removeAttribute( key );
	}

	/**
	 * @protected
	*/
	_clearAttributes() {
		this._selection.clearAttributes();
	}

	_getStoredAttributes() {
		return this._selection._getStoredAttributes();
	}

	/**
	 * @protected
	*/
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
