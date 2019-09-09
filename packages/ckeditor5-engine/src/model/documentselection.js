/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/model/documentselection
 */

import mix from '@ckeditor/ckeditor5-utils/src/mix';
import EmitterMixin from '@ckeditor/ckeditor5-utils/src/emittermixin';

import Selection from './selection';
import LiveRange from './liverange';
import Text from './text';
import TextProxy from './textproxy';
import toMap from '@ckeditor/ckeditor5-utils/src/tomap';
import Collection from '@ckeditor/ckeditor5-utils/src/collection';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';
import uid from '@ckeditor/ckeditor5-utils/src/uid';

const storePrefix = 'selection:';

/**
 * `DocumentSelection` is a special selection which is used as the
 * {@link module:engine/model/document~Document#selection document's selection}.
 * There can be only one instance of `DocumentSelection` per document.
 *
 * Document selection can only be changed by using the {@link module:engine/model/writer~Writer} instance
 * inside the {@link module:engine/model/model~Model#change `change()`} block, as it provides a secure way to modify model.
 *
 * `DocumentSelection` is automatically updated upon changes in the {@link module:engine/model/document~Document document}
 * to always contain valid ranges. Its attributes are inherited from the text unless set explicitly.
 *
 * Differences between {@link module:engine/model/selection~Selection} and `DocumentSelection` are:
 * * there is always a range in `DocumentSelection` - even if no ranges were added there is a "default range"
 * present in the selection,
 * * ranges added to this selection updates automatically when the document changes,
 * * attributes of `DocumentSelection` are updated automatically according to selection ranges.
 *
 * Since `DocumentSelection` uses {@link module:engine/model/liverange~LiveRange live ranges}
 * and is updated when {@link module:engine/model/document~Document document}
 * changes, it cannot be set on {@link module:engine/model/node~Node nodes}
 * that are inside {@link module:engine/model/documentfragment~DocumentFragment document fragment}.
 * If you need to represent a selection in document fragment,
 * use {@link module:engine/model/selection~Selection Selection class} instead.
 *
 * @mixes module:utils/emittermixin~EmitterMixin
 */
