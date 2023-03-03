/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module select-all/selectallui
 */

import { Plugin } from '@ckeditor/ckeditor5-core';
import { ButtonView } from '@ckeditor/ckeditor5-ui';

import selectAllIcon from '../theme/icons/select-all.svg';

/**
 * The select all UI feature.
 *
 * It registers the `'selectAll'` UI button in the editor's
 * {@link module:ui/componentfactory~ComponentFactory component factory}. When clicked, the button
 * executes the {@link module:select-all/selectallcommand~SelectAllCommand select all command}.
 */
export default class SelectAllUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName(): 'SelectAllUI' {
		return 'SelectAllUI';
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;

		editor.ui.componentFactory.add( 'selectAll', locale => {
			const command = editor.commands.get( 'selectAll' )!;
			const view = new ButtonView( locale );
			const t = locale.t;

			view.set( {
				label: t( 'Select all' ),
				icon: selectAllIcon,
				keystroke: 'Ctrl+A',
				tooltip: true
			} );

			view.bind( 'isEnabled' ).to( command, 'isEnabled' );

			// Execute the command.
			this.listenTo( view, 'execute', () => {
				editor.execute( 'selectAll' );
				editor.editing.view.focus();
			} );

			return view;
		} );
	}
}
