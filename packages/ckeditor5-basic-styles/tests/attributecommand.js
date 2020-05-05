/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import AttributeCommand from '../src/attributecommand';

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor';

import { setData, getData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

describe( 'AttributeCommand', () => {
	const attrKey = 'bold';
	let editor, command, model, doc, root;

	beforeEach( () => {
		return ModelTestEditor
			.create()
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				doc = model.document;
				root = doc.getRoot();

				command = new AttributeCommand( editor, attrKey );

				model.schema.register( 'p', { inheritAllFrom: '$block' } );
				model.schema.register( 'h1', { inheritAllFrom: '$block' } );
				model.schema.register( 'img', {
					allowWhere: [ '$block', '$text' ],
					isObject: true
				} );

				model.schema.addAttributeCheck( ( ctx, attributeName ) => {
					// Allow 'bold' on p>$text.
					if ( ctx.endsWith( 'p $text' ) && attributeName == 'bold' ) {
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
		it( 'is true when collapsed selection has the attribute', () => {
			model.change( writer => {
				writer.setSelectionAttribute( attrKey, true );
			} );

			expect( command.value ).to.be.true;
		} );

		it( 'is false when collapsed selection does not have the attribute', () => {
			model.change( writer => {
				writer.setSelectionAttribute( attrKey, true );
			} );

			model.change( writer => {
				writer.removeSelectionAttribute( attrKey );
			} );

			expect( command.value ).to.be.false;
		} );

		it( 'is true when the first item that allows attribute has the attribute set #1', () => {
			setData( model, '<p><$text bold="true">fo[o</$text></p><h1>b]ar</h1>' );

			expect( command.value ).to.be.true;
		} );

		it( 'is true when the first item that allows attribute has the attribute set #2', () => {
			setData( model, '<h1>fo[o</h1><p><$text bold="true">f</$text>o]o</p>' );

			expect( command.value ).to.be.true;
		} );

		it( 'is false when the first item that allows attribute does not have the attribute set #1', () => {
			setData( model, '<p>b[a<$text bold="true">r</$text></p><h1>fo]o</h1>' );

			expect( command.value ).to.be.false;
		} );

		it( 'is false when the first item that allows attribute does not have the attribute set #2', () => {
			setData( model, '<h1>fo[o</h1><p>b<$text bold="true">r</$text>r]</p>' );

			expect( command.value ).to.be.false;
		} );

		it( 'is true when the first item that allows attribute has the attribute set - object with nested editable', () => {
			model.schema.register( 'caption', {
				allowContentOf: '$block',
				allowIn: 'img',
				isLimit: true
			} );
			model.schema.extend( '$text', {
				allowIn: 'caption',
				allowAttributes: 'bold'
			} );

			setData( model, '<p>[<img><caption>Some caption inside the image.</caption></img>]</p>' );

			expect( command.value ).to.be.false;
			command.execute();
			expect( command.value ).to.be.true;

			expect( getData( model ) ).to.equal(
				'<p>[<img><caption><$text bold="true">Some caption inside the image.</$text></caption></img>]</p>'
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
	} );

	describe( 'execute()', () => {
		it( 'should do nothing if the command is disabled', () => {
			setData( model, '<p>fo[ob]ar</p>' );

			command.isEnabled = false;

			command.execute();

			expect( getData( model ) ).to.equal( '<p>fo[ob]ar</p>' );
		} );

		it( 'should add attribute on selected nodes if the command value was false', () => {
			setData( model, '<p>a[bc<$text bold="true">fo]obar</$text>xyz</p>' );

			expect( command.value ).to.be.false;

			command.execute();

			expect( command.value ).to.be.true;
			expect( getData( model ) ).to.equal( '<p>a[<$text bold="true">bcfo]obar</$text>xyz</p>' );
		} );

		it( 'should remove attribute from selected nodes if the command value was true', () => {
			setData( model, '<p>abc[<$text bold="true">foo]bar</$text>xyz</p>' );

			expect( command.value ).to.be.true;

			command.execute();

			expect( getData( model ) ).to.equal( '<p>abc[foo]<$text bold="true">bar</$text>xyz</p>' );
			expect( command.value ).to.be.false;
		} );

		it( 'should add attribute on selected nodes if execute parameter was set to true', () => {
			setData( model, '<p>abc<$text bold="true">foob[ar</$text>x]yz</p>' );

			expect( command.value ).to.be.true;

			command.execute( { forceValue: true } );

			expect( command.value ).to.be.true;
			expect( getData( model ) ).to.equal( '<p>abc<$text bold="true">foob[arx</$text>]yz</p>' );
		} );

		it( 'should remove attribute on selected nodes if execute parameter was set to false', () => {
			setData( model, '<p>a[bc<$text bold="true">fo]obar</$text>xyz</p>' );

			command.execute( { forceValue: false } );

			expect( command.value ).to.be.false;
			expect( getData( model ) ).to.equal( '<p>a[bcfo]<$text bold="true">obar</$text>xyz</p>' );
		} );

		it( 'should change selection attribute if selection is collapsed in non-empty parent', () => {
			setData( model, '<p>a[]bc<$text bold="true">foobar</$text>xyz</p><p></p>' );

			expect( command.value ).to.be.false;

			command.execute();

			expect( command.value ).to.be.true;
			expect( doc.selection.hasAttribute( 'bold' ) ).to.be.true;

			command.execute();

			expect( command.value ).to.be.false;
			expect( doc.selection.hasAttribute( 'bold' ) ).to.be.false;
		} );

		it( 'should not store attribute change on selection if selection is collapsed in non-empty parent', () => {
			setData( model, '<p>a[]bc<$text bold="true">foobar</$text>xyz</p>' );

			command.execute();

			// It should not save that bold was executed at position ( root, [ 0, 1 ] ).

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
			setData( model, '<p>abc<$text bold="true">foobar</$text>xyz</p><p>[]</p>' );

			expect( command.value ).to.be.false;

			command.execute();

			expect( command.value ).to.be.true;
			expect( doc.selection.hasAttribute( 'bold' ) ).to.be.true;

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
			expect( command.value ).to.be.true;

			command.execute();

			expect( command.value ).to.be.false;
			expect( doc.selection.hasAttribute( 'bold' ) ).to.be.false;
		} );

		it( 'should not apply attribute change where it would invalid schema', () => {
			model.schema.register( 'image', { inheritAllFrom: '$block' } );
			setData( model, '<p>ab[c<img></img><$text bold="true">foobar</$text>xy<img></img>]z</p>' );

			expect( command.isEnabled ).to.be.true;

			command.execute();

			expect( getData( model ) )
				.to.equal( '<p>ab[<$text bold="true">c</$text><img></img><$text bold="true">foobarxy</$text><img></img>]z</p>' );
		} );

		it( 'should use parent batch for storing undo steps', () => {
			setData( model, '<p>a[bc<$text bold="true">fo]obar</$text>xyz</p>' );

			model.change( writer => {
				expect( writer.batch.operations.length ).to.equal( 0 );
				command.execute();
				expect( writer.batch.operations.length ).to.equal( 1 );
			} );

			expect( getData( model ) ).to.equal( '<p>a[<$text bold="true">bcfo]obar</$text>xyz</p>' );
		} );

		describe( 'should cause firing model change event', () => {
			let spy;

			beforeEach( () => {
				spy = sinon.spy();
			} );

			it( 'collapsed selection in non-empty parent', () => {
				setData( model, '<p>x[]y</p>' );

				model.document.on( 'change', spy );

				command.execute();

				expect( spy.called ).to.be.true;
			} );

			it( 'non-collapsed selection', () => {
				setData( model, '<p>[xy]</p>' );

				model.document.on( 'change', spy );

				command.execute();

				expect( spy.called ).to.be.true;
			} );

			it( 'in empty parent', () => {
				setData( model, '<p>[]</p>' );

				model.document.on( 'change', spy );

				command.execute();

				expect( spy.called ).to.be.true;
			} );
		} );
	} );
} );
