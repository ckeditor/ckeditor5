/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
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
import iconHeading3 from '../theme/icons/heading3.svg';
import iconHeading4 from '../theme/icons/heading4.svg';
import iconHeading5 from '../theme/icons/heading5.svg';
import iconHeading6 from '../theme/icons/heading6.svg';

const defaultIcons = {
	heading1: iconHeading1,
	heading2: iconHeading2,
	heading3: iconHeading3,
	heading4: iconHeading4,
	heading5: iconHeading5,
	heading6: iconHeading6
};

/**
 * The `HeadingButtonsUI` plugin defines a set of UI buttons that can be used instead of the
 * standard drop down component.
 *
 * This feature is not enabled by default by the {@link module:heading/heading~Heading} plugin and needs to be
 * installed manually to the editor configuration.
 *
 * Plugin introduces button UI elements, which names are same as `model` property from {@link module:heading/heading~HeadingOption}.
 *
 *		ClassicEditor
 *			.create( {
 *				plugins: [ ..., Heading, Paragraph, HeadingButtonsUI, ParagraphButtonUI ]
 *				heading: {
 *					options: [
 *						{ model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
 *						{ model: 'heading1', view: 'h2', title: 'Heading 1', class: 'ck-heading_heading1' },
 *						{ model: 'heading2', view: 'h3', title: 'Heading 2', class: 'ck-heading_heading2' },
 *						{ model: 'heading3', view: 'h4', title: 'Heading 3', class: 'ck-heading_heading3' }
 *					]
 * 				},
 * 				toolbar: [ 'paragraph', 'heading1', 'heading2', 'heading3' ]
 *			} )
 *			.then( ... )
 *			.catch( ... );
 *
 * NOTE: The `'paragraph'` button is defined in by the {@link module:paragraph/paragraphbuttonui~ParagraphButtonUI} plugin
 * which needs to be loaded manually as well.
 *
 * It is possible to use custom icons by providing `icon` config option in {@link module:heading/heading~HeadingOption}.
 * For the default configuration standard icons are used.
 *
 * @extends module:core/plugin~Plugin
 */
export default class HeadingButtonsUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	init() {
		const options = getLocalizedOptions( this.editor );

		options
			.filter( item => item.model !== 'paragraph' )
			.map( item => this._createButton( item ) );
	}

	/**
	 * Creates single button view from provided configuration option.
	 *
	 * @private
	 * @param {Object} option
	 */
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
