/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module basic-styles/code/codeui
 */

import { Plugin } from 'ckeditor5/src/core';
import { ButtonView } from 'ckeditor5/src/ui';

import type AttributeCommand from '../attributecommand';

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
	public static get pluginName(): 'CodeUI' {
		return 'CodeUI';
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
}
