/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module basic-styles/code/codeui
 */

import { Plugin } from 'ckeditor5/src/core.js';
import { ButtonView, MenuBarMenuListItemButtonView } from 'ckeditor5/src/ui.js';

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

		// Add code button to feature components.
		editor.ui.componentFactory.add( CODE, () => {
			const buttonView = this._createButton( ButtonView );
			const command = editor.commands.get( CODE )!;

			// Bind button model to command.
			buttonView.bind( 'isOn' ).to( command, 'value' );

			return buttonView;
		} );

		editor.ui.componentFactory.add( 'menuBar:' + CODE, () => {
			return this._createButton( MenuBarMenuListItemButtonView );
		} );
	}

	/**
	 * Creates a button for code command to use either in toolbar or in menu bar.
	 */
	private _createButton<T extends typeof ButtonView | typeof MenuBarMenuListItemButtonView>( ButtonClass: T ): InstanceType<T> {
		const editor = this.editor;
		const locale = editor.locale;
		const command = editor.commands.get( CODE )!;
		const view = new ButtonClass( editor.locale ) as InstanceType<T>;
		const t = locale.t;

		view.set( {
			label: t( 'Code' ),
			icon: codeIcon,
			tooltip: true,
			isToggleable: true
		} );

		view.bind( 'isEnabled' ).to( command, 'isEnabled' );

		// Execute the command.
		this.listenTo( view, 'execute', () => {
			editor.execute( CODE );
			editor.editing.view.focus();
		} );

		return view;
	}
}
