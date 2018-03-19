/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module table/tableui
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';

import icon from '@ckeditor/ckeditor5-core/theme/icons/object-center.svg';
import insertRowIcon from '@ckeditor/ckeditor5-core/theme/icons/object-left.svg';
import insertColumnIcon from '@ckeditor/ckeditor5-core/theme/icons/object-right.svg';

/**
 * The table UI plugin.
 *
 * @extends module:core/plugin~Plugin
 */
export default class TableUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;

		editor.ui.componentFactory.add( 'insertTable', locale => {
			const command = editor.commands.get( 'insertTable' );
			const buttonView = new ButtonView( locale );

			buttonView.bind( 'isEnabled' ).to( command );

			buttonView.set( {
				icon,
				label: 'Insert table',
				tooltip: true
			} );

			buttonView.on( 'execute', () => {
				editor.execute( 'insertTable' );
				editor.editing.view.focus();
			} );

			return buttonView;
		} );

		editor.ui.componentFactory.add( 'insertRow', locale => {
			const command = editor.commands.get( 'insertRow' );
			const buttonView = new ButtonView( locale );

			buttonView.bind( 'isEnabled' ).to( command );

			buttonView.set( {
				icon: insertRowIcon,
				label: 'Insert row',
				tooltip: true
			} );

			buttonView.on( 'execute', () => {
				editor.execute( 'insertRow' );
				editor.editing.view.focus();
			} );

			return buttonView;
		} );
		editor.ui.componentFactory.add( 'insertColumn', locale => {
			const command = editor.commands.get( 'insertColumn' );
			const buttonView = new ButtonView( locale );

			buttonView.bind( 'isEnabled' ).to( command );

			buttonView.set( {
				icon: insertColumnIcon,
				label: 'Insert column',
				tooltip: true
			} );

			buttonView.on( 'execute', () => {
				editor.execute( 'insertColumn' );
				editor.editing.view.focus();
			} );

			return buttonView;
		} );
	}
}
