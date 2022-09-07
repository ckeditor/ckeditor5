/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils';

import { getData as getModelData, setData as setModelData } from '../../src/dev-utils/model';

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
		}, /model-nodelist-offset-out-of-bound/ );

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
