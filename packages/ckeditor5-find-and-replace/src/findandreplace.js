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
			// Data is contained only for the "find" button.
			if ( data ) {
				findAndReplaceEditing.state.searchText = data.searchText;
				this.editor.execute( 'find', data.searchText, data );
			} else {
				// Arrow button press.
				this.editor.execute( 'findNext' );
			}
		} );

		/**
		 * Delegate find previous request
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
			// We need to wait for the UI to be ready to have the toolbar dropdown available.
			// Otherwise the findAndReplace component is registered but not yet constructed.
			this.listenTo( this.editor.ui, 'ready', () => {
				const formView = ui.formView;
				// If the editor doesn't contain the findAndReplace button then there's no ui#formView property.
				if ( formView ) {
					const commands = this.editor.commands;

					formView.findNextButtonView.bind( 'isEnabled' ).to( commands.get( 'findNext' ), 'isEnabled' );
					formView.findPrevButtonView.bind( 'isEnabled' ).to( commands.get( 'findPrevious' ), 'isEnabled' );

					formView.replaceButtonView.unbind( 'isEnabled' );
					formView.replaceButtonView.bind( 'isEnabled' ).to(
						commands.get( 'replace' ), 'isEnabled', formView, 'isSearching', ( commandEnabled, isSearching ) => {
							return commandEnabled && isSearching;
						} );

					formView.replaceAllButtonView.unbind( 'isEnabled' );
					formView.replaceAllButtonView.bind( 'isEnabled' ).to(
						commands.get( 'replaceAll' ), 'isEnabled', formView, 'isSearching', ( commandEnabled, isSearching ) => {
							return commandEnabled && isSearching;
						} );
				}
			} );
		}

		ui._setState( findAndReplaceEditing.state );
	}
}
