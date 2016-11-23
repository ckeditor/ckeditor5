/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Autoformat from 'ckeditor5/autoformat/autoformat.js';
import Paragraph from 'ckeditor5/paragraph/paragraph.js';
import VirtualTestEditor from 'tests/core/_utils/virtualtesteditor.js';
import Enter from 'ckeditor5/enter/enter.js';
import { setData, getData } from 'ckeditor5/engine/dev-utils/model.js';
import testUtils from 'tests/core/_utils/utils.js';

testUtils.createSinonSandbox();

describe( 'Autoformat', () => {
	let editor, doc, batch;

	beforeEach( () => {
		return VirtualTestEditor.create( {
			plugins: [ Enter, Paragraph, Autoformat ]
		} )
		.then( newEditor => {
			editor = newEditor;
			doc = editor.document;
			batch = doc.batch();
		} );
	} );

	describe( 'Bulleted list', () => {
		it( 'should replace asterisk with bulleted list item', () => {
			setData( doc, '<paragraph>*[]</paragraph>' );
			doc.enqueueChanges( () => {
				batch.insert( doc.selection.getFirstPosition(), ' ' );
			} );

			expect( getData( doc ) ).to.equal( '<listItem indent="0" type="bulleted">[]</listItem>' );
		} );

		it( 'should replace minus character with bulleted list item', () => {
			setData( doc, '<paragraph>-[]</paragraph>' );
			doc.enqueueChanges( () => {
				batch.insert( doc.selection.getFirstPosition(), ' ' );
			} );

			expect( getData( doc ) ).to.equal( '<listItem indent="0" type="bulleted">[]</listItem>' );
		} );

		it( 'should not replace minus character when inside bulleted list item', () => {
			setData( doc, '<listItem indent="0" type="bulleted">-[]</listItem>' );
			doc.enqueueChanges( () => {
				batch.insert( doc.selection.getFirstPosition(), ' ' );
			} );

			expect( getData( doc ) ).to.equal( '<listItem indent="0" type="bulleted">- []</listItem>' );
		} );
	} );

	describe( 'Numbered list', () => {
		it( 'should replace digit with numbered list item', () => {
			setData( doc, '<paragraph>1.[]</paragraph>' );
			doc.enqueueChanges( () => {
				batch.insert( doc.selection.getFirstPosition(), ' ' );
			} );

			expect( getData( doc ) ).to.equal( '<listItem indent="0" type="numbered">[]</listItem>' );
		} );

		it( 'should not replace digit character when inside numbered list item', () => {
			setData( doc, '<listItem indent="0" type="numbered">1.[]</listItem>' );
			doc.enqueueChanges( () => {
				batch.insert( doc.selection.getFirstPosition(), ' ' );
			} );

			expect( getData( doc ) ).to.equal( '<listItem indent="0" type="numbered">1. []</listItem>' );
		} );
	} );

	describe( 'Heading', () => {
		it( 'should replace hash character with heading', () => {
			setData( doc, '<paragraph>#[]</paragraph>' );
			doc.enqueueChanges( () => {
				batch.insert( doc.selection.getFirstPosition(), ' ' );
			} );

			expect( getData( doc ) ).to.equal( '<heading1>[]</heading1>' );
		} );

		it( 'should replace two hash characters with heading level 2', () => {
			setData( doc, '<paragraph>##[]</paragraph>' );
			doc.enqueueChanges( () => {
				batch.insert( doc.selection.getFirstPosition(), ' ' );
			} );

			expect( getData( doc ) ).to.equal( '<heading2>[]</heading2>' );
		} );

		it( 'should not replace minus character when inside heading', () => {
			setData( doc, '<heading1>#[]</heading1>' );
			doc.enqueueChanges( () => {
				batch.insert( doc.selection.getFirstPosition(), ' ' );
			} );

			expect( getData( doc ) ).to.equal( '<heading1># []</heading1>' );
		} );
	} );

	describe( 'Inline autoformat', () => {
		it( 'should replace both `**` with bold', () => {
			setData( doc, '<paragraph>**foobar*[]</paragraph>' );
			doc.enqueueChanges( () => {
				batch.insert( doc.selection.getFirstPosition(), '*' );
			} );

			expect( getData( doc ) ).to.equal( '<paragraph><$text bold="true">foobar</$text>[]</paragraph>' );
		} );

		it( 'should replace both `*` with italic', () => {
			setData( doc, '<paragraph>*foobar[]</paragraph>' );
			doc.enqueueChanges( () => {
				batch.insert( doc.selection.getFirstPosition(), '*' );
			} );

			expect( getData( doc ) ).to.equal( '<paragraph><$text italic="true">foobar</$text>[]</paragraph>' );
		} );

		it( 'nothing should be replaces when typing `*`', () => {
			setData( doc, '<paragraph>foobar[]</paragraph>' );
			doc.enqueueChanges( () => {
				batch.insert( doc.selection.getFirstPosition(), '*' );
			} );

			expect( getData( doc ) ).to.equal( '<paragraph>foobar*[]</paragraph>' );
		} );

		it( 'should format inside the text', () => {
			setData( doc, '<paragraph>foo **bar*[] baz</paragraph>' );
			doc.enqueueChanges( () => {
				batch.insert( doc.selection.getFirstPosition(), '*' );
			} );

			expect( getData( doc ) ).to.equal( '<paragraph>foo <$text bold="true">bar</$text>[] baz</paragraph>' );
		} );
	} );
} );
