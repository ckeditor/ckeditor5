/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module find-and-replace/findandreplacestate
 */

import { ObservableMixin, mix, Collection } from 'ckeditor5/src/utils';

/**
 * The object storing find and replace plugin state for a given editor instance.
 *
 * @mixes module:utils/observablemixin~ObservableMixin
 */
export default class FindAndReplaceState {
	/**
	 * Creates an instance of the state.
	 *
	 * @param {module:engine/model/model~Model} model
	 */
	constructor( model ) {
		/**
		 * A collection of find matches.
		 *
		 * @protected
		 * @observable
		 * @member {module:utils/collection~Collection} #results
		 */
		this.set( 'results', new Collection() );

		/**
		 * Currently highlighted search result in {@link #results matched results}.
		 *
		 * @readonly
		 * @observable
		 * @member {Object|null} #highlightedResult
		 */
		this.set( 'highlightedResult', null );

		/**
		 * Searched text value.
		 *
		 * @readonly
		 * @observable
		 * @member {String} #searchText
		 */
		this.set( 'searchText', '' );

		/**
		 * Replace text value.
		 *
		 * @readonly
		 * @observable
		 * @member {String} #replaceText
		 */
		this.set( 'replaceText', '' );

		/**
		 * Indicates whether the matchCase checkbox has been checked.
		 *
		 * @readonly
		 * @observable
		 * @member {Boolean} #matchCase
		 */
		this.set( 'matchCase', false );

		/**
		 * Indicates whether the matchWholeWords checkbox has been checked.
		 *
		 * @readonly
		 * @observable
		 * @member {Boolean} #matchWholeWords
		 */
		this.set( 'matchWholeWords', false );

		this.results.on( 'change', ( eventInfo, { removed, index } ) => {
			removed = Array.from( removed );

			if ( removed.length ) {
				let highlightedResultRemoved = false;

				model.change( writer => {
					for ( const removedResult of removed ) {
						if ( this.highlightedResult === removedResult ) {
							highlightedResultRemoved = true;
						}

						if ( model.markers.has( removedResult.marker.name ) ) {
							writer.removeMarker( removedResult.marker );
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
	 *
	 * @param {module:engine/model/model~Model} model
	 */
	clear( model ) {
		this.searchText = '';

		model.change( writer => {
			if ( this.highlightedResult ) {
				const oldMatchId = this.highlightedResult.marker.name.split( ':' )[ 1 ];
				const oldMarker = model.markers.get( `findResultHighlighted:${ oldMatchId }` );

				if ( oldMarker ) {
					writer.removeMarker( oldMarker );
				}
			}

			[ ...this.results ].forEach( ( { marker } ) => {
				writer.removeMarker( marker );
			} );
		} );

		this.results.clear();
	}
}

mix( FindAndReplaceState, ObservableMixin );
