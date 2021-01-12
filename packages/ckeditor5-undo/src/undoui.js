/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module undo/undoui
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';

import undoIcon from '../theme/icons/undo.svg';
import redoIcon from '../theme/icons/redo.svg';

/**
 * The undo UI feature. It introduces the `'undo'` and `'redo'` buttons to the editor.
 *
 * @extends module:core/plugin~Plugin
 */
export default class UndoUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const locale = editor.locale;
		const t = editor.t;

		const localizedUndoIcon = locale.uiLanguageDirection == 'ltr' ? undoIcon : redoIcon;
		const localizedRedoIcon = locale.uiLanguageDirection == 'ltr' ? redoIcon : undoIcon;

		this._addButton( 'undo', t( 'Undo' ), 'CTRL+Z', localizedUndoIcon );
		this._addButton( 'redo', t( 'Redo' ), 'CTRL+Y', localizedRedoIcon );
	}

	/**
	 * Creates a button for the specified command.
	 *
	 * @private
	 * @param {String} name Command name.
	 * @param {String} label Button label.
	 * @param {String} keystroke Command keystroke.
	 * @param {String} Icon Source of the icon.
	 */
	_addButton( name, label, keystroke, Icon ) {
		const editor = this.editor;

		editor.ui.componentFactory.add( name, locale => {
			const command = editor.commands.get( name );
			const view = new ButtonView( locale );

			view.set( {
				label,
				icon: Icon,
				keystroke,
				tooltip: true
			} );

			view.bind( 'isEnabled' ).to( command, 'isEnabled' );

			this.listenTo( view, 'execute', () => {
				editor.execute( name );
				editor.editing.view.focus();
			} );

			return view;
		} );
	}
}
