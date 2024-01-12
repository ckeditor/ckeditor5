/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module basic-styles/bold/boldui
 */

import { Plugin, icons } from 'ckeditor5/src/core.js';
import { ButtonView } from 'ckeditor5/src/ui.js';
import type AttributeCommand from '../attributecommand.js';

const BOLD = 'bold';

/**
 * The bold UI feature. It introduces the Bold button.
 */
export default class BoldUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'BoldUI' as const;
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;
		const t = editor.t;

		// Add bold button to feature components.
		editor.ui.componentFactory.add( BOLD, locale => {
			const command: AttributeCommand = editor.commands.get( BOLD )!;
			const view = new ButtonView( locale );

			view.set( {
				label: t( 'Bold' ),
				icon: icons.bold,
				keystroke: 'CTRL+B',
				tooltip: true,
				isToggleable: true
			} );

			view.bind( 'isOn', 'isEnabled' ).to( command, 'value', 'isEnabled' );

			// Execute command.
			this.listenTo( view, 'execute', () => {
				editor.execute( BOLD );
				editor.editing.view.focus();
			} );

			return view;
		} );
	}

	/**
	 * @inheritDoc
	 */
	public afterInit(): void {
		const editor = this.editor;

		if ( editor.plugins.has( 'AccessibilityHelp' ) ) {
			const t = editor.t;

			editor.plugins.get( 'AccessibilityHelp' ).registerKeystrokes( {
				label: t( 'Bold' ),
				keystroke: 'CTRL+B'
			} );
		}
	}
}
