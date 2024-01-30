/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module basic-styles/underline/underlineui
 */

import { Plugin } from 'ckeditor5/src/core.js';
import { ButtonView, MenuBarMenuItemButtonView } from 'ckeditor5/src/ui.js';
import type AttributeCommand from '../attributecommand.js';

import underlineIcon from '../../theme/icons/underline.svg';

const UNDERLINE = 'underline';

/**
 * The underline UI feature. It introduces the Underline button.
 */
export default class UnderlineUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'UnderlineUI' as const;
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;
		const command: AttributeCommand = editor.commands.get( UNDERLINE )!;

		// Add bold button to feature components.
		editor.ui.componentFactory.add( UNDERLINE, () => {
			const buttonView = this._createButton( ButtonView );

			buttonView.set( {
				tooltip: true
			} );

			buttonView.bind( 'isOn' ).to( command, 'value' );

			return buttonView;
		} );

		editor.ui.componentFactory.add( 'menuBar:' + UNDERLINE, () => {
			return this._createButton( MenuBarMenuItemButtonView );
		} );
	}

	/**
	 * TODO
	 */
	private _createButton<T extends typeof ButtonView | typeof MenuBarMenuItemButtonView>( ButtonClass: T ): InstanceType<T> {
		const editor = this.editor;
		const locale = editor.locale;
		const command: AttributeCommand = editor.commands.get( UNDERLINE )!;
		const view = new ButtonClass( editor.locale ) as InstanceType<T>;
		const t = locale.t;

		view.set( {
			label: t( 'Underline' ),
			icon: underlineIcon,
			keystroke: 'CTRL+U',
			isToggleable: true
		} );

		view.bind( 'isEnabled' ).to( command, 'isEnabled' );

		// Execute the command.
		this.listenTo( view, 'execute', () => {
			editor.execute( UNDERLINE );
			editor.editing.view.focus();
		} );

		return view;
	}
}
