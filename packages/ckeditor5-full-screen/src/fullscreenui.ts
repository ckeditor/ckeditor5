/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module full-screen/fullscreenui
 */

import { Plugin } from 'ckeditor5/src/core.js';
import { ButtonView } from 'ckeditor5/src/ui.js';

import fullScreenIcon from '../theme/icons/fullscreen.svg';
import '../theme/fullscreen.css';

const COMMAND_NAME = 'fullScreen';

export default class FullScreenUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'FullScreenUI' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static override get isOfficialPlugin(): true {
		return true;
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;
		const t = editor.t;
		const fullScreenCommand = editor.commands.get( COMMAND_NAME )!;

		editor.ui.componentFactory.add( COMMAND_NAME, locale => {
			const view = new ButtonView( locale );

			view.set( {
				label: t( 'Full screen' ),
				icon: fullScreenIcon,
				tooltip: true,
				isToggleable: true
			} );

			view.bind( 'isEnabled' ).to( fullScreenCommand, 'isEnabled' );
			view.bind( 'isOn' ).to( fullScreenCommand, 'value' );

			this.listenTo( view, 'execute', () => {
				editor.execute( COMMAND_NAME );
				editor.editing.view.focus();
			} );

			return view;
		} );
	}
}
