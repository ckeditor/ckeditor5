/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils.js';

import { getData as getModelData, setData as setModelData } from '../../src/dev-utils/model.js';

describe( 'Bug ckeditor5#11925', () => {
	let editor;

	beforeEach( async () => {
		editor = await VirtualTestEditor.create( {
			plugins: [ Paragraph ]
		} );
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	it( 'should not break the editor after setting invalid selection', () => {
		setModelData( editor.model, '<paragraph>X</paragraph><paragraph>Foo [bar] baz</paragraph><paragraph>Y</paragraph>' );

		const selection = editor.model.document.selection.getFirstRange();

		editor.model.change( writer => {
			writer.remove(
				editor.model.document.getRoot().getChild( 1 )
			);
		} );

		expectToThrowCKEditorError( () => {
			editor.model.change( writer => {
				writer.setSelection( selection );
			} );
		}, /document-selection-wrong-position/ );

		expect( () => {
			editor.model.change( writer => {
				writer.insertText( 'abc', editor.model.document.selection.getFirstPosition() );
			} );
		} ).to.not.throw();

		expect( getModelData( editor.model ) ).to.equal(
			'<paragraph>Xabc[]</paragraph><paragraph>Y</paragraph>'
		);
	} );
} );
