/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Position from './position.js';
import Range from './range.js';
import LiveRange from './liverange.js';
import EmitterMixin from '../../utils/emittermixin.js';
import CharacterProxy from './characterproxy.js';
import CKEditorError from '../../utils/ckeditorerror.js';
import toMap from '../../utils/tomap.js';
import mix from '../../utils/mix.js';

const storePrefix = 'selection:';

/**
 * Represents a selection that is made on nodes in {@link engine.model.Document}. `Selection` instance is
 * created by {@link engine.model.Document}. You should not need to create an instance of `Selection`.
 *
 * Keep in mind that selection always contains at least one range. If no ranges has been added to selection or all ranges
 * got removed from selection, the selection will be reset to contain {@link engine.model.Selection#_getDefaultRange the default range}.
 *
 * @memberOf engine.model
 */
export default class Selection {
	/**
	 * Creates an empty selection.
	 *
	 * @param {engine.model.Document} document Document which owns this selection.
	 */
	constructor( document ) {
		/**
		 * List of attributes set on current selection.
		 *
		 * @protected
		 * @member {Map} engine.model.Selection#_attrs
		 */
		this._attrs = new Map();

		/**
		 * Document which owns this selection.
		 *
		 * @private
		 * @member {engine.model.Document} engine.model.Selection#_document
		 */
		this._document = document;

		/**
		 * Specifies whether the last added range was added as a backward or forward range.
		 *
		 * @private
		 * @member {Boolean} engine.model.Selection#_lastRangeBackward
		 */
		this._lastRangeBackward = false;

		/**
		 * Stores all ranges that are selected.
		 *
		 * @private
		 * @member {Array.<engine.model.LiveRange>} engine.model.Selection#_ranges
		 */
		this._ranges = [];
	}

	/**
	 * Selection anchor. Anchor may be described as a position where the selection starts. Together with
	 * {@link engine.model.Selection#focus} they define the direction of selection, which is important
	 * when expanding/shrinking selection. Anchor is always the start or end of the most recent added range.
	 * It may be a bit unintuitive when there are multiple ranges in selection.
	 *
	 * @see engine.model.Selection#focus
	 * @type {engine.model.LivePosition}
	 */
	get anchor() {
		let range = this._ranges.length ? this._ranges[ this._ranges.length - 1 ] : this._getDefaultRange();

		return this._lastRangeBackward ? range.end : range.start;
	}

	/**
	 * Selection focus. Focus is a position where the selection ends.
	 *
	 * @see engine.model.Selection#anchor
	 * @type {engine.model.LivePosition}
	 */
	get focus() {
		let range = this._ranges.length ? this._ranges[ this._ranges.length - 1 ] : this._getDefaultRange();

		return this._lastRangeBackward ? range.start : range.end;
	}

	/**
	 * Returns whether the selection is collapsed. Selection is collapsed when there is exactly one range which is
	 * collapsed.
	 *
	 * @type {Boolean}
	 */
	get isCollapsed() {
		const length = this._ranges.length;

		if ( length === 0 ) {
			// Default range is collapsed.
			return true;
		} else if ( length === 1 ) {
			return this._ranges[ 0 ].isCollapsed;
		} else {
			return false;
		}
	}

	/**
	 * Returns number of ranges in selection.
	 *
	 * @type {Number}
     */
	get rangeCount() {
		return this._ranges.length ? this._ranges.length : 1;
	}

	/**
	 * Specifies whether the {@link engine.model.Selection#focus} precedes {@link engine.model.Selection#anchor}.
	 *
	 * @type {Boolean}
	 */
	get isBackward() {
		return !this.isCollapsed && this._lastRangeBackward;
	}

	/**
	 * Adds a range to the selection. Added range is copied and converted to {@link engine.model.LiveRange}. This means
	 * that passed range is not saved in the Selection instance and you can safely operate on it.
	 *
	 * Accepts a flag describing in which way the selection is made - passed range might be selected from
	 * {@link engine.model.Range#start} to {@link engine.model.Range#end} or from {@link engine.model.Range#end}
	 * to {@link engine.model.Range#start}. The flag is used to set {@link engine.model.Selection#anchor} and
	 * {@link engine.model.Selection#focus} properties.
	 *
	 * @fires engine.model.Selection#change:range
	 * @param {engine.model.Range} range Range to add.
	 * @param {Boolean} [isBackward] Flag describing if added range was selected forward - from start to end (`false`)
	 * or backward - from end to start (`true`). Defaults to `false`.
	 */
	addRange( range, isBackward ) {
		this._pushRange( range );
		this._lastRangeBackward = !!isBackward;

		this.fire( 'change:range' );
	}

