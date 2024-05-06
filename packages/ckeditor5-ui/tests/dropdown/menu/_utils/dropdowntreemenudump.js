/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { createTextSearchMetadata } from '../../../../src/dropdown/menu/search/dropdownmenutreesearchmetadata.js';

/**
 * A collection of utility functions for creating tree dump tags.
 */
export const Dump = {
	/**
	 * Creates a root tree dump tag.
	 */
	root: ( children = [] ) => treeDumpTag( 'Root', {}, children ).join( '\n' ),

	/**
	 * Creates a menu tree dump tag.
	 */
	menu: ( text, children = [] ) => treeDumpTag(
		'Menu',
		createTextSearchMetadata( text ),
		children
	),

	/**
	 * Creates an item tree dump tag.
	 */
	item: text => treeDumpTag( 'Item', createTextSearchMetadata( text ) )
};

/**
 * Generates a string representation of an HTML tag with optional attributes and children.
 *
 * @param name The name of the HTML tag.
 * @param attributes Optional attributes for the HTML tag.
 * @param children Optional children elements of the HTML tag.
 * @returns The string representation of the HTML tag.
 */
function treeDumpTag( name, attributes = {}, children = [] ) {
	const formattedAttributes = (
		Object
			.entries( attributes )
			.map( ( [ key, value ] ) => ` ${ key }="${ value }"` )
			.join( '' )
	);

	if ( !children.length ) {
		return [ `<${ name }${ formattedAttributes } />` ];
	}

	return [
		`<${ name }${ formattedAttributes }>`,
		...children.flat().map( child => `  ${ child }` ),
		`</${ name }>`
	];
}
