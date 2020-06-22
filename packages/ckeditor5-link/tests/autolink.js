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
	it( 'should be named', () => {
		expect( AutoLink.pluginName ).to.equal( 'AutoLink' );
	} );

	describe( 'auto link behavior', () => {
		let editor, model;

		beforeEach( async () => {
			editor = await ModelTestEditor.create( {
				plugins: [ Paragraph, Input, LinkEditing, AutoLink, UndoEditing, Enter, ShiftEnter ]
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

		it( 'can undo auto-linking (after space)', () => {
			simulateTyping( 'https://www.cksource.com ' );

			editor.commands.execute( 'undo' );

			expect( getData( model ) ).to.equal(
				'<paragraph>https://www.cksource.com []</paragraph>'
			);
		} );

		it( 'can undo auto-linking (after <softBreak>)', () => {
			setData( model, '<paragraph>https://www.cksource.com[]</paragraph>' );

			editor.execute( 'shiftEnter' );

			editor.commands.execute( 'undo' );

			expect( getData( model ) ).to.equal(
				'<paragraph>https://www.cksource.com<softBreak></softBreak>[]</paragraph>'
			);
		} );

		it( 'can undo auto-linking (after enter)', () => {
			setData( model, '<paragraph>https://www.cksource.com[]</paragraph>' );

			editor.execute( 'enter' );

			editor.commands.execute( 'undo' );

			expect( getData( model ) ).to.equal(
				'<paragraph>https://www.cksource.com</paragraph>' +
				'<paragraph>[]</paragraph>'
			);
		} );

		function simulateTyping( text ) {
			const letters = text.split( '' );

			for ( const letter of letters ) {
				editor.execute( 'input', { text: letter } );
			}
		}
	} );
} );
