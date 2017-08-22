/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/model/documentselection
 */

import Position from './position';
import Range from './range';
import LiveRange from './liverange';
import Text from './text';
import TextProxy from './textproxy';
import toMap from '@ckeditor/ckeditor5-utils/src/tomap';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';
import log from '@ckeditor/ckeditor5-utils/src/log';

import Selection from './selection';

const storePrefix = 'selection:';

const attrOpTypes = new Set(
	[ 'addAttribute', 'removeAttribute', 'changeAttribute', 'addRootAttribute', 'removeRootAttribute', 'changeRootAttribute' ]
);

/**
 * `DocumentSelection` is a special selection which is used as the
 * {@link module:engine/model/document~Document#selection document's selection}.
 * There can be only one instance of `DocumentSelection` per document.
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
 * @extends module:engine/model/selection~Selection
 */
export default class DocumentSelection extends Selection {
	/**
	 * Creates an empty live selection for given {@link module:engine/model/document~Document}.
	 *
	 * @param {module:engine/model/document~Document} document Document which owns this selection.
	 */
	constructor( document ) {
		super();

		/**
		 * Document which owns this selection.
		 *
		 * @protected
		 * @member {module:engine/model/document~Document} module:engine/model/documentselection~DocumentSelection#_document
		 */
		this._document = document;

		/**
		 * Keeps mapping of attribute name to priority with which the attribute got modified (added/changed/removed)
		 * last time. Possible values of priority are: `'low'` and `'normal'`.
		 *
		 * Priorities are used by internal `DocumentSelection` mechanisms. All attributes set using `DocumentSelection`
		 * attributes API are set with `'normal'` priority.
		 *
		 * @private
		 * @member {Map} module:engine/model/documentselection~DocumentSelection#_attributePriority
		 */
		this._attributePriority = new Map();

		this.listenTo( this._document, 'change', ( evt, type, changes, batch ) => {
			// Whenever attribute operation is performed on document, update selection attributes.
			// This is not the most efficient way to update selection attributes, but should be okay for now.
			if ( attrOpTypes.has( type ) ) {
				this._updateAttributes( false );
			}

			// Whenever element which had selection's attributes stored in it stops being empty,
			// the attributes need to be removed.
			clearAttributesStoredInElement( changes, batch, this._document );
		} );
	}

	/**
	 * @inheritDoc
	 */
	get isCollapsed() {
		const length = this._ranges.length;

		return length === 0 ? this._document._getDefaultRange().isCollapsed : super.isCollapsed;
	}

	/**
	 * @inheritDoc
	 */
	get anchor() {
		return super.anchor || this._document._getDefaultRange().start;
	}

	/**
	 * @inheritDoc
	 */
	get focus() {
		return super.focus || this._document._getDefaultRange().end;
	}

	/**
	 * @inheritDoc
	 */
	get rangeCount() {
		return this._ranges.length ? this._ranges.length : 1;
	}

	/**
	 * Unbinds all events previously bound by document selection.
	 */
	destroy() {
		for ( let i = 0; i < this._ranges.length; i++ ) {
			this._ranges[ i ].detach();
		}

		this.stopListening();
	}

	/**
	 * @inheritDoc
	 */
	* getRanges() {
		if ( this._ranges.length ) {
			yield* super.getRanges();
		} else {
			yield this._document._getDefaultRange();
		}
	}

	/**
	 * @inheritDoc
	 */
	getFirstRange() {
		return super.getFirstRange() || this._document._getDefaultRange();
	}

	/**
	 * @inheritDoc
	 */
	getLastRange() {
		return super.getLastRange() || this._document._getDefaultRange();
	}

	/**
	 * @inheritDoc
	 */
	addRange( range, isBackward = false ) {
		super.addRange( range, isBackward );
		this.refreshAttributes();
	}

	/**
	 * @inheritDoc
	 */
	removeAllRanges() {
		super.removeAllRanges();
		this.refreshAttributes();
	}

	/**
	 * @inheritDoc
	 */
	setRanges( newRanges, isLastBackward = false ) {
		super.setRanges( newRanges, isLastBackward );
		this.refreshAttributes();
	}

