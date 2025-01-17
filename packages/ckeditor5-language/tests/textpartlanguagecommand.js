/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import { setData, getData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';

import TextPartLanguageCommand from '../src/textpartlanguagecommand.js';

describe( 'TextPartLanguageCommand', () => {
	let editor, command, model, doc, root;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		return ModelTestEditor
			.create()
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				doc = model.document;
				root = doc.getRoot();

				command = new TextPartLanguageCommand( editor );

				model.schema.register( 'p', { inheritAllFrom: '$block' } );
				model.schema.register( 'h1', { inheritAllFrom: '$block' } );
				model.schema.register( 'img', {
					allowWhere: [ '$block', '$text' ],
					isObject: true
				} );

				model.schema.addAttributeCheck( ( ctx, attributeName ) => {
					// Allow 'language' on p>$text.
					if ( ctx.endsWith( 'p $text' ) && attributeName == 'language' ) {
						return true;
					}
				} );
			} );
	} );

	afterEach( () => {
		command.destroy();

		return editor.destroy();
	} );

	describe( 'value', () => {
		it( 'includes language when collapsed selection has the attribute', () => {
			model.change( writer => {
				writer.setSelectionAttribute( 'language', 'fr:ltr' );
			} );

			expect( command.value ).to.equal( 'fr:ltr' );
		} );

		it( 'is false when collapsed selection does not have the attribute', () => {
			model.change( writer => {
				writer.setSelectionAttribute( 'language', 'fr:ltr' );
			} );

			model.change( writer => {
				writer.removeSelectionAttribute( 'language' );
			} );

			expect( command.value ).to.be.false;
		} );

		it( 'includes language when the first item that allows attribute has the attribute #1', () => {
			setData( model, '<p><$text language="fr:ltr">fo[o</$text></p><h1>b]ar</h1>' );

			expect( command.value ).to.equal( 'fr:ltr' );
		} );

		it( 'includes language when the first item that allows attribute has the attribute #2', () => {
			setData( model, '<h1>fo[o</h1><p><$text language="fr:ltr">f</$text>o]o</p>' );

			expect( command.value ).to.equal( 'fr:ltr' );
		} );

		it( 'is false when the selection does not have the attribute', () => {
			setData( model, '<p>[foo]bar</p>' );

			expect( command.value ).to.be.false;
		} );

		it( 'is false when the first item that allows attribute does not have the attribute #1', () => {
			setData( model, '<p>b[a<$text language="fr:ltr">r</$text></p><h1>fo]o</h1>' );

			expect( command.value ).to.be.false;
		} );

		it( 'is false when the first item that allows attribute does not have the attribute #2', () => {
			setData( model, '<h1>fo[o</h1><p>b<$text language="fr:ltr">r</$text>r]</p>' );

			expect( command.value ).to.be.false;
		} );

		it( 'includes language when the first item that allows attribute has the attribute - object with nested editable', () => {
			model.schema.register( 'caption', {
				allowContentOf: '$block',
				allowIn: 'img',
				isLimit: true
			} );
			model.schema.extend( '$text', {
				allowIn: 'caption',
				allowAttributes: 'language'
			} );

			setData( model, '<p>[<img><caption>Some caption inside the image.</caption></img>]</p>' );

			expect( command.value ).to.be.false;
			command.execute( { languageCode: 'fr', textDirection: 'ltr' } );

			expect( command.value ).to.equal( 'fr:ltr' );

			expect( getData( model ) ).to.equal(
				'<p>[<img><caption><$text language="fr:ltr">Some caption inside the image.</$text></caption></img>]</p>'
			);
		} );
	} );

	describe( 'isEnabled', () => {
		// This test doesn't tests every possible case.
		// Method `refresh()` uses `checkAttributeInSelection()` which is fully tested in its own test.

		beforeEach( () => {
			model.schema.register( 'x', { inheritAllFrom: '$block' } );
		} );

		describe( 'when selection is collapsed', () => {
			it( 'should return true if characters with the attribute can be placed at caret position', () => {
				setData( model, '<p>f[]oo</p>' );
				expect( command.isEnabled ).to.be.true;
			} );

			it( 'should return false if characters with the attribute cannot be placed at caret position', () => {
				setData( model, '<x>fo[]o</x>' );
				expect( command.isEnabled ).to.be.false;
			} );
		} );

		describe( 'when selection is not collapsed', () => {
			it( 'should return true if there is at least one node in selection that can have the attribute', () => {
				setData( model, '<p>[foo]</p>' );
				expect( command.isEnabled ).to.be.true;
			} );

			it( 'should return false if there are no nodes in selection that can have the attribute', () => {
				setData( model, '<x>[foo]</x>' );
				expect( command.isEnabled ).to.be.false;
			} );
		} );

		it( 'should be disabled in a readonly mode', () => {
			editor.enableReadOnlyMode( 'unit-test' );
			setData( model, '<p>f[]oo</p>' );
			expect( command.isEnabled ).to.be.false;
		} );
	} );

	describe( 'execute()', () => {
		it( 'should do nothing if the command is disabled', () => {
			setData( model, '<p>fo[ob]ar</p>' );

			command.isEnabled = false;

			command.execute( { languageCode: 'fr', textDirection: 'ltr' } );

			expect( getData( model ) ).to.equal( '<p>fo[ob]ar</p>' );
		} );

		it( 'should add attribute on selected nodes if the command value was not set', () => {
			setData( model, '<p>a[bc<$text language="fr:ltr">fo]obar</$text>xyz</p>' );

			expect( command.value ).to.be.false;

			command.execute( { languageCode: 'fr', textDirection: 'ltr' } );

			expect( command.value ).to.equal( 'fr:ltr' );
			expect( getData( model ) ).to.equal( '<p>a[<$text language="fr:ltr">bcfo]obar</$text>xyz</p>' );
		} );

		it( 'should remove attribute from selected nodes if the command value was not set', () => {
			setData( model, '<p>abc[<$text language="fr:ltr">foo]bar</$text>xyz</p>' );

			expect( command.value ).to.equal( 'fr:ltr' );

			command.execute();

			expect( getData( model ) ).to.equal( '<p>abc[foo]<$text language="fr:ltr">bar</$text>xyz</p>' );
			expect( command.value ).to.be.false;
		} );

		it( 'should replace attribute on selected nodes if execute parameter was set', () => {
			setData( model, '<p>abc<$text language="fr:ltr">foob[ar</$text>x]yz</p>' );

			expect( command.value ).to.equal( 'fr:ltr' );

			command.execute( { languageCode: 'ar', textDirection: 'rtl' } );

			expect( command.value ).to.equal( 'ar:rtl' );
			expect( getData( model ) ).to.equal(
				'<p>abc<$text language="fr:ltr">foob</$text>[<$text language="ar:rtl">arx</$text>]yz</p>'
			);
		} );

		it( 'should remove attribute on selected nodes if execute parameter was set to false', () => {
			setData( model, '<p>a[bc<$text language="fr:ltr">fo]obar</$text>xyz</p>' );

			command.execute( { languageCode: false } );

			expect( command.value ).to.be.false;
			expect( getData( model ) ).to.equal( '<p>a[bcfo]<$text language="fr:ltr">obar</$text>xyz</p>' );
		} );

		it( 'should remove attribute on selected nodes if execute parameter was set to null', () => {
			setData( model, '<p>a[bc<$text language="fr:ltr">fo]obar</$text>xyz</p>' );

			command.execute( { languageCode: null } );

			expect( command.value ).to.be.false;
			expect( getData( model ) ).to.equal( '<p>a[bcfo]<$text language="fr:ltr">obar</$text>xyz</p>' );
		} );

		it( 'should change selection attribute if selection is collapsed in non-empty parent', () => {
			setData( model, '<p>a[]bc<$text language="fr:ltr">foobar</$text>xyz</p><p></p>' );

			expect( command.value ).to.be.false;

			command.execute( { languageCode: 'ar', textDirection: 'rtl' } );

			expect( command.value ).to.equal( 'ar:rtl' );
			expect( doc.selection.getAttribute( 'language' ) ).to.equal( 'ar:rtl' );

			command.execute( { languageCode: false } );

			expect( command.value ).to.be.false;
			expect( doc.selection.hasAttribute( 'language' ) ).to.be.false;
		} );

		it( 'should not store attribute change on selection if selection is collapsed in non-empty parent', () => {
			setData( model, '<p>a[]bc<$text language="fr:ltr">foobar</$text>xyz</p>' );

			command.execute( { languageCode: 'ar', textDirection: 'rtl' } );

			// It should not save that language was executed at position ( root, [ 0, 1 ] ).

			model.change( writer => {
				// Simulate clicking right arrow key by changing selection ranges.
				writer.setSelection( writer.createRange(
					writer.createPositionAt( root.getNodeByPath( [ 0 ] ), 2 )
				) );

				// Get back to previous selection.
				writer.setSelection( writer.createRange(
					writer.createPositionAt( root.getNodeByPath( [ 0 ] ), 1 )
				) );
			} );

			expect( command.value ).to.be.false;
		} );

		it( 'should change selection attribute and store it if selection is collapsed in empty parent', () => {
			setData( model, '<p>abc<$text language="fr:ltr">foobar</$text>xyz</p><p>[]</p>' );

			expect( command.value ).to.be.false;

			command.execute( { languageCode: 'ar', textDirection: 'rtl' } );

			expect( command.value ).to.equal( 'ar:rtl' );
			expect( doc.selection.getAttribute( 'language' ) ).to.equal( 'ar:rtl' );

			// Attribute should be stored.
			// Simulate clicking somewhere else in the editor.
			model.change( writer => {
				writer.setSelection( root.getNodeByPath( [ 0 ] ), 2 );
			} );

			expect( command.value ).to.be.false;

			// Go back to where attribute was stored.
			model.change( writer => {
				writer.setSelection( root.getNodeByPath( [ 1 ] ), 0 );
			} );

			// Attribute should be restored.
			expect( command.value ).to.equal( 'ar:rtl' );

			command.execute( { languageCode: false } );

			expect( command.value ).to.be.false;
			expect( doc.selection.hasAttribute( 'language' ) ).to.be.false;
		} );

		it( 'should force language text direction if textDirection was set', () => {
			setData( model, '<p>x[]y</p>' );

			command.execute( { languageCode: 'ar', textDirection: 'ltr' } );

			expect( command.value ).to.equal( 'ar:ltr' );
			expect( doc.selection.getAttribute( 'language' ) ).to.equal( 'ar:ltr' );
		} );

		it( 'should detect language text direction if textDirection was not set', () => {
			setData( model, '<p>x[]y</p>' );

			command.execute( { languageCode: 'ar' } );

			expect( command.value ).to.equal( 'ar:rtl' );
			expect( doc.selection.getAttribute( 'language' ) ).to.equal( 'ar:rtl' );
		} );

		describe( 'model change event', () => {
			let spy;

			beforeEach( () => {
				spy = sinon.spy();
			} );

			describe( 'should be fired when execute parameter was set to language', () => {
				it( 'collapsed selection in non-empty parent', () => {
					setData( model, '<p>x[]y</p>' );

					model.document.on( 'change', spy );

					command.execute( { languageCode: 'fr' } );

					expect( spy.called ).to.be.true;
				} );

				it( 'non-collapsed selection', () => {
					setData( model, '<p>[xy]</p>' );

					model.document.on( 'change', spy );

					command.execute( { languageCode: 'fr' } );

					expect( spy.called ).to.be.true;
				} );

				it( 'in empty parent', () => {
					setData( model, '<p>[]</p>' );

					model.document.on( 'change', spy );

					command.execute( { languageCode: 'fr' } );

					expect( spy.called ).to.be.true;
				} );
			} );

			describe( 'should not be fired when execute parameter was set to false', () => {
				it( 'collapsed selection in non-empty parent', () => {
					setData( model, '<p>x[]y</p>' );

					model.document.on( 'change', spy );

					command.execute( { languageCode: false } );

					expect( spy.called ).to.be.false;
				} );

				it( 'non-collapsed selection', () => {
					setData( model, '<p>[xy]</p>' );

					model.document.on( 'change', spy );

					command.execute( { languageCode: false } );

					expect( spy.called ).to.be.false;
				} );

				it( 'in empty parent', () => {
					setData( model, '<p>[]</p>' );

					model.document.on( 'change', spy );

					command.execute( { languageCode: false } );

					expect( spy.called ).to.be.false;
				} );
			} );
		} );
	} );
} );
