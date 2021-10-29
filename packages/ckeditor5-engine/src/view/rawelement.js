/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/view/rawelement
 */

import Element from './element';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';
import Node from './node';

/**
 * The raw element class.
 *
 * The raw elements work as data containers ("wrappers", "sandboxes") but their children are not managed or
 * even recognized by the editor. This encapsulation allows integrations to maintain custom DOM structures
 * in the editor content without, for instance, worrying about compatibility with other editor features.
 * Raw elements are a perfect tool for integration with external frameworks and data sources.
 *
 * Unlike {@link module:engine/view/uielement~UIElement UI elements}, raw elements act like real editor
 * content (similar to {@link module:engine/view/containerelement~ContainerElement} or
 * {@link module:engine/view/emptyelement~EmptyElement}), they are considered by the editor selection and
 * {@link module:widget/utils~toWidget they can work as widgets}.
 *
 * To create a new raw element, use the
 * {@link module:engine/view/downcastwriter~DowncastWriter#createRawElement `downcastWriter#createRawElement()`} method.
 *
 * @extends module:engine/view/element~Element
 */
export default class RawElement extends Element {
	/**
	 * Creates a new instance of a raw element.
	 *
	 * Throws the `view-rawelement-cannot-add` {@link module:utils/ckeditorerror~CKEditorError CKEditorError} when the `children`
	 * parameter is passed to inform that the usage of `RawElement` is incorrect (adding child nodes to `RawElement` is forbidden).
	 *
	 * @see module:engine/view/downcastwriter~DowncastWriter#createRawElement
	 * @protected
	 * @param {module:engine/view/document~Document} document The document instance to which this element belongs.
	 * @param {String} name A node name.
	 * @param {Object|Iterable} [attrs] The collection of attributes.
	 * @param {module:engine/view/node~Node|Iterable.<module:engine/view/node~Node>} [children]
	 * A list of nodes to be inserted into the created element.
	 */
	constructor( document, name, attrs, children ) {
		super( document, name, attrs, children );

		// Override the default of the base class.
		this._isAllowedInsideAttributeElement = true;

		/**
		 * Returns `null` because filler is not needed for raw elements.
		 *
		 * @method #getFillerOffset
		 * @returns {null} Always returns null.
		 */
		this.getFillerOffset = getFillerOffset;
	}

	/**
	 * Checks whether this object is of the given type or name.
	 *
	 *		rawElement.is( 'rawElement' ); // -> true
	 *		rawElement.is( 'element' ); // -> true
	 *		rawElement.is( 'node' ); // -> true
	 *		rawElement.is( 'view:rawElement' ); // -> true
	 *		rawElement.is( 'view:element' ); // -> true
	 *		rawElement.is( 'view:node' ); // -> true
	 *
	 *		rawElement.is( 'model:element' ); // -> false
	 *		rawElement.is( 'documentFragment' ); // -> false
	 *
	 * Assuming that the object being checked is a raw element, you can also check its
	 * {@link module:engine/view/rawelement~RawElement#name name}:
	 *
	 *		rawElement.is( 'img' ); // -> true if this is an img element
	 *		rawElement.is( 'rawElement', 'img' ); // -> same as above
	 *		text.is( 'img' ); -> false
	 *
	 * {@link module:engine/view/node~Node#is Check the entire list of view objects} which implement the `is()` method.
	 *
	 * @param {String} type The type to check when the `name` parameter is present.
	 * Otherwise, it acts like the `name` parameter.
	 * @param {String} [name] The element name.
	 * @returns {Boolean}
	 */
	is( type, name = null ) {
		if ( !name ) {
			return type === 'rawElement' || type === 'view:rawElement' ||
				// From super.is(). This is highly utilised method and cannot call super. See ckeditor/ckeditor5#6529.
				type === this.name || type === 'view:' + this.name ||
				type === 'element' || type === 'view:element' ||
				type === 'node' || type === 'view:node';
		} else {
			return name === this.name && (
				type === 'rawElement' || type === 'view:rawElement' ||
				type === 'element' || type === 'view:element'
			);
		}
	}

	/**
	 * Overrides the {@link module:engine/view/element~Element#_insertChild} method.
	 * Throws the `view-rawelement-cannot-add` {@link module:utils/ckeditorerror~CKEditorError CKEditorError} to prevent
	 * adding any child nodes to a raw element.
	 *
	 * @protected
	 */
	_insertChild( index, nodes ) {
		if ( nodes && ( nodes instanceof Node || Array.from( nodes ).length > 0 ) ) {
			/**
			 * Cannot add children to a {@link module:engine/view/rawelement~RawElement} instance.
			 *
			 * @error view-rawelement-cannot-add
			 */
			throw new CKEditorError(
				'view-rawelement-cannot-add',
				[ this, nodes ]
			);
		}
	}

	/**
	 * This allows rendering the children of a {@link module:engine/view/rawelement~RawElement} on the DOM level.
	 * This method is called by the {@link module:engine/view/domconverter~DomConverter} with the raw DOM element
	 * passed as an argument, leaving the number and shape of the children up to the integrator.
	 *
	 * This method **must be defined** for the raw element to work:
	 *
	 *		const myRawElement = downcastWriter.createRawElement( 'div' );
	 *
	 *		myRawElement.render = function( domElement, domConverter ) {
	 *			domConverter.setContentOf( domElement, '<b>This is the raw content of myRawElement.</b>' );
	 *		};
	 *
	 * @method #render
	 * @param {HTMLElement} domElement The native DOM element representing the raw view element.
	 * @param {module:engine/view/domconverter~DomConverter} domConverter Instance of the DomConverter used to optimize the output.
	 */
}

// Returns `null` because block filler is not needed for raw elements.
//
// @returns {null}
function getFillerOffset() {
	return null;
}
