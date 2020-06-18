/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor';
import Input from '@ckeditor/ckeditor5-typing/src/input';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import { getData, setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

import LinkEditing from '../src/linkediting';
import AutoLink from '../src/autolink';
import UndoEditing from '@ckeditor/ckeditor5-undo/src/undoediting';

describe( 'AutoLink', () => {
	it( 'should be named', () => {
		expect( AutoLink.pluginName ).to.equal( 'AutoLink' );
	} );

	describe( 'auto link behavior', () => {
		let editor, model;

		beforeEach( async () => {
			editor = await ModelTestEditor.create( { plugins: [ Paragraph, Input, LinkEditing, AutoLink, UndoEditing ] } );

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

		it( 'can undo auto-linking', () => {
			simulateTyping( 'https://www.cksource.com ' );

			editor.commands.execute( 'undo' );

			expect( getData( model ) ).to.equal(
				'<paragraph>https://www.cksource.com []</paragraph>'
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
