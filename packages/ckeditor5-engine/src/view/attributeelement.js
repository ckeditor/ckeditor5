/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/view/attributeelement
 */

import Element from './element';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';

// Default attribute priority.
const DEFAULT_PRIORITY = 10;

/**
 * Attribute elements are used to represent formatting elements in the view (think – `<b>`, `<span style="font-size: 2em">`, etc.).
 * Most often they are created when downcasting model text attributes.
 *
 * Editing engine does not define a fixed HTML DTD. This is why a feature developer needs to choose between various
 * types (container element, {@link module:engine/view/attributeelement~AttributeElement attribute element},
 * {@link module:engine/view/emptyelement~EmptyElement empty element}, etc) when developing a feature.
 *
 * To create a new attribute element instance use the
 * {@link module:engine/view/downcastwriter~DowncastWriter#createAttributeElement `DowncastWriter#createAttributeElement()`} method.
 *
 * @extends module:engine/view/element~Element
 */
export default class AttributeElement extends Element {
	/**
	 * Creates an attribute element.
	 *
	 * @see module:engine/view/downcastwriter~DowncastWriter#createAttributeElement
	 * @see module:engine/view/element~Element
	 * @protected
	 */
	constructor( name, attrs, children ) {
		super( name, attrs, children );

		/**
		 * Returns block {@link module:engine/view/filler filler} offset or `null` if block filler is not needed.
		 *
		 * @method #getFillerOffset
		 * @returns {Number|null} Block filler offset or `null` if block filler is not needed.
		 */
		this.getFillerOffset = getFillerOffset;

		/**
		 * Element priority. Decides in what order elements are wrapped by {@link module:engine/view/downcastwriter~DowncastWriter}.
		 *
		 * @protected
		 * @member {Number}
		 */
		this._priority = DEFAULT_PRIORITY;

		/**
		 * Element identifier. If set, it is used by {@link module:engine/view/element~Element#isSimilar},
		 * and then two elements are considered similar if, and only if they have the same `_id`.
		 *
		 * @protected
		 * @member {String|Number}
		 */
		this._id = null;

		/**
		 * Keeps all the attribute elements that have the same {@link module:engine/view/attributeelement~AttributeElement#id ids}
		 * and still exist in the view tree.
		 *
		 * This property is managed by {@link module:engine/view/downcastwriter~DowncastWriter}.
		 *
		 * @protected
		 * @member {Set.<module:engine/view/attributeelement~AttributeElement>|null}
		 */
		this._clonesGroup = null;
	}

	/**
	 * Element priority. Decides in what order elements are wrapped by {@link module:engine/view/downcastwriter~DowncastWriter}.
	 *
	 * @readonly
	 * @type {Number}
	 */
	get priority() {
		return this._priority;
	}

	/**
	 * Element identifier. If set, it is used by {@link module:engine/view/element~Element#isSimilar},
	 * and then two elements are considered similar if, and only if they have the same `id`.
	 *
	 * @readonly
	 * @type {String|Number}
	 */
	get id() {
		return this._id;
	}

	/**
	 * Returns all {@link module:engine/view/attributeelement~AttributeElement attribute elements} that has the
	 * same {@link module:engine/view/attributeelement~AttributeElement#id id} and are in the view tree (were not removed).
	 *
	 * Note: If this element has been removed from the tree, returned set will not include it.
	 *
	 * Throws {@link module:utils/ckeditorerror~CKEditorError attribute-element-get-elements-with-same-id-no-id}
	 * if this element has no `id`.
	 *
	 * @returns {Set.<module:engine/view/attributeelement~AttributeElement>} Set containing all the attribute elements
	 * with the same `id` that were added and not removed from the view tree.
	 */
	getElementsWithSameId() {
		if ( this.id === null ) {
			/**
			 * Cannot get elements with the same id for an attribute element without id.
			 *
			 * @error attribute-element-get-elements-with-same-id-no-id
			 */
			throw new CKEditorError(
				'attribute-element-get-elements-with-same-id-no-id: ' +
				'Cannot get elements with the same id for an attribute element without id.',
				this
			);
		}

		return new Set( this._clonesGroup );
	}

	/**
	 * @inheritDoc
	 */
	is( type, name = null ) {
		if ( !name ) {
			return type == 'attributeElement' || super.is( type );
		} else {
			return ( type == 'attributeElement' && name == this.name ) || super.is( type, name );
		}
	}

	/**
	 * Checks if this element is similar to other element.
	 *
	 * If none of elements has set {@link module:engine/view/attributeelement~AttributeElement#id}, then both elements
	 * should have the same name, attributes and priority to be considered as similar. Two similar elements can contain
	 * different set of children nodes.
	 *
	 * If at least one element has {@link module:engine/view/attributeelement~AttributeElement#id} set, then both
	 * elements have to have the same {@link module:engine/view/attributeelement~AttributeElement#id} value to be
	 * considered similar.
	 *
	 * Similarity is important for {@link module:engine/view/downcastwriter~DowncastWriter}. For example:
	 *
	 * * two following similar elements can be merged together into one, longer element,
	 * * {@link module:engine/view/downcastwriter~DowncastWriter#unwrap} checks similarity of passed element and processed element to
	 * decide whether processed element should be unwrapped,
	 * * etc.
	 *
	 * @param {module:engine/view/element~Element} otherElement
	 * @returns {Boolean}
	 */
	isSimilar( otherElement ) {
		// If any element has an `id` set, just compare the ids.
		if ( this.id !== null || otherElement.id !== null ) {
			return this.id === otherElement.id;
		}

		return super.isSimilar( otherElement ) && this.priority == otherElement.priority;
	}

	/**
	 * Clones provided element with priority.
	 *
	 * @protected
	 * @param {Boolean} deep If set to `true` clones element and all its children recursively. When set to `false`,
	 * element will be cloned without any children.
	 * @returns {module:engine/view/attributeelement~AttributeElement} Clone of this element.
	 */
	_clone( deep ) {
		const cloned = super._clone( deep );

		// Clone priority too.
		cloned._priority = this._priority;

		// And id too.
		cloned._id = this._id;

		return cloned;
	}
}

/**
 * Default attribute priority.
 *
 * @member {Number} module:engine/view/attributeelement~AttributeElement.DEFAULT_PRIORITY
 */
AttributeElement.DEFAULT_PRIORITY = DEFAULT_PRIORITY;

// Returns block {@link module:engine/view/filler~Filler filler} offset or `null` if block filler is not needed.
//
// @returns {Number|null} Block filler offset or `null` if block filler is not needed.
function getFillerOffset() {
	// <b>foo</b> does not need filler.
	if ( nonUiChildrenCount( this ) ) {
		return null;
	}

	let element = this.parent;

	// <p><b></b></p> needs filler -> <p><b><br></b></p>
	while ( element && element.is( 'attributeElement' ) ) {
		if ( nonUiChildrenCount( element ) > 1 ) {
			return null;
		}

		element = element.parent;
	}

	if ( !element || nonUiChildrenCount( element ) > 1 ) {
		return null;
	}

	// Render block filler at the end of element (after all ui elements).
	return this.childCount;
}

// Returns total count of children that are not {@link module:engine/view/uielement~UIElement UIElements}.
//
// @param {module:engine/view/element~Element} element
// @returns {Number}
function nonUiChildrenCount( element ) {
	return Array.from( element.getChildren() ).filter( element => !element.is( 'uiElement' ) ).length;
}