	/**
	 * Unbinds all events previously bound by this selection or objects created by this selection.
	 */
	destroy() {
		for ( let i = 0; i < this._ranges.length; i++ ) {
			this._ranges[ i ].detach();
		}
	}

	/**
	 * Returns an iterator that contains copies of all ranges added to the selection.
	 *
	 * @returns {Iterator.<engine.model.Range>}
	 */
	*getRanges() {
		if ( this._ranges.length ) {
			for ( let range of this._ranges ) {
				yield Range.createFromRange( range );
			}
		} else {
			yield this._getDefaultRange();
		}
	}

	/**
	 * Returns the first range in the selection. First range is the one which {@link engine.model.Range#start start} position
	 * {@link engine.model.Position#isBefore is before} start position of all other ranges (not to confuse with the first range
	 * added to the selection).
	 *
	 * @returns {engine.model.Range}
	 */
	getFirstRange() {
		let first = null;

		for ( let i = 0; i < this._ranges.length; i++ ) {
			let range = this._ranges[ i ];

			if ( !first || range.start.isBefore( first.start ) ) {
				first = range;
			}
		}

		return first ? Range.createFromRange( first ) : this._getDefaultRange();
	}

	/**
	 * Returns the first position in the selection. First position is the position that {@link engine.model.Position#isBefore is before}
	 * any other position in the selection ranges.
	 *
	 * @returns {engine.model.Position}
	 */
	getFirstPosition() {
		return Position.createFromPosition( this.getFirstRange().start );
	}

	/**
	 * Removes all ranges that were added to the selection. Fires update event.
	 *
	 * @fires engine.model.Selection#change:range
	 */
	removeAllRanges() {
		this.destroy();
		this._ranges = [];

		this.fire( 'change:range' );
	}

	/**
	 * Replaces all ranges that were added to the selection with given array of ranges. Last range of the array
	 * is treated like the last added range and is used to set {@link #anchor} and {@link #focus}. Accepts a flag
	 * describing in which way the selection is made (see {@link #addRange}).
	 *
	 * @fires engine.model.Selection#change:range
	 * @param {Array.<engine.model.Range>} newRanges Array of ranges to set.
	 * @param {Boolean} [isLastBackward] Flag describing if last added range was selected forward - from start to end (`false`)
	 * or backward - from end to start (`true`). Defaults to `false`.
	 */
	setRanges( newRanges, isLastBackward ) {
		this.destroy();
		this._ranges = [];

		for ( let i = 0; i < newRanges.length; i++ ) {
			this._pushRange( newRanges[ i ] );
		}

		this._lastRangeBackward = !!isLastBackward;

		this.fire( 'change:range' );
	}

	/**
	 * Sets collapsed selection in the specified location.
	 *
	 * The location can be specified in the same form as {@link engine.model.Position.createAt} parameters.
	 *
	 * @fires engine.model.Selection#change:range
	 * @param {engine.model.Node|engine.model.Position} nodeOrPosition
	 * @param {Number|'END'|'BEFORE'|'AFTER'} [offset=0] Offset or one of the flags. Used only when
	 * first parameter is a node.
	 */
	collapse( nodeOrPosition, offset ) {
		const pos = Position.createAt( nodeOrPosition, offset );
		const range = new Range( pos, pos );

		this.setRanges( [ range ] );
	}

	/**
	 * Sets {@link engine.model.Selection#focus} in the specified location.
	 *
	 * The location can be specified in the same form as {@link engine.model.Position.createAt} parameters.
	 *
	 * @fires engine.model.Selection#change:range
	 * @param {engine.model.Node|engine.model.Position} nodeOrPosition
	 * @param {Number|'END'|'BEFORE'|'AFTER'} [offset=0] Offset or one of the flags. Used only when
	 * first parameter is a node.
	 */
	setFocus( nodeOrPosition, offset ) {
		const newFocus = Position.createAt( nodeOrPosition, offset );

		if ( newFocus.compareWith( this.focus ) == 'SAME' ) {
			return;
		}

		const anchor = this.anchor;

		if ( this._ranges.length ) {
			// TODO Replace with _popRange, so child classes can override this (needed for #329).
			this._ranges.pop().detach();
		}

		if ( newFocus.compareWith( anchor ) == 'BEFORE' ) {
			this.addRange( new Range( newFocus, anchor ), true );
		} else {
			this.addRange( new Range( anchor, newFocus ) );
		}
	}

