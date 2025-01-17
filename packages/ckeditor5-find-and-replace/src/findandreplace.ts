/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module find-and-replace/findandreplace
 */

import { Plugin } from 'ckeditor5/src/core.js';
import FindAndReplaceUI, { type SearchResetedEvent } from './findandreplaceui.js';
import FindAndReplaceEditing from './findandreplaceediting.js';
import type { Marker } from 'ckeditor5/src/engine.js';
import type { FindNextEvent, FindPreviousEvent, ReplaceAllEvent, ReplaceEvent } from './ui/findandreplaceformview.js';

export type ResultType = {
	id?: string;
	label?: string;
	start?: number;
	end?: number;
	marker?: Marker;
};

/**
 * The find and replace plugin.
 *
 * For a detailed overview, check the {@glink features/find-and-replace Find and replace feature documentation}.
 *
 * This is a "glue" plugin which loads the following plugins:
 *
 * * The {@link module:find-and-replace/findandreplaceediting~FindAndReplaceEditing find and replace editing feature},
 * * The {@link module:find-and-replace/findandreplaceui~FindAndReplaceUI find and replace UI feature}
 */
export default class FindAndReplace extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ FindAndReplaceEditing, FindAndReplaceUI ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'FindAndReplace' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static override get isOfficialPlugin(): true {
		return true;
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const ui = this.editor.plugins.get( 'FindAndReplaceUI' );
		const findAndReplaceEditing = this.editor.plugins.get( 'FindAndReplaceEditing' );
		const state = findAndReplaceEditing.state!;

		ui.on<FindNextEvent>( 'findNext', ( event, data ) => {
			// Data is contained only for the "find" button.
			if ( data ) {
				state.searchText = data.searchText;
				findAndReplaceEditing.find( data.searchText, data );
			} else {
				// Find next arrow button press.
				this.editor.execute( 'findNext' );
			}
		} );

		ui.on<FindPreviousEvent>( 'findPrevious', ( event, data ) => {
			if ( data && state.searchText !== data.searchText ) {
				findAndReplaceEditing.find( data.searchText );
			} else {
				// Subsequent calls.
				this.editor.execute( 'findPrevious' );
			}
		} );

		ui.on<ReplaceEvent>( 'replace', ( event, data ) => {
			if ( state.searchText !== data.searchText ) {
				findAndReplaceEditing.find( data.searchText );
			}

			const highlightedResult = state.highlightedResult;

			if ( highlightedResult ) {
				this.editor.execute( 'replace', data.replaceText, highlightedResult );
			}
		} );

		ui.on<ReplaceAllEvent>( 'replaceAll', ( event, data ) => {
			// The state hadn't been yet built for this search text.
			if ( state.searchText !== data.searchText ) {
				findAndReplaceEditing.find( data.searchText );
			}

			this.editor.execute( 'replaceAll', data.replaceText, state.results );
		} );

		// Reset the state when the user invalidated last search results, for instance,
		// by starting typing another search query or changing options.
		ui.on<SearchResetedEvent>( 'searchReseted', () => {
			state.clear( this.editor.model );
			findAndReplaceEditing.stop();
		} );
	}
}
