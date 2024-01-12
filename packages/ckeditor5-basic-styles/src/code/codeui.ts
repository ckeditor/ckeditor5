/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module basic-styles/code/codeui
 */

import { Plugin } from 'ckeditor5/src/core.js';
import { ButtonView } from 'ckeditor5/src/ui.js';

import type AttributeCommand from '../attributecommand.js';

import codeIcon from '../../theme/icons/code.svg';

import '../../theme/code.css';

const CODE = 'code';

/**
 * The code UI feature. It introduces the Code button.
 */
export default class CodeUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'CodeUI' as const;
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;
		const t = editor.t;

		// Add code button to feature components.
		editor.ui.componentFactory.add( CODE, locale => {
			const command: AttributeCommand = editor.commands.get( CODE )!;
			const view = new ButtonView( locale );

			view.set( {
				label: t( 'Code' ),
				icon: codeIcon,
				tooltip: true,
				isToggleable: true
			} );

			view.bind( 'isOn', 'isEnabled' ).to( command, 'value', 'isEnabled' );

			// Execute command.
			this.listenTo( view, 'execute', () => {
				editor.execute( CODE );
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
				label: t( 'Move out of an inline code style' ),
				keystroke: [
					[ 'arrowleft', 'arrowleft' ],
					[ 'arrowright', 'arrowright' ]
				]
			} );
		}
	}
}
