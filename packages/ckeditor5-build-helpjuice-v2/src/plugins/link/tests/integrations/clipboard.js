/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import LinkEditing from '../../src/linkediting';

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import TableEditing from '@ckeditor/ckeditor5-table/src/tableediting';
import ClipboardPipeline from '@ckeditor/ckeditor5-clipboard/src/clipboardpipeline';
import { getData as getModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { parse as parseView } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';

describe( 'Link integration: clipboard paste', () => {
	let editor, model;

	describe( 'when default protocol is not set', () => {
		beforeEach( () => {
			return VirtualTestEditor
				.create( {
					plugins: [ Paragraph, ClipboardPipeline, LinkEditing ]
				} )
				.then( newEditor => {
					editor = newEditor;
					model = editor.model;
				} );
		} );

		afterEach( () => {
			return editor.destroy();
		} );

		it( 'should not change a link if link has protocol', () => {
			const clipboard = editor.plugins.get( 'ClipboardPipeline' );

			clipboard.fire( 'inputTransformation', {
				content: parseView( '<a href="http://ckedtior.com">foo</a>' )
			} );

			expect( getModelData( model ) ).to.equalMarkup(
				'<paragraph><$text linkHref="http://ckedtior.com">foo</$text>[]</paragraph>'
			);
		} );

		it( 'should not change a link if link doesn\'t have protocol', () => {
			const clipboard = editor.plugins.get( 'ClipboardPipeline' );

			clipboard.fire( 'inputTransformation', {
				content: parseView( '<a href="ckedtior.com">foo</a>' )
			} );

			expect( getModelData( model ) ).to.equal(
				'<paragraph><$text linkHref="ckedtior.com">foo</$text>[]</paragraph>'
			);
		} );
	} );

	describe( 'when default protocol is set', () => {
		beforeEach( () => {
			return VirtualTestEditor
				.create( {
					plugins: [ Paragraph, ClipboardPipeline, LinkEditing, TableEditing ],
					link: {
						defaultProtocol: 'http://'
					}
				} )
				.then( newEditor => {
					editor = newEditor;
					model = editor.model;
				} );
		} );

		afterEach( () => {
			return editor.destroy();
		} );

		it( 'should not change a link if link has protocol', () => {
			const clipboard = editor.plugins.get( 'ClipboardPipeline' );

			clipboard.fire( 'inputTransformation', {
				content: parseView( '<a href="http://ckedtior.com">foo</a>' )
			} );

			expect( getModelData( model ) ).to.equalMarkup(
				'<paragraph><$text linkHref="http://ckedtior.com">foo</$text>[]</paragraph>'
			);
		} );

		it( 'should add protocol to link if link doesn\'t have protocol', () => {
			const clipboard = editor.plugins.get( 'ClipboardPipeline' );

			clipboard.fire( 'inputTransformation', {
				content: parseView( '<a href="www.ckedtior.com">foo</a>' )
			} );

			expect( getModelData( model ) ).to.equal(
				'<paragraph><$text linkHref="http://www.ckedtior.com">foo</$text>[]</paragraph>'
			);
		} );

		it( 'should add protocol to all links where it\'s possible', () => {
			const clipboard = editor.plugins.get( 'ClipboardPipeline' );

			clipboard.fire( 'inputTransformation', {
				content: parseView( '<a href="ckedtior.com">foo</a><a href="www.ckedtior.com">bar</a>' )
			} );

			expect( getModelData( model ) ).to.equal(
				'<paragraph>' +
					'<$text linkHref="http://ckedtior.com">foo</$text>' +
					'<$text linkHref="http://www.ckedtior.com">bar</$text>[]' +
				'</paragraph>'
			);
		} );

		it( 'should add protocol to link which is nested in table', () => {
			const clipboard = editor.plugins.get( 'ClipboardPipeline' );

			clipboard.fire( 'inputTransformation', {
				content: parseView(
					'<figure><table><tbody><tr><td>' +
						'<a href="ckedtior.com">foo</a>' +
					'</td></tr></tbody></table></figure>'
				)
			} );

			expect( getModelData( model ) ).to.equal(
				'[<table><tableRow><tableCell><paragraph>' +
					'<$text linkHref="http://ckedtior.com">foo</$text>' +
				'</paragraph></tableCell></tableRow></table>]'
			);
		} );

		it( 'should add protocol to multiple links which are nested in table', () => {
			const clipboard = editor.plugins.get( 'ClipboardPipeline' );

			clipboard.fire( 'inputTransformation', {
				content: parseView(
					'<table><tr><td>' +
						'<a href="ckedtior.com">foo</a>' +
					'</td>' +
					'<td>' +
						'<a href="ckedtior.com">foo</a>' +
						'<a href="ckedtior2.com">foo</a>' +
					'</td></tr></table>'
				)
			} );

			expect( getModelData( model ) ).to.equal(
				'[<table><tableRow>' +
					'<tableCell><paragraph>' +
						'<$text linkHref="http://ckedtior.com">foo</$text>' +
					'</paragraph></tableCell>' +
					'<tableCell><paragraph>' +
						'<$text linkHref="http://ckedtior.com">foo</$text>' +
						'<$text linkHref="http://ckedtior2.com">foo</$text>' +
					'</paragraph></tableCell>' +
				'</tableRow></table>]'
			);
		} );
	} );
} );

