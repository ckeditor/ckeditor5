/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Model } from '../../../src/model/model.js';
import { DetachOperation } from '../../../src/model/operation/detachoperation.js';

import { ModelPosition } from '../../../src/model/position.js';
import { ModelDocumentFragment } from '../../../src/model/documentfragment.js';
import { ModelElement } from '../../../src/model/element.js';
import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils.js';

describe( 'DetachOperation', () => {
	let model, doc, docFrag, element;

	beforeEach( () => {
		model = new Model();
		doc = model.document;
		element = new ModelElement( 'element' );
		docFrag = new ModelDocumentFragment( [ element ] );
	} );

	it( 'should have type equal to detach', () => {
		const op = new DetachOperation( ModelPosition._createBefore( element ), 1 );

		expect( op.type ).toBe( 'detach' );
	} );

	it( 'should return null on affectedSelectable', () => {
		const op = new DetachOperation( ModelPosition._createBefore( element ), 1 );
		expect( op.affectedSelectable ).toBe( null );
	} );

	it( 'should remove given element from parent', () => {
		const op = new DetachOperation( ModelPosition._createBefore( element ), 1 );

		model.applyOperation( op );

		expect( docFrag.childCount ).toBe( 0 );
	} );

	describe( '_validate()', () => {
		it( 'should throw when is executed on element from document', () => {
			const root = doc.createRoot();
			const element = new ModelElement( 'element' );

			root._appendChild( [ element ] );

			const op = new DetachOperation( ModelPosition._createBefore( element ), 1 );

			expectToThrowCKEditorError( () => {
				op._validate();
			}, /^detach-operation-on-document-node/, model );
		} );
	} );

	it( 'should be not a document operation', () => {
		const op = new DetachOperation( ModelPosition._createBefore( element ), 1 );

		expect( op.isDocumentOperation ).toBe( false );
	} );

	describe( 'toJSON', () => {
		it( 'should create proper json object', () => {
			const position = ModelPosition._createBefore( element );
			const op = new DetachOperation( position, 1 );

			const serialized = op.toJSON();

			expect( serialized ).toEqual( {
				__className: 'DetachOperation',
				baseVersion: null,
				sourcePosition: position.toJSON(),
				howMany: 1
			} );
		} );
	} );
} );
