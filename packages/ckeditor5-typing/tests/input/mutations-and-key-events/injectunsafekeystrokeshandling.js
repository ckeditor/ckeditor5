/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor';
import DomEventData from '@ckeditor/ckeditor5-engine/src/view/observer/domeventdata';
import env from '@ckeditor/ckeditor5-utils/src/env';
import { getData, setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { getCode } from '@ckeditor/ckeditor5-utils/src/keyboard';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import Typing from '../../../src/typing';

describe( 'Input', () => {
	describe( 'Typing text using mutations and key events', () => {
		describe( 'injectLegacyUnsafeKeystrokesHandling()', () => {
			let editor, model;

			testUtils.createSinonSandbox();

			beforeEach( async () => {
				// Force the browser to not use the beforeinput event.
				testUtils.sinon.stub( env.features, 'isInputEventsLevel1Supported' ).get( () => false );

				editor = await ModelTestEditor.create( { plugins: [ Typing ] } );

				model = editor.model;
				model.schema.register( 'paragraph', { inheritAllFrom: '$block' } );
			} );

			afterEach( async () => {
				await editor.destroy();
			} );

			it( 'should use typing batch while removing the content', () => {
				const insertTextCommand = editor.commands.get( 'insertText' );

				expect( insertTextCommand._batches.has( getCurrentBatch() ), 'batch before typing' ).to.equal( false );

				model.on( 'deleteContent', () => {
					expect( insertTextCommand._batches.has( getCurrentBatch() ), 'batch when deleting content' ).to.equal( true );
				}, { priority: 'highest' } );

				setData( model, '<paragraph>[foo]</paragraph>' );

				editor.editing.view.document.fire( 'keydown', new DomEventData( editor.editing.view.document, {
					preventDefault: () => {},
					keyCode: getCode( 'A' )
				} ) );

				expect( getData( model ) ).to.equal( '<paragraph>[]</paragraph>' );

				function getCurrentBatch() {
					return editor.model.change( writer => writer.batch );
				}
			} );
		} );
	} );
} );
