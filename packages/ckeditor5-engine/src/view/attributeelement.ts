/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module engine/view/attributeelement
 */

import Element, { type ElementAttributes } from './element.js';
import { CKEditorError } from '@ckeditor/ckeditor5-utils';

import type DocumentFragment from './documentfragment.js';
import type Document from './document.js';
import type Node from './node.js';

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
 */
export default class AttributeElement extends Element {
	public static readonly DEFAULT_PRIORITY: number = DEFAULT_PRIORITY;

	/**
	 * Element priority. Decides in what order elements are wrapped by {@link module:engine/view/downcastwriter~DowncastWriter}.
	 *
	 * @internal
	 * @readonly
	 */
	public _priority: number = DEFAULT_PRIORITY;

	/**
	 * Element identifier. If set, it is used by {@link module:engine/view/element~Element#isSimilar},
	 * and then two elements are considered similar if, and only if they have the same `_id`.
	 *
	 * @internal
	 * @readonly
	 */
	public _id: string | number | null = null;

	/**
	 * Keeps all the attribute elements that have the same {@link module:engine/view/attributeelement~AttributeElement#id ids}
	 * and still exist in the view tree.
	 *
	 * This property is managed by {@link module:engine/view/downcastwriter~DowncastWriter}.
	 */
	private readonly _clonesGroup: Set<AttributeElement> | null = null;

	/**
	 * Creates an attribute element.
	 *
	 * @see module:engine/view/downcastwriter~DowncastWriter#createAttributeElement
	 * @see module:engine/view/element~Element
	 * @protected
	 * @param document The document instance to which this element belongs.
	 * @param name Node name.
	 * @param attrs Collection of attributes.
	 * @param children A list of nodes to be inserted into created element.
	 */
	constructor(
		document: Document,
		name: string,
		attrs?: ElementAttributes,
		children?: Node | Iterable<Node>
	) {
		super( document, name, attrs, children );

		this.getFillerOffset = getFillerOffset;
	}

	/**
	 * Element priority. Decides in what order elements are wrapped by {@link module:engine/view/downcastwriter~DowncastWriter}.
	 */
	public get priority(): number {
		return this._priority;
	}

	/**
	 * Element identifier. If set, it is used by {@link module:engine/view/element~Element#isSimilar},
	 * and then two elements are considered similar if, and only if they have the same `id`.
	 */
	public get id(): string | number | null {
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
	 * @returns Set containing all the attribute elements
	 * with the same `id` that were added and not removed from the view tree.
	 */
	public getElementsWithSameId(): Set<AttributeElement> {
		if ( this.id === null ) {
			/**
			 * Cannot get elements with the same id for an attribute element without id.
			 *
			 * @error attribute-element-get-elements-with-same-id-no-id
			 */
			throw new CKEditorError(
				'attribute-element-get-elements-with-same-id-no-id',
				this
			);
		}

		return new Set( this._clonesGroup );
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
	 */
	public override isSimilar( otherElement: Element ): boolean {
		// If any element has an `id` set, just compare the ids.
		if ( this.id !== null || ( otherElement as any ).id !== null ) {
			return this.id === ( otherElement as any ).id;
		}

		return super.isSimilar( otherElement ) && this.priority == ( otherElement as any ).priority;
	}

	/**
	 * Clones provided element with priority.
	 *
	 * @internal
	 * @param deep If set to `true` clones element and all its children recursively. When set to `false`,
	 * element will be cloned without any children.
	 * @returns Clone of this element.
	 */
	public override _clone( deep: boolean = false ): this {
		const cloned = super._clone( deep );

		// Clone priority too.
		cloned._priority = this._priority;

		// And id too.
		cloned._id = this._id;

		return cloned;
	}

	/**
	 * Used by {@link module:engine/view/element~Element#_mergeAttributesFrom} to verify if the given element can be merged without
	 * conflicts into this element.
	 *
	 * @internal
	 */
	public override _canMergeAttributesFrom( otherElement: AttributeElement ): boolean {
		// Can't merge if any of elements have an id or a difference of priority.
		if ( this.id !== null || otherElement.id !== null || this.priority !== otherElement.priority ) {
			return false;
		}

		return super._canMergeAttributesFrom( otherElement );
	}

	/**
	 * Used by {@link module:engine/view/element~Element#_subtractAttributesOf} to verify if the given element attributes
	 * can be fully subtracted from this element.
	 *
	 * @internal
	 */
	public override _canSubtractAttributesOf( otherElement: AttributeElement ): boolean {
		// Can't subtract if any of elements have an id or a difference of priority.
		if ( this.id !== null || otherElement.id !== null || this.priority !== otherElement.priority ) {
			return false;
		}

		return super._canSubtractAttributesOf( otherElement );
	}
}

// The magic of type inference using `is` method is centralized in `TypeCheckable` class.
// Proper overload would interfere with that.
AttributeElement.prototype.is = function( type: string, name?: string ): boolean {
	if ( !name ) {
		return type === 'attributeElement' || type === 'view:attributeElement' ||
			// From super.is(). This is highly utilised method and cannot call super. See ckeditor/ckeditor5#6529.
			type === 'element' || type === 'view:element' ||
			type === 'node' || type === 'view:node';
	} else {
		return name === this.name && (
			type === 'attributeElement' || type === 'view:attributeElement' ||
			// From super.is(). This is highly utilised method and cannot call super. See ckeditor/ckeditor5#6529.
			type === 'element' || type === 'view:element'
		);
	}
};

/**
 * Returns block {@link module:engine/view/filler~Filler filler} offset or `null` if block filler is not needed.
 *
 * @returns Block filler offset or `null` if block filler is not needed.
 */
function getFillerOffset( this: AttributeElement ): number | null {
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

/**
 * Returns total count of children that are not {@link module:engine/view/uielement~UIElement UIElements}.
 */
function nonUiChildrenCount( element: Element | DocumentFragment ): number {
	return Array.from( element.getChildren() ).filter( element => !element.is( 'uiElement' ) ).length;
}
