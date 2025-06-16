/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { GeneralHtmlSupport } from '../src/index.js';
import { RemoveFormat } from '@ckeditor/ckeditor5-remove-format';
import { SelectAll } from '@ckeditor/ckeditor5-select-all';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Heading } from '@ckeditor/ckeditor5-heading';
import { Image, ImageCaption } from '@ckeditor/ckeditor5-image';
import { Table, TableCaption, TableCellProperties, TableColumnResize, TableProperties } from '@ckeditor/ckeditor5-table';
import { PageBreak } from '@ckeditor/ckeditor5-page-break';
import { CodeBlock } from '@ckeditor/ckeditor5-code-block';
import { List, ListProperties } from '@ckeditor/ckeditor5-list';
import { BlockQuote } from '@ckeditor/ckeditor5-block-quote';
import { _getModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import { _getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view.js';
import { stubUid } from '@ckeditor/ckeditor5-list/tests/list/_utils/uid.js';

describe( 'GeneralHtmlSupport', () => {
	let editor, element, dataSchema, generalHtmlSupport;

	beforeEach( async () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		editor = await ClassicTestEditor.create( element, {
			plugins: [ GeneralHtmlSupport ]
		} );

		dataSchema = editor.plugins.get( 'DataSchema' );
		generalHtmlSupport = editor.plugins.get( 'GeneralHtmlSupport' );
	} );

	afterEach( async () => {
		element.remove();

		await editor.destroy();
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( GeneralHtmlSupport.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( GeneralHtmlSupport.isPremiumPlugin ).to.be.false;
	} );

	describe( 'getGhsAttributeNameForElement()', () => {
		beforeEach( () => {
			dataSchema.registerBlockElement( { model: 'def', view: 'def1' } );
			dataSchema.registerBlockElement( { model: 'def', view: 'def2' } );
			dataSchema.registerInlineElement( { model: 'htmlDef', view: 'def3' } );
			dataSchema.registerInlineElement( { model: 'htmlDef', view: 'def4' } );
			dataSchema.registerInlineElement( { model: 'htmlObj', view: 'def5', isObject: true } );
		} );

		it( 'should return "htmlXAttributes" for block elements', () => {
			expect( generalHtmlSupport.getGhsAttributeNameForElement( 'def1' ) ).to.equal( 'htmlDef1Attributes' );
			expect( generalHtmlSupport.getGhsAttributeNameForElement( 'def2' ) ).to.equal( 'htmlDef2Attributes' );
		} );

		it( 'should return "htmlXAttributes" for inline object elements', () => {
			expect( generalHtmlSupport.getGhsAttributeNameForElement( 'def5' ) ).to.equal( 'htmlDef5Attributes' );
		} );

		it( 'should return model attribute name for inline elements with multiple view representations', () => {
			expect( generalHtmlSupport.getGhsAttributeNameForElement( 'def3' ) ).to.equal( 'htmlDef' );
			expect( generalHtmlSupport.getGhsAttributeNameForElement( 'def4' ) ).to.equal( 'htmlDef' );
		} );

		it( 'should return model attribute name for block elements with multiple view representations', () => {
			expect( generalHtmlSupport.getGhsAttributeNameForElement( 'td' ) ).to.equal( 'htmlTdAttributes' );
			expect( generalHtmlSupport.getGhsAttributeNameForElement( 'th' ) ).to.equal( 'htmlThAttributes' );
		} );

		it( 'should return model attribute name for list elements with multiple view representations', () => {
			expect( generalHtmlSupport.getGhsAttributeNameForElement( 'ul' ) ).to.equal( 'htmlUlAttributes' );
			expect( generalHtmlSupport.getGhsAttributeNameForElement( 'ol' ) ).to.equal( 'htmlOlAttributes' );
			expect( generalHtmlSupport.getGhsAttributeNameForElement( 'li' ) ).to.equal( 'htmlLiAttributes' );
		} );

		it( 'should return model attribute name for block elements', () => {
			expect( generalHtmlSupport.getGhsAttributeNameForElement( 'div' ) ).to.equal( 'htmlDivAttributes' );
			expect( generalHtmlSupport.getGhsAttributeNameForElement( 'p' ) ).to.equal( 'htmlPAttributes' );
		} );

		it( 'should return model attribute name for inline elements', () => {
			expect( generalHtmlSupport.getGhsAttributeNameForElement( 'a' ) ).to.equal( 'htmlA' );
			expect( generalHtmlSupport.getGhsAttributeNameForElement( 'strong' ) ).to.equal( 'htmlStrong' );
		} );
	} );
} );

describe( 'GeneralHtmlSupport - RemoveFormatCommand integration', () => {
	let editor, element, model, editingView;

	beforeEach( async () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		editor = await ClassicTestEditor.create( element, {
			plugins: [
				GeneralHtmlSupport, RemoveFormat, SelectAll,
				Paragraph, Heading, Image, ImageCaption,
				Table, TableProperties, TableCellProperties, TableColumnResize, TableCaption,
				PageBreak, CodeBlock, BlockQuote, List, ListProperties
			],
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
		} );

		model = editor.model;
		editingView = editor.editing.view;
	} );

	afterEach( async () => {
		element.remove();

		await editor.destroy();
	} );

	it( 'should remove styles and classes from paragraph', () => {
		editor.setData(
			'<p id="test" data-foo="bar" class="test-class" style="color: red;">Test</p>'
		);

		expect( editor.getData(), 'initial data' ).to.equal(
			'<p class="test-class" style="color:red;" id="test" data-foo="bar">Test</p>'
		);

		editor.execute( 'selectAll' );
		editor.execute( 'removeFormat' );

		expect( editor.getData(), 'data pipeline' ).to.equal(
			'<p id="test" data-foo="bar">Test</p>'
		);
		expect( _getViewData( editingView, { withoutSelection: true } ), 'editing view' ).to.equal(
			'<p data-foo="bar" id="test">Test</p>'
		);
	} );

	it( 'should remove styles and classes from paragraph (no attributes are set)', () => {
		editor.setData(
			'<p class="test-class" style="color: red;">Test</p>'
		);

		expect( editor.getData(), 'initial data' ).to.equal(
			'<p class="test-class" style="color:red;">Test</p>'
		);

		editor.execute( 'selectAll' );
		editor.execute( 'removeFormat' );

		expect( editor.getData(), 'data pipeline' ).to.equal(
			'<p>Test</p>'
		);
		expect( _getViewData( editingView, { withoutSelection: true } ), 'editing view' ).to.equal(
			'<p>Test</p>'
		);
	} );

	it( 'should remove styles and classes from div', () => {
		editor.setData(
			'<div id="test" data-foo="bar" class="test-class" style="color: red;">Test</div>'
		);

		expect( editor.getData(), 'initial data' ).to.equal(
			'<div class="test-class" style="color:red;" id="test" data-foo="bar">Test</div>'
		);

		editor.execute( 'selectAll' );
		editor.execute( 'removeFormat' );

		expect( editor.getData(), 'data pipeline' ).to.equal(
			'<div id="test" data-foo="bar">Test</div>'
		);
		expect( _getViewData( editingView, { withoutSelection: true } ), 'editing view' ).to.equal(
			'<div data-foo="bar" id="test">Test</div>'
		);
	} );

	it( 'should remove styles and classes from heading', () => {
		editor.setData(
			'<h2 id="test" data-foo="bar" class="test-class" style="color: red;">Test</h2>'
		);

		expect( editor.getData(), 'initial data' ).to.equal(
			'<h2 class="test-class" style="color:red;" id="test" data-foo="bar">Test</h2>'
		);

		editor.execute( 'selectAll' );
		editor.execute( 'removeFormat' );

		expect( editor.getData(), 'data pipeline' ).to.equal(
			'<h2 id="test" data-foo="bar">Test</h2>'
		);
		expect( _getViewData( editingView, { withoutSelection: true } ), 'editing view' ).to.equal(
			'<h2 data-foo="bar" id="test">Test</h2>'
		);
	} );

	it( 'should remove styles and classes from GHS heading (not builtin feature)', () => {
		editor.setData(
			'<h1 id="test" data-foo="bar" class="test-class" style="color: red;">Test</h1>'
		);

		expect( _getModelData( model, { withoutSelection: true } ) ).to.equal(
			'<htmlH1 htmlH1Attributes="{"attributes":{"id":"test","data-foo":"bar"},"styles":{"color":"red"},"classes":["test-class"]}">' +
				'Test' +
			'</htmlH1>'
		);
		expect( editor.getData(), 'initial data' ).to.equal(
			'<h1 class="test-class" style="color:red;" id="test" data-foo="bar">Test</h1>'
		);

		editor.execute( 'selectAll' );
		editor.execute( 'removeFormat' );

		expect( editor.getData(), 'data pipeline' ).to.equal(
			'<h1 id="test" data-foo="bar">Test</h1>'
		);
		expect( _getViewData( editingView, { withoutSelection: true } ), 'editing view' ).to.equal(
			'<h1 data-foo="bar" id="test">Test</h1>'
		);
	} );

	it( 'should remove styles and classes from image', () => {
		editor.setData(
			'<figure class="image foo" id="test" data-foo="bar" style="color: red;">' +
				'<img src="/sample.jpg" alt="122" class="bar" style="border-left: 2px solid blue;">' +
				'<figcaption style="background: yellow;">abc</figcaption>' +
			'</figure>'
		);

		expect( editor.getData(), 'initial data' ).to.equal(
			'<figure class="image foo" style="color:red;" id="test" data-foo="bar">' +
				'<img class="bar" style="border-left:2px solid blue;" src="/sample.jpg" alt="122">' +
				'<figcaption style="background-color:yellow;">abc</figcaption>' +
			'</figure>'
		);

		editor.execute( 'selectAll' );
		editor.execute( 'removeFormat' );

		expect( editor.getData(), 'data pipeline' ).to.equal(
			'<figure class="image" id="test" data-foo="bar">' +
				'<img src="/sample.jpg" alt="122">' +
				'<figcaption>abc</figcaption>' +
			'</figure>'
		);
		expect( _getViewData( editingView, { withoutSelection: true } ), 'editing view' ).to.equal(
			'<figure class="ck-widget ck-widget_selected image" contenteditable="false" data-foo="bar" id="test">' +
				'<img alt="122" src="/sample.jpg"></img>' +
				'<figcaption aria-label="Caption for image: 122" class="ck-editor__editable ck-editor__nested-editable" ' +
					'contenteditable="true" data-placeholder="Enter image caption" role="textbox" tabindex="-1">abc</figcaption>' +
				'<div class="ck ck-reset_all ck-widget__type-around"></div>' +
			'</figure>'
		);
	} );

	it( 'should remove styles and classes from table', () => {
		editor.setData(
			'<figure class="table foo" id="test" data-foo="bar" style="color: red;float:right;background: blue;width:60%;">' +
				'<table style="color:pink;">' +
					'<colgroup>' +
						'<col style="width: 30%; background:green;">' +
						'<col style="width: 70%">' +
					'</colgroup>' +
					'<tr>' +
						'<td style="color:yellow;">foo</td>' +
						'<td style="color:black;">bar</td>' +
					'</tr>' +
				'</table>' +
				'<figcaption style="background: yellow;">abc</figcaption>' +
			'</figure>'
		);

		expect( editor.getData(), 'initial data' ).to.equal(
			'<figure class="table foo" style="background-color:blue;color:red;float:right;width:60%;" id="test" data-foo="bar">' +
				'<table class="ck-table-resized" style="color:pink;">' +
					'<colgroup>' +
						'<col style="background-color:green;width:30%;">' +
						'<col style="width:70%;">' +
					'</colgroup>' +
					'<tbody>' +
						'<tr>' +
							'<td style="color:yellow;">foo</td>' +
							'<td style="color:black;">bar</td>' +
						'</tr>' +
					'</tbody>' +
				'</table>' +
				'<figcaption style="background-color:yellow;">abc</figcaption>' +
			'</figure>'
		);

		editor.execute( 'selectAll' );
		editor.execute( 'removeFormat' );

		expect( editor.getData(), 'data pipeline' ).to.equal(
			'<figure class="table" id="test" data-foo="bar">' +
				'<table class="ck-table-resized">' +
					'<colgroup>' +
						'<col style="width:50%;">' +
						'<col style="width:50%;">' +
					'</colgroup>' +
					'<tbody>' +
						'<tr>' +
							'<td>foo</td>' +
							'<td>bar</td>' +
						'</tr>' +
					'</tbody>' +
				'</table>' +
				'<figcaption>abc</figcaption>' +
			'</figure>'
		);
	} );

	it( 'should remove styles and classes from page-break', () => {
		editor.setData(
			'<div data-foo="bar" class="page-break abc" style="border-left: 3px solid blue; page-break-after:always;">' +
				'<span style="display:none;">&nbsp;</span>' +
			'</div>'
		);

		expect( editor.getData(), 'initial data' ).to.equal(
			'<div class="page-break abc" style="border-left:3px solid blue;page-break-after:always;" data-foo="bar">' +
				'<span style="display:none;">&nbsp;</span>' +
			'</div>'
		);

		editor.execute( 'selectAll' );
		editor.execute( 'removeFormat' );

		expect( editor.getData(), 'data pipeline' ).to.equal(
			'<div class="page-break" style="page-break-after:always;" data-foo="bar"><span style="display:none;">&nbsp;</span></div>'
		);
		expect( _getViewData( editingView, { withoutSelection: true } ), 'editing view' ).to.equal(
			'<div class="ck-widget ck-widget_selected page-break" contenteditable="false" data-foo="bar">' +
				'<span class="page-break__label"></span>' +
				'<div class="ck ck-reset_all ck-widget__type-around"></div>' +
			'</div>'
		);
	} );

	it( 'should remove styles and classes from code-block', () => {
		editor.setData(
			'<pre data-foo="bar" style="color:red"><code style="color:blue" data-bar="foo" class="language-javascript">foo</code></pre>'
		);

		expect( editor.getData(), 'initial data' ).to.equal(
			'<pre style="color:red;" data-foo="bar"><code class="language-javascript" style="color:blue;" data-bar="foo">foo</code></pre>'
		);

		editor.execute( 'selectAll' );
		editor.execute( 'removeFormat' );

		expect( editor.getData(), 'data pipeline' ).to.equal(
			'<pre data-foo="bar"><code class="language-javascript" data-bar="foo">foo</code></pre>'
		);
		expect( _getViewData( editingView, { withoutSelection: true } ), 'editing view' ).to.equal(
			'<pre data-foo="bar" data-language="JavaScript" spellcheck="false">' +
				'<code class="language-javascript" data-bar="foo">foo</code>' +
			'</pre>'
		);
	} );

	it( 'should remove styles and classes from block-quote', () => {
		editor.setData(
			'<p>a</p>' +
			'<blockquote style="background: blue" class="abc" data-foo="bar"><p>foo</p><p>bar</p></blockquote>' +
			'<p>b</p>'
		);

		expect( editor.getData(), 'initial data' ).to.equal(
			'<p>a</p>' +
			'<blockquote class="abc" style="background-color:blue;" data-foo="bar"><p>foo</p><p>bar</p></blockquote>' +
			'<p>b</p>'
		);

		editor.execute( 'selectAll' );
		editor.execute( 'removeFormat' );

		expect( editor.getData(), 'data pipeline' ).to.equal(
			'<p>a</p>' +
			'<blockquote data-foo="bar"><p>foo</p><p>bar</p></blockquote>' +
			'<p>b</p>'
		);
		expect( _getViewData( editingView, { withoutSelection: true } ), 'editing view' ).to.equal(
			'<p>a</p>' +
			'<blockquote data-foo="bar"><p>foo</p><p>bar</p></blockquote>' +
			'<p>b</p>'
		);
	} );

	it( 'should remove styles and classes from list', () => {
		stubUid();

		editor.setData(
			'<ol id="test" data-foo="bar" class="abc" style="background: red">' +
				'<li id="test1" data-bar="foo" class="123" style="background: yellow">foo</li>' +
			'</ol>'
		);

		expect( editor.getData(), 'initial data' ).to.equal(
			'<ol class="abc" style="background-color:red;" id="test" data-foo="bar">' +
				'<li class="123" style="background-color:yellow;" id="test1" data-bar="foo" data-list-item-id="a00">foo</li>' +
			'</ol>'
		);

		editor.execute( 'selectAll' );
		editor.execute( 'removeFormat' );

		expect( editor.getData(), 'data pipeline' ).to.equal(
			'<ol id="test" data-foo="bar">' +
				'<li id="test1" data-bar="foo" data-list-item-id="a00">foo</li>' +
			'</ol>'
		);
		expect( _getViewData( editingView, { withoutSelection: true } ), 'editing view' ).to.equal(
			'<ol data-foo="bar" id="test">' +
				'<li data-bar="foo" id="test1"><span class="ck-list-bogus-paragraph">foo</span></li>' +
			'</ol>'
		);
	} );

	it( 'should remove styles and classes from div container', () => {
		editor.setData(
			'<p>a</p>' +
			'<div id="test" data-foo="bar" class="abc" style="background: red">' +
				'<p id="test1" data-bar="foo" class="123" style="background: yellow">foo</p>' +
			'</div>' +
			'<p>b</p>'
		);

		expect( editor.getData(), 'initial data' ).to.equal(
			'<p>a</p>' +
			'<div class="abc" style="background-color:red;" id="test" data-foo="bar">' +
				'<p class="123" style="background-color:yellow;" id="test1" data-bar="foo">foo</p>' +
			'</div>' +
			'<p>b</p>'
		);

		editor.execute( 'selectAll' );
		editor.execute( 'removeFormat' );

		expect( editor.getData(), 'data pipeline' ).to.equal(
			'<p>a</p>' +
			'<div id="test" data-foo="bar">' +
				'<p id="test1" data-bar="foo">foo</p>' +
			'</div>' +
			'<p>b</p>'
		);
		expect( _getViewData( editingView, { withoutSelection: true } ), 'editing view' ).to.equal(
			'<p>a</p>' +
			'<div data-foo="bar" id="test">' +
				'<p data-bar="foo" id="test1">foo</p>' +
			'</div>' +
			'<p>b</p>'
		);
	} );
} );
