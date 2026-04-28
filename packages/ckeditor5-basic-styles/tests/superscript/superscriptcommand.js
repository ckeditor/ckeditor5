/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { SuperscriptEditing } from '../../src/superscript/superscriptediting.js';
import { SubscriptEditing } from '../../src/subscript/subscriptediting.js';
import { SuperscriptCommand } from '../../src/superscript/superscriptcommand.js';
import { AttributeCommand } from '../../src/attributecommand.js';

import { VirtualTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { UndoEditing } from '@ckeditor/ckeditor5-undo';
import { _getModelData, _setModelData } from '@ckeditor/ckeditor5-engine';

describe( 'SuperscriptCommand', () => {
	let editor, model, command;

	function createEditor( config = {} ) {
		return VirtualTestEditor
			.create( {
				plugins: [ Paragraph, UndoEditing, SuperscriptEditing, SubscriptEditing ],
				...config
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				command = editor.commands.get( 'superscript' );
			} );
	}

	afterEach( () => {
		return editor.destroy();
	} );

	describe( 'instance', () => {
		beforeEach( () => createEditor() );

		it( 'is an instance of SuperscriptCommand', () => {
			expect( command ).to.be.instanceOf( SuperscriptCommand );
		} );

		it( 'is an instance of AttributeCommand', () => {
			expect( command ).to.be.instanceOf( AttributeCommand );
		} );

		it( 'has the superscript attribute key', () => {
			expect( command.attributeKey ).to.equal( 'superscript' );
		} );
	} );

	describe( 'config defaults', () => {
		beforeEach( () => createEditor() );

		it( 'sets superscript.allowNesting to false by default', () => {
			expect( editor.config.get( 'superscript.allowNesting' ) ).to.be.false;
		} );
	} );

	describe( 'execute() with mutual exclusion (default)', () => {
		beforeEach( () => createEditor() );

		it( 'sets superscript on plain text without touching neighbors', () => {
			_setModelData( model, '<paragraph>[foo]</paragraph>' );

			editor.execute( 'superscript' );

			expect( _getModelData( model, { withoutSelection: true } ) ).to.equal(
				'<paragraph><$text superscript="true">foo</$text></paragraph>'
			);
		} );

		it( 'removes subscript when applying superscript on subscripted text', () => {
			_setModelData( model, '<paragraph>[<$text subscript="true">foo</$text>]</paragraph>' );

			editor.execute( 'superscript' );

			expect( _getModelData( model, { withoutSelection: true } ) ).to.equal(
				'<paragraph><$text superscript="true">foo</$text></paragraph>'
			);
		} );

		it( 'removes subscript on a non-collapsed range crossing sub | none | sup regions', () => {
			_setModelData( model,
				'<paragraph>' +
					'[<$text subscript="true">aa</$text>' +
					'bb' +
					'<$text superscript="true">cc</$text>]' +
				'</paragraph>'
			);

			editor.execute( 'superscript' );

			expect( _getModelData( model, { withoutSelection: true } ) ).to.equal(
				'<paragraph><$text superscript="true">aabbcc</$text></paragraph>'
			);
		} );

		it( 'does not touch subscript when toggling superscript off', () => {
			_setModelData( model, '<paragraph>[<$text superscript="true">foo</$text>]</paragraph>' );

			editor.execute( 'superscript' );

			expect( _getModelData( model, { withoutSelection: true } ) ).to.equal(
				'<paragraph>foo</paragraph>'
			);
		} );

		it( 'does not touch subscript adjacent to plain text when toggling off via forceValue:false', () => {
			_setModelData( model,
				'<paragraph>[foo]<$text subscript="true">bar</$text></paragraph>'
			);

			editor.execute( 'superscript', { forceValue: false } );

			expect( _getModelData( model, { withoutSelection: true } ) ).to.equal(
				'<paragraph>foo<$text subscript="true">bar</$text></paragraph>'
			);
		} );

		it( 'removes subscript when forceValue:true on a subscripted range', () => {
			_setModelData( model, '<paragraph>[<$text subscript="true">foo</$text>]</paragraph>' );

			editor.execute( 'superscript', { forceValue: true } );

			expect( _getModelData( model, { withoutSelection: true } ) ).to.equal(
				'<paragraph><$text superscript="true">foo</$text></paragraph>'
			);
		} );

		it( 'flips selection attributes on a collapsed selection inside subscripted text', () => {
			_setModelData( model, '<paragraph><$text subscript="true">foo[]bar</$text></paragraph>' );

			editor.execute( 'superscript' );

			const selection = model.document.selection;

			expect( selection.hasAttribute( 'superscript' ) ).to.be.true;
			expect( selection.hasAttribute( 'subscript' ) ).to.be.false;
		} );

		it( 'restores the original subscript with a single undo step', () => {
			_setModelData( model, '<paragraph>[<$text subscript="true">foo</$text>]</paragraph>' );

			editor.execute( 'superscript' );

			expect( _getModelData( model, { withoutSelection: true } ) ).to.equal(
				'<paragraph><$text superscript="true">foo</$text></paragraph>'
			);

			editor.execute( 'undo' );

			expect( _getModelData( model, { withoutSelection: true } ) ).to.equal(
				'<paragraph><$text subscript="true">foo</$text></paragraph>'
			);
		} );
	} );

	describe( 'execute() with allowNesting on the superscript side', () => {
		beforeEach( () => createEditor( { superscript: { allowNesting: true } } ) );

		it( 'preserves subscript when applying superscript', () => {
			_setModelData( model, '<paragraph>[<$text subscript="true">foo</$text>]</paragraph>' );

			editor.execute( 'superscript' );

			expect( _getModelData( model, { withoutSelection: true } ) ).to.equal(
				'<paragraph><$text subscript="true" superscript="true">foo</$text></paragraph>'
			);
		} );
	} );

	describe( 'execute() with allowNesting on the subscript side (OR semantics)', () => {
		beforeEach( () => createEditor( { subscript: { allowNesting: true } } ) );

		it( 'preserves subscript when applying superscript', () => {
			_setModelData( model, '<paragraph>[<$text subscript="true">foo</$text>]</paragraph>' );

			editor.execute( 'superscript' );

			expect( _getModelData( model, { withoutSelection: true } ) ).to.equal(
				'<paragraph><$text subscript="true" superscript="true">foo</$text></paragraph>'
			);
		} );
	} );
} );
