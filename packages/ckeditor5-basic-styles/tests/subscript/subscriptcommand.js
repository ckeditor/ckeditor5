/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { SubscriptEditing } from '../../src/subscript/subscriptediting.js';
import { SuperscriptEditing } from '../../src/superscript/superscriptediting.js';
import { MutuallyExclusiveAttributeCommand } from '../../src/mutuallyexclusiveattributecommand.js';
import { AttributeCommand } from '../../src/attributecommand.js';

import { VirtualTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { UndoEditing } from '@ckeditor/ckeditor5-undo';
import { _getModelData, _setModelData } from '@ckeditor/ckeditor5-engine';

describe( 'SubscriptCommand', () => {
	let editor, model, command;

	function createEditor( config = {} ) {
		return VirtualTestEditor
			.create( {
				plugins: [ Paragraph, UndoEditing, SubscriptEditing, SuperscriptEditing ],
				...config
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				command = editor.commands.get( 'subscript' );
			} );
	}

	afterEach( () => {
		return editor.destroy();
	} );

	describe( 'instance', () => {
		beforeEach( () => createEditor() );

		it( 'is an instance of MutuallyExclusiveAttributeCommand', () => {
			expect( command ).to.be.instanceOf( MutuallyExclusiveAttributeCommand );
		} );

		it( 'is an instance of AttributeCommand', () => {
			expect( command ).to.be.instanceOf( AttributeCommand );
		} );

		it( 'has the subscript attribute key', () => {
			expect( command.attributeKey ).to.equal( 'subscript' );
		} );
	} );

	describe( 'config defaults', () => {
		beforeEach( () => createEditor() );

		it( 'sets basicStyles.subscript.allowNesting to false by default', () => {
			expect( editor.config.get( 'basicStyles.subscript.allowNesting' ) ).to.be.false;
		} );
	} );

	describe( 'execute() with mutual exclusion (default)', () => {
		beforeEach( () => createEditor() );

		it( 'sets subscript on plain text without touching neighbors', () => {
			_setModelData( model, '<paragraph>[foo]</paragraph>' );

			editor.execute( 'subscript' );

			expect( _getModelData( model, { withoutSelection: true } ) ).to.equal(
				'<paragraph><$text subscript="true">foo</$text></paragraph>'
			);
		} );

		it( 'removes superscript when applying subscript on superscripted text', () => {
			_setModelData( model, '<paragraph>[<$text superscript="true">foo</$text>]</paragraph>' );

			editor.execute( 'subscript' );

			expect( _getModelData( model, { withoutSelection: true } ) ).to.equal(
				'<paragraph><$text subscript="true">foo</$text></paragraph>'
			);
		} );

		it( 'removes superscript on a non-collapsed range crossing sup | none | sub regions', () => {
			_setModelData( model,
				'<paragraph>' +
					'[<$text superscript="true">aa</$text>' +
					'bb' +
					'<$text subscript="true">cc</$text>]' +
				'</paragraph>'
			);

			editor.execute( 'subscript' );

			expect( _getModelData( model, { withoutSelection: true } ) ).to.equal(
				'<paragraph><$text subscript="true">aabbcc</$text></paragraph>'
			);
		} );

		it( 'does not touch superscript when toggling subscript off', () => {
			_setModelData( model, '<paragraph>[<$text subscript="true">foo</$text>]</paragraph>' );

			editor.execute( 'subscript' );

			expect( _getModelData( model, { withoutSelection: true } ) ).to.equal(
				'<paragraph>foo</paragraph>'
			);
		} );

		it( 'does not touch superscript adjacent to plain text when toggling off via forceValue:false', () => {
			_setModelData( model,
				'<paragraph>[foo]<$text superscript="true">bar</$text></paragraph>'
			);

			editor.execute( 'subscript', { forceValue: false } );

			expect( _getModelData( model, { withoutSelection: true } ) ).to.equal(
				'<paragraph>foo<$text superscript="true">bar</$text></paragraph>'
			);
		} );

		it( 'removes superscript when forceValue:true on a superscripted range', () => {
			_setModelData( model, '<paragraph>[<$text superscript="true">foo</$text>]</paragraph>' );

			editor.execute( 'subscript', { forceValue: true } );

			expect( _getModelData( model, { withoutSelection: true } ) ).to.equal(
				'<paragraph><$text subscript="true">foo</$text></paragraph>'
			);
		} );

		it( 'flips selection attributes on a collapsed selection inside superscripted text', () => {
			_setModelData( model, '<paragraph><$text superscript="true">foo[]bar</$text></paragraph>' );

			editor.execute( 'subscript' );

			const selection = model.document.selection;

			expect( selection.hasAttribute( 'subscript' ) ).to.be.true;
			expect( selection.hasAttribute( 'superscript' ) ).to.be.false;
		} );

		it( 'removes the stored superscript on empty blocks inside a multi-block selection', () => {
			_setModelData( model, '[<paragraph>foo</paragraph><paragraph></paragraph><paragraph>foo</paragraph>]' );

			editor.execute( 'superscript' );
			editor.execute( 'subscript' );

			model.change( writer => {
				writer.setSelection( model.document.getRoot().getNodeByPath( [ 1 ] ), 0 );
			} );

			expect( model.document.selection.hasAttribute( 'superscript' ) ).to.be.false;
			expect( model.document.selection.hasAttribute( 'subscript' ) ).to.be.true;
		} );

		it( 'restores the original superscript with a single undo step', () => {
			_setModelData( model, '<paragraph>[<$text superscript="true">foo</$text>]</paragraph>' );

			editor.execute( 'subscript' );

			expect( _getModelData( model, { withoutSelection: true } ) ).to.equal(
				'<paragraph><$text subscript="true">foo</$text></paragraph>'
			);

			editor.execute( 'undo' );

			expect( _getModelData( model, { withoutSelection: true } ) ).to.equal(
				'<paragraph><$text superscript="true">foo</$text></paragraph>'
			);
		} );
	} );

	describe( 'execute() with allowNesting on the subscript side', () => {
		beforeEach( () => createEditor( { basicStyles: { subscript: { allowNesting: true } } } ) );

		it( 'preserves superscript when applying subscript', () => {
			_setModelData( model, '<paragraph>[<$text superscript="true">foo</$text>]</paragraph>' );

			editor.execute( 'subscript' );

			expect( _getModelData( model, { withoutSelection: true } ) ).to.equal(
				'<paragraph><$text subscript="true" superscript="true">foo</$text></paragraph>'
			);
		} );
	} );

	describe( 'execute() with allowNesting on the superscript side (OR semantics)', () => {
		beforeEach( () => createEditor( { basicStyles: { superscript: { allowNesting: true } } } ) );

		it( 'preserves superscript when applying subscript', () => {
			_setModelData( model, '<paragraph>[<$text superscript="true">foo</$text>]</paragraph>' );

			editor.execute( 'subscript' );

			expect( _getModelData( model, { withoutSelection: true } ) ).to.equal(
				'<paragraph><$text subscript="true" superscript="true">foo</$text></paragraph>'
			);
		} );
	} );
} );
