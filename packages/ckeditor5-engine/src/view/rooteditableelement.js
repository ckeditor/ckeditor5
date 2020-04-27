/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/view/rooteditableelement
 */

import EditableElement from './editableelement';

const rootNameSymbol = Symbol( 'rootName' );

/**
 * Class representing a single root in the data view. A root can be either {@link ~RootEditableElement#isReadOnly editable or read-only},
 * but in both cases it is called "an editable". Roots can contain other {@link module:engine/view/editableelement~EditableElement
 * editable elements} making them "nested editables".
 *
 * @extends module:engine/view/editableelement~EditableElement
 */
export default class RootEditableElement extends EditableElement {
	/**
	 * Creates root editable element.
	 *
	 * @param {module:engine/view/document~Document} document The document instance to which this element belongs.
	 * @param {String} name Node name.
	 */
	constructor( document, name ) {
		super( document, name );

		/**
		 * Name of this root inside {@link module:engine/view/document~Document} that is an owner of this root. If no
		 * other name is set, `main` name is used.
		 *
		 * @readonly
		 * @member {String}
		 */
		this.rootName = 'main';
	}

	/**
	 * Checks whether this object is of the given.
	 *
	 *		rootEditableElement.is( 'rootElement' ); // -> true
	 *		rootEditableElement.is( 'editableElement' ); // -> true
	 *		rootEditableElement.is( 'element' ); // -> true
	 *		rootEditableElement.is( 'node' ); // -> true
	 *		rootEditableElement.is( 'view:editableElement' ); // -> true
	 *		rootEditableElement.is( 'view:element' ); // -> true
	 *		rootEditableElement.is( 'view:node' ); // -> true
	 *
	 *		rootEditableElement.is( 'model:element' ); // -> false
	 *		rootEditableElement.is( 'documentFragment' ); // -> false
	 *
	 * Assuming that the object being checked is a root editable element, you can also check its
	 * {@link module:engine/view/rooteditableelement~RootEditableElement#name name}:
	 *
	 *		rootEditableElement.is( 'div' ); // -> true if this is a div root editable element
	 *		rootEditableElement.is( 'rootElement', 'div' ); // -> same as above
	 *		text.is( 'div' ); -> false
	 *
	 * {@link module:engine/view/node~Node#is Check the entire list of view objects} which implement the `is()` method.
	 *
	 * @param {String} type Type to check when `name` parameter is present.
	 * Otherwise, it acts like the `name` parameter.
	 * @param {String} [name] Element name.
	 * @returns {Boolean}
	 */
	is( type, name = null ) {
		if ( !name ) {
			return type === 'rootElement' || type === 'view:rootElement' ||
				// From super.is(). This is highly utilised method and cannot call super. See ckeditor/ckeditor5#6529.
				type === 'editableElement' || type === 'view:editableElement' ||
				type === 'containerElement' || type === 'view:containerElement' ||
				type === this.name || type === 'view:' + this.name ||
				type === 'element' || type === 'view:element' ||
				type === 'node' || type === 'view:node';
		} else {
			return name === this.name && (
				type === 'rootElement' || type === 'view:rootElement' ||
				// From super.is(). This is highly utilised method and cannot call super. See ckeditor/ckeditor5#6529.
				type === 'editableElement' || type === 'view:editableElement' ||
				type === 'containerElement' || type === 'view:containerElement' ||
				type === 'element' || type === 'view:element'
			);
		}
	}

	get rootName() {
		return this.getCustomProperty( rootNameSymbol );
	}

	set rootName( rootName ) {
		this._setCustomProperty( rootNameSymbol, rootName );
	}

	/**
	 * Overrides old element name and sets new one.
	 * This is needed because view roots are created before they are attached to the DOM.
	 * The name of the root element is temporary at this stage. It has to be changed when the
	 * view root element is attached to the DOM element.
	 *
	 * @protected
	 * @param {String} name The new name of element.
	 */
	set _name( name ) {
		this.name = name;
	}
}
