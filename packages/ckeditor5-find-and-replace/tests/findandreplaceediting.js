/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { FindAndReplaceEditing } from '../src/findandreplaceediting.js';

import { DecoupledEditor } from '@ckeditor/ckeditor5-editor-decoupled';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { BoldEditing } from '@ckeditor/ckeditor5-basic-styles';
import { _getViewData, _getModelData, _setModelData } from '@ckeditor/ckeditor5-engine';
import { toWidget, viewToModelPositionOutsideModelElement } from '@ckeditor/ckeditor5-widget';

import { FindAndReplace } from '../src/findandreplace.js';

import { FindCommand } from '../src/findcommand.js';
import { ReplaceCommand } from '../src/replacecommand.js';
import { ReplaceAllCommand } from '../src/replaceallcommand.js';

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
		expect( FindAndReplaceEditing.pluginName ).toBe( 'FindAndReplaceEditing' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( FindAndReplaceEditing.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `true`', () => {
		expect( FindAndReplaceEditing.isPremiumPlugin ).toBe( true );
	} );

	it( 'should have `licenseFeatureCode` static flag set to `FAR`', () => {
		expect( FindAndReplaceEditing.licenseFeatureCode ).toBe( 'FAR' );
	} );

	describe( 'highlight', () => {
		it( 'when document is empty and user enters search phrase then it is highlighted', () => {
			editor.setData( '' );
			findAndReplaceEditing.find( 'Chleb' );
			editor.setData( 'Chleb' );

			expect( getSearchResultHTML() ).toBe(
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

			expect( _getModelData( model ) ).toBe(
				'<paragraph>[]<placeholder>Foo Bar Foo foo</placeholder>some text #</paragraph>'
			);

			findAndReplaceEditing.find( 'Foo' );

			expect( getSearchResultHTML() ).toBe(
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

			expect( _getModelData( model ) ).toBe(
				'<paragraph>[]text Foo text<placeholder>Bar Foo baz</placeholder>some Foo text</paragraph>'
			);

			findAndReplaceEditing.find( 'Foo' );

			expect( getSearchResultHTML() ).toBe(
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
			expect( getSearchResultHTML() ).toBe(
				'<p><span class="ck-find-result">' +
				'<span class="ck-find-result_selected">Chleb</span></span> <span class="ck-find-result">Chleb</span></p>' +
				'<p><span class="ck-find-result">Chleb</span></p>'
			);

			editor.execute( 'findNext' );
			expect( getSearchResultHTML() ).toBe(
				'<p><span class="ck-find-result">Chleb</span> <span class="ck-find-result">' +
				'<span class="ck-find-result_selected">Chleb</span></span></p><p><span class="ck-find-result">Chleb</span></p>'
			);

			editor.execute( 'findNext' );
			expect( getSearchResultHTML() ).toBe(
				'<p><span class="ck-find-result">Chleb</span> <span class="ck-find-result">Chleb</span></p>' +
				'<p><span class="ck-find-result"><span class="ck-find-result_selected">Chleb</span></span></p>'
			);
		} );

		it( 'search results are replaced in correct order', () => {
			editor.setData( '<p>Chleb Chleb</p><p>Chleb</p>' );

			findAndReplaceEditing.find( 'Chleb' );
			replace( '' );
			expect( getSearchResultHTML() ).toBe(
				'<p> <span class="ck-find-result"><span class="ck-find-result_selected">Chleb</span></span></p><p>' +
				'<span class="ck-find-result">Chleb</span></p>'
			);

			replace( '' );
			expect( getSearchResultHTML() ).toBe(
				'<p> </p><p><span class="ck-find-result"><span class="ck-find-result_selected">Chleb</span></span></p>'
			);

			replace( '' );
			expect( getSearchResultHTML() ).toBe( '<p> </p><p></p>' );
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
			const viewData = _getViewData( editor.editing.view, { withoutSelection: true, renderUIElements: false } );

			return viewData.replaceAll( /\s*data-find-result="[^"]*"/g, '' );
		}
	} );

	describe( 'find (marker collaboration edge cases)', () => {
		it( 'should not create duplicate results when an external marker covers already-found content', () => {
			_setModelData( model, '<paragraph>foo bar foo</paragraph>' );

			const findAndReplaceEditing = editor.plugins.get( 'FindAndReplaceEditing' );
			findAndReplaceEditing.find( 'foo' );

			expect( findAndReplaceEditing.state.results.length ).toBe( 2 );

			model.change( writer => {
				writer.addMarker( 'external:1', {
					usingOperation: true,
					affectsData: true,
					range: model.createRangeIn( model.document.getRoot().getChild( 0 ) )
				} );
			} );

			expect( findAndReplaceEditing.state.results.length ).toBe( 2 );
		} );

		it( 'should pick up matches inside a range introduced by an external marker', () => {
			_setModelData( model, '<paragraph>bar</paragraph><paragraph>foo</paragraph>' );

			const findAndReplaceEditing = editor.plugins.get( 'FindAndReplaceEditing' );
			findAndReplaceEditing.find( 'foo' );

			// Simulate results being absent for paragraph 2 (e.g. cleared by a collaborator).
			[ ...findAndReplaceEditing.state.results ].forEach( r => {
				findAndReplaceEditing.state.results.remove( r );
			} );

			expect( findAndReplaceEditing.state.results.length ).toBe( 0 );

			// External marker added over paragraph 2 — triggers changedMarkers path only.
			model.change( writer => {
				writer.addMarker( 'external:1', {
					usingOperation: true,
					affectsData: true,
					range: writer.createRangeOn( model.document.getRoot().getChild( 1 ) )
				} );
			} );

			expect( findAndReplaceEditing.state.results.length ).toBe( 1 );
		} );
	} );

	describe( 'downcast conversion', () => {
		it( 'should add editing downcast conversion for find results markers', () => {
			editor.setData( FOO_BAR_PARAGRAPH );

			const paragraph = root.getChild( 0 );
			addMarker( 'findResult:test-uid', paragraph, 4, 7 );

			expect( _getViewData( editor.editing.view, { withoutSelection: true } ) ).toBe(
				'<p>Foo <span class="ck-find-result" data-find-result="test-uid">bar</span> baz</p>'
			);
		} );

		it( 'should add editing downcast conversion for find results highlight markers', () => {
			editor.setData( FOO_BAR_PARAGRAPH );

			const paragraph = root.getChild( 0 );
			addMarker( 'findResultHighlighted:test-uid', paragraph, 4, 7 );

			expect( _getViewData( editor.editing.view, { withoutSelection: true } ) ).toBe(
				'<p>Foo <span class="ck-find-result_selected" data-find-result="test-uid">bar</span> baz</p>'
			);
		} );

		it( 'should keep rendered markers in editing view on adding new markers', () => {
			editor.setData( TWO_FOO_BAR_PARAGRAPHS );

			const secondParagraph = root.getChild( 1 );
			addMarker( 'findResult:test-uid-1', secondParagraph, 4, 7 );

			expect( _getViewData( editor.editing.view, { withoutSelection: true } ) ).toBe(
				'<p>Foo bar baz</p><p>Foo <span class="ck-find-result" data-find-result="test-uid-1">bar</span> baz</p>'
			);

			const firstParagraph = root.getChild( 0 );
			addMarker( 'findResult:test-uid-2', firstParagraph, 4, 7 );

			expect( _getViewData( editor.editing.view, { withoutSelection: true } ) ).toBe(
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

			expect( _getViewData( editor.editing.view, { withoutSelection: true } ) ).toBe(
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
			expect( editor.commands.get( 'find' ) ).toBeInstanceOf( FindCommand );
		} );

		it( 'should register replace command', () => {
			expect( editor.commands.get( 'replace' ) ).toBeInstanceOf( ReplaceCommand );
		} );

		it( 'should register replace all command', () => {
			expect( editor.commands.get( 'replaceAll' ) ).toBeInstanceOf( ReplaceAllCommand );
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
