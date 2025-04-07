/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module fullscreen/fullscreenui
 */

import { Plugin } from 'ckeditor5/src/core.js';
import { ButtonView, MenuBarMenuListItemButtonView } from 'ckeditor5/src/ui.js';
import { IconFullscreenEnter, IconFullscreenLeave } from 'ckeditor5/src/icons.js';
import { env } from 'ckeditor5/src/utils.js';

import FullscreenEditing from './fullscreenediting.js';
import '../theme/fullscreen.css';

const COMMAND_NAME = 'toggleFullscreen';

/**
 * A plugin registering the fullscreen mode buttons.
 */
export default class FullscreenUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ FullscreenEditing ] as const;
	}

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

		editor.ui.componentFactory.add( 'fullscreen', () => this._createButton( ButtonView ) );
		editor.ui.componentFactory.add( 'menuBar:fullscreen', () => this._createButton( MenuBarMenuListItemButtonView ) );
	}

	/**
	 * Creates a button that toggles the fullscreen mode.
	 */
	private _createButton( ButtonClass: typeof ButtonView | typeof MenuBarMenuListItemButtonView ) {
		const editor = this.editor;
		const t = editor.t;
		const command = editor.commands.get( COMMAND_NAME )!;
		const view = new ButtonClass( editor.locale );

		view.set( {
			isToggleable: true
		} );

		view.bind( 'isEnabled' ).to( command, 'isEnabled' );
		view.bind( 'isOn' ).to( command, 'value' );

		if ( ( view instanceof MenuBarMenuListItemButtonView ) ) {
			view.set( {
				role: 'menuitemcheckbox',
				label: t( 'Fullscreen mode' )
			} );
		} else {
			view.bind( 'icon' ).to( command, 'value', value => value ? IconFullscreenLeave : IconFullscreenEnter );
			view.bind( 'label' ).to( command, 'value', value => value ? t( 'Leave fullscreen mode' ) : t( 'Enter fullscreen mode' ) );
			view.set( {
				tooltip: true
			} );
		}

		this.listenTo( view, 'execute', () => {
			editor.execute( COMMAND_NAME );

			// On non-Chromium browsers, toolbar is not blurred properly after moving the editable,
			// even though the `document.activeElement` is changed. Hence we need to blur the view manually.
			// Fixes https://github.com/ckeditor/ckeditor5/issues/18250 and https://github.com/ckeditor/ckeditor5/issues/18247.
			if ( !env.isBlink ) {
				this.editor.ui.view.toolbar!.focusTracker.focusedElement = null;
			}

			// The order of scroll and focus is not important here.
			editor.editing.view.scrollToTheSelection();
			editor.editing.view.focus();
		} );

		return view;
	}
}