	/**
	 * Removes all attributes from the selection.
	 *
	 * @fires engine.model.Selection#change:attribute
	 */
	clearAttributes() {
		this._attrs.clear();
		this._setStoredAttributesTo( new Map() );

		this.fire( 'change:attribute' );
	}

	/**
	 * Gets an attribute value for given key or undefined it that attribute is not set on selection.
	 *
	 * @param {String} key Key of attribute to look for.
	 * @returns {*} Attribute value or null.
	 */
	getAttribute( key ) {
		return this._attrs.get( key );
	}

	/**
	 * Returns iterator that iterates over this selection attributes.
	 *
	 * @returns {Iterable.<*>}
	 */
	getAttributes() {
		return this._attrs[ Symbol.iterator ]();
	}

	/**
	 * Checks if the selection has an attribute for given key.
	 *
	 * @param {String} key Key of attribute to check.
	 * @returns {Boolean} `true` if attribute with given key is set on selection, `false` otherwise.
	 */
	hasAttribute( key ) {
		return this._attrs.has( key );
	}

	/**
	 * Removes an attribute with given key from the selection.
	 *
	 * @fires engine.model.Selection#change:attribute
	 * @param {String} key Key of attribute to remove.
	 */
	removeAttribute( key ) {
		this._attrs.delete( key );
		this._removeStoredAttribute( key );

		this.fire( 'change:attribute' );
	}

	/**
	 * Sets attribute on the selection. If attribute with the same key already is set, it overwrites its values.
	 *
	 * @fires engine.model.Selection#change:attribute
	 * @param {String} key Key of attribute to set.
	 * @param {*} value Attribute value.
	 */
	setAttribute( key, value ) {
		this._attrs.set( key, value );
		this._storeAttribute( key, value );

		this.fire( 'change:attribute' );
	}

	/**
	 * Removes all attributes from the selection and sets given attributes.
	 *
	 * @fires engine.model.Selection#change:attribute
	 * @param {Iterable|Object} attrs Iterable object containing attributes to be set.
	 */
	setAttributesTo( attrs ) {
		this._attrs = toMap( attrs );
		this._setStoredAttributesTo( this._attrs );

		this.fire( 'change:attribute' );
	}

	/**
	 * Converts given range to {@link engine.model.LiveRange} and adds it to internal ranges array. Throws an error
	 * if given range is intersecting with any range that is already stored in this selection.
	 *
	 * @private
	 * @param {engine.model.Range} range Range to add.
	 */
	_pushRange( range ) {
		for ( let i = 0; i < this._ranges.length ; i++ ) {
			if ( range.isIntersecting( this._ranges[ i ] ) ) {
				/**
				 * Trying to add a range that intersects with another range from selection.
				 *
				 * @error selection-range-intersects
				 * @param {engine.model.Range} addedRange Range that was added to the selection.
				 * @param {engine.model.Range} intersectingRange Range from selection that intersects with `addedRange`.
				 */
				throw new CKEditorError(
					'selection-range-intersects: Trying to add a range that intersects with another range from selection.',
					{ addedRange: range, intersectingRange: this._ranges[ i ] }
				);
			}
		}

		this._ranges.push( LiveRange.createFromRange( range ) );
	}

	/**
	 * Iterates through all attributes stored in current selection's parent.
	 *
	 * @returns {Iterable.<*>}
	 */
	*_getStoredAttributes() {
		const selectionParent = this.getFirstPosition().parent;

		if ( this.isCollapsed && selectionParent.getChildCount() === 0 ) {
			for ( let attr of selectionParent.getAttributes() ) {
				if ( attr[ 0 ].indexOf( storePrefix ) === 0 ) {
					const realKey = attr[ 0 ].substr( storePrefix.length );

					yield [ realKey, attr[ 1 ] ];
				}
			}
		}
	}

	/**
	 * Removes attribute with given key from attributes stored in current selection's parent node.
	 *
	 * @private
	 * @param {String} key Key of attribute to remove.
	 */
	_removeStoredAttribute( key ) {
		const selectionParent = this.getFirstPosition().parent;

		if ( this.isCollapsed && selectionParent.getChildCount() === 0 ) {
			const storeKey = Selection._getStoreAttributeKey( key );

			this._document.enqueueChanges( () => {
				this._document.batch().removeAttr( storeKey, selectionParent );
			} );
		}
	}

