/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module paragraph/paragraphbuttonui
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import icon from '../theme/icons/paragraph.svg';

/**
 * Class creates UI component representing paragraph button. It can be used together with
 * {@link module:heading/headingbuttonsui~HeadingButtonsUI} to replace heading dropdown used in toolbars.
 *
 * This plugin is not loaded automatically with {@link module:paragraph/paragraph~Paragraph paragraph plugin}. It must
 * be added manually in order to use `paragraph` component.
 *
 *		ClassicEditor
 *			.create( {
 *				plugins: [ ..., Heading, Paragraph, HeadingButtonsUI, ParagraphButtonUI ]
 * 				toolbar: [ 'paragraph', 'heading1', 'heading2', 'heading3' ]
 *			} )
 *			.then( ... )
 *			.catch( ... );
 *
 */
export default class ParagraphButtonUI extends Plugin {
	init() {
		const editor = this.editor;
		const t = editor.t;

		editor.ui.componentFactory.add( 'paragraph', locale => {
			const view = new ButtonView( locale );
			const command = editor.commands.get( 'paragraph' );

			view.label = t( 'Paragraph' );
			view.icon = icon;
			view.tooltip = true;
			view.bind( 'isEnabled' ).to( command );
			view.bind( 'isOn' ).to( command, 'value' );

			view.on( 'execute', () => {
				editor.execute( 'paragraph' );
			} );

			return view;
		} );
	}
}
