/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module horizontal-line/horizontallineui
 */

import { icons, Plugin } from 'ckeditor5/src/core.js';
import { ButtonView } from 'ckeditor5/src/ui.js';

import type HorizontalLineCommand from './horizontallinecommand.js';

/**
 * The horizontal line UI plugin.
 */
export default class HorizontalLineUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'HorizontalLineUI' as const;
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;
		const t = editor.t;

		// Add the `horizontalLine` button to feature components.
		editor.ui.componentFactory.add( 'horizontalLine', locale => {
			const command: HorizontalLineCommand = editor.commands.get( 'horizontalLine' )!;
			const view = new ButtonView( locale );

			view.set( {
				label: t( 'Horizontal line' ),
				icon: icons.horizontalLine,
				tooltip: true
			} );

			view.bind( 'isEnabled' ).to( command, 'isEnabled' );

			// Execute the command.
			this.listenTo( view, 'execute', () => {
				editor.execute( 'horizontalLine' );
				editor.editing.view.focus();
			} );

			return view;
		} );
	}
}