	/**
	 * @inheritDoc
	 */
	setAttribute( key, value ) {
		// Store attribute in parent element if the selection is collapsed in an empty node.
		if ( this.isCollapsed && this.anchor.parent.isEmpty ) {
			this._storeAttribute( key, value );
		}

		if ( this._setAttribute( key, value ) ) {
			// Fire event with exact data.
			const attributeKeys = [ key ];
			this.fire( 'change:attribute', { attributeKeys, directChange: true } );
		}
	}

	/**
	 * @inheritDoc
	 */
	removeAttribute( key ) {
		// Remove stored attribute from parent element if the selection is collapsed in an empty node.
		if ( this.isCollapsed && this.anchor.parent.isEmpty ) {
			this._removeStoredAttribute( key );
		}

		if ( this._removeAttribute( key ) ) {
			// Fire event with exact data.
			const attributeKeys = [ key ];
			this.fire( 'change:attribute', { attributeKeys, directChange: true } );
		}
	}

	/**
	 * @inheritDoc
	 */
	setAttributesTo( attrs ) {
		attrs = toMap( attrs );

		if ( this.isCollapsed && this.anchor.parent.isEmpty ) {
			this._setStoredAttributesTo( attrs );
		}

		const changed = this._setAttributesTo( attrs );

		if ( changed.size > 0 ) {
			// Fire event with exact data (fire only if anything changed).
			const attributeKeys = Array.from( changed );
			this.fire( 'change:attribute', { attributeKeys, directChange: true } );
		}
	}

	/**
	 * @inheritDoc
	 */
	clearAttributes() {
		this.setAttributesTo( [] );
	}

	/**
	 * Removes all attributes from the selection and sets attributes according to the surrounding nodes.
	 */
	refreshAttributes() {
		this._updateAttributes( true );
	}

	/**
	 * This method is not available in `DocumentSelection`. There can be only one
	 * `DocumentSelection` per document instance, so creating new `DocumentSelection`s this way
	 * would be unsafe.
	 */
	static createFromSelection() {
		/**
		 * `DocumentSelection#createFromSelection()` is not available. There can be only one
		 * `DocumentSelection` per document instance, so creating new `DocumentSelection`s this way
		 * would be unsafe.
		 *
		 * @error documentselection-cannot-create
		 */
		throw new CKEditorError( 'documentselection-cannot-create: Cannot create new DocumentSelection instance.' );
	}

	/**
	 * @inheritDoc
	 */
	_popRange() {
		this._ranges.pop().detach();
	}

	/**
	 * @inheritDoc
	 */
	_pushRange( range ) {
		const liveRange = this._prepareRange( range );

		// `undefined` is returned when given `range` is in graveyard root.
		if ( liveRange ) {
			this._ranges.push( liveRange );
		}
	}

	/**
	 * Prepares given range to be added to selection. Checks if it is correct,
	 * converts it to {@link module:engine/model/liverange~LiveRange LiveRange}
	 * and sets listeners listening to the range's change event.
	 *
	 * @private
	 * @param {module:engine/model/range~Range} range
	 */
	_prepareRange( range ) {
		if ( !( range instanceof Range ) ) {
			/**
			 * Trying to add an object that is not an instance of Range.
			 *
			 * @error model-selection-added-not-range
			 */
			throw new CKEditorError( 'model-selection-added-not-range: Trying to add an object that is not an instance of Range.' );
		}

		if ( range.root == this._document.graveyard ) {
			/**
			 * Trying to add a Range that is in the graveyard root. Range rejected.
			 *
			 * @warning model-selection-range-in-graveyard
			 */
			log.warn( 'model-selection-range-in-graveyard: Trying to add a Range that is in the graveyard root. Range rejected.' );

			return;
		}

		this._checkRange( range );

		const liveRange = LiveRange.createFromRange( range );

		this.listenTo( liveRange, 'change:range', ( evt, oldRange, data ) => {
			// If `LiveRange` is in whole moved to the graveyard, fix that range.
			if ( liveRange.root == this._document.graveyard ) {
				const sourceStart = data.sourcePosition;
				const howMany = data.range.end.offset - data.range.start.offset;
				const sourceRange = Range.createFromPositionAndShift( sourceStart, howMany );

				this._fixGraveyardSelection( liveRange, sourceRange );
			}

			// Whenever a live range from selection changes, fire an event informing about that change.
			this.fire( 'change:range', { directChange: false } );
		} );

		return liveRange;
	}

