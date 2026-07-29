/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { Plugin } from '@ckeditor/ckeditor5-core';
import { Enter } from '@ckeditor/ckeditor5-enter';
import { Typing } from '@ckeditor/ckeditor5-typing';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Bold, Italic } from '@ckeditor/ckeditor5-basic-styles';
import { Undo } from '@ckeditor/ckeditor5-undo';
import { ViewPosition } from '../../../src/view/position.js';
import type { ViewDowncastWriter } from '../../../src/view/downcastwriter.js';

declare global {
	interface Window { editor: any }
}

function createEndingUIElement( writer: ViewDowncastWriter ) {
	const element = writer.createUIElement( 'span', null, function( domDocument ) {
		const root = this.toDomElement( domDocument );
		root.classList.add( 'ui-element' );
		root.innerHTML = 'END OF PARAGRAPH';

		return root;
	} );

	return element;
}

function createMiddleUIElement( writer: ViewDowncastWriter ) {
	const element = writer.createUIElement( 'span', null, function( domDocument ) {
		const root = this.toDomElement( domDocument );
		root.classList.add( 'ui-element' );
		root.innerHTML = 'X';

		return root;
	} );

	return element;
}

class UIElementTestPlugin extends Plugin {
	public init(): void {
		const editor = this.editor;
		const editing = editor.editing;

		// Add some UIElement to each paragraph.
		editing.downcastDispatcher.on( 'insert:paragraph', ( evt, data, conversionApi ) => {
			const viewP = conversionApi.mapper.toViewElement( data.item );
			viewP._appendChild( createEndingUIElement( conversionApi.writer ) );
		}, { priority: 'lowest' } );
	}
}

ClassicEditor
	.create( {
		attachTo: document.querySelector( '#editor' ) as HTMLElement,
		plugins: [ Enter, Typing, Paragraph, Undo, Bold, Italic, UIElementTestPlugin ],
		toolbar: [ 'undo', 'redo', 'bold', 'italic' ]
	} )
	.then( editor => {
		window.editor = editor;
		const view = editor.editing.view;

		// Add some UI elements.
		const viewRoot = editor.editing.view.document.getRoot();
		const viewText1 = ( viewRoot!.getChild( 0 ) as any ).getChild( 0 );
		const viewText2 = ( viewRoot!.getChild( 1 ) as any ).getChild( 0 );

		view.change( writer => {
			writer.insert( new ViewPosition( viewText1, 20 ), createMiddleUIElement( writer ) );
			writer.insert( new ViewPosition( viewText1, 20 ), createMiddleUIElement( writer ) );
			writer.insert( new ViewPosition( viewText2, 0 ), createMiddleUIElement( writer ) );
			writer.insert( new ViewPosition( viewText2, 6 ), createMiddleUIElement( writer ) );
		} );

		document.querySelector( '#insert-ui-element' )!.addEventListener( 'click', () => {
			view.change( writer => {
				writer.insert( view.document.selection.getFirstPosition()!, createMiddleUIElement( writer ) );
			} );
		} );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
