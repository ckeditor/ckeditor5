/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module engine/view/rooteditableelement
 */

import EditableElement from './editableelement.js';

import type Document from './document.js';

const rootNameSymbol = Symbol( 'rootName' );

/**
 * Class representing a single root in the data view. A root can be either {@link ~RootEditableElement#isReadOnly editable or read-only},
 * but in both cases it is called "an editable". Roots can contain other {@link module:engine/view/editableelement~EditableElement
 * editable elements} making them "nested editables".
 */
export default class RootEditableElement extends EditableElement {
	/**
	 * Creates root editable element.
	 *
	 * @param document The document instance to which this element belongs.
	 * @param name Node name.
	 */
	constructor(
		document: Document,
		name: string
	) {
		super( document, name );

		this.rootName = 'main';
	}

	/**
	 * Name of this root inside {@link module:engine/view/document~Document} that is an owner of this root. If no
	 * other name is set, `main` name is used.
	 *
	 * @readonly
	 */
	public get rootName(): string {
		return this.getCustomProperty( rootNameSymbol ) as string;
	}

	public set rootName( rootName: string ) {
		this._setCustomProperty( rootNameSymbol, rootName );
	}

	/**
	 * Overrides old element name and sets new one.
	 * This is needed because view roots are created before they are attached to the DOM.
	 * The name of the root element is temporary at this stage. It has to be changed when the
	 * view root element is attached to the DOM element.
	 *
	 * @internal
	 * @param name The new name of element.
	 */
	public set _name( name: string ) {
		( this as any ).name = name;
	}
}

// The magic of type inference using `is` method is centralized in `TypeCheckable` class.
// Proper overload would interfere with that.
RootEditableElement.prototype.is = function( type: string, name?: string ): boolean {
	if ( !name ) {
		return type === 'rootElement' || type === 'view:rootElement' ||
			// From super.is(). This is highly utilised method and cannot call super. See ckeditor/ckeditor5#6529.
			type === 'editableElement' || type === 'view:editableElement' ||
			type === 'containerElement' || type === 'view:containerElement' ||
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
};
