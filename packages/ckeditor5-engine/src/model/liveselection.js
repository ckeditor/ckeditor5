/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Position from './position.js';
import Range from './range.js';
import LiveRange from './liverange.js';
import Text from './text.js';
import TextProxy from './textproxy.js';
import toMap from '../../utils/tomap.js';
import CKEditorError from '../../utils/ckeditorerror.js';
import log from '../../utils/log.js';

import Selection from './selection.js';

const storePrefix = 'selection:';

const attrOpTypes = new Set(
	[ 'addAttribute', 'removeAttribute', 'changeAttribute', 'addRootAttribute', 'removeRootAttribute', 'changeRootAttribute' ]
);

/**
 * `LiveSelection` is a type of {@link engine.model.Selection selection} that listens to changes on a
 * {@link engine.model.Document document} and has it ranges updated accordingly. Internal implementation of this
 * mechanism bases on {@link engine.model.LiveRange live ranges}.
 *
 * Differences between {@link engine.model.Selection} and `LiveSelection` are two:
 * * there is always a range in `LiveSelection` - even if no ranges were added there is a
 * {@link engine.model.LiveSelection#_getDefaultRange "default range"} present in the selection,
 * * ranges added to this selection updates automatically when the document changes.
 *
 * Since `LiveSelection` uses {@link engine.model.LiveRange live ranges} and is updated when {@link engine.model.Document document}
 * changes, it cannot be set on {@link engine.model.Node nodes} that are inside {@link engine.model.DocumentFragment document fragment}.
 * If you need to represent a selection in document fragment, use {@link engine.model.Selection "normal" selection} instead.
 *
 * @memberOf engine.model
 */
export default class LiveSelection extends Selection {
	/**
	 * Creates an empty live selection for given {@link engine.model.Document}.
	 *
	 * @param {engine.model.Document} document Document which owns this selection.
	 */
	constructor( document ) {
		super();

		/**
		 * Document which owns this selection.
		 *
		 * @protected
		 * @member {engine.model.Document} engine.model.LiveSelection#_document
		 */
		this._document = document;

		/**
		 * Keeps mapping of attribute name to priority with which the attribute got modified (added/changed/removed)
		 * last time. Possible values of priority are: `'low'` and `'normal'`.
		 *
		 * Priorities are used by internal `LiveSelection` mechanisms. All attributes set using `LiveSelection`
		 * attributes API are set with `'normal'` priority.
		 *
		 * @private
		 * @member {Map} engine.model.LiveSelection#_attributePriority
		 */
		this._attributePriority = new Map();

		// Whenever selection range changes, if the change comes directly from selection API (direct user change).
		this.on( 'change:range', ( evt, data ) => {
			if ( data.directChange ) {
				this.refreshAttributes();
			}
		}, { priority: 'high' } );

		// Whenever attribute operation is performed on document, update attributes. This is not the most efficient
		// way to update selection attributes, but should be okay for now. `_updateAttributes` will be fired too often,
		// but it won't change attributes or fire `change:attribute` event if not needed.
		this.listenTo( this._document, 'change', ( evt, type ) => {
			if ( attrOpTypes.has( type ) ) {
				this._updateAttributes( false );
			}
		} );
	}

