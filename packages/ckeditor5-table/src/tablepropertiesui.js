/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tablepropertiesui
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';

import tableProperties from './../theme/icons/table-properties.svg';

/**
 * TODO
 *
 * @extends module:core/plugin~Plugin
 */
export default class TablePropertiesUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const t = editor.t;

		editor.ui.componentFactory.add( 'tableProperties', locale => {
			const view = new ButtonView( locale );

			view.set( {
				label: t( 'Table properties' ),
				icon: tableProperties,
				tooltip: true
			} );

			this.listenTo( view, 'execute', () => this._showUI() );

			return view;
		} );
	}

	_showUI() {
	}
}
