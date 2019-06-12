/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module core/indent
 */
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';

import Plugin from './plugin';
import MultiCommand from './multicommand';

/**
 * The indent feature.
 *
 * This plugin acts as a single entry point plugin for other features that implements indenting of elements like list or paragraphs.
 *
 * It registers the `'indent'` and `'outdent'` commands and it introduces the `'indent'` and `'outdent'` buttons that allow to
 * increase or decrease text indentation of supported elements.
 *
 * The compatible features are:
 * - the {@link module:list/list~List list} or {@link module:list/listediting~ListEditing list editing} feature for list indentation
 * - the {@link module:indent-block/indentblock~IndentBlock block indentation} feature for indenting text blocks like paragraphs or headings
 *
 * **Note**: In order the commands and buttons to work at least one of compatible features is required.
 */
export default class Indent extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'Indent';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const t = editor.t;

		editor.commands.add( 'indent', new MultiCommand( editor ) );
		editor.commands.add( 'outdent', new MultiCommand( editor ) );

		this._defineButton( 'indent', t( 'Increase indent' ) );
		this._defineButton( 'outdent', t( 'Decrease indent' ) );
	}

	/**
	 * Defines an UI button.
	 *
	 * @param {String} commandName
	 * @param {String} label
	 * @private
	 */
	_defineButton( commandName, label ) {
		const editor = this.editor;

		editor.ui.componentFactory.add( commandName, locale => {
			const command = editor.commands.get( commandName );
			const view = new ButtonView( locale );

			view.set( {
				label,
				withText: true,
				tooltip: true
			} );

			view.bind( 'isOn', 'isEnabled' ).to( command, 'value', 'isEnabled' );

			this.listenTo( view, 'execute', () => editor.execute( commandName ) );

			return view;
		} );
	}
}
