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
 * * The {@link module:find-and-replace/findandreplaceui~FindAndReplaceUI find and replace UI feature} and
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
		 * findNext button logic
		 */
		ui.on( 'findNext', ( event, data ) => {
			if ( data.searchText.length !== 0 ) {
				findAndReplaceEditing.stop();
			}

			findAndReplaceEditing.find( data.searchText );
		} );

		/**
		 * FindPrev button logic
		 */
		ui.on( 'findPrev', ( event, data ) => {
			if ( data.searchText.length !== 0 ) {
				findAndReplaceEditing.stop();
			}
			findAndReplaceEditing.find( data.searchText );
		} );

		/**
		 * Replace button logic
		 */
		ui.on( 'replace', ( event, data ) => {
			// TODO: the { marker } needs to be passed down to the .replace()
			findAndReplaceEditing.replace( data.marker, data.replaceText );
		} );

		/**
		 * Replace all button logic
		 */
		ui.on( 'replaceAll', ( event, data ) => {
			findAndReplaceEditing.replaceAll( data.replaceText );
		} );
	}
}
