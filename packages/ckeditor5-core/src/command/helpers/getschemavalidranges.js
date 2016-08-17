/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import TreeWalker from '../../../engine/model/treewalker.js';
import Range from '../../../engine/model/range.js';

/**
 * Walks through given array of ranges and removes parts of them that are not allowed by passed schema to have the
 * attribute set. This is done by breaking a range in two and omitting the not allowed part.
 *
 * @param {String} attribute Attribute key.
 * @param {Array.<engine.model.Range>} ranges Ranges to be validated.
 * @param {engine.model.Schema} schema Document schema.
 * @returns {Array.<engine.model.Range>} Ranges without invalid parts.
 */
export default function getSchemaValidRanges( attribute, ranges, schema ) {
	const validRanges = [];

	for ( let range of ranges ) {
		const walker = new TreeWalker( { boundaries: range, mergeCharacters: true } );
		let step = walker.next();

		let last = range.start;
		let from = range.start;
		let to = range.end;

		while ( !step.done ) {
			const name = step.value.item.name || '$text';

			if ( !schema.check( { name: name, inside: last, attributes: attribute } ) ) {
				if ( !from.isEqual( last ) ) {
					validRanges.push( new Range( from, last ) );
				}

				from = walker.position;
			}

			last = walker.position;
			step = walker.next();
		}

		if ( from && !from.isEqual( to ) ) {
			validRanges.push( new Range( from, to ) );
		}
	}

	return validRanges;
}