	/**
	 * @inheritDoc
	 */
	get isCollapsed() {
		const length = this._ranges.length;

		return length === 0 ? true : super.isCollapsed;
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
		return super.focus || this._document._getDefaultRange().start;
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
	*getRanges() {
		if ( this._ranges.length ) {
			yield *super.getRanges();
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
	setAttribute( key, value ) {
		// Store attribute in parent element if the selection is collapsed in an empty node.
		if ( this.isCollapsed && this.anchor.parent.childCount === 0 ) {
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
		if ( this.isCollapsed && this.anchor.parent.childCount === 0 ) {
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

		if ( this.isCollapsed && this.anchor.parent.childCount === 0 ) {
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
	 * Creates and returns an instance of `LiveSelection` that is a clone of given selection, meaning that it has same
	 * ranges and same direction as this selection.
	 *
	 * @params {engine.model.Selection} otherSelection Selection to be cloned.
	 * @returns {engine.model.LiveSelection} `Selection` instance that is a clone of given selection.
	 */
	static createFromSelection( otherSelection ) {
		const selection = new this( otherSelection._document );
		selection.setTo( otherSelection );

		return selection;
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
	 * Prepares given range to be added to selection. Checks if it is correct, converts it to {@link engine.model.LiveRange LiveRange}
	 * and sets listeners listening to the range's change event.
	 *
	 * @private
	 * @param {engine.model.Range} range
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
		this.listenTo( liveRange, 'change', ( evt, oldRange ) => {
			if ( liveRange.root == this._document.graveyard ) {
				this._fixGraveyardSelection( liveRange, oldRange );
			}

			this.fire( 'change:range', { directChange: false } );
		} );

		return liveRange;
	}

	/**
	 * Updates this selection attributes according to its ranges and the {@link engine.model.Document model document}.
	 *
	 * @protected
	 * @param {Boolean} clearAll
	 * @fires engine.model.LiveSelection#change:attribute
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
			for ( let [ key, priority ] of this._attributePriority ) {
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
		for ( let [ newKey, newValue ] of this.getAttributes() ) {
			if ( !oldAttributes.has( newKey ) || oldAttributes.get( newKey ) !== newValue ) {
				changed.push( newKey );
			}
		}

		// Then, check which of old attributes got removed.
		for ( let [ oldKey ] of oldAttributes ) {
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
	 * @param {Iterable|Object} attrs Iterable object containing attributes to be set.
	 * @param {Boolean} [directChange=true] `true` if the change is caused by `Selection` API, `false` if change
	 * is caused by `Batch` API.
	 * @returns {Set.<String>} Changed attribute keys.
	 */
	_setAttributesTo( attrs, directChange = true ) {
		const changed = new Set();

		for ( let [ oldKey, oldValue ] of this.getAttributes() ) {
			// Do not remove attribute if attribute with same key and value is about to be set.
			if ( attrs.get( oldKey ) === oldValue ) {
				continue;
			}

			// Attribute still might not get removed because of priorities.
			if ( this._removeAttribute( oldKey, directChange ) ) {
				changed.add( oldKey );
			}
		}

		for ( let [ key, value ] of attrs ) {
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
	*_getStoredAttributes() {
		const selectionParent = this.getFirstPosition().parent;

		if ( this.isCollapsed && selectionParent.childCount === 0 ) {
			for ( let key of selectionParent.getAttributeKeys() ) {
				if ( key.indexOf( storePrefix ) === 0 ) {
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
		const storeKey = LiveSelection._getStoreAttributeKey( key );

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
		const storeKey = LiveSelection._getStoreAttributeKey( key );

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

		for ( let [ oldKey ] of this._getStoredAttributes() ) {
			const storeKey = LiveSelection._getStoreAttributeKey( oldKey );

			batch.removeAttribute( selectionParent, storeKey );
		}

		for ( let [ key, value ] of attrs ) {
			const storeKey = LiveSelection._getStoreAttributeKey( key );

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

		let attrs = null;

		if ( !this.isCollapsed ) {
			// 1. If selection is a range...
			const range = this.getFirstRange();

			// ...look for a first character node in that range and take attributes from it.
			for ( let item of range ) {
				// This is not an optimal solution because of https://github.com/ckeditor/ckeditor5-engine/issues/454.
				// It can be done better by using `break;` instead of checking `attrs === null`.
				if ( item.type == 'text' && attrs === null ) {
					attrs = item.item.getAttributes();
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
	 * @param {engine.model.LiveRange} gyRange The range added in selection, that ended up in graveyard root.
	 * @param {engine.model.Range} oldRange The state of that range before it was added to graveyard root.
	 */
	_fixGraveyardSelection( gyRange, oldRange ) {
		const gyPath = gyRange.start.path;

		const newPathLength = oldRange.start.path.length - ( gyPath.length - 2 );
		const newPath = oldRange.start.path.slice( 0, newPathLength );
		newPath[ newPath.length - 1 ] -= gyPath[ 1 ];

		const newPosition = new Position( oldRange.root, newPath );
		const newRange = this._prepareRange( new Range( newPosition, newPosition ) );

		const index = this._ranges.indexOf( gyRange );
		this._ranges.splice( index, 1, newRange );

		gyRange.detach();
	}
}

// Helper function for {@link engine.model.LiveSelection#_updateAttributes}. It takes model item, checks whether
// it is a text node (or text proxy) and if so, returns it's attributes. If not, returns `null`.
//
// @param {engine.model.Item}  node
// @returns {Boolean}
function getAttrsIfCharacter( node ) {
	if ( node instanceof TextProxy || node instanceof Text ) {
		return node.getAttributes();
	}

	return null;
}
