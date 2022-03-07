/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

import DocumentListEditing from '../../../src/documentlist/documentlistediting';
import stubUid from '../_utils/uid';
import { modelList } from '../_utils/utils';

import Image from '@ckeditor/ckeditor5-image/src/image';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import { Paragraph } from 'ckeditor5/src/paragraph';
import {
	getData as getModelData,
	setData as setModelData
} from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

describe( 'image plugin integration', () => {
	let element;
	let editor, model;
	let blockCommand;
	const imgSrc = 'foo/bar.jpg';
	testUtils.createSinonSandbox();

	beforeEach( async () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		editor = await ClassicTestEditor.create( element, {
			plugins: [
				Paragraph, DocumentListEditing, Image
			]
		} );

		model = editor.model;

		stubUid();
	} );

	afterEach( async () => {
		element.remove();

		await editor.destroy();
	} );

	describe( 'changing image type', () => {
		beforeEach( () => {
			blockCommand = editor.commands.get( 'imageTypeBlock' );
			// inlineCommand = editor.commands.get( 'imageTypeInline' );
		} );

		describe( 'block image to inline image', () => {
			it( 'should replace inline image with a block image', () => {
				setModelData( model, modelList( [
					`* <paragraph>[<imageInline src="${ imgSrc }"></imageInline>]</paragraph>`
				] ) );

				blockCommand.execute();

				expect( getModelData( model ) ).to.equal(
					`[<imageBlock listIndent="0" listItemId="000" listType="bulleted" src="${ imgSrc }"></imageBlock>]`
				);
			} );

			it( 'should create a block imaage below paragraph when an inline image is at the end of a block', () => {
				setModelData( model, modelList( [
					`* <paragraph>Foo[<imageInline src="${ imgSrc }"></imageInline>]</paragraph>`
				] ) );

				blockCommand.execute();

				expect( getModelData( model ) ).to.equal(
					'<paragraph listIndent="0" listItemId="000" listType="bulleted">Foo</paragraph>' +
					`[<imageBlock listIndent="0" listItemId="000" listType="bulleted" src="${ imgSrc }"></imageBlock>]`
				);
			} );

			it( 'should create a block imaage below paragraph when an inline image is at the start of a block', () => {
				setModelData( model, modelList( [
					`* <paragraph>[<imageInline src="${ imgSrc }"></imageInline>]Foo</paragraph>`
				] ) );

				blockCommand.execute();

				expect( getModelData( model ) ).to.equal(
					`[<imageBlock listIndent="0" listItemId="000" listType="bulleted" src="${ imgSrc }"></imageBlock>]` +
					'<paragraph listIndent="0" listItemId="000" listType="bulleted">Foo</paragraph>'
				);
			} );

			it( 'should split paragraph in two when an inline image is in the middle of a block', () => {
				setModelData( model, modelList( [
					`* <paragraph>Fo[<imageInline src="${ imgSrc }"></imageInline>]oo</paragraph>`
				] ) );

				blockCommand.execute();

				expect( getModelData( model ) ).to.equal(
					'<paragraph listIndent="0" listItemId="000" listType="bulleted">Fo</paragraph>' +
					`[<imageBlock listIndent="0" listItemId="000" listType="bulleted" src="${ imgSrc }"></imageBlock>]` +
					'<paragraph listIndent="0" listItemId="000" listType="bulleted">oo</paragraph>'
				);
			} );

			it( 'should replace block image with a paragraphed inline image when an image is in a block', () => {
				setModelData( model, modelList( [
					'* <paragraph>Foo</paragraph>' +
					`  [<imageInline src="${ imgSrc }"></imageInline>]`
				] ) );

				blockCommand.execute();

				expect( getModelData( model ) ).to.equal(
					`[<imageBlock listIndent="0" listItemId="000" listType="bulleted" src="${ imgSrc }"></imageBlock>]`
				);
			} );
		} );

		// describe( 'block image to inline image', () => {

		// } );
	} );
} );
