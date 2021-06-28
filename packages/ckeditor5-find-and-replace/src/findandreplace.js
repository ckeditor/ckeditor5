/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
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

	init() {
		const ui = this.editor.plugins.get( 'FindAndReplaceUI' );
		const findAndReplaceEditing = this.editor.plugins.get( 'FindAndReplaceEditing' );

		/**
		 * Delegate find next request.
		 */
		ui.on( 'findNext', ( event, data ) => {
			if ( data && findAndReplaceEditing.state.searchText !== data.searchText ) {
				findAndReplaceEditing.state.searchText = data.searchText;
				this.editor.execute( 'find', data.searchText, data );
			} else {
				// Subsequent calls.
				this.editor.execute( 'findNext' );
			}
		} );

		/**
		 * Delegate find previous request.i
		 */
		ui.on( 'findPrevious', ( event, data ) => {
			if ( data && findAndReplaceEditing.state.searchText !== data.searchText ) {
				this.editor.execute( 'find', data.searchText );
			} else {
				// Subsequent calls.
				this.editor.execute( 'findPrevious' );
			}
		} );

		/**
		 * Delegate replace action.
		 */
		ui.on( 'replace', ( event, data ) => {
			if ( findAndReplaceEditing.state.searchText !== data.searchText ) {
				this.editor.execute( 'find', data.searchText );
			}

			const highlightedResult = findAndReplaceEditing.state.highlightedResult;

			if ( highlightedResult ) {
				this.editor.execute( 'replace', data.replaceText, highlightedResult );
			}
		} );

		/**
		 * Delegate replace all action.
		 */
		ui.on( 'replaceAll', ( event, data ) => {
			// The state hadn't been yet built for this search text.
			if ( findAndReplaceEditing.state.searchText !== data.searchText ) {
				this.editor.execute( 'find', data.searchText );
			}

			this.editor.execute( 'replaceAll', data.replaceText, findAndReplaceEditing.state.results );
		} );

		ui.on( 'dropdown:closed', () => {
			findAndReplaceEditing.state.clear( this.editor.model );
			findAndReplaceEditing.stop();
		} );

		if ( this.editor.ui ) {
			// We need to wait for UI ready to have the toolbar dropdown available. Otherwise findAndReplace component
			// is registered but not yet constructed.
			this.listenTo( this.editor.ui, 'ready', () => {
				// If editor doesn't contain findAndReplace button then there's no ui#formView property.
				if ( ui.formView ) {
					ui.formView.findNextButtonView.bind( 'isEnabled' ).to( this.editor.commands.get( 'findNext' ), 'isEnabled' );
					ui.formView.findPrevButtonView.bind( 'isEnabled' ).to( this.editor.commands.get( 'findPrevious' ), 'isEnabled' );
				}
			} );
		}

		ui._setState( findAndReplaceEditing.state );
	}
}
