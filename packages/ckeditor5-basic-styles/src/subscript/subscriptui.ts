/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module basic-styles/subscript/subscriptui
 */

import { Plugin } from 'ckeditor5/src/core';
import { ButtonView } from 'ckeditor5/src/ui';
import type AttributeCommand from '../attributecommand';

import subscriptIcon from '../../theme/icons/subscript.svg';

const SUBSCRIPT = 'subscript';

/**
 * The subscript UI feature. It introduces the Subscript button.
 */
export default class SubscriptUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName(): 'SubscriptUI' {
		return 'SubscriptUI';
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;
		const t = editor.t;

		// Add subscript button to feature components.
		editor.ui.componentFactory.add( SUBSCRIPT, locale => {
			const command: AttributeCommand = editor.commands.get( SUBSCRIPT )!;
			const view = new ButtonView( locale );

			view.set( {
				label: t( 'Subscript' ),
				icon: subscriptIcon,
				tooltip: true,
				isToggleable: true
			} );

			view.bind( 'isOn', 'isEnabled' ).to( command, 'value', 'isEnabled' );

			// Execute command.
			this.listenTo( view, 'execute', () => {
				editor.execute( SUBSCRIPT );
				editor.editing.view.focus();
			} );

			return view;
		} );
	}
}
