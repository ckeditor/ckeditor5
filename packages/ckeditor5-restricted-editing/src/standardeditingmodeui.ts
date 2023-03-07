/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module restricted-editing/standardeditingmodeui
 */

import { Plugin } from 'ckeditor5/src/core';
import { ButtonView } from 'ckeditor5/src/ui';

import unlockIcon from '../theme/icons/contentunlock.svg';
import type RestrictedEditingExceptionCommand from './restrictededitingexceptioncommand';

/**
 * The standard editing mode UI feature.
 *
 * It introduces the `'restrictedEditingException'` button that marks text as unrestricted for editing.
 */
export default class StandardEditingModeUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName(): 'StandardEditingModeUI' {
		return 'StandardEditingModeUI';
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;
		const t = editor.t;

		editor.ui.componentFactory.add( 'restrictedEditingException', locale => {
			const command: RestrictedEditingExceptionCommand = editor.commands.get( 'restrictedEditingException' )!;
			const view = new ButtonView( locale );

			view.set( {
				icon: unlockIcon,
				tooltip: true,
				isToggleable: true
			} );

			view.bind( 'isOn', 'isEnabled' ).to( command, 'value', 'isEnabled' );
			view.bind( 'label' ).to( command, 'value', value => {
				return value ? t( 'Disable editing' ) : t( 'Enable editing' );
			} );

			this.listenTo( view, 'execute', () => {
				editor.execute( 'restrictedEditingException' );
				editor.editing.view.focus();
			} );

			return view;
		} );
	}
}
