/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Paragraph from '../src/paragraph';
import Clipboard from '@ckeditor/ckeditor5-clipboard/src/clipboard';
import UndoEngine from '@ckeditor/ckeditor5-undo/src/undoengine';
import HeadingEngine from '@ckeditor/ckeditor5-heading/src/headingengine';
import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import {
	getData as getModelData,
	setData as setModelData
} from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { parse as parseView } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';

describe( 'Paragraph feature – integration', () => {
	describe( 'with clipboard', () => {
		it( 'pastes h1+h2+p as p+p+p when heading feature is not present', () => {
			return VirtualTestEditor
				.create( { plugins: [ Paragraph, Clipboard ] } )
				.then( newEditor => {
					const editor = newEditor;
					const doc = editor.document;
					const clipboard = editor.plugins.get( 'Clipboard' );

					setModelData( doc, '<paragraph>[]</paragraph>' );

					clipboard.fire( 'inputTransformation', {
						content: parseView( '<h1>foo</h1><h2>bar</h2><p>bom</p>' )
					} );

					expect( getModelData( doc ) ).to.equal(
						'<paragraph>foo</paragraph><paragraph>bar</paragraph><paragraph>bom[]</paragraph>'
					);
				} );
		} );

		// Explainer: the heading feature is configured to handle h2-h4 elements, so h1 has no handler.
		it( 'pastes h1+h2+p as p+h2+p when heading feature is present', () => {
			return VirtualTestEditor
				.create( { plugins: [ Paragraph, Clipboard, HeadingEngine ] } )
				.then( newEditor => {
					const editor = newEditor;
					const doc = editor.document;
					const clipboard = editor.plugins.get( 'Clipboard' );

					setModelData( doc, '<paragraph>[]</paragraph>' );

					clipboard.fire( 'inputTransformation', {
						content: parseView( '<h1>foo</h1><h2>bar</h2><p>bom</p>' )
					} );

					expect( getModelData( doc ) ).to.equal(
						'<paragraph>foo</paragraph><heading1>bar</heading1><paragraph>bom[]</paragraph>'
					);
				} );
		} );

		it( 'pastes ul>li+li as p+p when list feature is not present', () => {
			return VirtualTestEditor
				.create( { plugins: [ Paragraph, Clipboard ] } )
				.then( newEditor => {
					const editor = newEditor;
					const doc = editor.document;
					const clipboard = editor.plugins.get( 'Clipboard' );

					setModelData( doc, '<paragraph>[]</paragraph>' );

					clipboard.fire( 'inputTransformation', {
						content: parseView( '<ul><li>foo</li><li>bar</li></ul>' )
					} );

					expect( getModelData( doc ) ).to.equal( '<paragraph>foo</paragraph><paragraph>bar[]</paragraph>' );
				} );
		} );

		// Check whether the paragraph feature doesn't breaking pasting such content by trying to
		// handle the li element.
		it( 'pastes ul>li>h2+h3+p as h2+h3+p when heading feature is present', () => {
			return VirtualTestEditor
				.create( { plugins: [ Paragraph, Clipboard, HeadingEngine ] } )
				.then( newEditor => {
					const editor = newEditor;
					const doc = editor.document;
					const clipboard = editor.plugins.get( 'Clipboard' );

					setModelData( doc, '<paragraph>[]</paragraph>' );

					clipboard.fire( 'inputTransformation', {
						content: parseView( '<ul><li>x</li><li><h2>foo</h2><h3>bar</h3><p>bom</p></li><li>x</li></ul>' )
					} );

					expect( getModelData( doc ) ).to.equal(
						'<paragraph>x</paragraph>' +
						'<heading1>foo</heading1><heading2>bar</heading2><paragraph>bom</paragraph>' +
						'<paragraph>x[]</paragraph>'
					);
				} );
		} );

		// See 'should convert ul>li>ul>li+li (in clipboard holder)' in clipboard.js.
		it( 'pastes ul>li>ul>li+li', () => {
			return VirtualTestEditor
				.create( { plugins: [ Paragraph, Clipboard ] } )
				.then( newEditor => {
					const editor = newEditor;
					const doc = editor.document;
					const clipboard = editor.plugins.get( 'Clipboard' );

					setModelData( doc, '<paragraph>[]</paragraph>' );

					clipboard.fire( 'inputTransformation', {
						content: parseView( '<ul><li>a<ul><li>b</li><li>c</li></ul></li></ul>' )
					} );

					expect( getModelData( doc ) ).to.equal(
						'<paragraph>a</paragraph>' +
						'<paragraph>b</paragraph>' +
						'<paragraph>c[]</paragraph>'
					);
				} );
		} );

		// See 'should convert ul>li>p,text (in clipboard holder)' in clipboard.js.
		it( 'pastes ul>li>p,text', () => {
			return VirtualTestEditor
				.create( { plugins: [ Paragraph, Clipboard ] } )
				.then( newEditor => {
					const editor = newEditor;
					const doc = editor.document;
					const clipboard = editor.plugins.get( 'Clipboard' );

					setModelData( doc, '<paragraph>[]</paragraph>' );

					clipboard.fire( 'inputTransformation', {
						content: parseView( '<ul><li><p>a</p>b</li></ul>' )
					} );

					expect( getModelData( doc ) ).to.equal(
						'<paragraph>a</paragraph>' +
						'<paragraph>b[]</paragraph>'
					);
				} );
		} );
	} );

	describe( 'with undo', () => {
		it( 'fixing empty roots should be transparent to undo', () => {
			return VirtualTestEditor
				.create( { plugins: [ Paragraph, UndoEngine ] } )
				.then( newEditor => {
					const editor = newEditor;
					const doc = editor.document;
					const root = doc.getRoot();

					expect( editor.getData() ).to.equal( '<p>&nbsp;</p>' );
					expect( editor.commands.get( 'undo' ).isEnabled ).to.be.false;

					editor.setData( '<p>Foobar.</p>' );

					doc.enqueueChanges( () => {
						doc.batch().remove( root.getChild( 0 ) );
					} );

					expect( editor.getData() ).to.equal( '<p>&nbsp;</p>' );

					editor.execute( 'undo' );

					expect( editor.getData() ).to.equal( '<p>Foobar.</p>' );

					editor.execute( 'redo' );

					expect( editor.getData() ).to.equal( '<p>&nbsp;</p>' );

					editor.execute( 'undo' );

					expect( editor.getData() ).to.equal( '<p>Foobar.</p>' );
				} );
		} );

		it( 'fixing empty roots should be transparent to undo - multiple roots', () => {
			return VirtualTestEditor
				.create( { plugins: [ Paragraph, UndoEngine ] } )
				.then( newEditor => {
					const editor = newEditor;
					const doc = editor.document;
					const root = doc.getRoot();
					const otherRoot = doc.createRoot( '$root', 'otherRoot' );
					editor.editing.createRoot( 'div', 'otherRoot' );

					editor.data.set( '<p>Foobar.</p>', 'main' );
					editor.data.set( '<p>Foobar.</p>', 'otherRoot' );

					doc.enqueueChanges( () => {
						doc.batch().remove( root.getChild( 0 ) );
						doc.batch().remove( otherRoot.getChild( 0 ) );
					} );

					expect( editor.data.get( 'main' ) ).to.equal( '<p>&nbsp;</p>' );
					expect( editor.data.get( 'otherRoot' ) ).to.equal( '<p>&nbsp;</p>' );

					editor.execute( 'undo' );

					expect( editor.data.get( 'main' ) ).to.equal( '<p>&nbsp;</p>' );
					expect( editor.data.get( 'otherRoot' ) ).to.equal( '<p>Foobar.</p>' );

					editor.execute( 'undo' );

					expect( editor.data.get( 'main' ) ).to.equal( '<p>Foobar.</p>' );
					expect( editor.data.get( 'otherRoot' ) ).to.equal( '<p>Foobar.</p>' );
				} );
		} );
	} );
} );
