/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Position from '../../src/model/position';

import { setData as setModelData, getData as getModelData } from '../../src/dev-utils/model';

describe( 'Bug ckeditor5-engine#1281', () => {
	let element, editor, model;

	beforeEach( () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		return ClassicTestEditor
			.create( element, { plugins: [ Paragraph ] } )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
			} );
	} );

	afterEach( () => {
		element.remove();

		return editor.destroy();
	} );

	it( 'loads content that contains multi-range selection', () => {
		setModelData( model,
			'<paragraph>Paragraph 1.</paragraph>' +
			'<paragraph>Paragraph 2.</paragraph>' +
			'<paragraph>[Paragraph 3.]</paragraph>' +
			'<paragraph>[Paragraph 4.]</paragraph>'
		);

		const root = model.document.getRoot();
		const thirdParagraph = root.getNodeByPath( [ 2 ] );
		const fourthParagraph = root.getNodeByPath( [ 3 ] );
		const selRanges = Array.from( model.document.selection.getRanges() );

		expect( selRanges.length ).to.equal( 2 );

		assertPositions( Position._createAt( thirdParagraph, 0 ), selRanges[ 0 ].start );
		assertPositions( Position._createAt( thirdParagraph, 'end' ), selRanges[ 0 ].end );

		assertPositions( Position._createAt( fourthParagraph, 0 ), selRanges[ 1 ].start );
		assertPositions( Position._createAt( fourthParagraph, 'end' ), selRanges[ 1 ].end );
	} );

	it( 'does not throw an error when content before the selection is being removed (last element is selected)', () => {
		setModelData( model,
			'<paragraph>Paragraph 1.</paragraph>' +
			'<paragraph>Paragraph 2.</paragraph>' +
			'<paragraph>[Paragraph 3.]</paragraph>' +
			'<paragraph>[Paragraph 4.]</paragraph>'
		);

		model.change( writer => {
			const root = model.document.getRoot();
			const firstParagraph = root.getNodeByPath( [ 0 ] );

			expect( () => {
				writer.remove( firstParagraph );
			} ).to.not.throw();

			assertOutput(
				'<paragraph>Paragraph 2.</paragraph>' +
				'<paragraph>[Paragraph 3.]</paragraph>' +
				'<paragraph>[Paragraph 4.]</paragraph>'
			);
		} );
	} );

	it( 'does not throw an error when content before the selection is being removed (last element is not selected)', () => {
		setModelData( model,
			'<paragraph>Paragraph 1.</paragraph>' +
			'<paragraph>Paragraph 2.</paragraph>' +
			'<paragraph>[Paragraph 3.]</paragraph>' +
			'<paragraph>[Paragraph 4.]</paragraph>' +
			'<paragraph>Paragraph 5.</paragraph>'
		);

		model.change( writer => {
			const root = model.document.getRoot();
			const firstParagraph = root.getNodeByPath( [ 0 ] );

			expect( () => {
				writer.remove( firstParagraph );
			} ).to.not.throw();

			assertOutput(
				'<paragraph>Paragraph 2.</paragraph>' +
				'<paragraph>[Paragraph 3.]</paragraph>' +
				'<paragraph>[Paragraph 4.]</paragraph>' +
				'<paragraph>Paragraph 5.</paragraph>'
			);
		} );
	} );

	it( 'does not throw an error when content after the selection is being removed (first element is selected)', () => {
		setModelData( model,
			'<paragraph>[Paragraph 1.]</paragraph>' +
			'<paragraph>Paragraph 2.</paragraph>' +
			'<paragraph>Paragraph 3.</paragraph>' +
			'<paragraph>[Paragraph 4.]</paragraph>' +
			'<paragraph>Paragraph 5.</paragraph>'
		);

		model.change( writer => {
			const root = model.document.getRoot();
			const lastParagraph = root.getNodeByPath( [ 4 ] );

			expect( () => {
				writer.remove( lastParagraph );
			} ).to.not.throw();

			assertOutput(
				'<paragraph>[Paragraph 1.]</paragraph>' +
				'<paragraph>Paragraph 2.</paragraph>' +
				'<paragraph>Paragraph 3.</paragraph>' +
				'<paragraph>[Paragraph 4.]</paragraph>'
			);
		} );
	} );

	it( 'does not throw an error when content after the selection is being removed (first element is not selected)', () => {
		setModelData( model,
			'<paragraph>Paragraph 1.</paragraph>' +
			'<paragraph>Paragraph 2.</paragraph>' +
			'<paragraph>[Paragraph 3.]</paragraph>' +
			'<paragraph>[Paragraph 4.]</paragraph>' +
			'<paragraph>Paragraph 5.</paragraph>'
		);

		model.change( writer => {
			const root = model.document.getRoot();
			const lastParagraph = root.getNodeByPath( [ 4 ] );

			expect( () => {
				writer.remove( lastParagraph );
			} ).to.not.throw();

			assertOutput(
				'<paragraph>Paragraph 1.</paragraph>' +
				'<paragraph>Paragraph 2.</paragraph>' +
				'<paragraph>[Paragraph 3.]</paragraph>' +
				'<paragraph>[Paragraph 4.]</paragraph>'
			);
		} );
	} );

	it( 'does not throw an error when content between the selection\'s ranges is being removed (last element is selected)', () => {
		setModelData( model,
			'<paragraph>Paragraph 1.</paragraph>' +
			'<paragraph>[Paragraph 2.]</paragraph>' +
			'<paragraph>Paragraph 3.</paragraph>' +
			'<paragraph>[Paragraph 4.]</paragraph>'
		);

		model.change( writer => {
			const root = model.document.getRoot();
			const thirdParagraph = root.getNodeByPath( [ 2 ] );

			expect( () => {
				writer.remove( thirdParagraph );
			} ).to.not.throw();

			assertOutput(
				'<paragraph>Paragraph 1.</paragraph>' +
				'<paragraph>[Paragraph 2.]</paragraph>' +
				'<paragraph>[Paragraph 4.]</paragraph>'
			);
		} );
	} );

	it( 'does not throw an error when content between the selection\'s ranges is being removed (last element is not selected)', () => {
		setModelData( model,
			'<paragraph>Paragraph 1.</paragraph>' +
			'<paragraph>[Paragraph 2.]</paragraph>' +
			'<paragraph>Paragraph 3.</paragraph>' +
			'<paragraph>[Paragraph 4.]</paragraph>' +
			'<paragraph>Paragraph 5.</paragraph>'
		);

		model.change( writer => {
			const root = model.document.getRoot();
			const thirdParagraph = root.getNodeByPath( [ 2 ] );

			expect( () => {
				writer.remove( thirdParagraph );
			} ).to.not.throw();

			assertOutput(
				'<paragraph>Paragraph 1.</paragraph>' +
				'<paragraph>[Paragraph 2.]</paragraph>' +
				'<paragraph>[Paragraph 4.]</paragraph>' +
				'<paragraph>Paragraph 5.</paragraph>'
			);
		} );
	} );

	function assertPositions( firstPosition, secondPosition ) {
		expect( firstPosition.isEqual( secondPosition ) ).to.be.true;
	}

	function assertOutput( output ) {
		expect( getModelData( model ) ).to.equal( output );
	}
} );