	/**
	 * Updates this selection attributes according to its ranges and the {@link module:engine/model/document~Document model document}.
	 *
	 * @protected
	 * @param {Boolean} clearAll
	 * @fires change:attribute
	 */
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

		this._setAttributesTo( newAttributes, false );

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
	 * Internal method for setting `DocumentSelection` attribute. Supports attribute priorities (through `directChange`
	 * parameter).
	 *
	 * @private
	 * @param {String} key Attribute key.
	 * @param {*} value Attribute value.
	 * @param {Boolean} [directChange=true] `true` if the change is caused by `Selection` API, `false` if change
	 * is caused by `Batch` API.
	 * @returns {Boolean} Whether value has changed.
	 */
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

	/**
	 * Internal method for removing `DocumentSelection` attribute. Supports attribute priorities (through `directChange`
	 * parameter).
	 *
	 * @private
	 * @param {String} key Attribute key.
	 * @param {Boolean} [directChange=true] `true` if the change is caused by `Selection` API, `false` if change
	 * is caused by `Batch` API.
	 * @returns {Boolean} Whether attribute was removed. May not be true if such attributes didn't exist or the
	 * existing attribute had higher priority.
	 */
	_removeAttribute( key, directChange = true ) {
		const priority = directChange ? 'normal' : 'low';

		if ( priority == 'low' && this._attributePriority.get( key ) == 'normal' ) {
			// Priority too low.
			return false;
		}

		// Don't do anything if value has not changed.
		if ( !super.hasAttribute( key ) ) {
			return false;
		}

		this._attrs.delete( key );

		// Update priorities map.
		this._attributePriority.set( key, priority );

		return true;
	}

	/**
	 * Internal method for setting multiple `DocumentSelection` attributes. Supports attribute priorities (through
	 * `directChange` parameter).
	 *
	 * @private
	 * @param {Iterable|Object} attrs Iterable object containing attributes to be set.
	 * @param {Boolean} [directChange=true] `true` if the change is caused by `Selection` API, `false` if change
	 * is caused by `Batch` API.
	 * @returns {Set.<String>} Changed attribute keys.
	 */
	_setAttributesTo( attrs, directChange = true ) {
		const changed = new Set();

		for ( const [ oldKey, oldValue ] of this.getAttributes() ) {
			// Do not remove attribute if attribute with same key and value is about to be set.
			if ( attrs.get( oldKey ) === oldValue ) {
				continue;
			}

			// Attribute still might not get removed because of priorities.
			if ( this._removeAttribute( oldKey, directChange ) ) {
				changed.add( oldKey );
			}
		}

		for ( const [ key, value ] of attrs ) {
			// Attribute may not be set because of attributes or because same key/value is already added.
			const gotAdded = this._setAttribute( key, value, directChange );

			if ( gotAdded ) {
				changed.add( key );
			}
		}

		return changed;
	}

	/**
	 * Returns an iterator that iterates through all selection attributes stored in current selection's parent.
	 *
	 * @private
	 * @returns {Iterable.<*>}
	 */
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

	/**
	 * Removes attribute with given key from attributes stored in current selection's parent node.
	 *
	 * @private
	 * @param {String} key Key of attribute to remove.
	 */
	_removeStoredAttribute( key ) {
		const storeKey = DocumentSelection._getStoreAttributeKey( key );

		this._document.batch().removeAttribute( this.anchor.parent, storeKey );
	}

	/**
	 * Stores given attribute key and value in current selection's parent node.
	 *
	 * @private
	 * @param {String} key Key of attribute to set.
	 * @param {*} value Attribute value.
	 */
	_storeAttribute( key, value ) {
		const storeKey = DocumentSelection._getStoreAttributeKey( key );

		this._document.batch().setAttribute( this.anchor.parent, storeKey, value );
	}

