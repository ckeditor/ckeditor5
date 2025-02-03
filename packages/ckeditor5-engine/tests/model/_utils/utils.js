/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import Range from '../../../src/model/range.js';
import Position from '../../../src/model/position.js';
import TreeWalker from '../../../src/model/treewalker.js';
import Text from '../../../src/model/text.js';
import TextProxy from '../../../src/model/textproxy.js';

/**
 * Returns tree structure as a simplified string. Elements are uppercase and characters are lowercase.
 * Start and end of an element is marked the same way, by the element's name (in uppercase).
 *
 *		let element = new Element( 'div', [], [ 'abc', new Element( 'p', [], 'foo' ), 'xyz' ] );
 *		modelUtils.getNodesAndText( element ); // abcPfooPxyz
 *
 * @param {engine.model.Range} range Range to stringify.
 * @returns {String} String representing element inner structure.
 */
export function getNodesAndText( range ) {
	let txt = '';
	const treeWalker = new TreeWalker( { boundaries: range } );

	for ( const value of treeWalker ) {
		const node = value.item;
		const nodeText = node.data;

		if ( nodeText ) {
			txt += nodeText.toLowerCase();
		} else {
			txt += node.name.toUpperCase();
		}
	}

	return txt;
}

/**
 * Returns a {@link engine.model.Node} or if it starts at given offset, or {@link engine.model.TextProxy} with one
 * character, if given offset is occupied by a {@link engine.model.Text}.
 *
 * @param {engine.model.Element} parent Element from which item will be returned.
 * @param {Number} offset Item's offset.
 * @returns {engine.model.Node|engine.model.TextProxy}
 */
export function itemAt( parent, offset ) {
	const index = parent.offsetToIndex( offset );
	const node = parent.getChild( index );

	if ( node instanceof Text ) {
		const offsetInText = offset - node.startOffset;

		return new TextProxy( node, offsetInText, 1 );
	}

	return node;
}

/**
 * Returns all text contents that are inside given element and all it's children.
 *
 * @param {engine.model.Element} element Element from which text will be returned.
 * @returns {String} Text contents of the element.
 */
export function getText( element ) {
	let text = '';

	for ( const child of element.getChildren() ) {
		if ( child.data ) {
			text += child.data;
		} else if ( child.name ) {
			text += getText( child );
		}
	}

	return text;
}

/**
 * Maps all elements to names. If element contains child text node it will be appended to name with '#'.
 *
 * @param {Array.<engine.model.Element>} element Array of Element from which text will be returned.
 * @returns {String} Text contents of the element.
 */
export function stringifyBlocks( elements ) {
	return Array.from( elements ).map( el => {
		const name = el.name;

		let innerText = '';

		for ( const child of el.getChildren() ) {
			if ( child.is( '$text' ) ) {
				innerText += child.data;
			}
		}

		return innerText.length ? `${ name }#${ innerText }` : name;
	} );
}

/**
 * Creates a range on given {@link engine.model.Element element} only. The range starts directly before that element
 * and ends before the first child of that element.
 *
 * @param {engine.model.Element} element Element on which range should be created.
 * @returns {engine.model.Range}
 */
export function createRangeOnElementOnly( element ) {
	return new Range( Position._createAt( element.parent, element.startOffset ), Position._createAt( element, 0 ) );
}
