/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Model from '../../../src/model/model';
import DetachOperation from '../../../src/model/operation/detachoperation';

import Position from '../../../src/model/position';
import DocumentFragment from '../../../src/model/documentfragment';
import Element from '../../../src/model/element';
import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils';

describe( 'DetachOperation', () => {
	let model, doc, docFrag, element;

	beforeEach( () => {
		model = new Model();
		doc = model.document;
		element = new Element( 'element' );
		docFrag = new DocumentFragment( [ element ] );
	} );

	it( 'should have type equal to detach', () => {
		const op = new DetachOperation( Position._createBefore( element ), 1 );

		expect( op.type ).to.equal( 'detach' );
	} );

	it( 'should remove given element from parent', () => {
		const op = new DetachOperation( Position._createBefore( element ), 1 );

		model.applyOperation( op );

		expect( docFrag.childCount ).to.equal( 0 );
	} );

	describe( '_validate()', () => {
		it( 'should throw when is executed on element from document', () => {
			const root = doc.createRoot();
			const element = new Element( 'element' );

			root._appendChild( [ element ] );

			const op = new DetachOperation( Position._createBefore( element ), 1 );

			expectToThrowCKEditorError( () => {
				op._validate();
			}, /^detach-operation-on-document-node/, model );
		} );
	} );

	it( 'should be not a document operation', () => {
		const op = new DetachOperation( Position._createBefore( element ), 1 );

		expect( op.isDocumentOperation ).to.false;
	} );

	describe( 'toJSON', () => {
		it( 'should create proper json object', () => {
			const position = Position._createBefore( element );
			const op = new DetachOperation( position, 1 );

			const serialized = op.toJSON();

			expect( serialized ).to.deep.equal( {
				__className: 'DetachOperation',
				baseVersion: null,
				sourcePosition: position.toJSON(),
				howMany: 1
			} );
		} );
	} );
} );
