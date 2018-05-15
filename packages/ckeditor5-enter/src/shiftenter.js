/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module enter/shiftenter
 */

import ShiftEnterCommand from './shiftentercommand';
import EnterObserver from './enterobserver';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { upcastElementToElement } from '@ckeditor/ckeditor5-engine/src/conversion/upcast-converters';
import { downcastElementToElement } from '@ckeditor/ckeditor5-engine/src/conversion/downcast-converters';

/**
 * The ShiftEnter feature. Handles the <kbd>Shift + Enter</kbd> keys in the editor.
 *
 * @extends module:core/plugin~Plugin
 */
export default class ShiftEnter extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'SoftEnter';
	}

	init() {
		const editor = this.editor;
		const schema = editor.model.schema;
		const conversion = editor.conversion;
		const view = editor.editing.view;
		const viewDocument = view.document;

		// Configure schema.
		schema.register( 'break', {
			allowWhere: '$text'
		} );

		// Configure converters.
		conversion.for( 'upcast' )
			.add( upcastElementToElement( {
				model: 'break',
				view: 'br'
			} ) );

		conversion.for( 'downcast' )
			.add( downcastElementToElement( {
				model: 'break',
				view: ( modelElement, viewWriter ) => viewWriter.createEmptyElement( 'br' )
			} ) );

		view.addObserver( EnterObserver );

		editor.commands.add( 'shiftEnter', new ShiftEnterCommand( editor ) );

		// TODO We may use the keystroke handler for that.
		this.listenTo( viewDocument, 'enter', ( evt, data ) => {
			// The 'Enter' key is handled by the Enter plugin.
			if ( !data.isSoft ) {
				return;
			}

			editor.execute( 'shiftEnter' );
			data.preventDefault();
			view.scrollToTheSelection();
		}, { priority: 'low' } );
	}
}
