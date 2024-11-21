/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document, console */

import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Mention } from '@ckeditor/ckeditor5-mention';
import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';

import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';

import InsertEmojiCommand from '../src/insertemojicommand.js';

describe( 'InsertEmojiCommand', () => {
	let domElement, editor, model, command, stub;

	beforeEach( async () => {
		domElement = document.createElement( 'div' );
		document.body.appendChild( domElement );
		stub = sinon.stub( console, 'warn' );

		editor = await ClassicEditor.create( domElement, {
			plugins: [
				Paragraph,
				Essentials,
				Mention
			]
		} );

		model = editor.model;
		command = new InsertEmojiCommand( editor );
	} );

	afterEach( () => {
		stub.restore();
		domElement.remove();
		return editor.destroy();
	} );

	describe( '#execute()', () => {
		it( 'should insert given emoji at given range (before element)', () => {
			setModelData( model, '<paragraph>Hello world!</paragraph>' );

			const element = editor.model.document.getRoot().getChild( 0 );
			const range = model.createRange(
				model.createPositionBefore( element )
			);

			command.execute( ':)', range );

			expect( getModelData( model ) ).to.equal( '<paragraph>[]:)</paragraph><paragraph>Hello world!</paragraph>' );
		} );

		it( 'should insert given emoji at given range (replacing element)', () => {
			setModelData( model, '<paragraph>Hello world!</paragraph>' );

			const element = editor.model.document.getRoot().getChild( 0 );
			const range = model.createRangeIn( element );

			command.execute( ':)', range );

			expect( getModelData( model ) ).to.equal( '<paragraph>[]:)</paragraph>' );
		} );

		it( 'should insert given emoji at given range (after element)', () => {
			setModelData( model, '<paragraph>Hello world!</paragraph>' );

			const element = editor.model.document.getRoot().getChild( 0 );
			const range = model.createRange(
				model.createPositionAfter( element )
			);

			command.execute( ':)', range );

			expect( getModelData( model ) ).to.equal( '<paragraph>[]Hello world!</paragraph><paragraph>:)</paragraph>' );
		} );
	} );
} );
