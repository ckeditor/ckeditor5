/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module enter/shiftenter
 */

import ShiftEnterCommand from './shiftentercommand';
import EnterObserver from './enterobserver';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

/**
 * This plugin handles the <kbd>Shift</kbd>+<kbd>Enter</kbd> keystroke (soft line break) in the editor.
 *
 * See also the {@link module:enter/enter~Enter} plugin.
 *
 * For more information about this feature see the {@glink api/enter package page}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class ShiftEnter extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'ShiftEnter';
	}

	init() {
		const editor = this.editor;
		const schema = editor.model.schema;
		const conversion = editor.conversion;
		const view = editor.editing.view;
		const viewDocument = view.document;

		// Configure the schema.
		schema.register( 'softBreak', {
			allowWhere: '$text',
			isInline: true
		} );

		// Configure converters.
		conversion.for( 'upcast' )
			.elementToElement( {
				model: 'softBreak',
				view: 'br'
			} );

		conversion.for( 'downcast' )
			.elementToElement( {
				model: 'softBreak',
				view: ( modelElement, viewWriter ) => viewWriter.createEmptyElement( 'br' )
			} );

		view.addObserver( EnterObserver );

		editor.commands.add( 'shiftEnter', new ShiftEnterCommand( editor ) );

		this.listenTo( viewDocument, 'enter', ( evt, data ) => {
			data.preventDefault();

			// The hard enter key is handled by the Enter plugin.
			if ( !data.isSoft ) {
				return;
			}

			editor.execute( 'shiftEnter' );
			view.scrollToTheSelection();
		}, { priority: 'low' } );
	}
}
