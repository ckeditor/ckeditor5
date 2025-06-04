/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ListEditing from '../../../src/list/listediting.js';
import stubUid from '../_utils/uid.js';
import { modelList } from '../_utils/utils.js';

import Image from '@ckeditor/ckeditor5-image/src/image.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { Paragraph } from 'ckeditor5/src/paragraph.js';
import {
	getData as getModelData,
	setData as setModelData
} from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';

describe( 'image plugin integration', () => {
	let element;
	let editor, model;

	const imgSrc = 'foo/bar.jpg';

	testUtils.createSinonSandbox();

	beforeEach( async () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		editor = await ClassicTestEditor.create( element, {
			plugins: [
				Paragraph, ListEditing, Image
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
		let blockCommand, inlineCommand;

		beforeEach( () => {
			blockCommand = editor.commands.get( 'imageTypeBlock' );
			inlineCommand = editor.commands.get( 'imageTypeInline' );
		} );

		describe( 'inline image to block image', () => {
			it( 'should replace an inline image with a block image', () => {
				setModelData( model, modelList( [
					`* <paragraph>[<imageInline src="${ imgSrc }"></imageInline>]</paragraph>`
				] ) );

				blockCommand.execute();

				expect( getModelData( model ) ).to.equal(
					`[<imageBlock listIndent="0" listItemId="000" listType="bulleted" src="${ imgSrc }"></imageBlock>]`
				);
			} );

			it( 'should create a block image below paragraph when an inline image is at the end of a block', () => {
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

			it( 'should replace an inline image with a paragraphed inline image when an image is in a block', () => {
				setModelData( model, modelList( [
					'* Foo',
					`  <paragraph>[<imageInline src="${ imgSrc }"></imageInline>]</paragraph>`
				] ) );

				blockCommand.execute();

				expect( getModelData( model ) ).to.equal(
					'<paragraph listIndent="0" listItemId="000" listType="bulleted">Foo</paragraph>' +
					`[<imageBlock listIndent="0" listItemId="000" listType="bulleted" src="${ imgSrc }"></imageBlock>]`
				);
			} );

			it( 'should split an image after paragraph and create an image block if image inline is at the end', () => {
				setModelData( model, modelList( [
					'* Foo',
					`  <paragraph>Bar [<imageInline src="${ imgSrc }"></imageInline>]</paragraph>`
				] ) );

				blockCommand.execute();

				expect( getModelData( model ) ).to.equal(
					'<paragraph listIndent="0" listItemId="000" listType="bulleted">Foo</paragraph>' +
					'<paragraph listIndent="0" listItemId="000" listType="bulleted">Bar </paragraph>' +
					`[<imageBlock listIndent="0" listItemId="000" listType="bulleted" src="${ imgSrc }"></imageBlock>]`
				);
			} );

			it( 'should split an image before paragraph and create an image block if image inline is at the start', () => {
				setModelData( model, modelList( [
					'* Foo',
					`  <paragraph>[<imageInline src="${ imgSrc }"></imageInline>] Bar</paragraph>`
				] ) );

				blockCommand.execute();

				expect( getModelData( model ) ).to.equal(
					'<paragraph listIndent="0" listItemId="000" listType="bulleted">Foo</paragraph>' +
					`[<imageBlock listIndent="0" listItemId="000" listType="bulleted" src="${ imgSrc }"></imageBlock>]` +
					'<paragraph listIndent="0" listItemId="000" listType="bulleted"> Bar</paragraph>'
				);
			} );

			it( 'should split a paragraph into two and insert a block image between', () => {
				setModelData( model, modelList( [
					'* Foo',
					`  <paragraph>Bar [<imageInline src="${ imgSrc }"></imageInline>] Yar</paragraph>`
				] ) );

				blockCommand.execute();

				expect( getModelData( model ) ).to.equal(
					'<paragraph listIndent="0" listItemId="000" listType="bulleted">Foo</paragraph>' +
					'<paragraph listIndent="0" listItemId="000" listType="bulleted">Bar </paragraph>' +
					`[<imageBlock listIndent="0" listItemId="000" listType="bulleted" src="${ imgSrc }"></imageBlock>]` +
					'<paragraph listIndent="0" listItemId="000" listType="bulleted"> Yar</paragraph>'
				);
			} );
		} );

		describe( 'block image to inline image', () => {
			it( 'should change image block to inline block when an image is a first item in a list', () => {
				setModelData( model, modelList( [
					`* [<imageBlock src="${ imgSrc }"></imageBlock>]`
				] ) );

				inlineCommand.execute();

				expect( getModelData( model ) ).to.equal(
					'<paragraph listIndent="0" listItemId="000" listType="bulleted">' +
						`[<imageInline src="${ imgSrc }"></imageInline>]` +
					'</paragraph>'
				);
			} );

			it( 'should change image block to inline block when an image is a block item in a list', () => {
				setModelData( model, modelList( [
					'* Foo',
					`  [<imageBlock src="${ imgSrc }"></imageBlock>]`
				] ) );

				inlineCommand.execute();

				expect( getModelData( model ) ).to.equal(
					'<paragraph listIndent="0" listItemId="000" listType="bulleted">Foo</paragraph>' +
					'<paragraph listIndent="0" listItemId="000" listType="bulleted">' +
						`[<imageInline src="${ imgSrc }"></imageInline>]` +
					'</paragraph>'
				);
			} );

			it( 'should change image block to inline block when an image is not a last block item in a list', () => {
				setModelData( model, modelList( [
					'* Foo',
					`  [<imageBlock src="${ imgSrc }"></imageBlock>]`,
					'  Bar'
				] ) );

				inlineCommand.execute();

				expect( getModelData( model ) ).to.equal(
					'<paragraph listIndent="0" listItemId="000" listType="bulleted">Foo</paragraph>' +
					'<paragraph listIndent="0" listItemId="000" listType="bulleted">' +
						`[<imageInline src="${ imgSrc }"></imageInline>]` +
					'</paragraph>' +
					'<paragraph listIndent="0" listItemId="000" listType="bulleted">Bar</paragraph>'
				);
			} );
		} );
	} );
} );
