/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { getData as getModelData, parse as parseModel } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';

/**
 * Sets the editor model according to the specified input string.
 *
 * @param {module:engine/model/model~Model} model
 * @param {String} input
 * @returns {module:engine/model/selection~Selection} The selection marked in input string.
 */
export function prepareTest( model, input ) {
	const modelRoot = model.document.getRoot( 'main' );

	// Parse data string to model.
	const parsedResult = parseModel( input, model.schema, { context: [ modelRoot.name ] } );

	// Retrieve DocumentFragment and Selection from parsed model.
	const modelDocumentFragment = parsedResult.model;
	const selection = parsedResult.selection;

	// Ensure no undo step is generated.
	model.enqueueChange( 'transparent', writer => {
		// Replace existing model in document by new one.
		writer.remove( writer.createRangeIn( modelRoot ) );
		writer.insert( modelDocumentFragment, modelRoot );

		// Clean up previous document selection.
		writer.setSelection( null );
		writer.removeSelectionAttribute( model.document.selection.getAttributeKeys() );
	} );

	const ranges = [];

	for ( const range of selection.getRanges() ) {
		const start = model.createPositionFromPath( modelRoot, range.start.path );
		const end = model.createPositionFromPath( modelRoot, range.end.path );

		ranges.push( model.createRange( start, end ) );
	}

	return model.createSelection( ranges );
}

/**
 * Returns set of test tools for the specified editor instance.
 *
 * @param {module:core/editor/editor~Editor} editor
 * @returns {Object}
 */
export function setupTestHelpers( editor ) {
	const model = editor.model;
	const modelRoot = model.document.getRoot();
	const view = editor.editing.view;

	const test = {
		test( input, output, actionCallback, testUndo ) {
			const callbackSelection = prepareTest( model, input );

			const modelBefore = getModelData( model );
			const viewBefore = getViewData( view, { withoutSelection: true } );

			test.reconvertSpy = sinon.spy( editor.editing, 'reconvertItem' );
			actionCallback( callbackSelection );
			test.reconvertSpy.restore();

			expect( getViewData( view, { withoutSelection: true } ) ).to.equal( output );

			if ( testUndo ) {
				const modelAfter = getModelData( model );
				const viewAfter = getViewData( view, { withoutSelection: true } );

				editor.execute( 'undo' );

				expect( getModelData( model ), 'after undo' ).to.equal( modelBefore );
				expect( getViewData( view, { withoutSelection: true } ), 'after undo' ).to.equal( viewBefore );

				editor.execute( 'redo' );

				expect( getModelData( model ), 'after redo' ).to.equal( modelAfter );
				expect( getViewData( view, { withoutSelection: true } ), 'after redo' ).to.equal( viewAfter );
			}
		},

		insert( input, output, testUndo = true ) {
			// Cut out inserted element that is between '[' and ']' characters.
			const selStart = input.indexOf( '[' ) + 1;
			const selEnd = input.indexOf( ']' );

			const item = input.substring( selStart, selEnd );
			const modelInput = input.substring( 0, selStart ) + input.substring( selEnd );

			const actionCallback = selection => {
				model.change( writer => {
					writer.insert( parseModel( item, model.schema ), selection.getFirstPosition() );
				} );
			};

			test.test( modelInput, output, actionCallback, testUndo );
		},

		remove( input, output ) {
			const actionCallback = selection => {
				model.change( writer => {
					writer.remove( selection.getFirstRange() );
				} );
			};

			test.test( input, output, actionCallback );
		},

		changeType( input, output ) {
			const actionCallback = selection => {
				const element = selection.getFirstPosition().nodeAfter;
				const newType = element.getAttribute( 'listType' ) == 'numbered' ? 'bulleted' : 'numbered';

				model.change( writer => {
					const itemsToChange = Array.from( selection.getSelectedBlocks() );

					for ( const item of itemsToChange ) {
						writer.setAttribute( 'listType', newType, item );
					}
				} );
			};

			test.test( input, output, actionCallback );
		},

		renameElement( input, output, testUndo = true ) {
			const actionCallback = selection => {
				const element = selection.getFirstPosition().nodeAfter;

				model.change( writer => {
					writer.rename( element, element.name == 'paragraph' ? 'heading1' : 'paragraph' );
				} );
			};

			test.test( input, output, actionCallback, testUndo );
		},

		removeListAttributes( input, output, testUndo = true ) {
			const actionCallback = selection => {
				const element = selection.getFirstPosition().nodeAfter;

				model.change( writer => {
					writer.removeAttribute( 'listItemId', element );
					writer.removeAttribute( 'listType', element );
					writer.removeAttribute( 'listIndent', element );
				} );
			};

			test.test( input, output, actionCallback, testUndo );
		},

		setListAttributes( newIndent, input, output ) {
			const actionCallback = selection => {
				const element = selection.getFirstPosition().nodeAfter;

				model.change( writer => {
					writer.setAttributes( { listType: 'bulleted', listIndent: newIndent, listItemId: 'x' }, element );
				} );
			};

			test.test( input, output, actionCallback );
		},

		changeIndent( newIndent, input, output ) {
			const actionCallback = selection => {
				model.change( writer => {
					writer.setAttribute( 'listIndent', newIndent, selection.getFirstRange() );
				} );
			};

			test.test( input, output, actionCallback );
		},

		move( input, rootOffset, output, testUndo = true ) {
			const actionCallback = selection => {
				model.change( writer => {
					const targetPosition = writer.createPositionAt( modelRoot, rootOffset );

					writer.move( selection.getFirstRange(), targetPosition );
				} );
			};

			test.test( input, output, actionCallback, testUndo );
		},

		data( input, modelData, output = input ) {
			editor.setData( input );

			expect( editor.getData(), 'output data' ).to.equal( output );
			expect( getModelData( model, { withoutSelection: true } ), 'model data' ).to.equal( modelData );
		}
	};

	return test;
}
