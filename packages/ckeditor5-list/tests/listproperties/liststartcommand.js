/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { setData, getData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import ListPropertiesEditing from '../../src/listproperties/listpropertiesediting';

describe( 'ListStartCommand', () => {
	let editor, model, listStartCommand;

	beforeEach( () => {
		return VirtualTestEditor
			.create( {
				plugins: [ Paragraph, ListPropertiesEditing ],
				list: {
					properties: { styles: false, startIndex: true, reversed: false }
				}
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;

				listStartCommand = editor.commands.get( 'listStart' );
			} );
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	describe( '#isEnabled', () => {
		it( 'should be false if selected a paragraph', () => {
			setData( model, '<paragraph>Foo[]</paragraph>' );

			expect( listStartCommand.isEnabled ).to.be.false;
		} );

		it( 'should be false if selection starts in a paragraph and ends in a list item', () => {
			setData( model,
				'<paragraph>Fo[o</paragraph>' +
				'<listItem listIndent="0" listType="numbered" listStart="1">Foo]</listItem>'
			);

			expect( listStartCommand.isEnabled ).to.be.false;
		} );

		it( 'should be false if selection is inside a listItem (listType: bulleted)', () => {
			setData( model, '<listItem listIndent="0" listType="bulleted">Foo[]</listItem>' );

			expect( listStartCommand.isEnabled ).to.be.false;
		} );

		it( 'should be true if selection is inside a listItem (collapsed selection)', () => {
			setData( model, '<listItem listIndent="0" listType="numbered" listStart="2">Foo[]</listItem>' );

			expect( listStartCommand.isEnabled ).to.be.true;
		} );

		it( 'should be true if selection is inside a listItem (non-collapsed selection)', () => {
			setData( model, '<listItem listIndent="0" listType="numbered" listStart="1">[Foo]</listItem>' );

			expect( listStartCommand.isEnabled ).to.be.true;
		} );

		it( 'should be true attribute if selected more elements in the same list', () => {
			setData( model,
				'<listItem listIndent="0" listType="numbered" listStart="3">[1.</listItem>' +
				'<listItem listIndent="0" listType="numbered" listStart="3">2.]</listItem>' +
				'<listItem listIndent="0" listType="numbered" listStart="3">3.</listItem>'
			);

			expect( listStartCommand.isEnabled ).to.be.true;
		} );
	} );

	describe( '#value', () => {
		it( 'should return null if selected a paragraph', () => {
			setData( model, '<paragraph>Foo[]</paragraph>' );

			expect( listStartCommand.value ).to.be.null;
		} );

		it( 'should return null if selection starts in a paragraph and ends in a list item', () => {
			setData( model,
				'<paragraph>Fo[o</paragraph>' +
				'<listItem listIndent="0" listType="numbered" listStart="2">Foo]</listItem>'
			);

			expect( listStartCommand.value ).to.be.null;
		} );

		it( 'should return null if selection is inside a listItem (listType: bulleted)', () => {
			setData( model, '<listItem listIndent="0" listType="bulleted">Foo[]</listItem>' );

			expect( listStartCommand.value ).to.be.null;
		} );

		it( 'should return the value of `listStart` attribute if selection is inside a listItem (collapsed selection)', () => {
			setData( model, '<listItem listIndent="0" listType="numbered" listStart="2">Foo[]</listItem>' );

			expect( listStartCommand.value ).to.equal( 2 );
		} );

		it( 'should return the value of `listStart` attribute if selection is inside a listItem (non-collapsed selection)', () => {
			setData( model, '<listItem listIndent="0" listType="numbered" listStart="3">[Foo]</listItem>' );

			expect( listStartCommand.value ).to.equal( 3 );
		} );

		it( 'should return the value of `listStart` attribute if selected more elements in the same list', () => {
			setData( model,
				'<listItem listIndent="0" listType="numbered" listStart="3">[1.</listItem>' +
				'<listItem listIndent="0" listType="numbered" listStart="3">2.]</listItem>' +
				'<listItem listIndent="0" listType="numbered" listStart="3">3.</listItem>'
			);

			expect( listStartCommand.value ).to.equal( 3 );
		} );

		it( 'should return the value of `listStart` attribute for the selection inside a nested list', () => {
			setData( model,
				'<listItem listIndent="0" listType="numbered" listStart="2">1.</listItem>' +
				'<listItem listIndent="1" listType="numbered" listStart="3">1.1.[]</listItem>' +
				'<listItem listIndent="0" listType="numbered" listStart="2">2.</listItem>'
			);

			expect( listStartCommand.value ).to.equal( 3 );
		} );

		it(
			'should return the value of `listStart` attribute from a list where the selection starts (selection over nested list)',
			() => {
				setData( model,
					'<listItem listIndent="0" listType="numbered" listStart="2">1.</listItem>' +
					'<listItem listIndent="1" listType="numbered" listStart="3">1.1.[</listItem>' +
					'<listItem listIndent="0" listType="numbered" listStart="2">2.]</listItem>'
				);

				expect( listStartCommand.value ).to.equal( 3 );
			}
		);
	} );

	describe( 'execute()', () => {
		it( 'should set the `listStart` attribute for collapsed selection', () => {
			setData( model,
				'<listItem listIndent="0" listStart="1" listType="numbered">1.[]</listItem>'
			);

			listStartCommand.execute( { startIndex: 5 } );

			expect( getData( model ) ).to.equal(
				'<listItem listIndent="0" listStart="5" listType="numbered">1.[]</listItem>'
			);
		} );

		it( 'should set the `listStart` attribute for non-collapsed selection', () => {
			setData( model,
				'<listItem listIndent="0" listStart="2" listType="numbered">[1.]</listItem>'
			);

			listStartCommand.execute( { startIndex: 5 } );

			expect( getData( model ) ).to.equal(
				'<listItem listIndent="0" listStart="5" listType="numbered">[1.]</listItem>'
			);
		} );

		it( 'should set the `listStart` attribute for all the same list items (collapsed selection)', () => {
			setData( model,
				'<listItem listIndent="0" listStart="2" listType="numbered">1.[]</listItem>' +
				'<listItem listIndent="0" listStart="2" listType="numbered">2.</listItem>' +
				'<listItem listIndent="0" listStart="2" listType="numbered">3.</listItem>'
			);

			listStartCommand.execute( { startIndex: 3 } );

			expect( getData( model ) ).to.equal(
				'<listItem listIndent="0" listStart="3" listType="numbered">1.[]</listItem>' +
				'<listItem listIndent="0" listStart="3" listType="numbered">2.</listItem>' +
				'<listItem listIndent="0" listStart="3" listType="numbered">3.</listItem>'
			);
		} );

		it( 'should set the `listStart` attribute for all the same list items and ignores nested lists', () => {
			setData( model,
				'<listItem listIndent="0" listStart="1" listType="numbered">1.[]</listItem>' +
				'<listItem listIndent="0" listStart="1" listType="numbered">2.</listItem>' +
				'<listItem listIndent="1" listStart="1" listType="numbered">2.1.</listItem>' +
				'<listItem listIndent="1" listStart="1" listType="numbered">2.2.</listItem>' +
				'<listItem listIndent="0" listStart="1" listType="numbered">3.</listItem>' +
				'<listItem listIndent="1" listStart="1" listType="numbered">3.1.</listItem>'
			);

			listStartCommand.execute( { startIndex: 2 } );

			expect( getData( model ) ).to.equal(
				'<listItem listIndent="0" listStart="2" listType="numbered">1.[]</listItem>' +
				'<listItem listIndent="0" listStart="2" listType="numbered">2.</listItem>' +
				'<listItem listIndent="1" listStart="1" listType="numbered">2.1.</listItem>' +
				'<listItem listIndent="1" listStart="1" listType="numbered">2.2.</listItem>' +
				'<listItem listIndent="0" listStart="2" listType="numbered">3.</listItem>' +
				'<listItem listIndent="1" listStart="1" listType="numbered">3.1.</listItem>'
			);
		} );

		it(
			'should set the `listStart` attribute for all the same list items and ignores "parent" list (selection in nested list)',
			() => {
				setData( model,
					'<listItem listIndent="0" listStart="1" listType="numbered">1.</listItem>' +
					'<listItem listIndent="0" listStart="1" listType="numbered">2.</listItem>' +
					'<listItem listIndent="1" listStart="1" listType="numbered">2.1.[]</listItem>' +
					'<listItem listIndent="1" listStart="1" listType="numbered">2.2.</listItem>' +
					'<listItem listIndent="0" listStart="1" listType="numbered">3.</listItem>' +
					'<listItem listIndent="1" listStart="1" listType="numbered">3.1.</listItem>'
				);

				listStartCommand.execute( { startIndex: 2 } );

				expect( getData( model ) ).to.equal(
					'<listItem listIndent="0" listStart="1" listType="numbered">1.</listItem>' +
					'<listItem listIndent="0" listStart="1" listType="numbered">2.</listItem>' +
					'<listItem listIndent="1" listStart="2" listType="numbered">2.1.[]</listItem>' +
					'<listItem listIndent="1" listStart="2" listType="numbered">2.2.</listItem>' +
					'<listItem listIndent="0" listStart="1" listType="numbered">3.</listItem>' +
					'<listItem listIndent="1" listStart="1" listType="numbered">3.1.</listItem>'
				);
			}
		);

		it( 'should stop searching for the list items when spotted non-listItem element', () => {
			setData( model,
				'<paragraph>Foo.</paragraph>' +
				'<listItem listIndent="0" listStart="1" listType="numbered">1.[]</listItem>' +
				'<listItem listIndent="0" listStart="1" listType="numbered">2.</listItem>' +
				'<listItem listIndent="0" listStart="1" listType="numbered">3.</listItem>'
			);

			listStartCommand.execute( { startIndex: 2 } );

			expect( getData( model ) ).to.equal(
				'<paragraph>Foo.</paragraph>' +
				'<listItem listIndent="0" listStart="2" listType="numbered">1.[]</listItem>' +
				'<listItem listIndent="0" listStart="2" listType="numbered">2.</listItem>' +
				'<listItem listIndent="0" listStart="2" listType="numbered">3.</listItem>'
			);
		} );

		it( 'should stop searching for the list items when spotted listItem with different listType attribute', () => {
			setData( model,
				'<paragraph>Foo.</paragraph>' +
				'<listItem listIndent="0" listStart="1" listType="numbered">1.[]</listItem>' +
				'<listItem listIndent="0" listStart="1" listType="numbered">2.</listItem>' +
				'<listItem listIndent="0" listType="bulleted">1.</listItem>'
			);

			listStartCommand.execute( { startIndex: 2 } );

			expect( getData( model ) ).to.equal(
				'<paragraph>Foo.</paragraph>' +
				'<listItem listIndent="0" listStart="2" listType="numbered">1.[]</listItem>' +
				'<listItem listIndent="0" listStart="2" listType="numbered">2.</listItem>' +
				'<listItem listIndent="0" listType="bulleted">1.</listItem>'
			);
		} );

		it( 'should stop searching for the list items when spotted listItem with different `listStart` attribute', () => {
			setData( model,
				'<paragraph>Foo.</paragraph>' +
				'<listItem listIndent="0" listStart="1" listType="numbered">1.[]</listItem>' +
				'<listItem listIndent="0" listStart="1" listType="numbered">2.</listItem>' +
				'<listItem listIndent="0" listStart="2" listType="numbered">1.</listItem>'
			);

			listStartCommand.execute( { startIndex: 3 } );

			expect( getData( model ) ).to.equal(
				'<paragraph>Foo.</paragraph>' +
				'<listItem listIndent="0" listStart="3" listType="numbered">1.[]</listItem>' +
				'<listItem listIndent="0" listStart="3" listType="numbered">2.</listItem>' +
				'<listItem listIndent="0" listStart="2" listType="numbered">1.</listItem>'
			);
		} );

		it( 'should start searching for the list items from starting position (collapsed selection)', () => {
			setData( model,
				'<listItem listIndent="0" listStart="2" listType="numbered">1.</listItem>' +
				'<listItem listIndent="0" listStart="2" listType="numbered">2.</listItem>' +
				'<listItem listIndent="0" listStart="2" listType="numbered">[3.</listItem>' +
				'<paragraph>Foo.]</paragraph>'
			);

			listStartCommand.execute( { startIndex: 3 } );

			expect( getData( model ) ).to.equal(
				'<listItem listIndent="0" listStart="3" listType="numbered">1.</listItem>' +
				'<listItem listIndent="0" listStart="3" listType="numbered">2.</listItem>' +
				'<listItem listIndent="0" listStart="3" listType="numbered">[3.</listItem>' +
				'<paragraph>Foo.]</paragraph>'
			);
		} );

		it( 'should use `1` value if not specified (no options passed)', () => {
			setData( model,
				'<listItem listIndent="0" listStart="2" listType="numbered">1.[]</listItem>'
			);

			listStartCommand.execute();

			expect( getData( model ) ).to.equal(
				'<listItem listIndent="0" listStart="1" listType="numbered">1.[]</listItem>'
			);
		} );

		it( 'should use `1` value if not specified (passed an empty object)', () => {
			setData( model,
				'<listItem listIndent="0" listStart="2" listType="numbered">1.[]</listItem>'
			);

			listStartCommand.execute( {} );

			expect( getData( model ) ).to.equal(
				'<listItem listIndent="0" listStart="1" listType="numbered">1.[]</listItem>'
			);
		} );

		it( 'should update all items that belong to selected elements', () => {
			// [x] = items that should be updated.
			// All list items that belong to the same lists that selected items should be updated.
			// "2." is the most outer list (listIndent=0)
			// "2.1" a child list of the "2." element (listIndent=1)
			// "2.1.1" a child list of the "2.1" element (listIndent=2)
			//
			// [x] ■ 1.
			// [x] ■ [2.
			// [x]     ○ 2.1.
			// [x]         ▶ 2.1.1.]
			// [x]         ▶ 2.1.2.
			// [x]     ○ 2.2.
			// [x] ■ 3.
			// [ ]     ○ 3.1.
			// [ ]         ▶ 3.1.1.
			//
			// "3.1" is not selected and this list should not be updated.
			setData( model,
				'<listItem listIndent="0" listStart="1" listType="numbered">1.</listItem>' +
				'<listItem listIndent="0" listStart="1" listType="numbered">[2.</listItem>' +
				'<listItem listIndent="1" listStart="2" listType="numbered">2.1.</listItem>' +
				'<listItem listIndent="2" listStart="3" listType="numbered">2.1.1.]</listItem>' +
				'<listItem listIndent="2" listStart="3" listType="numbered">2.1.2.</listItem>' +
				'<listItem listIndent="1" listStart="2" listType="numbered">2.2.</listItem>' +
				'<listItem listIndent="0" listStart="1" listType="numbered">3.</listItem>' +
				'<listItem listIndent="1" listStart="4" listType="numbered">3.1.</listItem>' +
				'<listItem listIndent="2" listStart="5" listType="numbered">3.1.1.</listItem>'
			);

			listStartCommand.execute( { startIndex: 7 } );

			expect( getData( model ) ).to.equal(
				'<listItem listIndent="0" listStart="7" listType="numbered">1.</listItem>' +
				'<listItem listIndent="0" listStart="7" listType="numbered">[2.</listItem>' +
				'<listItem listIndent="1" listStart="7" listType="numbered">2.1.</listItem>' +
				'<listItem listIndent="2" listStart="7" listType="numbered">2.1.1.]</listItem>' +
				'<listItem listIndent="2" listStart="7" listType="numbered">2.1.2.</listItem>' +
				'<listItem listIndent="1" listStart="7" listType="numbered">2.2.</listItem>' +
				'<listItem listIndent="0" listStart="7" listType="numbered">3.</listItem>' +
				'<listItem listIndent="1" listStart="4" listType="numbered">3.1.</listItem>' +
				'<listItem listIndent="2" listStart="5" listType="numbered">3.1.1.</listItem>'
			);
		} );
	} );
} );
