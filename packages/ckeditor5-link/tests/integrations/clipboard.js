/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import TableEditing from '@ckeditor/ckeditor5-table/src/tableediting';
import { getData as getModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import LinkEditing from '../../src/linkediting';
import ClipboardPipeline from '@ckeditor/ckeditor5-clipboard/src/clipboardpipeline';
import { parse as parseView } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';

describe( 'Link integration: clipboard paste', () => {
	let editor, model;

	beforeEach( () => {
		return VirtualTestEditor
			.create( {
				plugins: [ Paragraph, ClipboardPipeline, LinkEditing, TableEditing ]
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
			} );
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	it( 'should not change a link if link has protocol and defaultProtocol is not set', () => {
		const clipboard = editor.plugins.get( 'ClipboardPipeline' );

		clipboard.fire( 'inputTransformation', {
			content: parseView( '<a href="http://ckedtior.com">foo</a>' )
		} );

		expect( getModelData( model ) ).to.equalMarkup(
			'<paragraph><$text linkHref="http://ckedtior.com">foo</$text>[]</paragraph>'
		);
	} );

	it( 'should not change a link if link has protocol and defaultProtocol is set', () => {
		editor.config.set( 'link.defaultProtocol', 'http://' );

		const clipboard = editor.plugins.get( 'ClipboardPipeline' );

		clipboard.fire( 'inputTransformation', {
			content: parseView( '<a href="http://ckedtior.com">foo</a>' )
		} );

		expect( getModelData( model ) ).to.equalMarkup(
			'<paragraph><$text linkHref="http://ckedtior.com">foo</$text>[]</paragraph>'
		);
	} );

	it( 'should not change a link if link doesn\'t have protocol and defaultProtocol is not set', () => {
		const clipboard = editor.plugins.get( 'ClipboardPipeline' );

		clipboard.fire( 'inputTransformation', {
			content: parseView( '<a href="ckedtior.com">foo</a>' )
		} );

		expect( getModelData( model ) ).to.equal(
			'<paragraph><$text linkHref="ckedtior.com">foo</$text>[]</paragraph>'
		);
	} );

	it( 'should add protocol to link if link doesn\'t have protocol and defaultProtocol is set', () => {
		editor.config.set( 'link.defaultProtocol', 'http://' );
		const clipboard = editor.plugins.get( 'ClipboardPipeline' );

		clipboard.fire( 'inputTransformation', {
			content: parseView( '<a href="www.ckedtior.com">foo</a>' )
		} );

		expect( getModelData( model ) ).to.equal(
			'<paragraph><$text linkHref="http://www.ckedtior.com">foo</$text>[]</paragraph>'
		);
	} );

	it( 'should add protocol to all links where it\'s possible', () => {
		editor.config.set( 'link.defaultProtocol', 'http://' );

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
		editor.config.set( 'link.defaultProtocol', 'http://' );

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
		editor.config.set( 'link.defaultProtocol', 'http://' );

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

