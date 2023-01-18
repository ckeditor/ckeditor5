/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import { setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

import ReplaceImageSourceCommand from '../../src/image/replaceimagesourcecommand';
import ImageBlockEditing from '../../src/image/imageblockediting';
import ImageInlineEditing from '../../src/image/imageinlineediting';

describe( 'ReplaceImageSourceCommand', () => {
	let editor, command, model;

	beforeEach( () => {
		return VirtualTestEditor
			.create( {
				plugins: [ ImageBlockEditing, ImageInlineEditing, Paragraph ]
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;

				command = new ReplaceImageSourceCommand( editor );

				const schema = model.schema;
				schema.extend( 'imageBlock', { allowAttributes: 'uploadId' } );
			} );
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	describe( 'execute()', () => {
		it( 'should change image source', () => {
			setModelData( model, '[<imageBlock src="foo/bar.jpg"></imageBlock>]' );

			const element = model.document.selection.getSelectedElement();

			command.execute( { source: 'bar/foo.jpg' } );

			expect( element.getAttribute( 'src' ) ).to.equal( 'bar/foo.jpg' );
		} );
	} );

	describe( 'refresh()', () => {
		it( 'should be enabled when selected element is an image', () => {
			setModelData( model, '[<imageBlock src="foo/bar.jpg"></imageBlock>]' );

			expect( command.isEnabled ).to.equal( true );
		} );

		it( 'should not enabled when selected element is not an image', () => {
			setModelData( model, '[<paragraph>Foo</paragraph>]' );

			expect( command.isEnabled ).to.equal( false );
		} );

		it( 'should store element src value', () => {
			setModelData( model, '[<imageBlock src="foo/bar.jpg"></imageBlock>]' );

			const element = model.document.selection.getSelectedElement();

			expect( element.getAttribute( 'src' ) ).to.equal( command.value );
		} );
	} );
} );
