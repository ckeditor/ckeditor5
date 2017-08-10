/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global document */

import BlockQuote from '../src/blockquote';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Image from '@ckeditor/ckeditor5-image/src/image';
import ImageCaption from '@ckeditor/ckeditor5-image/src/imagecaption';
import List from '@ckeditor/ckeditor5-list/src/list';
import Enter from '@ckeditor/ckeditor5-enter/src/enter';
import Delete from '@ckeditor/ckeditor5-typing/src/delete';

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

describe( 'BlockQuote', () => {
	let editor, doc, element;

	beforeEach( () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		return ClassicTestEditor
			.create( element, {
				plugins: [ BlockQuote, Paragraph, Image, ImageCaption, List, Enter, Delete ]
			} )
			.then( newEditor => {
				editor = newEditor;
				doc = editor.document;
			} );
	} );

	afterEach( () => {
		element.remove();

		return editor.destroy();
	} );

	describe( 'enter key support', () => {
		function fakeEventData() {
			return {
				preventDefault: sinon.spy()
			};
		}

		it( 'does nothing if selection is in an empty block but not in a block quote', () => {
			const data = fakeEventData();
			const execSpy = sinon.spy( editor, 'execute' );

			setModelData( doc, '<paragraph>x</paragraph><paragraph>[]</paragraph><paragraph>x</paragraph>' );

			editor.editing.view.fire( 'enter', data );

			// Only enter command should be executed.
			expect( data.preventDefault.called ).to.be.true;
			expect( execSpy.calledOnce ).to.be.true;
			expect( execSpy.args[ 0 ][ 0 ] ).to.equal( 'enter' );
		} );

		it( 'does nothing if selection is in a non-empty block (at the end) in a block quote', () => {
			const data = fakeEventData();
			const execSpy = sinon.spy( editor, 'execute' );

			setModelData( doc, '<blockQuote><paragraph>xx[]</paragraph></blockQuote>' );

			editor.editing.view.fire( 'enter', data );

			// Only enter command should be executed.
			expect( data.preventDefault.called ).to.be.true;
			expect( execSpy.calledOnce ).to.be.true;
			expect( execSpy.args[ 0 ][ 0 ] ).to.equal( 'enter' );
		} );

		it( 'does nothing if selection is in a non-empty block (at the beginning) in a block quote', () => {
			const data = fakeEventData();
			const execSpy = sinon.spy( editor, 'execute' );

			setModelData( doc, '<blockQuote><paragraph>[]xx</paragraph></blockQuote>' );

			editor.editing.view.fire( 'enter', data );

			// Only enter command should be executed.
			expect( data.preventDefault.called ).to.be.true;
			expect( execSpy.calledOnce ).to.be.true;
			expect( execSpy.args[ 0 ][ 0 ] ).to.equal( 'enter' );
		} );

		it( 'does nothing if selection is not collapsed', () => {
			const data = fakeEventData();
			const execSpy = sinon.spy( editor, 'execute' );

			setModelData( doc, '<blockQuote><paragraph>[</paragraph><paragraph>]</paragraph></blockQuote>' );

			editor.editing.view.fire( 'enter', data );

			// Only enter command should be executed.
			expect( data.preventDefault.called ).to.be.true;
			expect( execSpy.calledOnce ).to.be.true;
			expect( execSpy.args[ 0 ][ 0 ] ).to.equal( 'enter' );
		} );

		it( 'does not interfere with a similar handler in the list feature', () => {
			const data = fakeEventData();

			setModelData( doc,
				'<paragraph>x</paragraph>' +
				'<blockQuote>' +
					'<listItem indent="0" type="bulleted">a</listItem>' +
					'<listItem indent="0" type="bulleted">[]</listItem>' +
				'</blockQuote>' +
				'<paragraph>x</paragraph>'
			);

			editor.editing.view.fire( 'enter', data );

			expect( data.preventDefault.called ).to.be.true;

			expect( getModelData( doc ) ).to.equal(
				'<paragraph>x</paragraph>' +
				'<blockQuote>' +
					'<listItem indent="0" type="bulleted">a</listItem>' +
					'<paragraph>[]</paragraph>' +
				'</blockQuote>' +
				'<paragraph>x</paragraph>'
			);
		} );

		it( 'escapes block quote if selection is in an empty block in an empty block quote', () => {
			const data = fakeEventData();
			const execSpy = sinon.spy( editor, 'execute' );

			setModelData( doc, '<paragraph>x</paragraph><blockQuote><paragraph>[]</paragraph></blockQuote><paragraph>x</paragraph>' );

			editor.editing.view.fire( 'enter', data );

			expect( data.preventDefault.called ).to.be.true;
			expect( execSpy.calledOnce ).to.be.true;
			expect( execSpy.args[ 0 ][ 0 ] ).to.equal( 'blockQuote' );

			expect( getModelData( doc ) ).to.equal( '<paragraph>x</paragraph><paragraph>[]</paragraph><paragraph>x</paragraph>' );
		} );

		it( 'escapes block quote if selection is in an empty block in the middle of a block quote', () => {
			const data = fakeEventData();
			const execSpy = sinon.spy( editor, 'execute' );

			setModelData( doc,
				'<paragraph>x</paragraph>' +
				'<blockQuote><paragraph>a</paragraph><paragraph>[]</paragraph><paragraph>b</paragraph></blockQuote>' +
				'<paragraph>x</paragraph>'
			);

			editor.editing.view.fire( 'enter', data );

			expect( data.preventDefault.called ).to.be.true;
			expect( execSpy.calledOnce ).to.be.true;
			expect( execSpy.args[ 0 ][ 0 ] ).to.equal( 'blockQuote' );

			expect( getModelData( doc ) ).to.equal(
				'<paragraph>x</paragraph>' +
				'<blockQuote><paragraph>a</paragraph></blockQuote>' +
				'<paragraph>[]</paragraph>' +
				'<blockQuote><paragraph>b</paragraph></blockQuote>' +
				'<paragraph>x</paragraph>'
			);
		} );

		it( 'escapes block quote if selection is in an empty block at the end of a block quote', () => {
			const data = fakeEventData();
			const execSpy = sinon.spy( editor, 'execute' );

			setModelData( doc,
				'<paragraph>x</paragraph>' +
				'<blockQuote><paragraph>a</paragraph><paragraph>[]</paragraph></blockQuote>' +
				'<paragraph>x</paragraph>'
			);

			editor.editing.view.fire( 'enter', data );

			expect( data.preventDefault.called ).to.be.true;
			expect( execSpy.calledOnce ).to.be.true;
			expect( execSpy.args[ 0 ][ 0 ] ).to.equal( 'blockQuote' );

			expect( getModelData( doc ) ).to.equal(
				'<paragraph>x</paragraph>' +
				'<blockQuote><paragraph>a</paragraph></blockQuote>' +
				'<paragraph>[]</paragraph>' +
				'<paragraph>x</paragraph>'
			);
		} );

		it( 'scrolls the view document to the selection after the command is executed', () => {
			const data = fakeEventData();
			const execSpy = sinon.spy( editor, 'execute' );
			const scrollSpy = sinon.stub( editor.editing.view, 'scrollToTheSelection' );

			setModelData( doc,
				'<paragraph>x</paragraph>' +
				'<blockQuote><paragraph>a</paragraph><paragraph>[]</paragraph></blockQuote>' +
				'<paragraph>x</paragraph>'
			);

			editor.editing.view.fire( 'enter', data );

			sinon.assert.calledOnce( scrollSpy );
			sinon.assert.callOrder( execSpy, scrollSpy );
		} );
	} );

	describe( 'backspace key support', () => {
		function fakeEventData() {
			return {
				preventDefault: sinon.spy(),
				direction: 'backward',
				unit: 'character'
			};
		}

		it( 'merges paragraph into paragraph in the quote', () => {
			const data = fakeEventData();

			setModelData( doc,
				'<blockQuote><paragraph>a</paragraph><paragraph>b</paragraph></blockQuote>' +
				'<paragraph>[]c</paragraph>' +
				'<paragraph>d</paragraph>'
			);

			editor.editing.view.fire( 'delete', data );

			expect( getModelData( doc ) ).to.equal(
				'<blockQuote><paragraph>a</paragraph><paragraph>b[]c</paragraph></blockQuote>' +
				'<paragraph>d</paragraph>'
			);
		} );

		it( 'merges paragraph from a quote into a paragraph before quote', () => {
			const data = fakeEventData();

			setModelData( doc,
				'<paragraph>x</paragraph>' +
				'<blockQuote><paragraph>[]a</paragraph><paragraph>b</paragraph></blockQuote>' +
				'<paragraph>y</paragraph>'
			);

			editor.editing.view.fire( 'delete', data );

			expect( getModelData( doc ) ).to.equal(
				'<paragraph>x[]a</paragraph>' +
				'<blockQuote><paragraph>b</paragraph></blockQuote>' +
				'<paragraph>y</paragraph>'
			);
		} );

		it( 'merges two quotes', () => {
			const data = fakeEventData();

			setModelData( doc,
				'<paragraph>x</paragraph>' +
				'<blockQuote><paragraph>a</paragraph><paragraph>b</paragraph></blockQuote>' +
				'<blockQuote><paragraph>[]c</paragraph><paragraph>d</paragraph></blockQuote>' +
				'<paragraph>y</paragraph>'
			);

			editor.editing.view.fire( 'delete', data );

			expect( getModelData( doc ) ).to.equal(
				'<paragraph>x</paragraph>' +
				'<blockQuote><paragraph>a</paragraph><paragraph>b[]c</paragraph><paragraph>d</paragraph></blockQuote>' +
				'<paragraph>y</paragraph>'
			);
		} );

		it( 'removes empty quote when merging into another quote', () => {
			const data = fakeEventData();

			setModelData( doc,
				'<paragraph>x</paragraph>' +
				'<blockQuote><paragraph>a</paragraph></blockQuote>' +
				'<blockQuote><paragraph>[]</paragraph></blockQuote>' +
				'<paragraph>y</paragraph>'
			);

			editor.editing.view.fire( 'delete', data );

			expect( getModelData( doc ) ).to.equal(
				'<paragraph>x</paragraph>' +
				'<blockQuote><paragraph>a[]</paragraph></blockQuote>' +
				'<paragraph>y</paragraph>'
			);
		} );

		it( 'removes empty quote when merging into a paragraph', () => {
			const data = fakeEventData();

			setModelData( doc,
				'<paragraph>x</paragraph>' +
				'<blockQuote><paragraph>[]</paragraph></blockQuote>' +
				'<paragraph>y</paragraph>'
			);

			editor.editing.view.fire( 'delete', data );

			expect( getModelData( doc ) ).to.equal(
				'<paragraph>x[]</paragraph>' +
				'<paragraph>y</paragraph>'
			);
		} );
	} );

	describe( 'compatibility with images', () => {
		it( 'does not quote a simple image', () => {
			const element = document.createElement( 'div' );
			document.body.appendChild( element );

			// We can't load ImageCaption in this test because it adds <caption> to all images automatically.
			return ClassicTestEditor
				.create( element, {
					plugins: [ BlockQuote, Paragraph, Image ]
				} )
				.then( editor => {
					setModelData( editor.document,
						'<paragraph>fo[o</paragraph>' +
						'<image src="foo.png"></image>' +
						'<paragraph>b]ar</paragraph>'
					);

					editor.execute( 'blockQuote' );

					expect( getModelData( editor.document ) ).to.equal(
						'<blockQuote><paragraph>fo[o</paragraph></blockQuote>' +
						'<image src="foo.png"></image>' +
						'<blockQuote><paragraph>b]ar</paragraph></blockQuote>'
					);

					element.remove();
					editor.destroy();
				} );
		} );

		it( 'does not quote an image with caption', () => {
			setModelData( doc,
				'<paragraph>fo[o</paragraph>' +
				'<image src="foo.png">' +
					'<caption>xxx</caption>' +
				'</image>' +
				'<paragraph>b]ar</paragraph>'
			);

			editor.execute( 'blockQuote' );

			expect( getModelData( doc ) ).to.equal(
				'<blockQuote><paragraph>fo[o</paragraph></blockQuote>' +
				'<image src="foo.png">' +
					'<caption>xxx</caption>' +
				'</image>' +
				'<blockQuote><paragraph>b]ar</paragraph></blockQuote>'
			);
		} );

		it( 'does not add an image to existing quote', () => {
			setModelData( doc,
				'<paragraph>fo[o</paragraph>' +
				'<image src="foo.png">' +
					'<caption>xxx</caption>' +
				'</image>' +
				'<blockQuote><paragraph>b]ar</paragraph></blockQuote>'
			);

			editor.execute( 'blockQuote' );

			expect( getModelData( doc ) ).to.equal(
				'<blockQuote><paragraph>fo[o</paragraph></blockQuote>' +
				'<image src="foo.png">' +
					'<caption>xxx</caption>' +
				'</image>' +
				'<blockQuote><paragraph>b]ar</paragraph></blockQuote>'
			);
		} );
	} );
} );
