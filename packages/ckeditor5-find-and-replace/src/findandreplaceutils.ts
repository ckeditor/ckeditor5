/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module find-and-replace/findandreplaceutils
 */

import type { Element, Item, Marker, Model, Range } from 'ckeditor5/src/engine';
import { Plugin } from 'ckeditor5/src/core';
import { Collection, uid } from 'ckeditor5/src/utils';
import { escapeRegExp } from 'lodash-es';
import type { ResultType } from './findandreplace';

/**
 * A set of helpers related to find and replace.
 */
export default class FindAndReplaceUtils extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName(): 'FindAndReplaceUtils' {
		return 'FindAndReplaceUtils';
	}

	/**
	 * Executes findCallback and updates search results list.
	 *
	 * @param range The model range to scan for matches.
	 * @param model The model.
	 * @param findCallback The callback that should return `true` if provided text matches the search term.
	 * @param startResults An optional collection of find matches that the function should
	 * start with. This would be a collection returned by a previous `updateFindResultFromRange()` call.
	 * @returns A collection of objects describing find match.
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
	public updateFindResultFromRange(
		range: Range,
		model: Model,
		findCallback: ( { item, text }: { item: Item; text: string } ) => Array<ResultType>,
		startResults: Collection<ResultType> | null
	): Collection<ResultType> {
		const results = startResults || new Collection();

		model.change( writer => {
			[ ...range ].forEach( ( { type, item } ) => {
				if ( type === 'elementStart' ) {
					if ( model.schema.checkChild( item, '$text' ) ) {
						const foundItems = findCallback( {
							item,
							text: this.rangeToText( model.createRangeIn( item as Element ) )
						} );

						if ( !foundItems ) {
							return;
						}

						foundItems.forEach( foundItem => {
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
					}
				}
			} );
		} );

		return results;
	}

	/**
	 * Returns text representation of a range. The returned text length should be the same as range length.
	 * In order to achieve this, this function will replace inline elements (text-line) as new line character ("\n").
	 *
	 * @param range The model range.
	 * @returns The text content of the provided range.
	 */
	public rangeToText( range: Range ): string {
		return Array.from( range.getItems() ).reduce( ( rangeText, node ) => {
			// Trim text to a last occurrence of an inline element and update range start.
			if ( !( node.is( '$text' ) || node.is( '$textProxy' ) ) ) {
				// Editor has only one inline element defined in schema: `<softBreak>` which is treated as new line character in blocks.
				// Special handling might be needed for other inline elements (inline widgets).
				return `${ rangeText }\n`;
			}

			return rangeText + node.data;
		}, '' );
	}

	/**
	 * Creates a text matching callback for a specified search term and matching options.
	 *
	 * @param searchTerm The search term.
	 * @param options Matching options.
	 * 	- options.matchCase=false If set to `true` letter casing will be ignored.
	 * 	- options.wholeWords=false If set to `true` only whole words that match `callbackOrText` will be matched.
	 */
	public findByTextCallback(
		searchTerm: string,
		options: { matchCase?: boolean; wholeWords?: boolean }
	): ( { item, text }: { item: Item; text: string } ) => Array<ResultType> {
		let flags = 'gu';

		if ( !options.matchCase ) {
			flags += 'i';
		}

		let regExpQuery = `(${ escapeRegExp( searchTerm ) })`;

		if ( options.wholeWords ) {
			const nonLetterGroup = '[^a-zA-Z\u00C0-\u024F\u1E00-\u1EFF]';

			if ( !new RegExp( '^' + nonLetterGroup ).test( searchTerm ) ) {
				regExpQuery = `(^|${ nonLetterGroup }|_)${ regExpQuery }`;
			}

			if ( !new RegExp( nonLetterGroup + '$' ).test( searchTerm ) ) {
				regExpQuery = `${ regExpQuery }(?=_|${ nonLetterGroup }|$)`;
			}
		}

		const regExp = new RegExp( regExpQuery, flags );

		function findCallback( { text }: { text: string } ) {
			const matches = [ ...text.matchAll( regExp ) ];

			return matches.map( regexpMatchToFindResult );
		}

		return findCallback;
	}
}

// Finds the appropriate index in the resultsList Collection.
function findInsertIndex( resultsList: Collection<any>, markerToInsert: Marker ) {
	const result = resultsList.find( ( { marker } ) => {
		return markerToInsert.getStart().isBefore( marker.getStart() );
	} );

	return result ? resultsList.getIndex( result ) : resultsList.length;
}

/**
 *  Maps RegExp match result to find result.
 */
function regexpMatchToFindResult( matchResult: RegExpMatchArray ): ResultType {
	const lastGroupIndex = matchResult.length - 1;

	let startOffset = matchResult.index!;

	// Searches with match all flag have an extra matching group with empty string or white space matched before the word.
	// If the search term starts with the space already, there is no extra group even with match all flag on.
	if ( matchResult.length === 3 ) {
		startOffset += matchResult[ 1 ].length;
	}

	return {
		label: matchResult[ lastGroupIndex ],
		start: startOffset,
		end: startOffset + matchResult[ lastGroupIndex ].length
	};
}

declare module '@ckeditor/ckeditor5-core' {
	interface PluginsMap {
		[ FindAndReplaceUtils.pluginName ]: FindAndReplaceUtils;
	}
}
