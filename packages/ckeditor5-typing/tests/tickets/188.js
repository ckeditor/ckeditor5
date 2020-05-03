/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import Input from '../../src/input';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import BoldEditing from '@ckeditor/ckeditor5-basic-styles/src/bold/boldediting';

import { getData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';

describe( 'Bug ckeditor5-typing#188', () => {
	let editor;

	beforeEach( () => {
		return VirtualTestEditor.create( {
			plugins: [ Input, Paragraph, BoldEditing ]
		} ).then( newEditor => {
			editor = newEditor;
		} );
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	it( 'should not lost attributes while typing - IME', () => {
		const view = editor.editing.view;
		const p = view.document.getRoot().getChild( 0 );

		editor.execute( 'bold' );

		simulateMutation( view, p, 0, 0, '', 'u' );

		expect( getData( view, { withoutSelection: true } ) ).to.equal( '<p><strong>u</strong></p>' );

		simulateMutation( view, p, 0, 1, 'u', 'ü' );

		expect( getData( view, { withoutSelection: true } ) ).to.equal( '<p><strong>ü</strong></p>' );
	} );
} );

function simulateMutation( view, node, startOffset, endOffset, oldText, newText ) {
	const viewSelection = view.createSelection();

	viewSelection.setTo( view.createRange(
		view.createPositionAt( node, startOffset ),
		view.createPositionAt( node, endOffset )
	) );

	view.document.fire( 'mutations',
		[
			{
				type: 'text',
				oldText,
				newText,
				node
			}
		],
		viewSelection
	);
}
