/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module heading/headingbuttonsui
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';

import { getLocalizedOptions } from './utils';
import iconHeading1 from '../theme/icons/heading1.svg';
import iconHeading2 from '../theme/icons/heading2.svg';

const defaultIcons = {
	heading1: iconHeading1,
	heading2: iconHeading2
};

/**
 * HeadingButtonsUI class creates set of UI buttons that can be used instead of drop down component.
 * It is not enabled by default when using {@link module:heading/heading~Heading heading plugin}, and need to be
 * added manually to the editor configuration.
 *
 * It uses `icon` config option provided in {@link module:heading/heading~HeadingOption}. For the default configuration
 * standard icons are used.
 *
 * @extends module:core/plugin~Plugin
 */
export default class HeadingButtonsUI extends Plugin {
	init() {
		const options = getLocalizedOptions( this.editor );

		options
			.filter( item => item.model !== 'paragraph' )
			.map( item => this._createButton( item ) );
	}

	_createButton( option ) {
		const editor = this.editor;

		editor.ui.componentFactory.add( option.model, locale => {
			const view = new ButtonView( locale );
			const command = editor.commands.get( 'heading' );

			view.label = option.title;
			view.icon = option.icon || defaultIcons[ option.model ];
			view.tooltip = true;
			view.bind( 'isEnabled' ).to( command );
			view.bind( 'isOn' ).to( command, 'value', value => value == option.model );

			view.on( 'execute', () => {
				editor.execute( 'heading', { value: option.model } );
			} );

			return view;
		} );
	}
}
