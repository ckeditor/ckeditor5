/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/model/documentselection
 */

import Position from './position';
import Text from './text';
import TextProxy from './textproxy';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';
import mix from '@ckeditor/ckeditor5-utils/src/mix';
import EmitterMixin from '@ckeditor/ckeditor5-utils/src/emittermixin';

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
		this._selection = new Selection();

		/**
		 * Document which owns this selection.
		 *
		 * @protected
		 * @member {module:engine/model/model~Model}
		 */
		this._model = doc.model;

		/**
		 * Document which owns this selection.
		 *
		 * @protected
		 * @member {module:engine/model/document~Document}
		 */
		this._document = doc;

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

		// Add events that will ensure selection correctness.
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
						{ range }
					);
				}
			}
		} );

		this.listenTo( this._model, 'applyOperation', ( evt, args ) => {
			const operation = args[ 0 ];

			if ( !operation.isDocumentOperation ) {
				return;
			}

			// Whenever attribute operation is performed on document, update selection attributes.
			// This is not the most efficient way to update selection attributes, but should be okay for now.
			if ( attrOpTypes.has( operation.type ) ) {
				this._updateAttributes( false );
			}

			const batch = operation.delta.batch;

			// Batch may not be passed to the document#change event in some tests.
			// See https://github.com/ckeditor/ckeditor5-engine/issues/1001#issuecomment-314202352
			if ( batch ) {
				// Whenever element which had selection's attributes stored in it stops being empty,
				// the attributes need to be removed.
				clearAttributesStoredInElement( operation, this._model, batch );
			}
		}, { priority: 'low' } );
	}

	/**
	 * @inheritDoc
	 */
	get isCollapsed() {
		return this._selection.isCollapsed || this._document._getDefaultRange().isCollapsed;
	}

	/**
	 * @inheritDoc
	 */
	get anchor() {
		return this._selection.anchor || this._document._getDefaultRange().start;
	}

	/**
	 * @inheritDoc
	 */
	get focus() {
		return this._selection.focus || this._document._getDefaultRange().end;
	}

	/**
	 * @inheritDoc
	 */
	get rangeCount() {
		return this._selection.rangeCount > 0 ? this._selection.rangeCount : 1;
	}

	/**
	 * Describes whether `DocumentSelection` has own range(s) set, or if it is defaulted to
	 * {@link module:engine/model/document~Document#_getDefaultRange document's default range}.
	 *
	 * @readonly
	 * @type {Boolean}
	 */
	get hasOwnRange() {
		return this._selection.rangeCount > 0;
	}

	get isBackward() {
		return this._selection.isBackward;
	}

	/**
	 * Unbinds all events previously bound by document selection.
	 */
	destroy() {
		for ( const range of this._selection._ranges ) {
			range.detach();
		}

		this.stopListening();
	}

	/**
	 * @inheritDoc
	 */
	* getRanges() {
		if ( this._selection.rangeCount > 0 ) {
			yield* this._selection.getRanges();
		} else {
			yield this._document._getDefaultRange();
		}
	}

	/**
	 * @inheritDoc
	 */
	getFirstRange() {
		return this._selection.getFirstRange() || this._document._getDefaultRange();
	}

	/**
	 * @inheritDoc
	 */
	getLastRange() {
		return this._selection.getLastRange() || this._document._getDefaultRange();
	}

	/**
	 * @protected
	 * @param {*} itemOrPosition
	 * @param {*} offset
	 */
	_moveFocusTo( itemOrPosition, offset ) {
		this._selection.moveFocusTo( itemOrPosition, offset );
	}

	/**
	 * @protected
	 * @param {*} selectable
	 */
	_setTo( selectable ) {
		this._selection._setTo( selectable );
		this._refreshAttributes();
	}

	/**
	 * @protected
	 * @param {*} key
	 * @param {*} value
	 */
	_setAttribute( key, value ) {
		// Store attribute in parent element if the selection is collapsed in an empty node.
		if ( this._selection.isCollapsed && this._selection.anchor.parent.isEmpty ) {
			this._storeAttribute( key, value );
		}

		if ( this._setAttribute2( key, value ) ) {
			// Fire event with exact data.
			const attributeKeys = [ key ];
			this.fire( 'change:attribute', { attributeKeys, directChange: true } );
		}
	}

	/**
	 * @private
	 */
	_removeAllRanges() {
		this._selection.removeAllRanges();
		this._refreshAttributes();
	}

	/**
	 * Should be used only by the {@link module:engine/model/writer~Writer} class.
	 *
	 * @protected
	 */
	_removeAttribute( key ) {
		// Remove stored attribute from parent element if the selection is collapsed in an empty node.
		if ( this.isCollapsed && this.anchor.parent.isEmpty ) {
			this._removeStoredAttribute( key );
		}

		if ( this._removeAttributeByDirectChange( key ) ) {
			// Fire event with exact data.
			const attributeKeys = [ key ];
			this.fire( 'change:attribute', { attributeKeys, directChange: true } );
		}
	}

	getAttributes() {
		return this._selection.getAttributes();
	}

	getAttribute() {
		return this._selection.getAttribute();
	}

	// /**
	//  * @inheritDoc
	//  */
	// setAttributesTo( attrs ) {
	// 	attrs = toMap( attrs );

	// 	if ( this.isCollapsed && this.anchor.parent.isEmpty ) {
	// 		this._setStoredAttributesTo( attrs );
	// 	}

	// 	const changed = this._setAttributesTo( attrs );

	// 	if ( changed.size > 0 ) {
	// 		// Fire event with exact data (fire only if anything changed).
	// 		const attributeKeys = Array.from( changed );
	// 		this.fire( 'change:attribute', { attributeKeys, directChange: true } );
	// 	}
	// }

	// /**
	//  * @inheritDoc
	//  */
	// clearAttributes() {
	// 	this.setAttributesTo( [] );
	// }

	/**
	 * Removes all attributes from the selection and sets attributes according to the surrounding nodes.
	 *
	 * @private
	 */
	_refreshAttributes() {
		this._updateAttributes( true );
	}

	/**
	 * This method is not available in `DocumentSelection`. There can be only one
	 * `DocumentSelection` per document instance, so creating new `DocumentSelection`s this way
	 * would be unsafe.
	 */
	static createFromSelection() {
		/**
		 * Cannot create a new `DocumentSelection` instance.
		 *
		 * `DocumentSelection#createFromSelection()` is not available. There can be only one
		 * `DocumentSelection` per document instance, so creating new `DocumentSelection`s this way
		 * would be unsafe.
		 *
		 * @error documentselection-cannot-create
		 */
		throw new CKEditorError( 'documentselection-cannot-create: Cannot create a new DocumentSelection instance.' );
	}

	// /**
	//  * Prepares given range to be added to selection. Checks if it is correct,
	//  * converts it to {@link module:engine/model/liverange~LiveRange LiveRange}
	//  * and sets listeners listening to the range's change event.
	//  *
	//  * @private
	//  * @param {module:engine/model/range~Range} range
	//  */
	// _prepareRange( range ) {
	// 	if ( !( range instanceof Range ) ) {
	// 		/**
	// 		 * Trying to add an object that is not an instance of Range.
	// 		 *
	// 		 * @error model-selection-added-not-range
	// 		 */
	// 		throw new CKEditorError( 'model-selection-added-not-range: Trying to add an object that is not an instance of Range.' );
	// 	}

	// 	if ( range.root == this._document.graveyard ) {
	// 		/**
	// 		 * Trying to add a Range that is in the graveyard root. Range rejected.
	// 		 *
	// 		 * @warning model-selection-range-in-graveyard
	// 		 */
	// 		log.warn( 'model-selection-range-in-graveyard: Trying to add a Range that is in the graveyard root. Range rejected.' );

	// 		return;
	// 	}

	// 	this._checkRange( range );

	// 	const liveRange = LiveRange.createFromRange( range );

	// 	liveRange.on( 'change:range', ( evt, oldRange, data ) => {
	// 		// If `LiveRange` is in whole moved to the graveyard, fix that range.
	// 		if ( liveRange.root == this._document.graveyard ) {
	// 			this._fixGraveyardSelection( liveRange, data.sourcePosition );
	// 		}

	// 		// Whenever a live range from selection changes, fire an event informing about that change.
	// 		this.fire( 'change:range', { directChange: false } );
	// 	} );

	// 	return liveRange;
	// }

	// /**
	//  * Updates this selection attributes according to its ranges and the {@link module:engine/model/document~Document model document}.
	//  *
	//  * @protected
	//  * @param {Boolean} clearAll
	//  * @fires change:attribute
	//  */
	// _updateAttributes( clearAll ) {
	// 	const newAttributes = toMap( this._getSurroundingAttributes() );
	// 	const oldAttributes = toMap( this.getAttributes() );

	// 	if ( clearAll ) {
	// 		// If `clearAll` remove all attributes and reset priorities.
	// 		this._attributePriority = new Map();
	// 		this._attrs = new Map();
	// 	} else {
	// 		// If not, remove only attributes added with `low` priority.
	// 		for ( const [ key, priority ] of this._attributePriority ) {
	// 			if ( priority == 'low' ) {
	// 				this._attrs.delete( key );
	// 				this._attributePriority.delete( key );
	// 			}
	// 		}
	// 	}

	// 	this._setAttributesTo( newAttributes, false );

	// 	// Let's evaluate which attributes really changed.
	// 	const changed = [];

	// 	// First, loop through all attributes that are set on selection right now.
	// 	// Check which of them are different than old attributes.
	// 	for ( const [ newKey, newValue ] of this.getAttributes() ) {
	// 		if ( !oldAttributes.has( newKey ) || oldAttributes.get( newKey ) !== newValue ) {
	// 			changed.push( newKey );
	// 		}
	// 	}

	// 	// Then, check which of old attributes got removed.
	// 	for ( const [ oldKey ] of oldAttributes ) {
	// 		if ( !this.hasAttribute( oldKey ) ) {
	// 			changed.push( oldKey );
	// 		}
	// 	}

	// 	// Fire event with exact data (fire only if anything changed).
	// 	if ( changed.length > 0 ) {
	// 		this.fire( 'change:attribute', { attributeKeys: changed, directChange: false } );
	// 	}
	// }

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
	_setAttribute2( key, value, directChange = true ) {
		const priority = directChange ? 'normal' : 'low';

		if ( priority == 'low' && this._attributePriority.get( key ) == 'normal' ) {
			// Priority too low.
			return false;
		}

		const oldValue = this.selection.getAttribute( key );

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
	_removeAttributeByDirectChange( key, directChange = true ) {
		const priority = directChange ? 'normal' : 'low';

		if ( priority == 'low' && this._attributePriority.get( key ) == 'normal' ) {
			// Priority too low.
			return false;
		}

		// Don't do anything if value has not changed.
		if ( !this._selection.hasAttribute( key ) ) {
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
	 * @param {Map} attrs Iterable object containing attributes to be set.
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
			if ( this._removeAttributeByDirectChange( oldKey, directChange ) ) {
				changed.add( oldKey );
			}
		}

		for ( const [ key, value ] of attrs ) {
			// Attribute may not be set because of attributes or because same key/value is already added.
			const gotAdded = this._setAttribute2( key, value, directChange );

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

		this._model.change( writer => {
			writer.removeAttribute( storeKey, this.anchor.parent );
		} );
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

		this._model.change( writer => {
			writer.setAttribute( storeKey, value, this.anchor.parent );
		} );
	}

	/**
	 * Sets selection attributes stored in current selection's parent node to given set of attributes.
	 *
	 * @private
	 * @param {Iterable} attrs Iterable object containing attributes to be set.
	 */
	_setStoredAttributesTo( attrs ) {
		const selectionParent = this.anchor.parent;

		this._model.change( writer => {
			for ( const [ oldKey ] of this._getStoredAttributes() ) {
				const storeKey = DocumentSelection._getStoreAttributeKey( oldKey );

				writer.removeAttribute( storeKey, selectionParent );
			}

			for ( const [ key, value ] of attrs ) {
				const storeKey = DocumentSelection._getStoreAttributeKey( key );

				writer.setAttribute( storeKey, value, selectionParent );
			}
		} );
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
	 * @param {module:engine/model/position~Position} removedRangeStart Start position of a range which was removed.
	 */
	_fixGraveyardSelection( liveRange, removedRangeStart ) {
		// The start of the removed range is the closest position to the `liveRange` - the original selection range.
		// This is a good candidate for a fixed selection range.
		const positionCandidate = Position.createFromPosition( removedRangeStart );

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

mix( DocumentSelection, EmitterMixin );

/**
 * @event change:attribute
 */

// Helper function for {@link module:engine/model/documentselection~DocumentSelection#_updateAttributes}.
//
// It takes model item, checks whether it is a text node (or text proxy) and, if so, returns it's attributes. If not, returns `null`.
//
// @param {module:engine/model/item~Item|null}  node
// @returns {Boolean|Iterable}
function getAttrsIfCharacter( node ) {
	if ( node instanceof TextProxy || node instanceof Text ) {
		return node.getAttributes();
	}

	return null;
}

// Removes selection attributes from element which is not empty anymore.
function clearAttributesStoredInElement( operation, model, batch ) {
	let changeParent = null;

	if ( operation.type == 'insert' ) {
		changeParent = operation.position.parent;
	} else if ( operation.type == 'move' || operation.type == 'reinsert' || operation.type == 'remove' ) {
		changeParent = operation.getMovedRangeStart().parent;
	}

	if ( !changeParent || changeParent.isEmpty ) {
		return;
	}

	model.enqueueChange( batch, writer => {
		const storedAttributes = Array.from( changeParent.getAttributeKeys() ).filter( key => key.startsWith( storePrefix ) );

		for ( const key of storedAttributes ) {
			writer.removeAttribute( key, changeParent );
		}
	} );
}
