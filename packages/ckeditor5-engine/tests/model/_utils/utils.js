/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Range from '../../../src/model/range';
import TreeWalker from '../../../src/model/treewalker';
import Text from '../../../src/model/text';
import TextProxy from '../../../src/model/textproxy';
import Delta from '../../../src/model/delta/delta';
import Batch from '../../../src/model/batch';

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
 * Returns object JSON representation. It pases an object by JSON.stringify and JSON.parse functions.
 *
 * @param {Object|Array} object
 */
export function jsonParseStringify( object ) {
	return JSON.parse( JSON.stringify( object ) );
}

/**
 * Adds given {@link module:engine/model/operation/operation~Operation operation} to a newly created
 * {@link module:engine/model/delta/delta~Delta delta}
 * and returns it back. Every operation, when applied, have to be added to a delta. This helper function is useful in those
 * tests which focus on operations, not deltas.
 *
 * @param {module:engine/model/operation/operation~Operation} operation Operation to wrap
 * @returns {module:engine/model/operation/operation~Operation}
 */
export function wrapInDelta( operation ) {
	const delta = new Delta();
	// Batch() requires the document but only a few lines of code needs batch in `document#changes`
	// so we may have an invalid batch instance for some tests.
	const batch = new Batch();

	delta.addOperation( operation );
	batch.addDelta( delta );

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
 * Creates a range on given {@link engine.model.Element element} only. The range starts directly before that element
 * and ends before the first child of that element.
 *
 * @param {engine.model.Element} element Element on which range should be created.
 * @returns {engine.model.Range}
 */
export function createRangeOnElementOnly( element ) {
	return Range.createFromParentsAndOffsets( element.parent, element.startOffset, element, 0 );
}
