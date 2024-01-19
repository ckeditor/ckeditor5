/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module basic-styles/italic/italicui
 */

import { Plugin } from 'ckeditor5/src/core.js';
import { ButtonView } from 'ckeditor5/src/ui.js';
import type AttributeCommand from '../attributecommand.js';

import italicIcon from '../../theme/icons/italic.svg';

const ITALIC = 'italic';

/**
 * The italic UI feature. It introduces the Italic button.
 */
export default class ItalicUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'ItalicUI' as const;
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;
		const t = editor.t;

		// Add bold button to feature components.
		editor.ui.componentFactory.add( ITALIC, locale => {
			const command: AttributeCommand = editor.commands.get( ITALIC )!;
			const view = new ButtonView( locale );

			view.set( {
				label: t( 'Italic' ),
				icon: italicIcon,
				keystroke: 'CTRL+I',
				tooltip: true,
				isToggleable: true
			} );

			view.bind( 'isOn', 'isEnabled' ).to( command, 'value', 'isEnabled' );

			// Execute command.
			this.listenTo( view, 'execute', () => {
				editor.execute( ITALIC );
				editor.editing.view.focus();
			} );

			return view;
		} );
	}
}