	/**
	 * Stores given attribute key and value in current selection's parent node if the selection is collapsed and
	 * the parent node is empty.
	 *
	 * @private
	 * @param {String} key Key of attribute to set.
	 * @param {*} value Attribute value.
	 */
	_storeAttribute( key, value ) {
		const selectionParent = this.getFirstPosition().parent;

		if ( this.isCollapsed && selectionParent.getChildCount() === 0 ) {
			const storeKey = Selection._getStoreAttributeKey( key );

			this._document.enqueueChanges( () => {
				this._document.batch().setAttr( storeKey, value, selectionParent );
			} );
		}
	}

	/**
	 * Sets selection attributes stored in current selection's parent node to given set of attributes.
	 *
	 * @param {Iterable|Object} attrs Iterable object containing attributes to be set.
	 * @private
	 */
	_setStoredAttributesTo( attrs ) {
		const selectionParent = this.getFirstPosition().parent;

		if ( this.isCollapsed && selectionParent.getChildCount() === 0 ) {
			this._document.enqueueChanges( () => {
				const batch = this._document.batch();

				for ( let attr of this._getStoredAttributes() ) {
					const storeKey = Selection._getStoreAttributeKey( attr[ 0 ] );

					batch.removeAttr( storeKey, selectionParent );
				}

				for ( let attr of attrs ) {
					const storeKey = Selection._getStoreAttributeKey( attr[ 0 ] );

					batch.setAttr( storeKey, attr[ 1 ], selectionParent );
				}
			} );
		}
	}

	/**
	 * Updates this selection attributes based on it's position in the model.
	 *
	 * @protected
	 */
	_updateAttributes() {
		const position = this.getFirstPosition();
		const positionParent = position.parent;

		let attrs = null;

		if ( !this.isCollapsed ) {
			// 1. If selection is a range...
			const range = this.getFirstRange();

			// ...look for a first character node in that range and take attributes from it.
			for ( let item of range ) {
				// This is not an optimal solution because of https://github.com/ckeditor/ckeditor5-engine/issues/454.
				// It can be done better by using `break;` instead of checking `attrs === null`.
				if ( item.type == 'TEXT' && attrs === null ) {
					attrs = item.item.getAttributes();
				}
			}
		} else {
			// 2. If the selection is a caret or the range does not contain a character node...

			const nodeBefore = positionParent.getChild( position.offset - 1 );
			const nodeAfter = positionParent.getChild( position.offset );

			// ...look at the node before caret and take attributes from it if it is a character node.
			attrs = getAttrsIfCharacter( nodeBefore );

			// 3. If not, look at the node after caret...
			if ( !attrs ) {
				attrs = getAttrsIfCharacter( nodeAfter );
			}

			// 4. If not, try to find the first character on the left, that is in the same node.
			if ( !attrs ) {
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

		if ( attrs ) {
			this._attrs = new Map( attrs );
		} else {
			this.clearAttributes();
		}

		function getAttrsIfCharacter( node ) {
			if ( node instanceof CharacterProxy ) {
				return node.getAttributes();
			}

			return null;
		}

		this.fire( 'change:attribute' );
	}

	/**
	 * Returns a default range for this selection. The default range is a collapsed range that starts and ends
	 * at the beginning of this selection's document {@link engine.model.Document#_getDefaultRoot default root}.
	 * This "artificial" range is important for algorithms that base on selection, so they won't break or need
	 * special logic if there are no real ranges in the selection.
	 *
	 * @private
	 * @returns {engine.model.Range}
	 */
	_getDefaultRange() {
		const defaultRoot = this._document._getDefaultRoot();
		const pos = new Position( defaultRoot, [ 0 ] );

		return new Range( pos, pos );
	}

	/**
	 * Generates and returns an attribute key for selection attributes store, basing on original attribute key.
	 *
	 * @param {String} key Attribute key to convert.
	 * @returns {String} Converted attribute key, applicable for selection store.
	 */
	static _getStoreAttributeKey( key ) {
		return storePrefix + key;
	}
}

mix( Selection, EmitterMixin );

/**
 * Fired whenever selection ranges are changed through {@link engine.model.Selection Selection API}. Not fired when
 * {@link engine.model.LiveRange live ranges} inserted in selection change because of Tree Model changes.
 *
 * @event engine.model.Selection#change:range
 */

/**
 * Fired whenever selection attributes are changed.
 *
 * @event engine.model.Selection#change:attribute
 */
