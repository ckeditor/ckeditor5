/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module fullscreen/fullscreenui
 */

import { Plugin } from 'ckeditor5/src/core.js';
import { ButtonView } from 'ckeditor5/src/ui.js';

import fullscreenIcon from '../theme/icons/fullscreen.svg';
import '../theme/fullscreen.css';

const COMMAND_NAME = 'fullscreen';

export default class FullscreenUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'FullscreenUI' as const;
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
		const fullscreenCommand = editor.commands.get( COMMAND_NAME )!;

		editor.ui.componentFactory.add( COMMAND_NAME, locale => {
			const view = new ButtonView( locale );

			view.set( {
				label: t( 'Fullscreen' ),
				icon: fullscreenIcon,
				tooltip: true,
				isToggleable: true
			} );

			view.bind( 'isEnabled' ).to( fullscreenCommand, 'isEnabled' );
			view.bind( 'isOn' ).to( fullscreenCommand, 'value' );

			this.listenTo( view, 'execute', () => {
				editor.execute( COMMAND_NAME );
				editor.editing.view.focus();
			} );

			return view;
		} );
	}
}
