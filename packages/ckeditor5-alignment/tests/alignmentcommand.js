/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import AlignmentCommand from '../src/alignmentcommand.js';

import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';

import Command from '@ckeditor/ckeditor5-core/src/command.js';
import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor.js';

describe( 'AlignmentCommand', () => {
	let editor, model, command;

	beforeEach( () => {
		return ModelTestEditor.create()
			.then( newEditor => {
				model = newEditor.model;
				command = new AlignmentCommand( newEditor );
				editor = newEditor;

				editor.commands.add( 'alignment', command );

				model.schema.register( 'paragraph', { inheritAllFrom: '$block' } );
				model.schema.register( 'div', { inheritAllFrom: '$block' } );
				model.schema.extend( 'paragraph', { allowAttributes: 'alignment' } );
			} );
	} );

	afterEach( async () => {
		await editor.destroy();
	} );

	it( 'is a command', () => {
		expect( AlignmentCommand.prototype ).to.be.instanceOf( Command );
		expect( command ).to.be.instanceOf( Command );
	} );

	describe( 'value', () => {
		it( 'is set to block alignment when selection is in block that has alignment attribute set', () => {
			setModelData( model, '<paragraph alignment="center">x[]x</paragraph>' );

			expect( command ).to.have.property( 'value', 'center' );
		} );

		it( 'is set to default alignment when selection is in block with default alignment (LTR content)', () => {
			setModelData( model, '<paragraph>x[]x</paragraph>' );

			expect( command ).to.have.property( 'value', 'left' );
		} );

		it( 'is set to default alignment when selection is in block with default alignment (RTL content)', () => {
			return ModelTestEditor.create( {
				language: {
					content: 'ar'
				}
			} ).then( newEditor => {
				model = newEditor.model;
				command = new AlignmentCommand( newEditor );
				newEditor.commands.add( 'alignment', command );

				model.schema.register( 'paragraph', { inheritAllFrom: '$block' } );
				model.schema.register( 'div', { inheritAllFrom: '$block' } );
				model.schema.extend( 'paragraph', { allowAttributes: 'alignment' } );

				setModelData( model, '<paragraph>x[]x</paragraph>' );

				expect( command ).to.have.property( 'value', 'right' );

				return newEditor.destroy();
			} );
		} );
	} );

	describe( 'isEnabled', () => {
		it( 'is true when selection is in a block which can have added alignment', () => {
			setModelData( model, '<paragraph>x[]x</paragraph>' );

			expect( command ).to.have.property( 'isEnabled', true );
		} );

		it( 'is false when selection is in a block which cannot be aligned', () => {
			setModelData( model, '<div>x[]x</div>' );

			expect( command ).to.have.property( 'isEnabled', false );
		} );
	} );

	describe( 'execute()', () => {
		describe( 'applying alignment', () => {
			it( 'adds alignment to block element', () => {
				setModelData( model, '<paragraph>x[]x</paragraph>' );

				editor.execute( 'alignment', { value: 'center' } );

				expect( getModelData( model ) ).to.equal( '<paragraph alignment="center">x[]x</paragraph>' );
			} );

			it( 'should remove alignment from single block element if already has one (LTR content)', () => {
				setModelData( model, '<paragraph alignment="center">x[]x</paragraph>' );

				editor.execute( 'alignment', { value: 'left' } );

				expect( getModelData( model ) ).to.equal( '<paragraph>x[]x</paragraph>' );
			} );

			it( 'should remove alignment from single block element if already has one (RTL content)', () => {
				return ModelTestEditor.create( {
					language: {
						content: 'ar'
					}
				} ).then( newEditor => {
					model = newEditor.model;
					command = new AlignmentCommand( newEditor );
					newEditor.commands.add( 'alignment', command );

					model.schema.register( 'paragraph', { inheritAllFrom: '$block' } );
					model.schema.register( 'div', { inheritAllFrom: '$block' } );
					model.schema.extend( 'paragraph', { allowAttributes: 'alignment' } );

					setModelData( model, '<paragraph alignment="center">x[]x</paragraph>' );

					newEditor.execute( 'alignment', { value: 'right' } );

					expect( getModelData( model ) ).to.equal( '<paragraph>x[]x</paragraph>' );

					return newEditor.destroy();
				} );
			} );

			it( 'adds alignment to all selected blocks', () => {
				setModelData( model, '<paragraph>x[x</paragraph><paragraph>xx</paragraph><paragraph>x]x</paragraph>' );

				editor.execute( 'alignment', { value: 'center' } );

				expect( getModelData( model ) ).to.equal(
					'<paragraph alignment="center">x[x</paragraph>' +
					'<paragraph alignment="center">xx</paragraph>' +
					'<paragraph alignment="center">x]x</paragraph>'
				);
			} );

			it( 'sets alignment on all selected blocks as first block', () => {
				setModelData(
					model,
					'<paragraph>x[x</paragraph>' +
					'<paragraph >xx</paragraph>' +
					'<paragraph alignment="center">x]x</paragraph>'
				);

				editor.execute( 'alignment', { value: 'center' } );

				expect( getModelData( model ) ).to.equal(
					'<paragraph alignment="center">x[x</paragraph>' +
					'<paragraph alignment="center">xx</paragraph>' +
					'<paragraph alignment="center">x]x</paragraph>'
				);
			} );

			it( 'should remove alignment if block has the same alignment set', () => {
				setModelData( model, '<paragraph alignment="center">x[]x</paragraph>' );

				editor.execute( 'alignment', { value: 'center' } );

				expect( getModelData( model ) ).to.equal( '<paragraph>x[]x</paragraph>' );
			} );
		} );

		describe( 'applying default alignment', () => {
			it( 'removes alignment from block element when passed as value', () => {
				setModelData( model, '<paragraph alignment="justify">x[]x</paragraph>' );

				editor.execute( 'alignment', { value: 'left' } );

				expect( getModelData( model ) ).to.equal( '<paragraph>x[]x</paragraph>' );
			} );
			it( 'removes alignment from block element when no value is passed', () => {
				setModelData( model, '<paragraph alignment="justify">x[]x</paragraph>' );

				editor.execute( 'alignment' );

				expect( getModelData( model ) ).to.equal( '<paragraph>x[]x</paragraph>' );
			} );

			it( 'removes alignment from all selected blocks', () => {
				setModelData( model,
					'<paragraph alignment="center">x[x</paragraph>' +
					'<paragraph alignment="center">xx</paragraph>' +
					'<paragraph alignment="center">x]x</paragraph>'
				);

				editor.execute( 'alignment', { value: 'left' } );

				expect( getModelData( model ) ).to.equal(
					'<paragraph>x[x</paragraph><paragraph>xx</paragraph><paragraph>x]x</paragraph>'
				);
			} );

			it( 'removes alignment from all selected blocks even if one has no alignment defined', () => {
				setModelData( model,
					'<paragraph alignment="center">x[x</paragraph>' +
					'<paragraph>xx</paragraph>' +
					'<paragraph alignment="center">x]x</paragraph>'
				);

				editor.execute( 'alignment', { value: 'left' } );

				expect( getModelData( model ) ).to.equal(
					'<paragraph>x[x</paragraph><paragraph>xx</paragraph><paragraph>x]x</paragraph>'
				);
			} );
		} );
	} );
} );
