/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module find-and-replace/findandreplacestate
 */

import type { Model } from 'ckeditor5/src/engine';
import { ObservableMixin, Collection, type CollectionChangeEvent } from 'ckeditor5/src/utils';
import type { ResultType } from './findandreplace';

/**
 * The object storing find and replace plugin state for a given editor instance.
 */
export default class FindAndReplaceState extends ObservableMixin() {
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
	 * Searched text value.
	 *
	 * @readonly
	 * @observable
	 */
	declare public searchText: string;

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
		this.set( 'searchText', '' );
		this.set( 'replaceText', '' );
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
}

