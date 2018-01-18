/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/model/liveselection
 */

import Position from './position';
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
 * `LiveSelection` is used internally by {@link module:engine/model/documentselection~DocumentSelection} and shouldn't be used directly.
 *
 * LiveSelection` is automatically updated upon changes in the {@link module:engine/model/document~Document document}
 * to always contain valid ranges. Its attributes are inherited from the text unless set explicitly.
 *
 * Differences between {@link module:engine/model/selection~Selection} and `LiveSelection` are:
 * * there is always a range in `LiveSelection` - even if no ranges were added there is a "default range"
 * present in the selection,
 * * ranges added to this selection updates automatically when the document changes,
 * * attributes of `LiveSelection` are updated automatically according to selection ranges.
 *
 * @extends module:engine/model/selection~Selection
 */
export default class LiveSelection extends Selection {
	/**
	 * Creates an empty live selection for given {@link module:engine/model/document~Document}.
	 *
	 * @param {module:engine/model/document~Document} doc Document which owns this selection.
	 */
	constructor( doc ) {
		super();

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
		 * Priorities are used by internal `LiveSelection` mechanisms. All attributes set using `LiveSelection`
		 * attributes API are set with `'normal'` priority.
		 *
		 * @private
		 * @member {Map} module:engine/model/liveselection~LiveSelection#_attributePriority
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
	 * Describes whether `LiveSelection` has own range(s) set, or if it is defaulted to
	 * {@link module:engine/model/document~Document#_getDefaultRange document's default range}.
	 *
	 * @readonly
	 * @type {Boolean}
	 */
	get hasOwnRange() {
		return this._ranges.length > 0;
	}

	/**
	 * Unbinds all events previously bound by live selection.
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
	setTo( selectable, backwardSelectionOrOffset ) {
		super.setTo( selectable, backwardSelectionOrOffset );
		this._refreshAttributes();
	}

	setFocus( itemOrPosition, offset ) {
		super.setFocus( itemOrPosition, offset );
		this._refreshAttributes();
	}

	/**
	 * @inheritDoc
	 */
	setAttribute( key, value ) {
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
		if ( this._removeAttribute( key ) ) {
			// Fire event with exact data.
			const attributeKeys = [ key ];
			this.fire( 'change:attribute', { attributeKeys, directChange: true } );
		}
	}

	/**
	 * @inheritDoc
	 */
	clearAttributes() {
		const changed = this._setAttributesTo( new Map() );

		if ( changed.size > 0 ) {
			// Fire event with exact data (fire only if anything changed).
			const attributeKeys = Array.from( changed );
			this.fire( 'change:attribute', { attributeKeys, directChange: true } );
		}
	}

	/**
	 * Removes all attributes from the selection and sets attributes according to the surrounding nodes.
	 *
	 * @protected
	 */
	_refreshAttributes() {
		this._updateAttributes( true );
	}

	/**
	 * This method is not available in `LiveSelection`. There can be only one
	 * `LiveSelection` per document instance, so creating new `LiveSelection`s this way
	 * would be unsafe.
	 */
	static createFromSelection() {
		/**
		 * Cannot create a new `LiveSelection` instance.
		 *
		 * `LiveSelection#createFromSelection()` is not available. There can be only one
		 * `LiveSelection` per document instance, so creating new `LiveSelection`s this way
		 * would be unsafe.
		 *
		 * @error liveselection-cannot-create
		 */
		throw new CKEditorError( 'liveselection-cannot-create: Cannot create a new LiveSelection instance.' );
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
		this._checkRange( range );

		if ( range.root == this._document.graveyard ) {
			/**
			 * Trying to add a Range that is in the graveyard root. Range rejected.
			 *
			 * @warning model-selection-range-in-graveyard
			 */
			log.warn( 'model-selection-range-in-graveyard: Trying to add a Range that is in the graveyard root. Range rejected.' );

			return;
		}

		const liveRange = LiveRange.createFromRange( range );

		liveRange.on( 'change:range', ( evt, oldRange, data ) => {
			// If `LiveRange` is in whole moved to the graveyard, fix that range.
			if ( liveRange.root == this._document.graveyard ) {
				this._fixGraveyardSelection( liveRange, data.sourcePosition );
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
	 * Internal method for setting `LiveSelection` attribute. Supports attribute priorities (through `directChange`
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
	 * Internal method for removing `LiveSelection` attribute. Supports attribute priorities (through `directChange`
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
	 * Internal method for setting multiple `LiveSelection` attributes. Supports attribute priorities (through
	 * `directChange` parameter).
	 *
	 * @private
	 * @param {Map.<String,*>} attrs Iterable object containing attributes to be set.
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
	 * Returns an iterable that iterates through all selection attributes stored in current selection's parent.
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

/**
 * @event change:attribute
 */

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