export default class DocumentSelection {
	/**
	 * Creates an empty live selection for given {@link module:engine/model/document~Document}.
	 *
	 * @param {module:engine/model/document~Document} doc Document which owns this selection.
	 */
	constructor( doc ) {
		/**
		 * Selection used internally by that class (`DocumentSelection` is a proxy to that selection).
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

	/**
	 * Selection anchor. Anchor may be described as a position where the most recent part of the selection starts.
	 * Together with {@link #focus} they define the direction of selection, which is important
	 * when expanding/shrinking selection. Anchor is always {@link module:engine/model/range~Range#start start} or
	 * {@link module:engine/model/range~Range#end end} position of the most recently added range.
	 *
	 * Is set to `null` if there are no ranges in selection.
	 *
	 * @see #focus
	 * @readonly
	 * @type {module:engine/model/position~Position|null}
	 */
	get anchor() {
		return this._selection.anchor;
	}

	/**
	 * Selection focus. Focus is a position where the selection ends.
	 *
	 * Is set to `null` if there are no ranges in selection.
	 *
	 * @see #anchor
	 * @readonly
	 * @type {module:engine/model/position~Position|null}
	 */
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

	/**
	 * Describes whether `Documentselection` has own range(s) set, or if it is defaulted to
	 * {@link module:engine/model/document~Document#_getDefaultRange document's default range}.
	 *
	 * @readonly
	 * @type {Boolean}
	 */
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
	 * Describes whether the gravity is overridden (using {@link module:engine/model/writer~Writer#overrideSelectionGravity}) or not.
	 *
	 * Note that the gravity remains overridden as long as will not be restored the same number of times as it was overridden.
	 *
	 * @readonly
	 * @returns {Boolean}
	 */
	get isGravityOverridden() {
		return this._selection.isGravityOverridden;
	}

	/**
	 * A collection of selection markers.
	 * Marker is a selection marker when selection range is inside the marker range.
	 *
	 * @readonly
	 * @type {module:utils/collection~Collection.<module:engine/model/markercollection~Marker>}
	 */
	get markers() {
		return this._selection.markers;
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
	 * Gets elements of type {@link module:engine/model/schema~Schema#isBlock "block"} touched by the selection.
	 *
	 * This method's result can be used for example to apply block styling to all blocks covered by this selection.
	 *
	 * **Note:** `getSelectedBlocks()` returns blocks that are nested in other non-block elements
	 * but will not return blocks nested in other blocks.
	 *
	 * In this case the function will return exactly all 3 paragraphs (note: `<blockQuote>` is not a block itself):
	 *
	 *		<paragraph>[a</paragraph>
	 *		<blockQuote>
	 *			<paragraph>b</paragraph>
	 *		</blockQuote>
	 *		<paragraph>c]d</paragraph>
	 *
	 * In this case the paragraph will also be returned, despite the collapsed selection:
	 *
	 *		<paragraph>[]a</paragraph>
	 *
	 * In such a scenario, however, only blocks A, B & E will be returned as blocks C & D are nested in block B:
	 *
	 *		[<blockA></blockA>
	 *		<blockB>
	 *			<blockC></blockC>
	 *			<blockD></blockD>
	 *		</blockB>
	 *		<blockE></blockE>]
	 *
	 * If the selection is inside a block all the inner blocks (A & B) are returned:
	 *
	 * 		<block>
	 *			<blockA>[a</blockA>
	 * 			<blockB>b]</blockB>
	 * 		</block>
	 *
	 * **Special case**: If a selection ends at the beginning of a block, that block is not returned as from user perspective
	 * this block wasn't selected. See [#984](https://github.com/ckeditor/ckeditor5-engine/issues/984) for more details.
	 *
	 *		<paragraph>[a</paragraph>
	 *		<paragraph>b</paragraph>
	 *		<paragraph>]c</paragraph> // this block will not be returned
	 *
	 * @returns {Iterable.<module:engine/model/element~Element>}
	 */
	getSelectedBlocks() {
		return this._selection.getSelectedBlocks();
	}

	/**
	 * Returns the selected element. {@link module:engine/model/element~Element Element} is considered as selected if there is only
	 * one range in the selection, and that range contains exactly one element.
	 * Returns `null` if there is no selected element.
	 *
	 * @returns {module:engine/model/element~Element|null}
	 */
	getSelectedElement() {
		return this._selection.getSelectedElement();
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
	 * Unbinds all events previously bound by document selection.
	 */
	destroy() {
		this._selection.destroy();
	}

	/**
	 * Returns iterable that iterates over this selection's attribute keys.
	 *
	 * @returns {Iterable.<String>}
	 */
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
	 * Refreshes selection attributes and markers according to the current position in the model.
	 */
	refresh() {
		this._selection._updateMarkers();
		this._selection._updateAttributes( false );
	}

	/**
	 * Checks whether this object is of the given type.
	 *
	 *		selection.is( 'selection' ); // -> true
	 *		selection.is( 'documentSelection' ); // -> true
	 *		selection.is( 'model:selection' ); // -> true
	 *		selection.is( 'model:documentSelection' ); // -> true
	 *
	 *		selection.is( 'view:selection' ); // -> false
	 *		selection.is( 'element' ); // -> false
	 *		selection.is( 'node' ); // -> false
	 *
	 * {@link module:engine/model/node~Node#is Check the entire list of model objects} which implement the `is()` method.
	 *
	 * @param {String} type
	 * @returns {Boolean}
	 */
	is( type ) {
		return type == 'selection' ||
			type == 'model:selection' ||
			type == 'documentSelection' ||
			type == 'model:documentSelection';
	}

	/**
	 * Moves {@link module:engine/model/documentselection~DocumentSelection#focus} to the specified location.
	 * Should be used only within the {@link module:engine/model/writer~Writer#setSelectionFocus} method.
	 *
	 * The location can be specified in the same form as
	 * {@link module:engine/model/writer~Writer#createPositionAt writer.createPositionAt()} parameters.
	 *
	 * @see module:engine/model/writer~Writer#setSelectionFocus
	 * @protected
	 * @param {module:engine/model/item~Item|module:engine/model/position~Position} itemOrPosition
	 * @param {Number|'end'|'before'|'after'} [offset] Offset or one of the flags. Used only when
	 * first parameter is a {@link module:engine/model/item~Item model item}.
	 */
	_setFocus( itemOrPosition, offset ) {
		this._selection.setFocus( itemOrPosition, offset );
	}

	/**
	 * Sets this selection's ranges and direction to the specified location based on the given
	 * {@link module:engine/model/selection~Selectable selectable}.
	 * Should be used only within the {@link module:engine/model/writer~Writer#setSelection} method.
	 *
	 * @see module:engine/model/writer~Writer#setSelection
	 * @protected
	 * @param {module:engine/model/selection~Selectable} selectable
	 * @param {Number|'before'|'end'|'after'|'on'|'in'} [placeOrOffset] Sets place or offset of the selection.
	 * @param {Object} [options]
	 * @param {Boolean} [options.backward] Sets this selection instance to be backward.
	 */
	_setTo( selectable, placeOrOffset, options ) {
		this._selection.setTo( selectable, placeOrOffset, options );
	}

	/**
	 * Sets attribute on the selection. If attribute with the same key already is set, it's value is overwritten.
	 * Should be used only within the {@link module:engine/model/writer~Writer#setSelectionAttribute} method.
	 *
	 * @see module:engine/model/writer~Writer#setSelectionAttribute
	 * @protected
	 * @param {String} key Key of the attribute to set.
	 * @param {*} value Attribute value.
	 */
	_setAttribute( key, value ) {
		this._selection.setAttribute( key, value );
	}

	/**
	 * Removes an attribute with given key from the selection.
	 * If the given attribute was set on the selection, fires the {@link module:engine/model/selection~Selection#event:change:range}
	 * event with removed attribute key.
	 * Should be used only within the {@link module:engine/model/writer~Writer#removeSelectionAttribute} method.
	 *
	 * @see module:engine/model/writer~Writer#removeSelectionAttribute
	 * @protected
	 * @param {String} key Key of the attribute to remove.
	 */
	_removeAttribute( key ) {
		this._selection.removeAttribute( key );
	}

	/**
	 * Returns an iterable that iterates through all selection attributes stored in current selection's parent.
	 *
	 * @protected
	 * @returns {Iterable.<*>}
	 */
	_getStoredAttributes() {
		return this._selection._getStoredAttributes();
	}

	/**
	 * Temporarily changes the gravity of the selection from the left to the right.
	 *
	 * The gravity defines from which direction the selection inherits its attributes. If it's the default left
	 * gravity, the selection (after being moved by the the user) inherits attributes from its left hand side.
	 * This method allows to temporarily override this behavior by forcing the gravity to the right.
	 *
	 * It returns an unique identifier which is required to restore the gravity. It guarantees the symmetry
	 * of the process.
	 *
	 * @see module:engine/model/writer~Writer#overrideSelectionGravity
	 * @protected
	 * @returns {String} The unique id which allows restoring the gravity.
	 */
	_overrideGravity() {
		return this._selection.overrideGravity();
	}

	/**
	 * Restores the {@link ~DocumentSelection#_overrideGravity overridden gravity}.
	 *
	 * Restoring the gravity is only possible using the unique identifier returned by
	 * {@link ~DocumentSelection#_overrideGravity}. Note that the gravity remains overridden as long as won't be restored
	 * the same number of times it was overridden.
	 *
	 * @see module:engine/model/writer~Writer#restoreSelectionGravity
	 * @protected
	 * @param {String} uid The unique id returned by {@link #_overrideGravity}.
	 */
	_restoreGravity( uid ) {
		this._selection.restoreGravity( uid );
	}

	/**
	 * Generates and returns an attribute key for selection attributes store, basing on original attribute key.
	 *
	 * @protected
	 * @param {String} key Attribute key to convert.
	 * @returns {String} Converted attribute key, applicable for selection store.
	 */
	static _getStoreAttributeKey( key ) {
		return storePrefix + key;
	}

	/**
	 * Checks whether the given attribute key is an attribute stored on an element.
	 *
	 * @protected
	 * @param {String} key
	 * @returns {Boolean}
	 */
	static _isStoreAttributeKey( key ) {
		return key.startsWith( storePrefix );
	}
}

mix( DocumentSelection, EmitterMixin );

/**
 * Fired when selection range(s) changed.
 *
 * @event change:range
 * @param {Boolean} directChange In case of {@link module:engine/model/selection~Selection} class it is always set
 * to `true` which indicates that the selection change was caused by a direct use of selection's API.
 * The {@link module:engine/model/documentselection~DocumentSelection}, however, may change because its position
 * was directly changed through the {@link module:engine/model/writer~Writer writer} or because its position was
 * changed because the structure of the model has been changed (which means an indirect change).
 * The indirect change does not occur in case of normal (detached) selections because they are "static" (as "not live")
 * which mean that they are not updated once the document changes.
 */

/**
 * Fired when selection attribute changed.
 *
 * @event change:attribute
 * @param {Boolean} directChange In case of {@link module:engine/model/selection~Selection} class it is always set
 * to `true` which indicates that the selection change was caused by a direct use of selection's API.
 * The {@link module:engine/model/documentselection~DocumentSelection}, however, may change because its attributes
 * were directly changed through the {@link module:engine/model/writer~Writer writer} or because its position was
 * changed in the model and its attributes were refreshed (which means an indirect change).
 * The indirect change does not occur in case of normal (detached) selections because they are "static" (as "not live")
 * which mean that they are not updated once the document changes.
 * @param {Array.<String>} attributeKeys Array containing keys of attributes that changed.
 */

// `LiveSelection` is used internally by {@link module:engine/model/documentselection~DocumentSelection} and shouldn't be used directly.
//
// LiveSelection` is automatically updated upon changes in the {@link module:engine/model/document~Document document}
// to always contain valid ranges. Its attributes are inherited from the text unless set explicitly.
//
// Differences between {@link module:engine/model/selection~Selection} and `LiveSelection` are:
// * there is always a range in `LiveSelection` - even if no ranges were added there is a "default range"
// present in the selection,
// * ranges added to this selection updates automatically when the document changes,
// * attributes of `LiveSelection` are updated automatically according to selection ranges.
//
// @extends module:engine/model/selection~Selection
//

class LiveSelection extends Selection {
	// Creates an empty live selection for given {@link module:engine/model/document~Document}.
	// @param {module:engine/model/document~Document} doc Document which owns this selection.
	constructor( doc ) {
		super();

		// List of selection markers.
		// Marker is a selection marker when selection range is inside the marker range.
		//
		// @type {module:utils/collection~Collection}
		this.markers = new Collection( { idProperty: 'name' } );

		// Document which owns this selection.
		//
		// @protected
		// @member {module:engine/model/model~Model}
		this._model = doc.model;

		// Document which owns this selection.
		//
		// @protected
		// @member {module:engine/model/document~Document}
		this._document = doc;

		// Keeps mapping of attribute name to priority with which the attribute got modified (added/changed/removed)
		// last time. Possible values of priority are: `'low'` and `'normal'`.
		//
		// Priorities are used by internal `LiveSelection` mechanisms. All attributes set using `LiveSelection`
		// attributes API are set with `'normal'` priority.
		//
		// @private
		// @member {Map} module:engine/model/liveselection~LiveSelection#_attributePriority
		this._attributePriority = new Map();

		// Contains data required to fix ranges which have been moved to the graveyard.
		// @private
		// @member {Array} module:engine/model/liveselection~LiveSelection#_fixGraveyardRangesData
		this._fixGraveyardRangesData = [];

		// Flag that informs whether the selection ranges have changed. It is changed on true when `LiveRange#change:range` event is fired.
		// @private
		// @member {Array} module:engine/model/liveselection~LiveSelection#_hasChangedRange
		this._hasChangedRange = false;

		// Each overriding gravity adds an UID to the set and each removal removes it.
		// Gravity is overridden when there's at least one UID in the set.
		// Gravity is restored when the set is empty.
		// This is to prevent conflicts when gravity is overridden by more than one feature at the same time.
		// @private
		// @type {Set}
		this._overriddenGravityRegister = new Set();

		// Ensure selection is correct after each operation.
		this.listenTo( this._model, 'applyOperation', ( evt, args ) => {
			const operation = args[ 0 ];

			if ( !operation.isDocumentOperation || operation.type == 'marker' || operation.type == 'rename' || operation.type == 'noop' ) {
				return;
			}

			while ( this._fixGraveyardRangesData.length ) {
				const { liveRange, sourcePosition } = this._fixGraveyardRangesData.shift();

				this._fixGraveyardSelection( liveRange, sourcePosition );
			}

			if ( this._hasChangedRange ) {
				this._hasChangedRange = false;
				this.fire( 'change:range', { directChange: false } );
			}
		}, { priority: 'lowest' } );

		// Ensure selection is correct and up to date after each range change.
		this.on( 'change:range', () => {
			for ( const range of this.getRanges() ) {
				if ( !this._document._validateSelectionRange( range ) ) {
					/**
					 * Range from {@link module:engine/model/documentselection~DocumentSelection document selection}
					 * starts or ends at incorrect position.
					 *
					 * @error document-selection-wrong-position
					 * @param {module:engine/model/range~Range} range
					 */
					throw new CKEditorError(
						'document-selection-wrong-position: Range from document selection starts or ends at incorrect position.',
						this,
						{ range }
					);
				}
			}
		} );

		// Update markers data stored by the selection after each marker change.
		this.listenTo( this._model.markers, 'update', () => this._updateMarkers() );

		// Ensure selection is up to date after each change block.
		this.listenTo( this._document, 'change', ( evt, batch ) => {
			clearAttributesStoredInElement( this._model, batch );
		} );
	}

	get isCollapsed() {
		const length = this._ranges.length;

		return length === 0 ? this._document._getDefaultRange().isCollapsed : super.isCollapsed;
	}

	get anchor() {
		return super.anchor || this._document._getDefaultRange().start;
	}

	get focus() {
		return super.focus || this._document._getDefaultRange().end;
	}

	get rangeCount() {
		return this._ranges.length ? this._ranges.length : 1;
	}

	// Describes whether `LiveSelection` has own range(s) set, or if it is defaulted to
	// {@link module:engine/model/document~Document#_getDefaultRange document's default range}.
	//
	// @readonly
	// @type {Boolean}
	get hasOwnRange() {
		return this._ranges.length > 0;
	}

	// When set to `true` then selection attributes on node before the caret won't be taken
	// into consideration while updating selection attributes.
	//
	// @protected
	// @type {Boolean}
	get isGravityOverridden() {
		return !!this._overriddenGravityRegister.size;
	}

	// Unbinds all events previously bound by live selection.
	destroy() {
		for ( let i = 0; i < this._ranges.length; i++ ) {
			this._ranges[ i ].detach();
		}

		this.stopListening();
	}

	* getRanges() {
		if ( this._ranges.length ) {
			yield* super.getRanges();
		} else {
			yield this._document._getDefaultRange();
		}
	}

	getFirstRange() {
		return super.getFirstRange() || this._document._getDefaultRange();
	}

	getLastRange() {
		return super.getLastRange() || this._document._getDefaultRange();
	}

	setTo( selectable, optionsOrPlaceOrOffset, options ) {
		super.setTo( selectable, optionsOrPlaceOrOffset, options );
		this._updateAttributes( true );
	}

	setFocus( itemOrPosition, offset ) {
		super.setFocus( itemOrPosition, offset );
		this._updateAttributes( true );
	}

	setAttribute( key, value ) {
		if ( this._setAttribute( key, value ) ) {
			// Fire event with exact data.
			const attributeKeys = [ key ];
			this.fire( 'change:attribute', { attributeKeys, directChange: true } );
		}
	}

	removeAttribute( key ) {
		if ( this._removeAttribute( key ) ) {
			// Fire event with exact data.
			const attributeKeys = [ key ];
			this.fire( 'change:attribute', { attributeKeys, directChange: true } );
		}
	}

	overrideGravity() {
		const overrideUid = uid();

		// Remember that another overriding has been requested. It will need to be removed
		// before the gravity is to be restored.
		this._overriddenGravityRegister.add( overrideUid );

		if ( this._overriddenGravityRegister.size === 1 ) {
			this._updateAttributes( true );
		}

		return overrideUid;
	}

	restoreGravity( uid ) {
		if ( !this._overriddenGravityRegister.has( uid ) ) {
			/**
			 * Restoring gravity for an unknown UID is not possible. Make sure you are using a correct
			 * UID obtained from the {@link module:engine/model/writer~Writer#overrideSelectionGravity} to restore.
			 *
			 * @error document-selection-gravity-wrong-restore
			 * @param {String} uid The unique identifier returned by
			 * {@link module:engine/model/documentselection~DocumentSelection#_overrideGravity}.
			 */
			throw new CKEditorError(
				'document-selection-gravity-wrong-restore: Attempting to restore the selection gravity for an unknown UID.',
				this,
				{ uid }
			);
		}

		this._overriddenGravityRegister.delete( uid );

		// Restore gravity only when all overriding have been restored.
		if ( !this.isGravityOverridden ) {
			this._updateAttributes( true );
		}
	}

	_popRange() {
		this._ranges.pop().detach();
	}

	_pushRange( range ) {
		const liveRange = this._prepareRange( range );

		// `undefined` is returned when given `range` is in graveyard root.
		if ( liveRange ) {
			this._ranges.push( liveRange );
		}
	}

	// Prepares given range to be added to selection. Checks if it is correct,
	// converts it to {@link module:engine/model/liverange~LiveRange LiveRange}
	// and sets listeners listening to the range's change event.
	//
	// @private
	// @param {module:engine/model/range~Range} range
	_prepareRange( range ) {
		this._checkRange( range );

		if ( range.root == this._document.graveyard ) {
			// @if CK_DEBUG // console.warn( 'Trying to add a Range that is in the graveyard root. Range rejected.' );

			return;
		}

		const liveRange = LiveRange.fromRange( range );

		liveRange.on( 'change:range', ( evt, oldRange, data ) => {
			this._hasChangedRange = true;

			// If `LiveRange` is in whole moved to the graveyard, save necessary data. It will be fixed on `Model#applyOperation` event.
			if ( liveRange.root == this._document.graveyard ) {
				this._fixGraveyardRangesData.push( {
					liveRange,
					sourcePosition: data.deletionPosition
				} );
			}
		} );

		return liveRange;
	}

	_updateMarkers() {
		const markers = [];

		for ( const marker of this._model.markers ) {
			const markerRange = marker.getRange();

			for ( const selectionRange of this.getRanges() ) {
				if ( markerRange.containsRange( selectionRange, !selectionRange.isCollapsed ) ) {
					markers.push( marker );
				}
			}
		}

		for ( const marker of markers ) {
			if ( !this.markers.has( marker ) ) {
				this.markers.add( marker );
			}
		}

		for ( const marker of Array.from( this.markers ) ) {
			if ( !markers.includes( marker ) ) {
				this.markers.remove( marker );
			}
		}
	}

	// Updates this selection attributes according to its ranges and the {@link module:engine/model/document~Document model document}.
	//
	// @protected
	// @param {Boolean} clearAll
	// @fires change:attribute
	_updateAttributes( clearAll ) {
		const newAttributes = toMap( this._getSurroundingAttributes() );
		const oldAttributes = toMap( this.getAttributes() );

		if ( clearAll ) {
			// If `clearAll` remove all attributes and reset priorities.
			this._attributePriority = new Map();
			this._attrs = new Map();
		} else {
			// If not, remove only attributes added with `low` priority.
			for ( const [ key, priority ] of this._attributePriority ) {
				if ( priority == 'low' ) {
					this._attrs.delete( key );
					this._attributePriority.delete( key );
				}
			}
		}

		this._setAttributesTo( newAttributes );

		// Let's evaluate which attributes really changed.
		const changed = [];

		// First, loop through all attributes that are set on selection right now.
		// Check which of them are different than old attributes.
		for ( const [ newKey, newValue ] of this.getAttributes() ) {
			if ( !oldAttributes.has( newKey ) || oldAttributes.get( newKey ) !== newValue ) {
				changed.push( newKey );
			}
		}

		// Then, check which of old attributes got removed.
		for ( const [ oldKey ] of oldAttributes ) {
			if ( !this.hasAttribute( oldKey ) ) {
				changed.push( oldKey );
			}
		}

		// Fire event with exact data (fire only if anything changed).
		if ( changed.length > 0 ) {
			this.fire( 'change:attribute', { attributeKeys: changed, directChange: false } );
		}
	}

	// Internal method for setting `LiveSelection` attribute. Supports attribute priorities (through `directChange`
	// parameter).
	//
	// @private
	// @param {String} key Attribute key.
	// @param {*} value Attribute value.
	// @param {Boolean} [directChange=true] `true` if the change is caused by `Selection` API, `false` if change
	// is caused by `Batch` API.
	// @returns {Boolean} Whether value has changed.
	_setAttribute( key, value, directChange = true ) {
		const priority = directChange ? 'normal' : 'low';

		if ( priority == 'low' && this._attributePriority.get( key ) == 'normal' ) {
			// Priority too low.
			return false;
		}

		const oldValue = super.getAttribute( key );

		// Don't do anything if value has not changed.
		if ( oldValue === value ) {
			return false;
		}

		this._attrs.set( key, value );

		// Update priorities map.
		this._attributePriority.set( key, priority );

		return true;
	}

	// Internal method for removing `LiveSelection` attribute. Supports attribute priorities (through `directChange`
	// parameter).
	//
	// NOTE: Even if attribute is not present in the selection but is provided to this method, it's priority will
	// be changed according to `directChange` parameter.
	//
	// @private
	// @param {String} key Attribute key.
	// @param {Boolean} [directChange=true] `true` if the change is caused by `Selection` API, `false` if change
	// is caused by `Batch` API.
	// @returns {Boolean} Whether attribute was removed. May not be true if such attributes didn't exist or the
	// existing attribute had higher priority.
	_removeAttribute( key, directChange = true ) {
		const priority = directChange ? 'normal' : 'low';

		if ( priority == 'low' && this._attributePriority.get( key ) == 'normal' ) {
			// Priority too low.
			return false;
		}

		// Update priorities map.
		this._attributePriority.set( key, priority );

		// Don't do anything if value has not changed.
		if ( !super.hasAttribute( key ) ) {
			return false;
		}

		this._attrs.delete( key );

		return true;
	}

	// Internal method for setting multiple `LiveSelection` attributes. Supports attribute priorities (through
	// `directChange` parameter).
	//
	// @private
	// @param {Map.<String,*>} attrs Iterable object containing attributes to be set.
	// @returns {Set.<String>} Changed attribute keys.
	_setAttributesTo( attrs ) {
		const changed = new Set();

		for ( const [ oldKey, oldValue ] of this.getAttributes() ) {
			// Do not remove attribute if attribute with same key and value is about to be set.
			if ( attrs.get( oldKey ) === oldValue ) {
				continue;
			}

			// All rest attributes will be removed so changed attributes won't change .
			this._removeAttribute( oldKey, false );
		}

		for ( const [ key, value ] of attrs ) {
			// Attribute may not be set because of attributes or because same key/value is already added.
			const gotAdded = this._setAttribute( key, value, false );

			if ( gotAdded ) {
				changed.add( key );
			}
		}

		return changed;
	}

	// Returns an iterable that iterates through all selection attributes stored in current selection's parent.
	//
	// @protected
	// @returns {Iterable.<*>}
	* _getStoredAttributes() {
		const selectionParent = this.getFirstPosition().parent;

		if ( this.isCollapsed && selectionParent.isEmpty ) {
			for ( const key of selectionParent.getAttributeKeys() ) {
				if ( key.startsWith( storePrefix ) ) {
					const realKey = key.substr( storePrefix.length );

					yield [ realKey, selectionParent.getAttribute( key ) ];
				}
			}
		}
	}

	// Checks model text nodes that are closest to the selection's first position and returns attributes of first
	// found element. If there are no text nodes in selection's first position parent, it returns selection
	// attributes stored in that parent.
	//
	// @private
	// @returns {Iterable.<*>} Collection of attributes.
	_getSurroundingAttributes() {
		const position = this.getFirstPosition();
		const schema = this._model.schema;

		let attrs = null;

		if ( !this.isCollapsed ) {
			// 1. If selection is a range...
			const range = this.getFirstRange();

			// ...look for a first character node in that range and take attributes from it.
			for ( const value of range ) {
				// If the item is an object, we don't want to get attributes from its children.
				if ( value.item.is( 'element' ) && schema.isObject( value.item ) ) {
					break;
				}

				if ( value.type == 'text' ) {
					attrs = value.item.getAttributes();
					break;
				}
			}
		} else {
			// 2. If the selection is a caret or the range does not contain a character node...

			const nodeBefore = position.textNode ? position.textNode : position.nodeBefore;
			const nodeAfter = position.textNode ? position.textNode : position.nodeAfter;

			// When gravity is overridden then don't take node before into consideration.
			if ( !this.isGravityOverridden ) {
				// ...look at the node before caret and take attributes from it if it is a character node.
				attrs = getAttrsIfCharacter( nodeBefore );
			}

			// 3. If not, look at the node after caret...
			if ( !attrs ) {
				attrs = getAttrsIfCharacter( nodeAfter );
			}

			// 4. If not, try to find the first character on the left, that is in the same node.
			// When gravity is overridden then don't take node before into consideration.
			if ( !this.isGravityOverridden && !attrs ) {
				let node = nodeBefore;

				while ( node && !attrs ) {
					node = node.previousSibling;
					attrs = getAttrsIfCharacter( node );
				}
			}

			// 5. If not found, try to find the first character on the right, that is in the same node.
			if ( !attrs ) {
				let node = nodeAfter;

				while ( node && !attrs ) {
					node = node.nextSibling;
					attrs = getAttrsIfCharacter( node );
				}
			}

			// 6. If not found, selection should retrieve attributes from parent.
			if ( !attrs ) {
				attrs = this._getStoredAttributes();
			}
		}

		return attrs;
	}

	// Fixes a selection range after it ends up in graveyard root.
	//
	// @private
	// @param {module:engine/model/liverange~LiveRange} liveRange The range from selection, that ended up in the graveyard root.
	// @param {module:engine/model/position~Position} removedRangeStart Start position of a range which was removed.
	_fixGraveyardSelection( liveRange, removedRangeStart ) {
		// The start of the removed range is the closest position to the `liveRange` - the original selection range.
		// This is a good candidate for a fixed selection range.
		const positionCandidate = removedRangeStart.clone();

		// Find a range that is a correct selection range and is closest to the start of removed range.
		const selectionRange = this._model.schema.getNearestSelectionRange( positionCandidate );

		// Remove the old selection range before preparing and adding new selection range. This order is important,
		// because new range, in some cases, may intersect with old range (it depends on `getNearestSelectionRange()` result).
		const index = this._ranges.indexOf( liveRange );
		this._ranges.splice( index, 1 );
		liveRange.detach();

		// If nearest valid selection range has been found - add it in the place of old range.
		if ( selectionRange ) {
			// Check the range, convert it to live range, bind events, etc.
			const newRange = this._prepareRange( selectionRange );

			// Add new range in the place of old range.
			this._ranges.splice( index, 0, newRange );
		}
		// If nearest valid selection range cannot be found - just removing the old range is fine.
	}
}

// Helper function for {@link module:engine/model/liveselection~LiveSelection#_updateAttributes}.
//
// It takes model item, checks whether it is a text node (or text proxy) and, if so, returns it's attributes. If not, returns `null`.
//
// @param {module:engine/model/item~Item|null}  node
// @returns {Boolean}
function getAttrsIfCharacter( node ) {
	if ( node instanceof TextProxy || node instanceof Text ) {
		return node.getAttributes();
	}

	return null;
}

// Removes selection attributes from element which is not empty anymore.
//
// @private
// @param {module:engine/model/model~Model} model
// @param {module:engine/model/batch~Batch} batch
function clearAttributesStoredInElement( model, batch ) {
	const differ = model.document.differ;

	for ( const entry of differ.getChanges() ) {
		if ( entry.type != 'insert' ) {
			continue;
		}

		const changeParent = entry.position.parent;
		const isNoLongerEmpty = entry.length === changeParent.maxOffset;

		if ( isNoLongerEmpty ) {
			model.enqueueChange( batch, writer => {
				const storedAttributes = Array.from( changeParent.getAttributeKeys() )
					.filter( key => key.startsWith( storePrefix ) );

				for ( const key of storedAttributes ) {
					writer.removeAttribute( key, changeParent );
				}
			} );
		}
	}
}
