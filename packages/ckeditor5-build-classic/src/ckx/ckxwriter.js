/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import DowncastWriter from '@ckeditor/ckeditor5-engine/src/view/downcastwriter';

export default class CKXWriter extends DowncastWriter {
	createElementWithChildren( name, attributes, ...children ) {
		// Handles both "div" and "container:div" notations.
		const { elementType, elementName } = getTypeAndName( name );

		const parent = this._createElementOfType( elementType, elementName, attributes );

		for ( const child of children ) {
			// writer.insert disallows inserting outside parent container so let's hack it:
			parent._appendChild( typeof child === 'string' ? this.createText( child ) : child );
		}

		return parent;
	}

	_createElementOfType( elementType, elementName, attributes ) {
		switch ( elementType ) {
			case 'container':
				return this.createContainerElement( elementName, attributes );
			case 'attribute':
				return this.createAttributeElement( elementName, attributes );
			case 'empty':
				return this.createEmptyElement( elementName, attributes );
			case 'raw': {
				const renderFunction = attributes.renderFunction;

				if ( renderFunction ) {
					delete attributes.renderFunction;
				}

				return this.createRawElement( elementName, attributes, renderFunction );
			}
		}
	}
}

function getTypeAndName( name ) {
	let [ elementType, elementName ] = name.split( ':' );

	if ( !elementName ) {
		elementName = elementType;
		elementType = 'container';
	}

	return { elementType, elementName };
}
