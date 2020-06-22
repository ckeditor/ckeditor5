/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor';
import Enter from '@ckeditor/ckeditor5-enter/src/enter';
import Input from '@ckeditor/ckeditor5-typing/src/input';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import ShiftEnter from '@ckeditor/ckeditor5-enter/src/shiftenter';
import UndoEditing from '@ckeditor/ckeditor5-undo/src/undoediting';
import { getData, setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

import LinkEditing from '../src/linkediting';
import AutoLink from '../src/autolink';

describe( 'AutoLink', () => {
	let editor;

	it( 'should be named', () => {
		expect( AutoLink.pluginName ).to.equal( 'AutoLink' );
	} );

	describe( 'auto link behavior', () => {
		let model;

		beforeEach( async () => {
			editor = await ModelTestEditor.create( {
				plugins: [ Paragraph, Input, LinkEditing, AutoLink, Enter, ShiftEnter ]
			} );

			model = editor.model;

			setData( model, '<paragraph>[]</paragraph>' );
		} );

		it( 'does not add linkHref attribute to a text link while typing', () => {
			simulateTyping( 'https://www.cksource.com' );

			expect( getData( model ) ).to.equal(
				'<paragraph>https://www.cksource.com[]</paragraph>'
			);
		} );

		it( 'adds linkHref attribute to a text link after space', () => {
			simulateTyping( 'https://www.cksource.com ' );

			expect( getData( model ) ).to.equal(
				'<paragraph><$text linkHref="https://www.cksource.com">https://www.cksource.com</$text> []</paragraph>'
			);
		} );

		it( 'adds linkHref attribute to a text link after space (inside paragraph)', () => {
			setData( model, '<paragraph>Foo Bar [] Baz</paragraph>' );

			simulateTyping( 'https://www.cksource.com ' );

			expect( getData( model ) ).to.equal(
				'<paragraph>Foo Bar <$text linkHref="https://www.cksource.com">https://www.cksource.com</$text> [] Baz</paragraph>'
			);
		} );

		it( 'adds linkHref attribute to a text link after a soft break', () => {
			setData( model, '<paragraph>https://www.cksource.com[]</paragraph>' );

			editor.execute( 'shiftEnter' );

			// TODO: should test with selection but master has a bug. See: https://github.com/ckeditor/ckeditor5/issues/7459.
			expect( getData( model, { withoutSelection: true } ) ).to.equal(
				'<paragraph>' +
					'<$text linkHref="https://www.cksource.com">https://www.cksource.com</$text>' +
					'<softBreak></softBreak>' +
				'</paragraph>'
			);
		} );

		it( 'does not add linkHref attribute to a text link after double soft break', () => {
			setData( model, '<paragraph>https://www.cksource.com<softBreak></softBreak>[]</paragraph>' );

			editor.execute( 'shiftEnter' );

			expect( getData( model ) ).to.equal(
				'<paragraph>https://www.cksource.com<softBreak></softBreak><softBreak></softBreak>[]</paragraph>'
			);
		} );

		it( 'adds linkHref attribute to a text link on enter', () => {
			setData( model, '<paragraph>https://www.cksource.com[]</paragraph>' );

			editor.execute( 'enter' );

			expect( getData( model ) ).to.equal(
				'<paragraph>' +
					'<$text linkHref="https://www.cksource.com">https://www.cksource.com</$text>' +
				'</paragraph>' +
				'<paragraph>[]</paragraph>'
			);
		} );

		it( 'adds "mailto://" to link of detected email addresses', () => {
			simulateTyping( 'newsletter@cksource.com ' );

			expect( getData( model ) ).to.equal(
				'<paragraph><$text linkHref="mailto://newsletter@cksource.com">newsletter@cksource.com</$text> []</paragraph>'
			);
		} );

		const supportedURLs = [
			'http://cksource.com',
			'https://cksource.com',
			'http://www.cksource.com',
			'hTtP://WwW.cKsOuRcE.cOm',
			'http://foo.bar.cksource.com',
			'http://www.cksource.com/some/path/index.html#abc',
			'http://www.cksource.com/some/path/index.html?foo=bar',
			'http://www.cksource.com/some/path/index.html?foo=bar#abc',
			'http://localhost',
			'ftp://cksource.com',
			'mailto://cksource@cksource.com',
			'www.cksource.com',
			'cksource.com'
		];

		const unsupportedURLs = [
			'http://www.cksource.com/some/path/index.html#abc?foo=bar', // Wrong #? sequence.
			'http:/cksource.com'
		];

		for ( const supportedURL of supportedURLs ) {
			it( `should detect "${ supportedURL }" as a valid URL`, () => {
				simulateTyping( supportedURL + ' ' );

				expect( getData( model ) ).to.equal(
					`<paragraph><$text linkHref="${ supportedURL }">${ supportedURL }</$text> []</paragraph>` );
			} );
		}

		for ( const unsupportedURL of unsupportedURLs ) {
			it( `should not detect "${ unsupportedURL }" as a valid URL`, () => {
				simulateTyping( unsupportedURL + ' ' );

				expect( getData( model ) ).to.equal(
					`<paragraph>${ unsupportedURL } []</paragraph>` );
			} );
		}
	} );

	describe( 'Undo integration', () => {
		let model;

		beforeEach( async () => {
			editor = await ModelTestEditor.create( {
				plugins: [ Paragraph, Input, LinkEditing, AutoLink, UndoEditing, Enter, ShiftEnter ]
			} );

			model = editor.model;

			setData( model, '<paragraph>https://www.cksource.com[]</paragraph>' );
		} );

		it( 'should undo auto-linking (after space)', () => {
			simulateTyping( ' ' );

			editor.commands.execute( 'undo' );

			expect( getData( model ) ).to.equal(
				'<paragraph>https://www.cksource.com []</paragraph>'
			);
		} );

		it( 'should undo auto-linking (after <softBreak>)', () => {
			editor.execute( 'shiftEnter' );

			editor.commands.execute( 'undo' );

			expect( getData( model ) ).to.equal(
				'<paragraph>https://www.cksource.com<softBreak></softBreak>[]</paragraph>'
			);
		} );

		it( 'should undo auto-linking (after enter)', () => {
			editor.execute( 'enter' );

			editor.commands.execute( 'undo' );

			expect( getData( model ) ).to.equal(
				'<paragraph>https://www.cksource.com</paragraph>' +
				'<paragraph>[]</paragraph>'
			);
		} );
	} );

	function simulateTyping( text ) {
		const letters = text.split( '' );

		for ( const letter of letters ) {
			editor.execute( 'input', { text: letter } );
		}
	}
} );
