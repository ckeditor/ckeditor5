/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import TreeWalker from '/ckeditor5/engine/model/treewalker.js';
import Text from '/ckeditor5/engine/model/text.js';
import TextProxy from '/ckeditor5/engine/model/textproxy.js';
import Delta from '/ckeditor5/engine/model/delta/delta.js';

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

	for ( let value of treeWalker ) {
		let node = value.item;
		let nodeText = node.data;

		if ( nodeText ) {
			txt += nodeText.toLowerCase();
		} else {
			txt += node.name.toUpperCase();
		}
	}

	return txt;
}

/**
 * Returns object JSON representation. It pases an object by JSON.stringify and JSON.parse functions.
 *
 * @param {Object|Array} object
 */
export function jsonParseStringify( object ) {
	return JSON.parse( JSON.stringify( object ) );
}

/**
 * Adds given {@link engine.model.operation.Operation operation} to a newly created {@link engine.model.delta.Delta delta}
 * and returns it back. Every operation, when applied, have to be added to a delta. This helper function is useful in those
 * tests which focus on operations, not deltas.
 *
 * @param {engine.model.operation.Operation} operation Operation to wrap
 * @returns {engine.model.operation.Operation}
 */
export function wrapInDelta( operation ) {
	const delta = new Delta();
	delta.addOperation( operation );

	return operation;
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
	let index = parent.offsetToIndex( offset );
	let node = parent.getChild( index );

	if ( node instanceof Text ) {
		let offsetInText = offset - node.startOffset;

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

	for ( let child of element.getChildren() ) {
		if ( child.data ) {
			text += child.data;
		} else if ( child.name ) {
			text += getText( child );
		}
	}

	return text;
}
