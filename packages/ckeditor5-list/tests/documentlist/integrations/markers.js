/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

import DocumentListEditing from '../../../src/documentlist/documentlistediting';

import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import ImageBlockEditing from '@ckeditor/ckeditor5-image/src/image/imageblockediting';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import { setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

import stubUid from '../_utils/uid';

describe( 'DocumentListEditing integrations: markers', () => {
	let element, editor, model, root;

	testUtils.createSinonSandbox();

	beforeEach( async () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		editor = await ClassicTestEditor.create( element, {
			plugins: [ Paragraph, DocumentListEditing, ImageBlockEditing ]
		} );

		model = editor.model;
		root = model.document.getRoot();

		editor.conversion.for( 'upcast' ).dataToMarker( { view: 'foo' } );
		editor.conversion.for( 'dataDowncast' ).markerToData( { model: 'foo' } );

		stubUid();
	} );

	afterEach( async () => {
		element.remove();

		await editor.destroy();
	} );

	function addMarker( range ) {
		model.change( writer => {
			writer.addMarker( 'foo:bar', {
				usingOperation: true,
				affectsData: true,
				range
			} );
		} );
	}

	function checkMarker( range ) {
		const marker = model.markers.get( 'foo:bar' );

		expect( marker ).to.not.be.null;
		expect( marker.getRange().isEqual( range ) ).to.be.true;
	}

	describe( 'list item with a single paragraph', () => {
		beforeEach( () => {
			setModelData( model,
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">A</paragraph>'
			);
		} );

		it( 'marker beginning before a paragraph and ending inside', () => {
			const range = model.createRange(
				model.createPositionBefore( root.getChild( 0 ) ),
				model.createPositionAt( root.getChild( 0 ), 'end' )
			);

			addMarker( range );

			const data = editor.getData();

			expect( data ).to.equal(
				'<ul>' +
					'<li>' +
						'<p data-foo-start-before="bar">A<foo-end name="bar"></foo-end></p>' +
					'</li>' +
				'</ul>'
			);

			editor.setData( data );

			checkMarker( range );
			expect( editor.getData() ).to.equal( data );
		} );

		it( 'marker beginning before an empty paragraph and ending inside', () => {
			model.change( writer => writer.remove( root.getChild( 0 ).getChild( 0 ) ) );

			const range = model.createRange(
				model.createPositionBefore( root.getChild( 0 ) ),
				model.createPositionAt( root.getChild( 0 ), 'end' )
			);

			addMarker( range );

			const data = editor.getData();

			expect( data ).to.equal(
				'<ul>' +
					'<li>' +
						'<p data-foo-start-before="bar"><foo-end name="bar"></foo-end>&nbsp;</p>' +
					'</li>' +
				'</ul>'
			);

			editor.setData( data );

			checkMarker( range );
			expect( editor.getData() ).to.equal( data );
		} );

		it( 'marker beginning before a paragraph and ending after it', () => {
			const range = model.createRangeOn( root.getChild( 0 ) );

			addMarker( range );

			const data = editor.getData();

			expect( data ).to.equal(
				'<ul>' +
					'<li>' +
						'<p data-foo-end-after="bar" data-foo-start-before="bar">A</p>' +
					'</li>' +
				'</ul>'
			);

			editor.setData( data );

			checkMarker( range );
			expect( editor.getData() ).to.equal( data );
		} );

		it( 'marker inside a paragraph', () => {
			const range = model.createRangeIn( root.getChild( 0 ) );

			addMarker( range );

			const data = editor.getData();

			expect( data ).to.equal(
				'<ul>' +
					'<li>' +
						'<foo-start name="bar"></foo-start>A<foo-end name="bar"></foo-end>' +
					'</li>' +
				'</ul>'
			);

			editor.setData( data );

			checkMarker( range );
			expect( editor.getData() ).to.equal( data );
		} );

		it( 'marker inside an empty paragraph', () => {
			model.change( writer => writer.remove( root.getChild( 0 ).getChild( 0 ) ) );

			const range = model.createRangeIn( root.getChild( 0 ) );

			addMarker( range );

			const data = editor.getData();

			expect( data ).to.equal(
				'<ul>' +
					'<li>' +
						'<foo-start name="bar"></foo-start><foo-end name="bar"></foo-end>&nbsp;' +
					'</li>' +
				'</ul>'
			);

			editor.setData( data );

			checkMarker( range );
			expect( editor.getData() ).to.equal( data );
		} );
	} );

	describe( 'list item with multiple paragraphs', () => {
		beforeEach( () => {
			setModelData( model,
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">A</paragraph>' +
				'<paragraph listType="bulleted" listItemId="a" listIndent="0">B</paragraph>'
			);
		} );

		it( 'marker beginning before a paragraph and ending inside', () => {
			const range = model.createRange(
				model.createPositionBefore( root.getChild( 0 ) ),
				model.createPositionAt( root.getChild( 0 ), 'end' )
			);

			addMarker( range );

			const data = editor.getData();

			expect( data ).to.equal(
				'<ul>' +
					'<li>' +
						'<p data-foo-start-before="bar">A<foo-end name="bar"></foo-end></p>' +
						'<p>B</p>' +
					'</li>' +
				'</ul>'
			);

			editor.setData( data );

			checkMarker( range );
			expect( editor.getData() ).to.equal( data );
		} );

		it( 'marker beginning before a paragraph and ending inside the next paragraph', () => {
			const range = model.createRange(
				model.createPositionBefore( root.getChild( 0 ) ),
				model.createPositionAt( root.getChild( 1 ), 'end' )
			);

			addMarker( range );

			const data = editor.getData();

			expect( data ).to.equal(
				'<ul>' +
					'<li>' +
						'<p data-foo-start-before="bar">A</p>' +
						'<p>B<foo-end name="bar"></foo-end></p>' +
					'</li>' +
				'</ul>'
			);

			editor.setData( data );

			checkMarker( range );
			expect( editor.getData() ).to.equal( data );
		} );

		it( 'marker beginning before an empty paragraph and ending inside the next paragraph', () => {
			model.change( writer => {
				writer.remove( root.getChild( 0 ).getChild( 0 ) );
				writer.remove( root.getChild( 1 ).getChild( 0 ) );
			} );

			const range = model.createRange(
				model.createPositionBefore( root.getChild( 0 ) ),
				model.createPositionAt( root.getChild( 1 ), 'end' )
			);

			addMarker( range );

			const data = editor.getData();

			expect( data ).to.equal(
				'<ul>' +
					'<li>' +
						'<p data-foo-start-before="bar">&nbsp;</p>' +
						'<p><foo-end name="bar"></foo-end>&nbsp;</p>' +
					'</li>' +
				'</ul>'
			);

			editor.setData( data );

			checkMarker( range );
			expect( editor.getData() ).to.equal( data );
		} );

		it( 'marker beginning before a paragraph and ending after the next paragraph', () => {
			const range = model.createRangeIn( root );

			addMarker( range );

			const data = editor.getData();

			expect( data ).to.equal(
				'<ul>' +
					'<li>' +
						'<p data-foo-start-before="bar">A</p>' +
						'<p data-foo-end-after="bar">B</p>' +
					'</li>' +
				'</ul>'
			);

			editor.setData( data );

			checkMarker( range );
			expect( editor.getData() ).to.equal( data );
		} );

		it( 'marker starting in a paragraph and ending in next paragraph', () => {
			const range = model.createRange(
				model.createPositionAt( root.getChild( 0 ), 'end' ),
				model.createPositionAt( root.getChild( 1 ), 0 )
			);

			addMarker( range );

			const data = editor.getData();

			expect( data ).to.equal(
				'<ul>' +
					'<li>' +
						'<p>A<foo-start name="bar"></foo-start></p>' +
						'<p><foo-end name="bar"></foo-end>B</p>' +
					'</li>' +
				'</ul>'
			);

			editor.setData( data );

			checkMarker( range );
			expect( editor.getData() ).to.equal( data );
		} );

		it( 'marker starting in a empty paragraph and ending in next empty paragraph', () => {
			model.change( writer => {
				writer.remove( root.getChild( 0 ).getChild( 0 ) );
				writer.remove( root.getChild( 1 ).getChild( 0 ) );
			} );

			const range = model.createRange(
				model.createPositionAt( root.getChild( 0 ), 'end' ),
				model.createPositionAt( root.getChild( 1 ), 0 )
			);

			addMarker( range );

			const data = editor.getData();

			expect( data ).to.equal(
				'<ul>' +
					'<li>' +
						'<p><foo-start name="bar"></foo-start>&nbsp;</p>' +
						'<p><foo-end name="bar"></foo-end>&nbsp;</p>' +
					'</li>' +
				'</ul>'
			);

			editor.setData( data );

			checkMarker( range );
			expect( editor.getData() ).to.equal( data );
		} );
	} );
} );
