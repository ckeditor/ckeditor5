/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module show-blocks/showblocksui
 */

import { Plugin } from 'ckeditor5/src/core';
import { ButtonView } from 'ckeditor5/src/ui';

import showBlocksIcon from '../theme/icons/show-blocks.svg';
import '../theme/showblocks.css';

/**
 * The UI plugin of the show blocks feature.
 *
 * It registers the `'showBlocks'` UI button in the editor's {@link module:ui/componentfactory~ComponentFactory component factory}
 * that toggles the visibility of the HTML element names of content blocks.
 */
export default class ShowBlocksUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'ShowBlocksUI' as const;
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;

		editor.ui.componentFactory.add( 'showBlocks', locale => {
			const command = editor.commands.get( 'showBlocks' )!;
			const view = new ButtonView( locale );
			const t = locale.t;

			view.set( {
				label: t( 'Show blocks' ),
				icon: showBlocksIcon,
				tooltip: true
			} );

			view.bind( 'isOn' ).to( command, 'value', command, 'isEnabled',
				( value, isEnabled ) => value && isEnabled );
			view.bind( 'isEnabled' ).to( command );

			// Execute the command.
			this.listenTo( view, 'execute', () => {
				editor.execute( 'showBlocks' );
				editor.editing.view.focus();
			} );

			return view;
		} );
	}
}
