/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import { getData as getModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import LinkEditing from '../../src/linkediting';
import AutoLink from '../../src/autolink';
import ClipboardPipeline from '@ckeditor/ckeditor5-clipboard/src/clipboardpipeline';
import { parse as parseView } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';

describe( 'Pasted link', () => {
	let editor, model;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		return VirtualTestEditor
			.create( {
				plugins: [ Paragraph, ClipboardPipeline, LinkEditing, AutoLink ]
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
			} );
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	it( 'should not change if has protocol and defaultProtocol is not set', () => {
		const clipboard = editor.plugins.get( 'ClipboardPipeline' );

		clipboard.fire( 'inputTransformation', {
			content: parseView( '<a href="http://ckedtior.com">foo</a>' )
		} );

		expect( getModelData( model ) ).to.equalMarkup(
			'<paragraph><$text linkHref="http://ckedtior.com">foo</$text>[]</paragraph>'
		);
	} );

	it( 'should not change if has protocol and defaultProtocol is set', () => {
		editor.config.set( 'link.defaultProtocol', 'http://' );

		const clipboard = editor.plugins.get( 'ClipboardPipeline' );

		clipboard.fire( 'inputTransformation', {
			content: parseView( '<a href="http://ckedtior.com">foo</a>' )
		} );

		expect( getModelData( model ) ).to.equalMarkup(
			'<paragraph><$text linkHref="http://ckedtior.com">foo</$text>[]</paragraph>'
		);
	} );

	it( 'should not change if doesn\'t have protocol and defaultProtocol is not set', () => {
		const clipboard = editor.plugins.get( 'ClipboardPipeline' );

		clipboard.fire( 'inputTransformation', {
			content: parseView( '<a href="ckedtior.com">foo</a>' )
		} );

		expect( getModelData( model ) ).to.equal(
			'<paragraph><$text linkHref="ckedtior.com">foo</$text>[]</paragraph>'
		);
	} );

	it( 'should have protocol added doesn\'t have protocol and defaultProtocol is set', () => {
		const clipboard = editor.plugins.get( 'ClipboardPipeline' );

		clipboard.fire( 'inputTransformation', {
			content: parseView( '<a href="www.ckedtior.com">foo</a>' )
		} );

		expect( getModelData( model ) ).to.equal(
			'<paragraph><$text linkHref="www.ckedtior.com">foo</$text>[]</paragraph>'
		);
	} );

	it( 'should have protocol added if multiple links are pasted', () => {
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
} );