	/**
	 * Sets selection attributes stored in current selection's parent node to given set of attributes.
	 *
	 * @private
	 * @param {Iterable|Object} attrs Iterable object containing attributes to be set.
	 */
	_setStoredAttributesTo( attrs ) {
		const selectionParent = this.anchor.parent;
		const batch = this._document.batch();

		for ( const [ oldKey ] of this._getStoredAttributes() ) {
			const storeKey = DocumentSelection._getStoreAttributeKey( oldKey );

			batch.removeAttribute( selectionParent, storeKey );
		}

		for ( const [ key, value ] of attrs ) {
			const storeKey = DocumentSelection._getStoreAttributeKey( key );

			batch.setAttribute( selectionParent, storeKey, value );
		}
	}

	/**
	 * Checks model text nodes that are closest to the selection's first position and returns attributes of first
	 * found element. If there are no text nodes in selection's first position parent, it returns selection
	 * attributes stored in that parent.
	 *
	 * @private
	 * @returns {Iterable.<*>} Collection of attributes.
	 */
	_getSurroundingAttributes() {
		const position = this.getFirstPosition();
		const schema = this._document.schema;

		let attrs = null;

		if ( !this.isCollapsed ) {
			// 1. If selection is a range...
			const range = this.getFirstRange();

			// ...look for a first character node in that range and take attributes from it.
			for ( const value of range ) {
				// If the item is an object, we don't want to get attributes from its children.
				if ( value.item.is( 'element' ) && schema.objects.has( value.item.name ) ) {
					break;
				}

				// This is not an optimal solution because of https://github.com/ckeditor/ckeditor5-engine/issues/454.
				// It can be done better by using `break;` instead of checking `attrs === null`.
				if ( value.type == 'text' && attrs === null ) {
					attrs = value.item.getAttributes();
				}
			}
		} else {
			// 2. If the selection is a caret or the range does not contain a character node...

			const nodeBefore = position.textNode ? position.textNode : position.nodeBefore;
			const nodeAfter = position.textNode ? position.textNode : position.nodeAfter;

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

		return attrs;
	}

	/**
	 * Fixes a selection range after it ends up in graveyard root.
	 *
	 * @private
	 * @param {module:engine/model/liverange~LiveRange} liveRange The range from selection, that ended up in the graveyard root.
	 * @param {module:engine/model/range~Range} removedRange Range which removing had caused moving `liveRange` to the graveyard root.
	 */
	_fixGraveyardSelection( liveRange, removedRange ) {
		// The start of the removed range is the closest position to the `liveRange` - the original selection range.
		// This is a good candidate for a fixed selection range.
		const positionCandidate = Position.createFromPosition( removedRange.start );

		// Find a range that is a correct selection range and is closest to the start of removed range.
		const selectionRange = this._document.getNearestSelectionRange( positionCandidate );

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

		// Fire an event informing about selection change.
		this.fire( 'change:range', { directChange: false } );
	}
}

/**
 * @event change:attribute
 */

// Helper function for {@link module:engine/model/documentselection~DocumentSelection#_updateAttributes}.
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
function clearAttributesStoredInElement( changes, batch, document ) {
	// Batch may not be passed to the document#change event in some tests.
	// See https://github.com/ckeditor/ckeditor5-engine/issues/1001#issuecomment-314202352
	// Ignore also transparent batches because they are... transparent.
	if ( !batch || batch.type == 'transparent' ) {
		return;
	}

	const changeParent = changes.range && changes.range.start.parent;

	// `changes.range` is not set in case of rename, root and marker operations.
	// None of them may lead to the element becoming non-empty.
	if ( !changeParent || changeParent.isEmpty ) {
		return;
	}

	document.enqueueChanges( () => {
		const storedAttributes = Array.from( changeParent.getAttributeKeys() ).filter( key => key.startsWith( storePrefix ) );

		for ( const key of storedAttributes ) {
			batch.removeAttribute( changeParent, key );
		}
	} );
}
