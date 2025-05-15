/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module find-and-replace/findandreplacestate
 */

import type { Model, Item } from 'ckeditor5/src/engine.js';
import { ObservableMixin, Collection, type CollectionChangeEvent, type ObservableChangeEvent } from 'ckeditor5/src/utils.js';
import type { ResultType } from './findandreplace.js';

/**
 * The object storing find and replace plugin state for a given editor instance.
 */
export default class FindAndReplaceState extends /* #__PURE__ */ ObservableMixin() {
	/**
	 * A collection of find matches.
	 *
	 * @observable
	 */
	declare public results: Collection<ResultType>;

	/**
	 * Currently highlighted search result in {@link #results matched results}.
	 *
	 * @readonly
	 * @observable
	 */
	declare public highlightedResult: ResultType | null;

	/**
	 * Currently highlighted search result offset in {@link #results matched results}.
	 *
	 * @readonly
	 * @observable
	 */
	declare public highlightedOffset: number;

	/**
	 * Searched text value.
	 *
	 * @readonly
	 * @observable
	 */
	declare public searchText: string;

	/**
	 *  The most recent search callback used by the feature to find matches.
	 *  It is used to re-run the search when user modifies the editor content.
	 *
	 * @readonly
	 * @observable
	 */
	declare public lastSearchCallback: FindCallback | null;

	/**
	 * Replace text value.
	 *
	 * @readonly
	 * @observable
	 */
	declare public replaceText: string;

	/**
	 * Indicates whether the matchCase checkbox has been checked.
	 *
	 * @readonly
	 * @observable
	 */
	declare public matchCase: boolean;

	/**
	 * Indicates whether the matchWholeWords checkbox has been checked.
	 *
	 * @readonly
	 * @observable
	 */
	declare public matchWholeWords: boolean;

	/**
	 * Creates an instance of the state.
	 */
	public constructor( model: Model ) {
		super();

		this.set( 'results', new Collection() );
		this.set( 'highlightedResult', null );
		this.set( 'highlightedOffset', 0 );
		this.set( 'searchText', '' );
		this.set( 'replaceText', '' );
		this.set( 'lastSearchCallback', null );
		this.set( 'matchCase', false );
		this.set( 'matchWholeWords', false );

		this.results.on<CollectionChangeEvent<ResultType>>( 'change', ( eventInfo, { removed, index } ) => {
			if ( Array.from( removed ).length ) {
				let highlightedResultRemoved = false;

				model.change( writer => {
					for ( const removedResult of removed ) {
						if ( this.highlightedResult === removedResult ) {
							highlightedResultRemoved = true;
						}

						if ( model.markers.has( removedResult.marker!.name ) ) {
							writer.removeMarker( removedResult.marker! );
						}
					}
				} );

				if ( highlightedResultRemoved ) {
					const nextHighlightedIndex = index >= this.results.length ? 0 : index;
					this.highlightedResult = this.results.get( nextHighlightedIndex );
				}
			}
		} );

		this.on<ObservableChangeEvent<ResultType | null>>( 'change:highlightedResult', ( ) => {
			this.refreshHighlightOffset( model );
		} );
	}

	/**
	 * Cleans the state up and removes markers from the model.
	 */
	public clear( model: Model ): void {
		this.searchText = '';

		model.change( writer => {
			if ( this.highlightedResult ) {
				const oldMatchId = this.highlightedResult.marker!.name.split( ':' )[ 1 ];
				const oldMarker = model.markers.get( `findResultHighlighted:${ oldMatchId }` );

				if ( oldMarker ) {
					writer.removeMarker( oldMarker );
				}
			}

			[ ...this.results ].forEach( ( { marker } ) => {
				writer.removeMarker( marker! );
			} );
		} );

		this.results.clear();
	}

	/**
	 * Refreshes the highlight result offset based on it's index within the result list.
	 */
	public refreshHighlightOffset( model: Model ): void {
		const { highlightedResult, results } = this;

		if ( highlightedResult ) {
			this.highlightedOffset = sortSearchResultsByMarkerPositions( model, [ ...results ] ).indexOf( highlightedResult ) + 1;
		} else {
			this.highlightedOffset = 0;
		}
	}
}

/**
 * Sorts search results by marker positions. Make sure that the results are sorted in the same order as they appear in the document
 * to avoid issues with the `find next` command. Apparently, the order of the results in the state might be different than the order
 * of the markers in the model.
 */
export function sortSearchResultsByMarkerPositions( model: Model, results: Array<ResultType> ): Array<ResultType> {
	const sortMapping = { before: -1, same: 0, after: 1, different: 1 };

	// `compareWith` doesn't play well with multi-root documents, so we need to sort results by root name first
	// and then sort them within each root. It prevents "random" order of results when the document has multiple roots.
	// See more: https://github.com/ckeditor/ckeditor5/pull/17292#issuecomment-2442084549
	return model.document.getRootNames().flatMap( rootName =>
		results
			.filter( result => result.marker!.getStart().root.rootName === rootName )
			.sort( ( a, b ) => sortMapping[ a.marker!.getStart().compareWith( b.marker!.getStart() ) ] )
	);
}

/**
 * The callback function used to find matches in the document.
 */
export type FindCallback = ( { item, text }: { item: Item; text: string } ) => FindCallbackResultObject | FindCallbackResult;

/**
 * Represents the result of a find callback.
 *
 * The `searchText` attribute in the result object is used to determine if the search text has changed.
 * If returned `searchText` is different than the last search text, the search results will be invalidated
 * while searching for next item and the search will start from the beginning of the document.
 */
export type FindCallbackResultObject = {
	results: Array<ResultType>;
	searchText: string;
};

/**
 * Represents the result of a find callback.
 *
 * @deprecated Use `FindCallbackResultObject` instead.
 */
export type FindCallbackResult = Array<ResultType>;
