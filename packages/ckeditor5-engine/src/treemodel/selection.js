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
import utils from '../../utils/utils.js';

const storePrefix = 'selection:';

/**
 * Represents a selection that is made on nodes in {@link engine.treeModel.Document}. `Selection` instance is
 * created by {@link engine.treeModel.Document}. You should not need to create an instance of `Selection`.
 *
 * Keep in mind that selection always contains at least one range. If no ranges has been added to selection or all ranges
 * got removed from selection, the selection will be reset to contain {@link engine.treeModel.Selection#_getDefaultRange the default range}.
 *
 * @memberOf engine.treeModel
 */
export default class Selection {
	/**
	 * Creates an empty selection.
	 *
	 * @param {engine.treeModel.Document} document Document which owns this selection.
	 */
	constructor( document ) {
		/**
		 * List of attributes set on current selection.
		 *
		 * @protected
		 * @member {Map} engine.treeModel.Selection#_attrs
		 */
		this._attrs = new Map();

		/**
		 * Document which owns this selection.
		 *
		 * @private
		 * @member {engine.treeModel.Document} engine.treeModel.Selection#_document
		 */
		this._document = document;

		/**
		 * Specifies whether the last added range was added as a backward or forward range.
		 *
		 * @private
		 * @member {Boolean} engine.treeModel.Selection#_lastRangeBackward
		 */
		this._lastRangeBackward = false;

		/**
		 * Stores all ranges that are selected.
		 *
		 * @private
		 * @member {Array.<engine.treeModel.LiveRange>} engine.treeModel.Selection#_ranges
		 */
		this._ranges = [];
	}

	/**
	 * Selection anchor. Anchor may be described as a position where the selection starts. Together with
	 * {@link engine.treeModel.Selection#focus} they define the direction of selection, which is important
	 * when expanding/shrinking selection. Anchor is always the start or end of the most recent added range.
	 * It may be a bit unintuitive when there are multiple ranges in selection.
	 *
	 * @see engine.treeModel.Selection#focus
	 * @type {engine.treeModel.LivePosition}
	 */
	get anchor() {
		let range = this._ranges.length ? this._ranges[ this._ranges.length - 1 ] : this._getDefaultRange();

		return this._lastRangeBackward ? range.end : range.start;
	}

	/**
	 * Selection focus. Focus is a position where the selection ends.
	 *
	 * @see engine.treeModel.Selection#anchor
	 * @type {engine.treeModel.LivePosition}
	 */
	get focus() {
		let range = this._ranges.length ? this._ranges[ this._ranges.length - 1 ] : this._getDefaultRange();

		return this._lastRangeBackward ? range.start : range.end;
	}

	/**
	 * Returns whether the selection is collapsed. Selection is collapsed when all it's ranges are collapsed.
	 *
	 * @type {Boolean}
	 */
	get isCollapsed() {
		for ( let i = 0; i < this._ranges.length; i++ ) {
			if ( !this._ranges[ i ].isCollapsed ) {
				return false;
			}
		}

		return true;
	}

	/**
	 * Specifies whether the last added range was added as a backward or forward range.
	 *
	 * @type {Boolean}
	 */
	get isBackward() {
		return this._lastRangeBackward;
	}

	/**
	 * Adds a range to the selection. Added range is copied and converted to {@link engine.treeModel.LiveRange}. This means
	 * that passed range is not saved in the Selection instance and you can safely operate on it.
	 *
	 * Accepts a flag describing in which way the selection is made - passed range might be selected from
	 * {@link engine.treeModel.Range#start} to {@link engine.treeModel.Range#end} or from {@link engine.treeModel.Range#end}
	 * to {@link engine.treeModel.Range#start}. The flag is used to set {@link engine.treeModel.Selection#anchor} and
	 * {@link engine.treeModel.Selection#focus} properties.
	 *
	 * @fires {@link engine.treeModel.Selection#change:range change:range}
	 * @param {engine.treeModel.Range} range Range to add.
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
	 * Returns an array of ranges added to the selection. The method returns a copy of internal array, so
	 * it will not change when ranges get added or removed from selection.
	 *
	 * @returns {Array.<LiveRange>}
	 */
	getRanges() {
		return this._ranges.length ? this._ranges.slice() : [ this._getDefaultRange() ];
	}

	/**
	 * Returns the first range in the selection. First range is the one which {@link engine.treeModel.Range#start start} position
	 * {@link engine.treeModel.Position#isBefore is before} start position of all other ranges (not to confuse with the first range
	 * added to the selection).
	 *
	 * @returns {engine.treeModel.Range}
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
	 * Returns the first position in the selection. First position is the position that {@link engine.treeModel.Position#isBefore is before}
	 * any other position in the selection ranges.
	 *
	 * @returns {engine.treeModel.Position}
	 */
	getFirstPosition() {
		return Position.createFromPosition( this.getFirstRange().start );
	}

