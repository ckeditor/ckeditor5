/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import FindAndReplaceEditing from '../src/findandreplaceediting.js';

import DecoupledEditor from '@ckeditor/ckeditor5-editor-decoupled/src/decouplededitor.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials.js';
import BoldEditing from '@ckeditor/ckeditor5-basic-styles/src/bold/boldediting.js';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view.js';
import { getData as getModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import { toWidget, viewToModelPositionOutsideModelElement } from '@ckeditor/ckeditor5-widget/src/index.js';

import FindAndReplace from '../src/findandreplace.js';

import FindCommand from '../src/findcommand.js';
import ReplaceCommand from '../src/replacecommand.js';
import ReplaceAllCommand from '../src/replaceallcommand.js';

describe( 'FindAndReplaceEditing', () => {
	const FOO_BAR_PARAGRAPH = '<p>Foo bar baz</p>';
	const TWO_FOO_BAR_PARAGRAPHS = FOO_BAR_PARAGRAPH + FOO_BAR_PARAGRAPH;

	let editor, model, root, findAndReplaceEditing;

	beforeEach( async () => {
		editor = await DecoupledEditor.create( '', {
			plugins: [ Essentials, Paragraph, BoldEditing, FindAndReplace ]
		} );

		model = editor.model;
		root = model.document.getRoot();
		findAndReplaceEditing = editor.plugins.get( 'FindAndReplaceEditing' );
	} );

	afterEach( async () => {
		await editor.destroy();
	} );

	it( 'should be named', () => {
		expect( FindAndReplaceEditing.pluginName ).to.equal( 'FindAndReplaceEditing' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( FindAndReplaceEditing.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( FindAndReplaceEditing.isPremiumPlugin ).to.be.false;
	} );

	describe( 'highlight', () => {
		it( 'when document is empty and user enters search phrase then it is highlighted', () => {
			editor.setData( '' );
			findAndReplaceEditing.find( 'Chleb' );
			editor.setData( 'Chleb' );

			expect( getSearchResultHTML() ).to.equal(
				'<p><span class="ck-find-result"><span class="ck-find-result_selected">Chleb</span></span></p>'
			);
		} );

		it( 'should properly highlight inline widgets with text content', () => {
			registerInlinePlaceholderWidget( editor );

			editor.setData(
				'<p>' +
					'<span class="placeholder">Foo Bar Foo foo</span>' +
					'<span>some text #</span>' +
				'</p>'
			);

			expect( getModelData( model ) ).to.equal(
				'<paragraph>[]<placeholder>Foo Bar Foo foo</placeholder>some text #</paragraph>'
			);

			findAndReplaceEditing.find( 'Foo' );

			expect( getSearchResultHTML() ).to.equal(
				'<p>' +
					'<span class="ck-widget placeholder" contenteditable="false">' +
						'<span class="ck-find-result"><span class="ck-find-result_selected">Foo</span></span>' +
						' Bar <span class="ck-find-result">Foo</span> <span class="ck-find-result">foo</span>' +
					'</span>' +
					'some text #' +
				'</p>'
			);
		} );

		it( 'should properly highlight text after an inline widgets with text content', () => {
			registerInlinePlaceholderWidget( editor );

			editor.setData(
				'<p>' +
					'text Foo text' +
					'<span class="placeholder">Bar Foo baz</span>' +
					'some Foo text' +
				'</p>'
			);

			expect( getModelData( model ) ).to.equal(
				'<paragraph>[]text Foo text<placeholder>Bar Foo baz</placeholder>some Foo text</paragraph>'
			);

			findAndReplaceEditing.find( 'Foo' );

			expect( getSearchResultHTML() ).to.equal(
				'<p>' +
					'text <span class="ck-find-result"><span class="ck-find-result_selected">Foo</span></span> text' +
					'<span class="ck-widget placeholder" contenteditable="false">' +
						'Bar <span class="ck-find-result">Foo</span> baz' +
					'</span>' +
					'some <span class="ck-find-result">Foo</span> text' +
				'</p>'
			);
		} );

		it( 'highlight iterates over all found words', () => {
			editor.setData( '<p>Chleb Chleb</p><p>Chleb</p>' );

			findAndReplaceEditing.find( 'Chleb' );
			expect( getSearchResultHTML() ).to.equal(
				'<p><span class="ck-find-result">' +
				'<span class="ck-find-result_selected">Chleb</span></span> <span class="ck-find-result">Chleb</span></p>' +
				'<p><span class="ck-find-result">Chleb</span></p>'
			);

			editor.execute( 'findNext' );
			expect( getSearchResultHTML() ).to.equal(
				'<p><span class="ck-find-result">Chleb</span> <span class="ck-find-result">' +
				'<span class="ck-find-result_selected">Chleb</span></span></p><p><span class="ck-find-result">Chleb</span></p>'
			);

			editor.execute( 'findNext' );
			expect( getSearchResultHTML() ).to.equal(
				'<p><span class="ck-find-result">Chleb</span> <span class="ck-find-result">Chleb</span></p>' +
				'<p><span class="ck-find-result"><span class="ck-find-result_selected">Chleb</span></span></p>'
			);
		} );

		it( 'search results are replaced in correct order', () => {
			editor.setData( '<p>Chleb Chleb</p><p>Chleb</p>' );

			findAndReplaceEditing.find( 'Chleb' );
			replace( '' );
			expect( getSearchResultHTML() ).to.equal(
				'<p> <span class="ck-find-result"><span class="ck-find-result_selected">Chleb</span></span></p><p>' +
				'<span class="ck-find-result">Chleb</span></p>'
			);

			replace( '' );
			expect( getSearchResultHTML() ).to.equal(
				'<p> </p><p><span class="ck-find-result"><span class="ck-find-result_selected">Chleb</span></span></p>'
			);

			replace( '' );
			expect( getSearchResultHTML() ).to.equal( '<p> </p><p></p>' );
		} );

		it( 'basic formatting works on highlighted search results', () => {
			editor.setData( '<p>test</p>' );

			findAndReplaceEditing.find( 'test' );
			editor.model.change( writer => {
				writer.setSelection( editor.model.document.getRoot().getChild( 0 ), 'on' );
			} );

			editor.execute( 'bold' );
			findAndReplaceEditing.find(
				'<p><span class="ck-find-result"><span class="ck-find-result_selected"><strong>test</strong></span></span></p>'
			);
		} );

		function replace( replaceText ) {
			editor.execute( 'replace', replaceText, findAndReplaceEditing.state.highlightedResult );
		}

		function getSearchResultHTML() {
			const viewData = getViewData( editor.editing.view, { withoutSelection: true, renderUIElements: false } );

			return viewData.replaceAll( /\s*data-find-result="[^"]*"/g, '' );
		}
	} );

	describe( 'downcast conversion', () => {
		it( 'should add editing downcast conversion for find results markers', () => {
			editor.setData( FOO_BAR_PARAGRAPH );

			const paragraph = root.getChild( 0 );
			addMarker( 'findResult:test-uid', paragraph, 4, 7 );

			expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal(
				'<p>Foo <span class="ck-find-result" data-find-result="test-uid">bar</span> baz</p>'
			);
		} );

		it( 'should add editing downcast conversion for find results highlight markers', () => {
			editor.setData( FOO_BAR_PARAGRAPH );

			const paragraph = root.getChild( 0 );
			addMarker( 'findResultHighlighted:test-uid', paragraph, 4, 7 );

			expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal(
				'<p>Foo <span class="ck-find-result_selected" data-find-result="test-uid">bar</span> baz</p>'
			);
		} );

		it( 'should keep rendered markers in editing view on adding new markers', () => {
			editor.setData( TWO_FOO_BAR_PARAGRAPHS );

			const secondParagraph = root.getChild( 1 );
			addMarker( 'findResult:test-uid-1', secondParagraph, 4, 7 );

			expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal(
				'<p>Foo bar baz</p><p>Foo <span class="ck-find-result" data-find-result="test-uid-1">bar</span> baz</p>'
			);

			const firstParagraph = root.getChild( 0 );
			addMarker( 'findResult:test-uid-2', firstParagraph, 4, 7 );

			expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal(
				'<p>Foo <span class="ck-find-result" data-find-result="test-uid-2">bar</span> baz</p>' +
          '<p>Foo <span class="ck-find-result" data-find-result="test-uid-1">bar</span> baz</p>'
			);
		} );

		it( 'should keep rendered markers in editing view on removing markers', () => {
			editor.setData( TWO_FOO_BAR_PARAGRAPHS );

			const firstParagraph = root.getChild( 0 );
			const secondParagraph = root.getChild( 1 );

			addMarker( 'findResult:test-uid-1', firstParagraph, 0, 3 );
			addMarker( 'findResult:test-uid-2', secondParagraph, 0, 3 );
			addMarker( 'findResult:test-uid-3', secondParagraph, 4, 7 );

			model.change( writer => {
				writer.removeMarker( 'findResult:test-uid-1' );
			} );

			expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal(
				'<p>Foo bar baz</p>' +
          '<p>' +
          '<span class="ck-find-result" data-find-result="test-uid-2">Foo</span>' +
          ' <span class="ck-find-result" data-find-result="test-uid-3">bar</span>' +
          ' baz' +
          '</p>'
			);
		} );
	} );

	describe( 'commands', () => {
		it( 'should register find command', () => {
			expect( editor.commands.get( 'find' ) ).to.be.instanceOf( FindCommand );
		} );

		it( 'should register replace command', () => {
			expect( editor.commands.get( 'replace' ) ).to.be.instanceOf( ReplaceCommand );
		} );

		it( 'should register replace all command', () => {
			expect( editor.commands.get( 'replaceAll' ) ).to.be.instanceOf( ReplaceAllCommand );
		} );
	} );

	function addMarker( name, secondParagraph, start, end ) {
		let marker = null;
		model.change( writer => {
			marker = writer.addMarker( name, {
				usingOperation: false,
				affectsData: false,
				range: writer.createRange(
					writer.createPositionAt( secondParagraph, start ),
					writer.createPositionAt( secondParagraph, end )
				)
			} );
		} );

		return marker;
	}

	function registerInlinePlaceholderWidget() {
		model.schema.register( 'placeholder', {
			inheritAllFrom: '$inlineObject',
			allowAttributes: [ 'name' ]
		} );

		model.schema.extend( '$text', { allowIn: 'placeholder' } );

		editor.editing.mapper.on(
			'viewToModelPosition',
			viewToModelPositionOutsideModelElement( model, viewElement => viewElement.hasClass( 'placeholder' ) )
		);

		editor.conversion.for( 'upcast' ).elementToElement( {
			view: {
				name: 'span',
				classes: [ 'placeholder' ]
			},
			model: ( _, { writer } ) => writer.createElement( 'placeholder' )
		} );

		editor.conversion.for( 'editingDowncast' ).elementToElement( {
			model: 'placeholder',
			view: ( _, { writer } ) => toWidget(
				writer.createContainerElement( 'span', { class: 'placeholder' } ),
				writer
			)
		} );

		editor.conversion.for( 'dataDowncast' ).elementToElement( {
			model: 'placeholder',
			view: ( _, { writer } ) => writer.createContainerElement( 'span', { class: 'placeholder' } )
		} );
	}
} );
