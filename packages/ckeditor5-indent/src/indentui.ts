/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module indent/indentui
 */

import { ButtonView } from 'ckeditor5/src/ui';
import { Plugin } from 'ckeditor5/src/core';

import indentIcon from '../theme/icons/indent.svg';
import outdentIcon from '../theme/icons/outdent.svg';

/**
 * The indent UI feature.
 *
 * This plugin registers the `'indent'` and `'outdent'` buttons.
 *
 * **Note**: In order for the commands to work, at least one of the compatible features is required. Read more in
 * the {@link module:indent/indent~Indent indent feature} API documentation.
 */
export default class IndentUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName(): 'IndentUI' {
		return 'IndentUI';
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;
		const locale = editor.locale;
		const t = editor.t;

		const localizedIndentIcon = locale.uiLanguageDirection == 'ltr' ? indentIcon : outdentIcon;
		const localizedOutdentIcon = locale.uiLanguageDirection == 'ltr' ? outdentIcon : indentIcon;

		this._defineButton( 'indent', t( 'Increase indent' ), localizedIndentIcon );
		this._defineButton( 'outdent', t( 'Decrease indent' ), localizedOutdentIcon );
	}

	/**
	 * Defines a UI button.
	 */
	private _defineButton( commandName: 'indent' | 'outdent', label: string, icon: string ): void {
		const editor = this.editor;

		editor.ui.componentFactory.add( commandName, locale => {
			const command = editor.commands.get( commandName )!;
			const view = new ButtonView( locale );

			view.set( {
				label,
				icon,
				tooltip: true
			} );

			view.bind( 'isEnabled' ).to( command, 'isEnabled' );

			this.listenTo( view, 'execute', () => {
				editor.execute( commandName );
				editor.editing.view.focus();
			} );

			return view;
		} );
	}
}
