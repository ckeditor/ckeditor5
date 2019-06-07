/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
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
	 * @param {String} name Node name.
	 */
	constructor( name ) {
		super( name );

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
	 * @inheritDoc
	 */
	is( type, name = null ) {
		if ( !name ) {
			return type == 'rootElement' || super.is( type );
		} else {
			return ( type == 'rootElement' && name == this.name ) || super.is( type, name );
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
