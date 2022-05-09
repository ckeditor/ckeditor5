/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module
 */

import { Plugin } from 'ckeditor5/src/core';

/**
 *
 */
export default class TableColumnResizeTrackChanges extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'TableColumnResizeTrackChanges';
	}

	/**
	 * @inheritDoc
	 */
	afterInit() {
		const editor = this.editor;

		if ( !editor.plugins.has( 'TableColumnResizeEditing' ) ) {
			return;
		}

		const plugin = editor.plugins.get( 'TrackChangesEditing' );

		plugin.enableCommand( 'columnResizeTableWidth', ( executeCommand, options = {} ) => {
			const selection = editor.model.document.selection;

			const table = selection.getFirstPosition().findAncestor( 'table' );

			editor.model.change( () => {
				executeCommand( options );

				plugin.markBlockFormat( table, {
					commandName: 'columnResizeTableWidth',
					commandParams: [ options ]
				} );
			} );
		} );

		plugin._descriptionFactory.registerDescriptionCallback( suggestion => {
			const { data } = suggestion;

			if ( !data ) {
				return;
			}

			if ( data.commandName == 'columnResizeTableWidth' ) {
				const newTableWidth = data.commandParams[ 0 ].value;

				if ( newTableWidth ) {
					return {
						type: 'format',
						content: `*Width changed* to ${ newTableWidth }`
					};
				} else {
					return {
						type: 'format',
						content: '*Remove table width*'
					};
				}
			}
		} );
	}
}
