/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module basic-styles/superscript/superscriptui
 */

import { Plugin } from 'ckeditor5/src/core';
import { ButtonView } from 'ckeditor5/src/ui';
import type AttributeCommand from '../attributecommand';

import superscriptIcon from '../../theme/icons/superscript.svg';

const SUPERSCRIPT = 'superscript';

/**
 * The superscript UI feature. It introduces the Superscript button.
 */
export default class SuperscriptUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName(): 'SuperscriptUI' {
		return 'SuperscriptUI';
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;
		const t = editor.t;

		// Add superscript button to feature components.
		editor.ui.componentFactory.add( SUPERSCRIPT, locale => {
			const command: AttributeCommand = editor.commands.get( SUPERSCRIPT )!;
			const view = new ButtonView( locale );

			view.set( {
				label: t( 'Superscript' ),
				icon: superscriptIcon,
				tooltip: true,
				isToggleable: true
			} );

			view.bind( 'isOn', 'isEnabled' ).to( command, 'value', 'isEnabled' );

			// Execute command.
			this.listenTo( view, 'execute', () => {
				editor.execute( SUPERSCRIPT );
				editor.editing.view.focus();
			} );

			return view;
		} );
	}
}
