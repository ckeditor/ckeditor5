/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module enter/shiftenter
 */

import ShiftEnterCommand from './shiftentercommand.js';
import EnterObserver, { type ViewDocumentEnterEvent } from './enterobserver.js';
import { Plugin } from '@ckeditor/ckeditor5-core';

/**
 * This plugin handles the <kbd>Shift</kbd>+<kbd>Enter</kbd> keystroke (soft line break) in the editor.
 *
 * See also the {@link module:enter/enter~Enter} plugin.
 *
 * For more information about this feature see the {@glink api/enter package page}.
 */
export default class ShiftEnter extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'ShiftEnter' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static override get isOfficialPlugin(): true {
		return true;
	}

	public init(): void {
		const editor = this.editor;
		const schema = editor.model.schema;
		const conversion = editor.conversion;
		const view = editor.editing.view;
		const viewDocument = view.document;
		const t = this.editor.t;

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
				view: ( modelElement, { writer } ) => writer.createEmptyElement( 'br' )
			} );

		view.addObserver( EnterObserver );

		editor.commands.add( 'shiftEnter', new ShiftEnterCommand( editor ) );

		this.listenTo<ViewDocumentEnterEvent>( viewDocument, 'enter', ( evt, data ) => {
			// When not in composition, we handle the action, so prevent the default one.
			// When in composition, it's the browser who modify the DOM (renderer is disabled).
			if ( !viewDocument.isComposing ) {
				data.preventDefault();
			}

			// The hard enter key is handled by the Enter plugin.
			if ( !data.isSoft ) {
				return;
			}

			editor.execute( 'shiftEnter' );
			view.scrollToTheSelection();
		}, { priority: 'low' } );

		// Add the information about the keystroke to the accessibility database.
		editor.accessibility.addKeystrokeInfos( {
			keystrokes: [
				{
					label: t( 'Insert a soft break (a <code>&lt;br&gt;</code> element)' ),
					keystroke: 'Shift+Enter'
				}
			]
		} );
	}
}
