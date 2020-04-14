/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module select-all/selectallui
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';

import selectAllIcon from '../theme/icons/select-all.svg';

/**
 * The select all UI feature.
 *
 * It registers the `'selectAll'` UI button in the editor's
 * {@link module:ui/componentfactory~ComponentFactory component factory}. When clicked, the button
 * executes the {@link module:select-all/selectallcommand~SelectAllCommand select all command}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class SelectAllUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'SelectAllUI';
	}

	init() {
		const editor = this.editor;

		editor.ui.componentFactory.add( 'selectAll', locale => {
			const command = editor.commands.get( 'selectAll' );
			const view = new ButtonView( locale );
			const t = locale.t;

			view.set( {
				label: t( 'Select all' ),
				icon: selectAllIcon,
				keystroke: 'CTRL+A',
				tooltip: true
			} );

			view.bind( 'isOn', 'isEnabled' ).to( command, 'value', 'isEnabled' );

			// Execute command.
			this.listenTo( view, 'execute', () => {
				editor.execute( 'selectAll' );
				editor.editing.view.focus();
			} );

			return view;
		} );
	}
}
