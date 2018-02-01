/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
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
import Heading from '@ckeditor/ckeditor5-heading/src/heading';

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import { parse, getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

describe( 'BlockQuote integration', () => {
	let editor, model, element;

	beforeEach( () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		return ClassicTestEditor
			.create( element, {
				plugins: [ BlockQuote, Paragraph, Image, ImageCaption, List, Enter, Delete, Heading ]
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
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

			setModelData( model, '<paragraph>x</paragraph><paragraph>[]</paragraph><paragraph>x</paragraph>' );

			editor.editing.view.fire( 'enter', data );

			// Only enter command should be executed.
			expect( data.preventDefault.called ).to.be.true;
			expect( execSpy.calledOnce ).to.be.true;
			expect( execSpy.args[ 0 ][ 0 ] ).to.equal( 'enter' );
		} );

		it( 'does nothing if selection is in a non-empty block (at the end) in a block quote', () => {
			const data = fakeEventData();
			const execSpy = sinon.spy( editor, 'execute' );

			setModelData( model, '<blockQuote><paragraph>xx[]</paragraph></blockQuote>' );

			editor.editing.view.fire( 'enter', data );

			// Only enter command should be executed.
			expect( data.preventDefault.called ).to.be.true;
			expect( execSpy.calledOnce ).to.be.true;
			expect( execSpy.args[ 0 ][ 0 ] ).to.equal( 'enter' );
		} );

		it( 'does nothing if selection is in a non-empty block (at the beginning) in a block quote', () => {
			const data = fakeEventData();
			const execSpy = sinon.spy( editor, 'execute' );

			setModelData( model, '<blockQuote><paragraph>[]xx</paragraph></blockQuote>' );

			editor.editing.view.fire( 'enter', data );

			// Only enter command should be executed.
			expect( data.preventDefault.called ).to.be.true;
			expect( execSpy.calledOnce ).to.be.true;
			expect( execSpy.args[ 0 ][ 0 ] ).to.equal( 'enter' );
		} );

		it( 'does nothing if selection is not collapsed', () => {
			const data = fakeEventData();
			const execSpy = sinon.spy( editor, 'execute' );

			setModelData( model, '<blockQuote><paragraph>[</paragraph><paragraph>]</paragraph></blockQuote>' );

			editor.editing.view.fire( 'enter', data );

			// Only enter command should be executed.
			expect( data.preventDefault.called ).to.be.true;
			expect( execSpy.calledOnce ).to.be.true;
			expect( execSpy.args[ 0 ][ 0 ] ).to.equal( 'enter' );
		} );

		it( 'does not interfere with a similar handler in the list feature', () => {
			const data = fakeEventData();

			setModelData( model,
				'<paragraph>x</paragraph>' +
				'<blockQuote>' +
					'<listItem indent="0" type="bulleted">a</listItem>' +
					'<listItem indent="0" type="bulleted">[]</listItem>' +
				'</blockQuote>' +
				'<paragraph>x</paragraph>'
			);

			editor.editing.view.fire( 'enter', data );

			expect( data.preventDefault.called ).to.be.true;

			expect( getModelData( model ) ).to.equal(
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

			setModelData( model, '<paragraph>x</paragraph><blockQuote><paragraph>[]</paragraph></blockQuote><paragraph>x</paragraph>' );

			editor.editing.view.fire( 'enter', data );

			expect( data.preventDefault.called ).to.be.true;
			expect( execSpy.calledOnce ).to.be.true;
			expect( execSpy.args[ 0 ][ 0 ] ).to.equal( 'blockQuote' );

			expect( getModelData( model ) ).to.equal( '<paragraph>x</paragraph><paragraph>[]</paragraph><paragraph>x</paragraph>' );
		} );

		it( 'escapes block quote if selection is in an empty block in the middle of a block quote', () => {
			const data = fakeEventData();
			const execSpy = sinon.spy( editor, 'execute' );

			setModelData( model,
				'<paragraph>x</paragraph>' +
				'<blockQuote><paragraph>a</paragraph><paragraph>[]</paragraph><paragraph>b</paragraph></blockQuote>' +
				'<paragraph>x</paragraph>'
			);

			editor.editing.view.fire( 'enter', data );

			expect( data.preventDefault.called ).to.be.true;
			expect( execSpy.calledOnce ).to.be.true;
			expect( execSpy.args[ 0 ][ 0 ] ).to.equal( 'blockQuote' );

			expect( getModelData( model ) ).to.equal(
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

			setModelData( model,
				'<paragraph>x</paragraph>' +
				'<blockQuote><paragraph>a</paragraph><paragraph>[]</paragraph></blockQuote>' +
				'<paragraph>x</paragraph>'
			);

			editor.editing.view.fire( 'enter', data );

			expect( data.preventDefault.called ).to.be.true;
			expect( execSpy.calledOnce ).to.be.true;
			expect( execSpy.args[ 0 ][ 0 ] ).to.equal( 'blockQuote' );

			expect( getModelData( model ) ).to.equal(
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

			setModelData( model,
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

			setModelData( model,
				'<blockQuote><paragraph>a</paragraph><paragraph>b</paragraph></blockQuote>' +
				'<paragraph>[]c</paragraph>' +
				'<paragraph>d</paragraph>'
			);

			editor.editing.view.fire( 'delete', data );

			expect( getModelData( model ) ).to.equal(
				'<blockQuote><paragraph>a</paragraph><paragraph>b[]c</paragraph></blockQuote>' +
				'<paragraph>d</paragraph>'
			);
		} );

		it( 'merges paragraph from a quote into a paragraph before quote', () => {
			const data = fakeEventData();

			setModelData( model,
				'<paragraph>x</paragraph>' +
				'<blockQuote><paragraph>[]a</paragraph><paragraph>b</paragraph></blockQuote>' +
				'<paragraph>y</paragraph>'
			);

			editor.editing.view.fire( 'delete', data );

			expect( getModelData( model ) ).to.equal(
				'<paragraph>x[]a</paragraph>' +
				'<blockQuote><paragraph>b</paragraph></blockQuote>' +
				'<paragraph>y</paragraph>'
			);
		} );

		it( 'merges two quotes', () => {
			const data = fakeEventData();

			setModelData( model,
				'<paragraph>x</paragraph>' +
				'<blockQuote><paragraph>a</paragraph><paragraph>b</paragraph></blockQuote>' +
				'<blockQuote><paragraph>[]c</paragraph><paragraph>d</paragraph></blockQuote>' +
				'<paragraph>y</paragraph>'
			);

			editor.editing.view.fire( 'delete', data );

			expect( getModelData( model ) ).to.equal(
				'<paragraph>x</paragraph>' +
				'<blockQuote><paragraph>a</paragraph><paragraph>b[]c</paragraph><paragraph>d</paragraph></blockQuote>' +
				'<paragraph>y</paragraph>'
			);
		} );

		it( 'removes empty quote when merging into another quote', () => {
			const data = fakeEventData();

			setModelData( model,
				'<paragraph>x</paragraph>' +
				'<blockQuote><paragraph>a</paragraph></blockQuote>' +
				'<blockQuote><paragraph>[]</paragraph></blockQuote>' +
				'<paragraph>y</paragraph>'
			);

			editor.editing.view.fire( 'delete', data );

			expect( getModelData( model ) ).to.equal(
				'<paragraph>x</paragraph>' +
				'<blockQuote><paragraph>a[]</paragraph></blockQuote>' +
				'<paragraph>y</paragraph>'
			);
		} );

		it( 'removes empty quote when merging into a paragraph', () => {
			const data = fakeEventData();

			setModelData( model,
				'<paragraph>x</paragraph>' +
				'<blockQuote><paragraph>[]</paragraph></blockQuote>' +
				'<paragraph>y</paragraph>'
			);

			editor.editing.view.fire( 'delete', data );

			expect( getModelData( model ) ).to.equal(
				'<paragraph>x[]</paragraph>' +
				'<paragraph>y</paragraph>'
			);
		} );
	} );

	// Historically, due to problems with schema, images were not quotable.
	// These tests were left here to confirm that after schema was fixed, images are properly quotable.
	describe( 'compatibility with images', () => {
		it( 'quotes a simple image', () => {
			const element = document.createElement( 'div' );
			document.body.appendChild( element );

			// We can't load ImageCaption in this test because it adds <caption> to all images automatically.
			return ClassicTestEditor
				.create( element, {
					plugins: [ BlockQuote, Paragraph, Image ]
				} )
				.then( editor => {
					setModelData( editor.model,
						'<paragraph>fo[o</paragraph>' +
						'<image src="foo.png"></image>' +
						'<paragraph>b]ar</paragraph>'
					);

					editor.execute( 'blockQuote' );

					expect( getModelData( editor.model ) ).to.equal(
						'<blockQuote>' +
							'<paragraph>fo[o</paragraph>' +
							'<image src="foo.png"></image>' +
							'<paragraph>b]ar</paragraph>' +
						'</blockQuote>'
					);

					element.remove();
					return editor.destroy();
				} );
		} );

		it( 'quotes an image with caption', () => {
			setModelData( model,
				'<paragraph>fo[o</paragraph>' +
				'<image src="foo.png">' +
					'<caption>xxx</caption>' +
				'</image>' +
				'<paragraph>b]ar</paragraph>'
			);

			editor.execute( 'blockQuote' );

			expect( getModelData( model ) ).to.equal(
				'<blockQuote>' +
					'<paragraph>fo[o</paragraph>' +
					'<image src="foo.png">' +
						'<caption>xxx</caption>' +
					'</image>' +
					'<paragraph>b]ar</paragraph>' +
				'</blockQuote>'
			);
		} );

		it( 'adds an image to an existing quote', () => {
			setModelData( model,
				'<paragraph>fo[o</paragraph>' +
				'<image src="foo.png">' +
					'<caption>xxx</caption>' +
				'</image>' +
				'<blockQuote><paragraph>b]ar</paragraph></blockQuote>'
			);

			editor.execute( 'blockQuote' );

			expect( getModelData( model ) ).to.equal(
				'<blockQuote>' +
					'<paragraph>fo[o</paragraph>' +
					'<image src="foo.png">' +
						'<caption>xxx</caption>' +
					'</image>' +
					'<paragraph>b]ar</paragraph>' +
				'</blockQuote>'
			);
		} );
	} );

	// When blockQuote with a paragraph was pasted into a list item, the item contained the paragraph. It was invalid.
	// There is a test which checks whether blockQuote will split the list items instead of merging with.
	describe( 'compatibility with lists', () => {
		it( 'does not merge the paragraph with list item', () => {
			setModelData( model, '<listItem indent="0" type="bulleted">fo[]o</listItem>' );

			const df = parse(
				'<blockQuote><paragraph>xxx</paragraph></blockQuote><heading1>yyy</heading1>',
				model.schema
			);

			model.insertContent( df, model.document.selection );

			expect( getModelData( model ) ).to.equal(
				'<listItem indent="0" type="bulleted">fo</listItem>' +
				'<blockQuote>' +
				'<paragraph>xxx</paragraph>' +
				'</blockQuote>' +
				'<heading1>yyy[]o</heading1>'
			);
		} );
	} );
} );
