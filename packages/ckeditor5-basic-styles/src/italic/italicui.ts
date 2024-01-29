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
		const command: AttributeCommand = editor.commands.get( ITALIC )!;

		// Add bold button to feature components.
		editor.ui.componentFactory.add( ITALIC, () => {
			const buttonView = this._createGenericButton();

			buttonView.set( {
				tooltip: true
			} );

			buttonView.bind( 'isOn' ).to( command, 'value' );

			return buttonView;
		} );

		editor.ui.componentFactory.add( 'menuBar:' + ITALIC, () => {
			const buttonView = this._createGenericButton();

			buttonView.set( {
				withText: true,
				withKeystroke: true,
				tooltip: false
			} );

			return buttonView;
		} );
	}

	/**
	 * TODO
	 */
	private _createGenericButton() {
		const editor = this.editor;
		const locale = editor.locale;
		const command: AttributeCommand = editor.commands.get( ITALIC )!;
		const view = new ButtonView( locale );
		const t = locale.t;

		view.set( {
			label: t( 'Italic' ),
			icon: italicIcon,
			keystroke: 'CTRL+I',
			tooltip: true,
			isToggleable: true
		} );

		view.bind( 'isEnabled' ).to( command, 'isEnabled' );

		// Execute the command.
		this.listenTo( view, 'execute', () => {
			editor.execute( ITALIC );
			editor.editing.view.focus();
		} );

		return view;
	}
}
