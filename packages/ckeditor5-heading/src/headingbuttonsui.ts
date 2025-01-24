/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module heading/headingbuttonsui
 */

import { Plugin } from 'ckeditor5/src/core.js';
import { ButtonView } from 'ckeditor5/src/ui.js';
import { IconHeading1, IconHeading2, IconHeading3, IconHeading4, IconHeading5, IconHeading6 } from 'ckeditor5/src/icons.js';

import { getLocalizedOptions } from './utils.js';
import type { HeadingOption } from './headingconfig.js';
import type HeadingCommand from './headingcommand.js';

const defaultIcons: Record<string, string> = /* #__PURE__ */ ( () => ( {
	heading1: IconHeading1,
	heading2: IconHeading2,
	heading3: IconHeading3,
	heading4: IconHeading4,
	heading5: IconHeading5,
	heading6: IconHeading6
} ) )();

/**
 * The `HeadingButtonsUI` plugin defines a set of UI buttons that can be used instead of the
 * standard drop down component.
 *
 * This feature is not enabled by default by the {@link module:heading/heading~Heading} plugin and needs to be
 * installed manually to the editor configuration.
 *
 * Plugin introduces button UI elements, which names are same as `model` property from {@link module:heading/headingconfig~HeadingOption}.
 *
 * ```ts
 * ClassicEditor
 *   .create( {
 *     plugins: [ ..., Heading, Paragraph, HeadingButtonsUI, ParagraphButtonUI ]
 *     heading: {
 *       options: [
 *         { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
 *         { model: 'heading1', view: 'h2', title: 'Heading 1', class: 'ck-heading_heading1' },
 *         { model: 'heading2', view: 'h3', title: 'Heading 2', class: 'ck-heading_heading2' },
 *         { model: 'heading3', view: 'h4', title: 'Heading 3', class: 'ck-heading_heading3' }
 *       ]
 *      },
 *      toolbar: [ 'paragraph', 'heading1', 'heading2', 'heading3' ]
 *   } )
 *   .then( ... )
 *   .catch( ... );
 * ```
 *
 * NOTE: The `'paragraph'` button is defined in by the {@link module:paragraph/paragraphbuttonui~ParagraphButtonUI} plugin
 * which needs to be loaded manually as well.
 *
 * It is possible to use custom icons by providing `icon` config option in {@link module:heading/headingconfig~HeadingOption}.
 * For the default configuration standard icons are used.
 */
export default class HeadingButtonsUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	public init(): void {
		const options = getLocalizedOptions( this.editor );

		options
			.filter( item => item.model !== 'paragraph' )
			.map( item => this._createButton( item ) );
	}

	/**
	 * Creates single button view from provided configuration option.
	 */
	private _createButton( option: HeadingOption ) {
		const editor = this.editor;

		editor.ui.componentFactory.add( option.model, locale => {
			const view = new ButtonView( locale );
			const command: HeadingCommand = editor.commands.get( 'heading' )!;

			view.label = option.title;
			view.icon = option.icon || defaultIcons[ option.model ];
			view.tooltip = true;
			view.isToggleable = true;
			view.bind( 'isEnabled' ).to( command );
			view.bind( 'isOn' ).to( command, 'value', value => value == option.model );

			view.on( 'execute', () => {
				editor.execute( 'heading', { value: option.model } );
				editor.editing.view.focus();
			} );

			return view;
		} );
	}
}
