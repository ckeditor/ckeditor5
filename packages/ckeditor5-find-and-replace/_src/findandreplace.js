/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module find-and-replace/findandreplace
 */

import { Plugin } from 'ckeditor5/src/core';
import FindAndReplaceUI from './findandreplaceui';
import FindAndReplaceEditing from './findandreplaceediting';

/**
 * The find and replace plugin.
 *
 * For a detailed overview, check the {@glink features/find-and-replace Find and replace feature documentation}.
 *
 * This is a "glue" plugin which loads the following plugins:
 *
 * * The {@link module:find-and-replace/findandreplaceediting~FindAndReplaceEditing find and replace editing feature},
 * * The {@link module:find-and-replace/findandreplaceui~FindAndReplaceUI find and replace UI feature}
 *
 * @extends module:core/plugin~Plugin
 */
export default class FindAndReplace extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ FindAndReplaceEditing, FindAndReplaceUI ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'FindAndReplace';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const ui = this.editor.plugins.get( 'FindAndReplaceUI' );
		const findAndReplaceEditing = this.editor.plugins.get( 'FindAndReplaceEditing' );
		const state = findAndReplaceEditing.state;

		ui.on( 'findNext', ( event, data ) => {
			// Data is contained only for the "find" button.
			if ( data ) {
				state.searchText = data.searchText;
				this.editor.execute( 'find', data.searchText, data );
			} else {
				// Find next arrow button press.
				this.editor.execute( 'findNext' );
			}
		} );

		ui.on( 'findPrevious', ( event, data ) => {
			if ( data && state.searchText !== data.searchText ) {
				this.editor.execute( 'find', data.searchText );
			} else {
				// Subsequent calls.
				this.editor.execute( 'findPrevious' );
			}
		} );

		ui.on( 'replace', ( event, data ) => {
			if ( state.searchText !== data.searchText ) {
				this.editor.execute( 'find', data.searchText );
			}

			const highlightedResult = state.highlightedResult;

			if ( highlightedResult ) {
				this.editor.execute( 'replace', data.replaceText, highlightedResult );
			}
		} );

		ui.on( 'replaceAll', ( event, data ) => {
			// The state hadn't been yet built for this search text.
			if ( state.searchText !== data.searchText ) {
				this.editor.execute( 'find', data.searchText );
			}

			this.editor.execute( 'replaceAll', data.replaceText, state.results );
		} );

		// Reset the state when the user invalidated last search results, for instance,
		// by starting typing another search query or changing options.
		ui.on( 'searchReseted', () => {
			state.clear( this.editor.model );
			findAndReplaceEditing.stop();
		} );
	}
}
