/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import AttributeCommand from '../src/attributecommand';

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor';

import Document from '@ckeditor/ckeditor5-engine/src/model/document';
import Batch from '@ckeditor/ckeditor5-engine/src/model/batch';
import Range from '@ckeditor/ckeditor5-engine/src/model/range';
import Position from '@ckeditor/ckeditor5-engine/src/model/position';
import { setData, getData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

describe( 'AttributeCommand', () => {
	const attrKey = 'bold';
	let editor, command, doc, root;

	beforeEach( () => {
		return ModelTestEditor
			.create()
			.then( newEditor => {
				editor = newEditor;
				doc = editor.document;
				root = doc.getRoot();

				command = new AttributeCommand( editor, attrKey );

				doc.schema.registerItem( 'p', '$block' );
				doc.schema.registerItem( 'h1', '$block' );
				doc.schema.registerItem( 'img', '$inline' );
				doc.schema.objects.add( 'img' );

				// Allow block in "root" (DIV)
				doc.schema.allow( { name: '$block', inside: '$root' } );

				// Bold text is allowed only in P.
				doc.schema.allow( { name: '$text', attributes: 'bold', inside: 'p' } );
				doc.schema.allow( { name: 'p', attributes: 'bold', inside: '$root' } );

				// Disallow bold on image.
				doc.schema.disallow( { name: 'img', attributes: 'bold', inside: '$root' } );
			} );
	} );

	afterEach( () => {
		command.destroy();

		return editor.destroy();
	} );

	describe( 'value', () => {
		it( 'is true when selection has the attribute', () => {
			doc.enqueueChanges( () => {
				doc.selection.setAttribute( attrKey, true );
			} );

			expect( command.value ).to.be.true;
		} );

		it( 'is false when selection does not have the attribute', () => {
			doc.enqueueChanges( () => {
				doc.selection.removeAttribute( attrKey );
			} );

			expect( command.value ).to.be.false;
		} );

		// See https://github.com/ckeditor/ckeditor5-core/issues/73#issuecomment-311572827.
		it( 'is false when selection contains object with nested editable', () => {
			doc.schema.registerItem( 'caption', '$block' );
			doc.schema.allow( { name: '$inline', inside: 'caption' } );
			doc.schema.allow( { name: 'caption', inside: 'img' } );
			doc.schema.allow( { name: '$text', attributes: 'bold', inside: 'caption' } );

			setData( doc, '<p>[<img><caption>Some caption inside the image.</caption></img>]</p>' );

			expect( command.value ).to.be.false;
			command.execute();
			expect( command.value ).to.be.false;

			expect( getData( doc ) ).to.equal(
				'<p>[<img><caption><$text bold="true">Some caption inside the image.</$text></caption></img>]</p>'
			);
		} );
	} );

	describe( 'isEnabled', () => {
		// This test doesn't tests every possible case.
		// Method `refresh()` uses `checkAttributeInSelection()` which is fully tested in its own test.

		beforeEach( () => {
			doc.schema.registerItem( 'x', '$block' );
			doc.schema.disallow( { name: '$text', inside: 'x', attributes: 'link' } );
		} );

		describe( 'when selection is collapsed', () => {
			it( 'should return true if characters with the attribute can be placed at caret position', () => {
				setData( doc, '<p>f[]oo</p>' );
				expect( command.isEnabled ).to.be.true;
			} );

			it( 'should return false if characters with the attribute cannot be placed at caret position', () => {
				setData( doc, '<x>fo[]o</x>' );
				expect( command.isEnabled ).to.be.false;
			} );
		} );

		describe( 'when selection is not collapsed', () => {
			it( 'should return true if there is at least one node in selection that can have the attribute', () => {
				setData( doc, '<p>[foo]</p>' );
				expect( command.isEnabled ).to.be.true;
			} );

			it( 'should return false if there are no nodes in selection that can have the attribute', () => {
				setData( doc, '<x>[foo]</x>' );
				expect( command.isEnabled ).to.be.false;
			} );
		} );
	} );

	describe( 'execute()', () => {
		it( 'should do nothing if the command is disabled', () => {
			setData( doc, '<p>fo[ob]ar</p>' );

			command.isEnabled = false;

			command.execute();

			expect( getData( doc ) ).to.equal( '<p>fo[ob]ar</p>' );
		} );

		it( 'should add attribute on selected nodes if the command value was false', () => {
			setData( doc, '<p>a[bc<$text bold="true">fo]obar</$text>xyz</p>' );

			expect( command.value ).to.be.false;

			command.execute();

			expect( command.value ).to.be.true;
			expect( getData( doc ) ).to.equal( '<p>a[<$text bold="true">bcfo]obar</$text>xyz</p>' );
		} );

		it( 'should remove attribute from selected nodes if the command value was true', () => {
			setData( doc, '<p>abc[<$text bold="true">foo]bar</$text>xyz</p>' );

			expect( command.value ).to.be.true;

			command.execute();

			expect( getData( doc ) ).to.equal( '<p>abc[foo]<$text bold="true">bar</$text>xyz</p>' );
			expect( command.value ).to.be.false;
		} );

		it( 'should add attribute on selected nodes if execute parameter was set to true', () => {
			setData( doc, '<p>abc<$text bold="true">foob[ar</$text>x]yz</p>' );

			expect( command.value ).to.be.true;

			command.execute( { forceValue: true } );

			expect( command.value ).to.be.true;
			expect( getData( doc ) ).to.equal( '<p>abc<$text bold="true">foob[arx</$text>]yz</p>' );
		} );

		it( 'should remove attribute on selected nodes if execute parameter was set to false', () => {
			setData( doc, '<p>a[bc<$text bold="true">fo]obar</$text>xyz</p>' );

			command.execute( { forceValue: false } );

			expect( command.value ).to.be.false;
			expect( getData( doc ) ).to.equal( '<p>a[bcfo]<$text bold="true">obar</$text>xyz</p>' );
		} );

		it( 'should change selection attribute if selection is collapsed in non-empty parent', () => {
			setData( doc, '<p>a[]bc<$text bold="true">foobar</$text>xyz</p><p></p>' );

			expect( command.value ).to.be.false;

			command.execute();

			expect( command.value ).to.be.true;
			expect( doc.selection.hasAttribute( 'bold' ) ).to.be.true;

			command.execute();

			expect( command.value ).to.be.false;
			expect( doc.selection.hasAttribute( 'bold' ) ).to.be.false;
		} );

		it( 'should not store attribute change on selection if selection is collapsed in non-empty parent', () => {
			setData( doc, '<p>a[]bc<$text bold="true">foobar</$text>xyz</p>' );

			command.execute();

			// It should not save that bold was executed at position ( root, [ 0, 1 ] ).

			doc.enqueueChanges( () => {
				// Simulate clicking right arrow key by changing selection ranges.
				doc.selection.setRanges( [ new Range( new Position( root, [ 0, 2 ] ), new Position( root, [ 0, 2 ] ) ) ] );

				// Get back to previous selection.
				doc.selection.setRanges( [ new Range( new Position( root, [ 0, 1 ] ), new Position( root, [ 0, 1 ] ) ) ] );
			} );

			expect( command.value ).to.be.false;
		} );

		it( 'should change selection attribute and store it if selection is collapsed in empty parent', () => {
			setData( doc, '<p>abc<$text bold="true">foobar</$text>xyz</p><p>[]</p>' );

			expect( command.value ).to.be.false;

			command.execute();

			expect( command.value ).to.be.true;
			expect( doc.selection.hasAttribute( 'bold' ) ).to.be.true;

			// Attribute should be stored.
			// Simulate clicking somewhere else in the editor.
			doc.enqueueChanges( () => {
				doc.selection.setRanges( [ new Range( new Position( root, [ 0, 2 ] ), new Position( root, [ 0, 2 ] ) ) ] );
			} );

			expect( command.value ).to.be.false;

			// Go back to where attribute was stored.
			doc.enqueueChanges( () => {
				doc.selection.setRanges( [ new Range( new Position( root, [ 1, 0 ] ), new Position( root, [ 1, 0 ] ) ) ] );
			} );

			// Attribute should be restored.
			expect( command.value ).to.be.true;

			command.execute();

			expect( command.value ).to.be.false;
			expect( doc.selection.hasAttribute( 'bold' ) ).to.be.false;
		} );

		it( 'should not apply attribute change where it would invalid schema', () => {
			doc.schema.registerItem( 'image', '$block' );
			setData( doc, '<p>ab[c<img></img><$text bold="true">foobar</$text>xy<img></img>]z</p>' );

			expect( command.isEnabled ).to.be.true;

			command.execute();

			expect( getData( doc ) )
				.to.equal( '<p>ab[<$text bold="true">c</$text><img></img><$text bold="true">foobarxy</$text><img></img>]z</p>' );
		} );

		it( 'should use provided batch for storing undo steps', () => {
			const batch = new Batch( new Document() );
			setData( doc, '<p>a[bc<$text bold="true">fo]obar</$text>xyz</p>' );

			expect( batch.deltas.length ).to.equal( 0 );

			command.execute( { batch } );

			expect( batch.deltas.length ).to.equal( 1 );
			expect( getData( doc ) ).to.equal( '<p>a[<$text bold="true">bcfo]obar</$text>xyz</p>' );
		} );

		describe( 'should cause firing model document changesDone event', () => {
			let spy;

			beforeEach( () => {
				spy = sinon.spy();
			} );

			it( 'collapsed selection in non-empty parent', () => {
				setData( doc, '<p>x[]y</p>' );

				doc.on( 'changesDone', spy );

				command.execute();

				expect( spy.calledOnce ).to.be.true;
			} );

			it( 'non-collapsed selection', () => {
				setData( doc, '<p>[xy]</p>' );

				doc.on( 'changesDone', spy );

				command.execute();

				expect( spy.calledOnce ).to.be.true;
			} );

			it( 'in empty parent', () => {
				setData( doc, '<p>[]</p>' );

				doc.on( 'changesDone', spy );

				command.execute();

				expect( spy.calledOnce ).to.be.true;
			} );
		} );
	} );
} );
