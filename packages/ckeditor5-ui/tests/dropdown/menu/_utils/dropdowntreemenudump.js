/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { createTextSearchMetadata } from '../../../../src/dropdown/menu/tree/dropdownmenutreecreateutils.js';
import { walkOverDropdownMenuTreeItems } from '../../../../src/dropdown/menu/tree/dropdownmenutreewalker.js';

/**
 * Dumps the dropdown menu tree into a string.
 *
 * ```ts
 * const tree = {
 * 	type: 'Root',
 * 	children: [
 * 		{
 * 			type: 'Menu',
 * 			search: {
 * 				raw: 'Menu 1',
 * 				text: 'menu 1'
 * 			},
 * 			menu: new DropdownMenuView( ... ),
 * 			children: [
 * 				{
 * 					type: 'Item',
 * 					search: {
 * 						raw: 'Buttom',
 * 						text: 'button'
 * 					},
 * 					item: new DropdownMenuListItemButtonView( ... )
 * 				}
 * 			]
 * 		}
 * 	]
 * };
 *
 * const dump = dumpDropdownMenuTree( tree );
 *
 * expect( dump ).to.equal( `<Root>
 *   <Menu 1>
 *     <Item raw="Button" text="button" />
 *   </Menu 1>
 * </Root>` );
 * ```
 *
 * @param tree The dropdown menu tree to dump.
 * @returns The string representation of the dropdown menu tree.
 */
export function dumpDropdownMenuTree( tree ) {
	const lines = [];
	let lastEnteredNode = null;

	const formatAttributes = attributes =>
		Object
			.entries( attributes )
			.map( ( [ key, value ] ) => ` ${ key }="${ value }"` )
			.join( '' );

	walkOverDropdownMenuTreeItems( {
		Default: {
			enter: ( { node, parents } ) => {
				const nesting = '  '.repeat( parents.length );
				const attributes = node.type === 'Root' ? '' : formatAttributes( node.search );

				lastEnteredNode = node;
				lines.push( `${ nesting }<${ node.type }${ attributes }>` );

				// Skip walking into not initialized menus.
				if ( node.type === 'Menu' && node.menu.isPendingLazyInitialization ) {
					return false;
				}
			},
			leave: ( { node, parents } ) => {
				if ( lastEnteredNode === node ) {
					// It's self enclosing tag. Like this one: <Item />
					lines[ lines.length - 1 ] = lines[ lines.length - 1 ].replace( />$/, ' />' );
				} else {
					// It's tag with children. Like this one: <Menu>...</Menu>
					const nesting = '  '.repeat( parents.length );

					lines.push( `${ nesting }</${ node.type }>` );
				}
			}
		}
	}, tree );

	return lines.join( '\n' );
}

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
