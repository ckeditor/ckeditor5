/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module find-and-replace
 */

import { uid, Collection } from 'ckeditor5/src/utils';
import { escapeRegExp } from 'lodash-es';

/**
 * Executes findCallback and updates search results list.
 *
 * @param {module:engine/model/range~Range} range
 * @param {module:engine/model/model~Model} model
 * @param {Function} findCallback
 * @param {module:utils/collection~Collection} [startResults] An optional collection of find matches that the function should
 * starts with. This would be a collection returned by a previous `updateFindResultFromRange()` call.
 * @returns {module:utils/collection~Collection} A collection of objects describing find match.
 *
 * An example structure:
 *
 * ```js
 * {
 *	id: resultId,
 *	label: foundItem.label,
 *	marker
 *	}
 * ```
 */
export function updateFindResultFromRange( range, model, findCallback, startResults ) {
	const results = startResults || new Collection();

	[ ...range ].forEach( ( { type, item } ) => {
		if ( type === 'elementStart' ) {
			if ( model.schema.checkChild( item, '$text' ) ) {
				const foundItems = findCallback( {
					item,
					text: rangeToText( model.createRangeIn( item ) )
				} );

				if ( !foundItems ) {
					return;
				}

				foundItems.forEach( foundItem => {
					model.change( writer => {
						const resultId = `findResult:${ uid() }`;
						const marker = writer.addMarker( resultId, {
							usingOperation: false,
							affectsData: false,
							range: writer.createRange(
								writer.createPositionAt( item, foundItem.start ),
								writer.createPositionAt( item, foundItem.end )
							)
						} );

						const index = findInsertIndex( results, marker );

						results.add(
							{
								id: resultId,
								label: foundItem.label,
								marker
							},
							index
						);
					} );
				} );
			}
		}
	} );

	return results;
}

/**
 * Returns text representation of a range. The returned text length should be the same as range length.
 * In order to achieve this this function will:
 * - replace inline elements (text-line) as new line character ("\n").
 * - @todo: check unicode characters
 */
export function rangeToText( range ) {
	return Array.from( range.getItems() ).reduce( ( rangeText, node ) => {
		// Trim text to a last occurrence of an inline element and update range start.
		if ( !( node.is( 'text' ) || node.is( 'textProxy' ) ) ) {
			// Editor has only one inline element defined in schema: `<softBreak>` which is treated as new line character in blocks.
			// Special handling might be needed for other inline elements (inline widgets).
			return `${ rangeText }\n`;
		}

		return rangeText + node.data;
	}, '' );
}

function findInsertIndex( resultsList, markerToInsert ) {
	const result = resultsList.find( ( { marker } ) => {
		return markerToInsert.getStart().isBefore( marker.getStart() );
	} );

	return result ? resultsList.getIndex( result ) : resultsList.length;
}

function regexpMatchToFindResult( matchResult ) {
	// In case of match words option the matching results contain indices so that we work on
	// offset where a subject match group was (as opposed to working on entire matched string).
	if ( matchResult.indices ) {
		return {
			label: matchResult[ 1 ],
			start: matchResult.indices[ 1 ][ 0 ],
			end: matchResult.indices[ 1 ][ 1 ]
		};
	} else {
		return {
			label: matchResult[ 1 ],
			start: matchResult.index,
			end: matchResult.index + matchResult[ 1 ].length
		};
	}
}

/**
 *
 * @param {String} searchTerm
 * @param {Object} [options]
 * @param {Boolean} [options.matchCase=false] If set to `true` letter casing will be ignored.
 * @param {Boolean} [options.wholeWords=false] If set to `true` only whole words that match `callbackOrText` will be matched.
 * @returns {Function}
 */
export function findByTextCallback( searchTerm, options ) {
	let flags = 'gu';

	if ( !options.matchCase ) {
		flags += 'i';
	}

	let regExpQuery = `(${ escapeRegExp( searchTerm ) })`;

	if ( options.wholeWords ) {
		flags += 'd'; // Special groups so that regexp indices are available.

		const nonLetterGroup = '[^a-zA-Z\u00C0-\u024F\u1E00-\u1EFF]';

		regExpQuery = `(?:^|${ nonLetterGroup }|_)` + regExpQuery + `(?:_|${ nonLetterGroup }|$)`;
	}

	const regExp = new RegExp( regExpQuery, flags );

	function findCallback( { text } ) {
		const matches = [ ...text.matchAll( regExp ) ];

		return matches.map( regexpMatchToFindResult );
	}

	return findCallback;
}