	/**
	 * Removes all ranges that were added to the selection. Fires update event.
	 *
	 * @fires {@link engine.treeModel.Selection#change:range change:range}
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
	 * @fires {@link engine.treeModel.Selection#change:range change:range}
	 * @param {Array.<engine.treeModel.Range>} newRanges Array of ranges to set.
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
	 * The `location` can be specified as:
	 *
	 * * a {@link engine.treeModel.Position position},
	 * * parent element and offset (offset defaults to `0`),
	 * * parent element and `'END'` (sets selection at the end of that element),
	 * * node and `'BEFORE'` or `'AFTER'` (sets selection before or after the given node).
	 *
	 * @fires {@link engine.treeModel.Selection#change:range change:range}
	 * @param {engine.treeModel.Node|engine.treeModel.Position} nodeOrPosition
	 * @param {Number|'END'|'BEFORE'|'AFTER'} [location=0] Offset or one of the flags. Used only when
	 * first parameter is a node.
	 */
	collapse( nodeOrPosition, location ) {
		let node, pos;

		if ( nodeOrPosition instanceof Position ) {
			pos = nodeOrPosition;
		} else {
			node = nodeOrPosition;

			if ( location == 'END' ) {
				location = node.getChildCount();
			} else if ( location == 'BEFORE' ) {
				location = node.getIndex();
				node = node.parent;
			} else if ( location == 'AFTER' ) {
				location = node.getIndex() + 1;
				node = node.parent;
			} else if ( !location ) {
				location = 0;
			}

			pos = Position.createFromParentAndOffset( node, location );
		}

		const range = new Range( pos, pos );

		this.setRanges( [ range ] );
	}

	/**
	 * Removes all attributes from the selection.
	 *
	 * @fires engine.treeModel.Selection#change:attribute
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
	 * @fires {@link engine.treeModel.Selection#change:range change:range}
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
	 * @fires {@link engine.treeModel.Selection#change:range change:range}
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
	 * @fires {@link engine.treeModel.Selection#change:range change:range}
	 * @param {Iterable|Object} attrs Iterable object containing attributes to be set.
	 */
	setAttributesTo( attrs ) {
		this._attrs = utils.toMap( attrs );
		this._setStoredAttributesTo( this._attrs );

		this.fire( 'change:attribute' );
	}

	/**
	 * Converts given range to {@link engine.treeModel.LiveRange} and adds it to internal ranges array. Throws an error
	 * if given range is intersecting with any range that is already stored in this selection.
	 *
	 * @private
	 * @param {engine.treeModel.Range} range Range to add.
	 */
	_pushRange( range ) {
		for ( let i = 0; i < this._ranges.length ; i++ ) {
			if ( range.isIntersecting( this._ranges[ i ] ) ) {
				/**
				 * Trying to add a range that intersects with another range from selection.
				 *
				 * @error selection-range-intersects
				 * @param {engine.treeModel.Range} addedRange Range that was added to the selection.
				 * @param {engine.treeModel.Range} intersectingRange Range from selection that intersects with `addedRange`.
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
	 * Updates this selection attributes based on it's position in the Tree Model.
	 *
	 * @protected
	 */
	_updateAttributes() {
		const position = this.getFirstPosition();
		const positionParent = position.parent;

		let attrs = null;

		if ( this.isCollapsed === false ) {
			// 1. If selection is a range...
			const range = this.getFirstRange();

			// ...look for a first character node in that range and take attributes from it.
			for ( let item of range ) {
				if ( item.type == 'TEXT' ) {
					attrs = item.item.getAttributes();
					break;
				}
			}
		}

		// 2. If the selection is a caret or the range does not contain a character node...
		if ( !attrs && this.isCollapsed === true ) {
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
	 * at the beginning of this selection's document {@link engine.treeModel.Document#_getDefaultRoot default root}.
	 * This "artificial" range is important for algorithms that base on selection, so they won't break or need
	 * special logic if there are no real ranges in the selection.
	 *
	 * @private
	 * @returns {engine.treeModel.Range}
	 */
	_getDefaultRange() {
		const defaultRoot = this._document._getDefaultRoot();

		return new Range( new Position( defaultRoot, [ 0 ] ), new Position( defaultRoot, [ 0 ] ) );
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

utils.mix( Selection, EmitterMixin );

/**
 * Fired whenever selection ranges are changed through {@link engine.treeModel.Selection Selection API}. Not fired when
 * {@link engine.treeModel.LiveRange live ranges} inserted in selection change because of Tree Model changes.
 *
 * @event engine.treeModel.Selection#change:range
 */

/**
 * Fired whenever selection attributes are changed.
 *
 * @event engine.treeModel.Selection#change:attribute
 */
