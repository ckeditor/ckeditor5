/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import ShiftEnter from '@ckeditor/ckeditor5-enter/src/shiftenter';
import LinkEditing from '@ckeditor/ckeditor5-link/src/linkediting';
import GeneralHtmlSupport from '../../src/generalhtmlsupport';
import { getModelDataWithAttributes } from '../_utils/utils';
import { getData as getModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

/* global document */

describe( 'DualContentModelElementSupport', () => {
	let editor, model, editorElement, dataFilter, dataSchema;

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ Paragraph, Bold, Italic, ShiftEnter, LinkEditing, GeneralHtmlSupport ]
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;

				dataFilter = editor.plugins.get( 'DataFilter' );
				dataSchema = editor.plugins.get( 'DataSchema' );
			} );
	} );

	afterEach( () => {
		editorElement.remove();

		return editor.destroy();
	} );

	it( 'should be named', () => {
		expect( editor.plugins.has( 'DualContentModelElementSupport' ) ).to.be.true;
	} );

	it( 'should be only applied to newly enabled elements', () => {
		model.schema.register( 'htmlDiv', {} );
		dataFilter.allowElement( 'div' );

		editor.setData( '<div><p>foobar</p></div>' );

		expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
			'<paragraph>foobar</paragraph>'
		);

		expect( editor.getData() ).to.equal( '<p>foobar</p>' );
	} );

	it( 'should recognize paragraph-like elements', () => {
		dataFilter.allowElement( 'div' );

		editor.setData( '<div><i>foo</i>bar<b>baz</b></div>' );

		expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
			'<htmlDivParagraph>' +
			'<$text italic="true">foo</$text>bar<$text bold="true">baz</$text>' +
			'</htmlDivParagraph>'
		);

		expect( editor.getData() ).to.equal( '<div><i>foo</i>bar<strong>baz</strong></div>' );
	} );

	it( 'should recognize paragraph-like elements with soft breaks', () => {
		dataFilter.allowElement( 'div' );

		editor.setData( '<div>foo<br>bar</div>' );

		expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
			'<htmlDivParagraph>foo<softBreak></softBreak>bar</htmlDivParagraph>'
		);

		expect( editor.getData() ).to.equal( '<div>foo<br>bar</div>' );
	} );

	it( 'should recognize paragraph-like elements with nested structure', () => {
		dataFilter.allowElement( 'div' );

		editor.setData( '<div><a href="example.com"><i>foo</i>bar</a>baz</div>' );

		expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
			'<htmlDivParagraph>' +
				'<$text italic="true" linkHref="example.com">foo</$text>' +
				'<$text linkHref="example.com">bar</$text>' +
				'baz' +
			'</htmlDivParagraph>'
		);

		expect( editor.getData() ).to.equal( '<div><a href="example.com"><i>foo</i>bar</a>baz</div>' );
	} );

	it( 'should recognize block elements', () => {
		dataFilter.allowElement( 'div' );

		editor.setData( '<div><p>foobar</p></div>' );

		expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
			'<htmlDiv><paragraph>foobar</paragraph></htmlDiv>'
		);

		expect( editor.getData() ).to.equal( '<div><p>foobar</p></div>' );
	} );

	it( 'should recognize block elements with nested structure', () => {
		dataFilter.allowElement( 'div' );

		editor.setData( '<div><a href="example.com"><p>foo</p></a>bar</div>' );

		expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
			'<htmlDiv>' +
				'<paragraph><$text linkHref="example.com">foo</$text></paragraph>' +
				'<paragraph>bar</paragraph>' +
			'</htmlDiv>'
		);

		expect( editor.getData() ).to.equal( '<div><p><a href="example.com">foo</a></p><p>bar</p></div>' );
	} );

	it( 'should autoparagraph mixed content', () => {
		dataFilter.allowElement( 'div' );

		editor.setData( '<div>foo<p>bar</p>baz</div>' );

		expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
			'<htmlDiv><paragraph>foo</paragraph><paragraph>bar</paragraph><paragraph>baz</paragraph></htmlDiv>'
		);

		expect( editor.getData() ).to.equal( '<div><p>foo</p><p>bar</p><p>baz</p></div>' );
	} );

	it( 'should detect nested dual content', () => {
		dataFilter.allowElement( 'div' );

		editor.setData( '<div><div>inline</div><div><p>sectioning</p></div></div>' );

		expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
			'<htmlDiv><htmlDivParagraph>inline</htmlDivParagraph><htmlDiv><paragraph>sectioning</paragraph></htmlDiv></htmlDiv>'
		);

		expect( editor.getData() ).to.equal( '<div><div>inline</div><div><p>sectioning</p></div></div>' );
	} );

	it( 'should preserve allowed attributes', () => {
		dataFilter.allowElement( 'div' );
		dataFilter.allowAttributes( { name: 'div', attributes: { 'data-foo': true } } );

		editor.setData( '<div data-foo><p>foobar</p></div><div data-foo>foobar</div>' );

		expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
			data: '<htmlDiv htmlAttributes="(1)"><paragraph>foobar</paragraph></htmlDiv>' +
			'<htmlDivParagraph htmlAttributes="(2)">foobar</htmlDivParagraph>',
			attributes: {
				1: {
					attributes: { 'data-foo': '' }
				},
				2: {
					attributes: { 'data-foo': '' }
				}
			}
		} );

		expect( editor.getData() ).to.equal( '<div data-foo=""><p>foobar</p></div><div data-foo="">foobar</div>' );
	} );

	it( 'should remove disallowed attributes', () => {
		dataFilter.allowElement( 'div' );
		dataFilter.allowAttributes( { name: 'div', attributes: { 'data-foo': true } } );
		dataFilter.disallowAttributes( { name: 'div', attributes: { 'data-foo': true } } );

		editor.setData( '<div data-foo><p>foobar</p></div><div data-foo>foobar</div>' );

		expect( getModelDataWithAttributes( model, { withoutSelection: true } ) ).to.deep.equal( {
			data: '<htmlDiv><paragraph>foobar</paragraph></htmlDiv>' +
			'<htmlDivParagraph>foobar</htmlDivParagraph>',
			attributes: {}
		} );

		expect( editor.getData() ).to.equal( '<div><p>foobar</p></div><div>foobar</div>' );
	} );

	it( 'should ensure that model element is allowed in the insertion context', () => {
		dataSchema.registerBlockElement( {
			model: 'htmlXyz',
			view: 'xyz',
			asParagraph: 'htmlXyzParagraph',
			modelSchema: {
				allowChildren: 'paragraph'
			}
		} );

		dataFilter.allowElement( 'xyz' );

		editor.setData( '<xyz><p>xyz</p></xyz>' );

		expect( editor.getData() ).to.equal( '<p>xyz</p>' );
	} );

	describe( 'with ghs configured to allow all', () => {
		let allowAllEditor, allowAllModel, allowAllEditorElement;

		beforeEach( () => {
			allowAllEditorElement = document.createElement( 'div' );
			document.body.appendChild( allowAllEditorElement );
			return ClassicTestEditor
				.create( allowAllEditorElement, {
					plugins: [ Paragraph, Bold, Italic, ShiftEnter, LinkEditing, GeneralHtmlSupport ],
					htmlSupport: {
						allow: [
							{
								name: /^.*$/,
								styles: true,
								attributes: true,
								classes: true
							}
						]
					}
				} )
				.then( newEditor => {
					allowAllEditor = newEditor;
					allowAllModel = newEditor.model;
				} );
		} );

		afterEach( () => {
			allowAllEditorElement.remove();

			return allowAllEditor.destroy();
		} );

		it( 'should upcast description list', () => {
			allowAllEditor.setData(
				'<dl>' +
					'<dt>Name</dt>' +
					'<dd>Godzilla</dd>' +
					'<dt>Born</dt>' +
					'<dd>1952</dd>' +
				'</dl>'
			);

			expect( getModelData( allowAllModel, { withoutSelection: true } ) ).to.equal(
				'<htmlDl>' +
					'<htmlDt><paragraph>Name</paragraph></htmlDt>' +
					'<htmlDd><paragraph>Godzilla</paragraph></htmlDd>' +
					'<htmlDt><paragraph>Born</paragraph></htmlDt>' +
					'<htmlDd><paragraph>1952</paragraph></htmlDd>' +
				'</htmlDl>'
			);
		} );

		it( 'should upcast description list when name-value groups are wrapped in div elements', () => {
			allowAllEditor.setData(
				'<dl>' +
					'<div>' +
						'<dt>Name</dt>' +
						'<dd>Godzilla</dd>' +
					'</div>' +
					'<div>' +
						'<dt>Born</dt>' +
						'<dd>1952</dd>' +
					'</div>' +
				'</dl>'
			);

			expect( getModelData( allowAllModel, { withoutSelection: true } ) ).to.equal(
				'<htmlDl>' +
					'<htmlDivDl>' +
						'<htmlDt><paragraph>Name</paragraph></htmlDt>' +
						'<htmlDd><paragraph>Godzilla</paragraph></htmlDd>' +
					'</htmlDivDl>' +
					'<htmlDivDl>' +
						'<htmlDt><paragraph>Born</paragraph></htmlDt>' +
						'<htmlDd><paragraph>1952</paragraph></htmlDd>' +
					'</htmlDivDl>' +
				'</htmlDl>'
			);
		} );

		it( 'should upcast description list div elements as well as other mixed-content div', () => {
			allowAllEditor.setData(
				'<div><div>inline</div><div><p>sectioning</p></div></div>' +
				'<dl>' +
					'<div>' +
						'<dt>Name</dt>' +
						'<dd>Godzilla</dd>' +
					'</div>' +
					'<div>' +
						'<dt>Born</dt>' +
						'<dd>1952</dd>' +
					'</div>' +
				'</dl>'
			);

			expect( getModelData( allowAllModel, { withoutSelection: true } ) ).to.equal(
				'<htmlDiv><htmlDivParagraph>inline</htmlDivParagraph><htmlDiv><paragraph>sectioning</paragraph></htmlDiv></htmlDiv>' +
				'<htmlDl>' +
					'<htmlDivDl>' +
						'<htmlDt><paragraph>Name</paragraph></htmlDt>' +
						'<htmlDd><paragraph>Godzilla</paragraph></htmlDd>' +
					'</htmlDivDl>' +
					'<htmlDivDl>' +
						'<htmlDt><paragraph>Born</paragraph></htmlDt>' +
						'<htmlDd><paragraph>1952</paragraph></htmlDd>' +
					'</htmlDivDl>' +
				'</htmlDl>'
			);
		} );
	} );
} );
