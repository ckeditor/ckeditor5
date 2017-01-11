/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import ListEngine from 'ckeditor5-list/src/listengine';
import ListCommand from 'ckeditor5-list/src/listcommand';

import ModelElement from 'ckeditor5-engine/src/model/element';
import ModelText from 'ckeditor5-engine/src/model/text';
import ModelPosition from 'ckeditor5-engine/src/model/position';
import ModelRange from 'ckeditor5-engine/src/model/range';

import ViewPosition from 'ckeditor5-engine/src/view/position';
import Paragraph from 'ckeditor5-paragraph/src/paragraph';

import VirtualTestEditor from 'ckeditor5-core/tests/_utils/virtualtesteditor';
import { getData as getModelData, setData as setModelData } from 'ckeditor5-engine/src/dev-utils/model';
import { getData as getViewData } from 'ckeditor5-engine/src/dev-utils/view';

describe( 'ListEngine', () => {
	let editor, doc, root;

	beforeEach( () => {
		return VirtualTestEditor.create( {
			plugins: [ Paragraph, ListEngine ]
		} )
			.then( newEditor => {
				editor = newEditor;

				doc = editor.document;
				root = doc.getRoot();

				doc.schema.allow( { name: '$text', inside: '$root' } );
			} );
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( ListEngine ) ).to.be.instanceOf( ListEngine );
	} );

	it( 'should set proper schema rules', () => {
		expect( doc.schema.hasItem( 'listItem' ) );
		expect( doc.schema.itemExtends( 'listItem', '$block' ) );

		expect( doc.schema.check( { name: '$inline', inside: 'listItem' } ) ).to.be.true;
		expect( doc.schema.check( { name: 'listItem', inside: 'listItem' } ) ).to.be.false;
		expect( doc.schema.check( { name: '$block', inside: 'listItem' } ) ).to.be.false;

		expect( doc.schema.check( { name: 'listItem', inside: '$root' } ) ).to.be.false;
		expect( doc.schema.check( { name: 'listItem', inside: '$root', attributes: [ 'indent' ] } ) ).to.be.false;
		expect( doc.schema.check( { name: 'listItem', inside: '$root', attributes: [ 'type' ] } ) ).to.be.false;
		expect( doc.schema.check( { name: 'listItem', inside: '$root', attributes: [ 'indent', 'type' ] } ) ).to.be.true;
	} );

	describe( 'commands', () => {
		it( 'should register bulleted list command', () => {
			expect( editor.commands.has( 'bulletedList' ) ).to.be.true;

			const command = editor.commands.get( 'bulletedList' );

			expect( command ).to.be.instanceOf( ListCommand );
			expect( command ).to.have.property( 'type', 'bulleted' );
		} );

		it( 'should register numbered list command', () => {
			expect( editor.commands.has( 'numberedList' ) ).to.be.true;

			const command = editor.commands.get( 'numberedList' );

			expect( command ).to.be.instanceOf( ListCommand );
			expect( command ).to.have.property( 'type', 'numbered' );
		} );
	} );

	describe( 'converters', () => {
		describe( 'model to view', () => {
			let viewDoc;

			function expectView( expectedView ) {
				expect( getViewData( viewDoc, { withoutSelection: true } ) ).to.equal( expectedView );
			}

			beforeEach( () => {
				doc = editor.document;
				viewDoc = editor.editing.view;
			} );

			describe( 'insert', () => {
				let item;

				beforeEach( () => {
					item = new ModelElement( 'listItem', { indent: 0, type: 'bulleted' }, new ModelText( '---' ) );

					const data =
						'<paragraph>foo</paragraph>' +
						'<listItem indent="0" type="bulleted">xxx</listItem>' +
						'<listItem indent="0" type="bulleted">yyy</listItem>' +
						'<paragraph>bar</paragraph>';

					setModelData( doc, data );
				} );

				it( 'list into empty editor (initialization)', () => {
					expectView( '<p>foo</p><ul><li>xxx</li><li>yyy</li></ul><p>bar</p>' );
				} );

				it( 'item at the beginning of list', () => {
					doc.batch().insert( ModelPosition.createAt( root, 1 ), item );

					expectView( '<p>foo</p><ul><li>---</li><li>xxx</li><li>yyy</li></ul><p>bar</p>' );
				} );

				it( 'item in the middle of list', () => {
					doc.batch().insert( ModelPosition.createAt( root, 2 ), item );

					expectView( '<p>foo</p><ul><li>xxx</li><li>---</li><li>yyy</li></ul><p>bar</p>' );
				} );

				it( 'item at the end of the list', () => {
					doc.batch().insert( ModelPosition.createAt( root, 3 ), item );

					expectView( '<p>foo</p><ul><li>xxx</li><li>yyy</li><li>---</li></ul><p>bar</p>' );
				} );

				it( 'item with different type at the beginning of list', () => {
					item.setAttribute( 'type', 'numbered' );
					doc.batch().insert( ModelPosition.createAt( root, 1 ), item );

					expectView( '<p>foo</p><ol><li>---</li></ol><ul><li>xxx</li><li>yyy</li></ul><p>bar</p>' );
				} );

				it( 'item with different type in the middle of list', () => {
					item.setAttribute( 'type', 'numbered' );
					doc.batch().insert( ModelPosition.createAt( root, 2 ), item );

					expectView( '<p>foo</p><ul><li>xxx</li></ul><ol><li>---</li></ol><ul><li>yyy</li></ul><p>bar</p>' );
				} );

				it( 'item with different type at the end of the list', () => {
					item.setAttribute( 'type', 'numbered' );
					doc.batch().insert( ModelPosition.createAt( root, 3 ), item );

					expectView( '<p>foo</p><ul><li>xxx</li><li>yyy</li></ul><ol><li>---</li></ol><p>bar</p>' );
				} );
			} );

			describe( 'remove', () => {
				beforeEach( () => {
					const data =
						'<paragraph>foo</paragraph>' +
						'<listItem indent="0" type="bulleted">xxx</listItem>' +
						'<listItem indent="0" type="bulleted">yyy</listItem>' +
						'<listItem indent="0" type="bulleted">zzz</listItem>' +
						'<paragraph>bar</paragraph>';

					setModelData( doc, data );
				} );

				it( 'item from the beginning of the list', () => {
					doc.batch().remove( ModelRange.createFromParentsAndOffsets( root, 1, root, 2 ) );

					expectView( '<p>foo</p><ul><li>yyy</li><li>zzz</li></ul><p>bar</p>' );
				} );

				it( 'item from the middle of the list', () => {
					doc.batch().remove( ModelRange.createFromParentsAndOffsets( root, 2, root, 3 ) );

					expectView( '<p>foo</p><ul><li>xxx</li><li>zzz</li></ul><p>bar</p>' );
				} );

				it( 'item from the end of the list', () => {
					doc.batch().remove( ModelRange.createFromParentsAndOffsets( root, 3, root, 4 ) );

					expectView( '<p>foo</p><ul><li>xxx</li><li>yyy</li></ul><p>bar</p>' );
				} );

				it( 'multiple items #1', () => {
					doc.batch().remove( ModelRange.createFromParentsAndOffsets( root, 1, root, 3 ) );

					expectView( '<p>foo</p><ul><li>zzz</li></ul><p>bar</p>' );
				} );

				it( 'multiple items #2', () => {
					doc.batch().remove( ModelRange.createFromParentsAndOffsets( root, 2, root, 4 ) );

					expectView( '<p>foo</p><ul><li>xxx</li></ul><p>bar</p>' );
				} );

				it( 'all items', () => {
					doc.batch().remove( ModelRange.createFromParentsAndOffsets( root, 1, root, 4 ) );

					expectView( '<p>foo</p><p>bar</p>' );
				} );
			} );

			describe( 'move', () => {
				let targetPosition;

				beforeEach( () => {
					const data =
						'<paragraph>foo</paragraph>' +
						'<listItem indent="0" type="bulleted">xxx</listItem>' +
						'<listItem indent="0" type="bulleted">yyy</listItem>' +
						'<listItem indent="0" type="bulleted">zzz</listItem>' +
						'<paragraph>bar</paragraph>';

					setModelData( doc, data );

					targetPosition = ModelPosition.createAt( root, 5 );
				} );

				it( 'item from the beginning of the list', () => {
					doc.batch().move( ModelRange.createFromParentsAndOffsets( root, 1, root, 2 ), targetPosition );

					expectView( '<p>foo</p><ul><li>yyy</li><li>zzz</li></ul><p>bar</p><ul><li>xxx</li></ul>' );
				} );

				it( 'item from the middle of the list', () => {
					doc.batch().move( ModelRange.createFromParentsAndOffsets( root, 2, root, 3 ), targetPosition );

					expectView( '<p>foo</p><ul><li>xxx</li><li>zzz</li></ul><p>bar</p><ul><li>yyy</li></ul>' );
				} );

				it( 'item from the end of the list', () => {
					doc.batch().move( ModelRange.createFromParentsAndOffsets( root, 3, root, 4 ), targetPosition );

					expectView( '<p>foo</p><ul><li>xxx</li><li>yyy</li></ul><p>bar</p><ul><li>zzz</li></ul>' );
				} );

				it( 'move item around the same list', () => {
					doc.batch().move(
						ModelRange.createFromParentsAndOffsets( root, 1, root, 2 ),
						ModelPosition.createAt( root, 3 )
					);

					expectView( '<p>foo</p><ul><li>yyy</li><li>xxx</li><li>zzz</li></ul><p>bar</p>' );
				} );

				it( 'multiple items #1', () => {
					doc.batch().move( ModelRange.createFromParentsAndOffsets( root, 1, root, 3 ), targetPosition );

					expectView( '<p>foo</p><ul><li>zzz</li></ul><p>bar</p><ul><li>xxx</li><li>yyy</li></ul>' );
				} );

				it( 'multiple items #2', () => {
					doc.batch().move( ModelRange.createFromParentsAndOffsets( root, 2, root, 4 ), targetPosition );

					expectView( '<p>foo</p><ul><li>xxx</li></ul><p>bar</p><ul><li>yyy</li><li>zzz</li></ul>' );
				} );

				it( 'all items', () => {
					doc.batch().move( ModelRange.createFromParentsAndOffsets( root, 1, root, 4 ), targetPosition );

					expectView( '<p>foo</p><p>bar</p><ul><li>xxx</li><li>yyy</li><li>zzz</li></ul>' );
				} );
			} );

			describe( 'change type', () => {
				beforeEach( () => {
					const data =
						'<paragraph>foo</paragraph>' +
						'<listItem indent="0" type="bulleted">xxx</listItem>' +
						'<listItem indent="0" type="bulleted">yyy</listItem>' +
						'<listItem indent="0" type="bulleted">zzz</listItem>' +
						'<paragraph>bar</paragraph>';

					setModelData( doc, data );
				} );

				it( 'item at the beginning of list', () => {
					let item = root.getChild( 1 );
					doc.batch().setAttribute( item, 'type', 'numbered' );

					expectView( '<p>foo</p><ol><li>xxx</li></ol><ul><li>yyy</li><li>zzz</li></ul><p>bar</p>' );
				} );

				it( 'item in the middle of list', () => {
					let item = root.getChild( 2 );
					doc.batch().setAttribute( item, 'type', 'numbered' );

					expectView( '<p>foo</p><ul><li>xxx</li></ul><ol><li>yyy</li></ol><ul><li>zzz</li></ul><p>bar</p>' );
				} );

				it( 'item at the end of the list', () => {
					let item = root.getChild( 3 );
					doc.batch().setAttribute( item, 'type', 'numbered' );

					expectView( '<p>foo</p><ul><li>xxx</li><li>yyy</li></ul><ol><li>zzz</li></ol><p>bar</p>' );
				} );
			} );

			describe( 'rename', () => {
				beforeEach( () => {
					const data =
						'<paragraph>foo</paragraph>' +
						'<listItem indent="0" type="bulleted">xxx</listItem>' +
						'<listItem indent="0" type="bulleted">yyy</listItem>' +
						'<listItem indent="0" type="bulleted">zzz</listItem>' +
						'<paragraph>bar</paragraph>';

					setModelData( doc, data );
				} );

				describe( 'item to paragraph', () => {
					it( 'first item', () => {
						doc.batch().rename( root.getChild( 1 ), 'paragraph' );

						expectView( '<p>foo</p><p>xxx</p><ul><li>yyy</li><li>zzz</li></ul><p>bar</p>' );
					} );

					it( 'middle item', () => {
						doc.batch().rename( root.getChild( 2 ), 'paragraph' );

						expectView( '<p>foo</p><ul><li>xxx</li></ul><p>yyy</p><ul><li>zzz</li></ul><p>bar</p>' );
					} );

					it( 'last item', () => {
						doc.batch().rename( root.getChild( 3 ), 'paragraph' );

						expectView( '<p>foo</p><ul><li>xxx</li><li>yyy</li></ul><p>zzz</p><p>bar</p>' );
					} );
				} );

				describe( 'paragraph to item', () => {
					it( 'first paragraph', () => {
						const item = root.getChild( 0 );

						doc.batch()
							.setAttribute( item, 'type', 'bulleted' )
							.setAttribute( item, 'indent', 0 )
							.rename( item, 'listItem' );

						expectView( '<ul><li>foo</li><li>xxx</li><li>yyy</li><li>zzz</li></ul><p>bar</p>' );
					} );

					it( 'last paragraph', () => {
						const item = root.getChild( 4 );

						doc.batch()
							.setAttribute( item, 'type', 'bulleted' )
							.setAttribute( item, 'indent', 0 )
							.rename( item, 'listItem' );

						expectView( '<p>foo</p><ul><li>xxx</li><li>yyy</li><li>zzz</li><li>bar</li></ul>' );
					} );
				} );
			} );

			describe( 'merging', () => {
				let paragraph;

				beforeEach( () => {
					const data =
						'<paragraph>foo</paragraph>' +
						'<listItem indent="0" type="bulleted">xxx</listItem>' +
						'<listItem indent="0" type="bulleted">yyy</listItem>' +
						'<paragraph>bar</paragraph>' +
						'<listItem indent="0" type="bulleted">zzz</listItem>';

					setModelData( doc, data );

					paragraph = root.getChild( 3 );
				} );

				it( 'after removing element from between two lists', () => {
					doc.batch().remove( paragraph );

					expectView( '<p>foo</p><ul><li>xxx</li><li>yyy</li><li>zzz</li></ul>' );
				} );

				it( 'after removing multiple elements', () => {
					doc.batch().remove( ModelRange.createFromParentsAndOffsets( root, 2, root, 4 ) );

					expectView( '<p>foo</p><ul><li>xxx</li><li>zzz</li></ul>' );
				} );

				it( 'after moving element from between two lists', () => {
					doc.batch().move( paragraph, ModelPosition.createAt( root, 5 ) );

					expectView( '<p>foo</p><ul><li>xxx</li><li>yyy</li><li>zzz</li></ul><p>bar</p>' );
				} );

				it( 'after renaming element between two lists - paragraph', () => {
					doc.batch()
						.setAttribute( paragraph, 'type', 'bulleted' )
						.setAttribute( paragraph, 'indent', 0 )
						.rename( paragraph, 'listItem' );

					expectView( '<p>foo</p><ul><li>xxx</li><li>yyy</li><li>bar</li><li>zzz</li></ul>' );
				} );

				it( 'after renaming element between two lists - different list type', () => {
					doc.batch()
						.setAttribute( paragraph, 'type', 'numbered' )
						.setAttribute( paragraph, 'indent', 0 )
						.rename( paragraph, 'listItem' );

					// Different list type - do not merge.
					expectView( '<p>foo</p><ul><li>xxx</li><li>yyy</li></ul><ol><li>bar</li></ol><ul><li>zzz</li></ul>' );

					doc.batch().setAttribute( root.getChild( 3 ), 'type', 'bulleted' );

					// Same list type - merge.
					expectView( '<p>foo</p><ul><li>xxx</li><li>yyy</li><li>bar</li><li>zzz</li></ul>' );
				} );
			} );
		} );

		describe( 'view to model', () => {
			it( 'converts structure with ul, li and ol', () => {
				editor.setData( '<p>foo</p><ul><li>xxx</li><li>yyy</li></ul><ol><li>zzz</li></ol><p>bar</p>' );

				const expectedModel =
					'<paragraph>foo</paragraph>' +
					'<listItem indent="0" type="bulleted">xxx</listItem>' +
					'<listItem indent="0" type="bulleted">yyy</listItem>' +
					'<listItem indent="0" type="numbered">zzz</listItem>' +
					'<paragraph>bar</paragraph>';

				expect( getModelData( doc, { withoutSelection: true } ) ).to.equal( expectedModel );
			} );

			it( 'cleans incorrect elements (for example whitespaces)', () => {
				editor.setData(
					'<p>foo</p>' +
					'<ul>' +
					'	<li>xxx</li>' +
					'	<li>yyy</li>' +
					'	<p>bar</p>' +
					'</ul>'
				);

				const expectedModel =
					'<paragraph>foo</paragraph>' +
					'<listItem indent="0" type="bulleted">xxx</listItem>' +
					'<listItem indent="0" type="bulleted">yyy</listItem>';

				expect( getModelData( doc, { withoutSelection: true } ) ).to.equal( expectedModel );
			} );
		} );

		it( 'model insert converter should not fire if change was already consumed', () => {
			editor.editing.modelToView.on( 'insert', ( evt, data, consumable ) => {
				consumable.consume( data.item, 'insert' );
			}, { priority: 'highest' } );

			setModelData( doc, '<listItem indent="0" type="bulleted"></listItem>' );

			expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal( '' );
		} );

		it( 'model remove converter should not fire if change was already consumed', () => {
			editor.editing.modelToView.on( 'remove', ( evt, data, consumable ) => {
				consumable.consume( data.item, 'remove' );
			}, { priority: 'highest' } );

			setModelData( doc, '<listItem indent="0" type="bulleted"></listItem>' );

			doc.batch().remove( root.getChild( 0 ) );

			expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal( '<ul><li></li></ul>' );
		} );

		it( 'model move converter should not fire if change was already consumed', () => {
			editor.editing.modelToView.on( 'move', ( evt, data, consumable ) => {
				consumable.consume( data.item, 'move' );
			}, { priority: 'highest' } );

			setModelData( doc, '<listItem indent="0" type="bulleted"></listItem><paragraph>foo</paragraph>' );

			doc.batch().move( root.getChild( 0 ), ModelPosition.createAt( root, 2 ) );

			expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal( '<ul><li></li></ul><p>foo</p>' );
		} );

		it( 'model change type converter should not fire if change was already consumed', () => {
			editor.editing.modelToView.on( 'changeAttribute:type', ( evt, data, consumable ) => {
				consumable.consume( data.item, 'changeAttribute:type' );
			}, { priority: 'highest' } );

			setModelData( doc, '<listItem indent="0" type="bulleted"></listItem>' );

			doc.batch().setAttribute( root.getChild( 0 ), 'type', 'numbered' );

			expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal( '<ul><li></li></ul>' );
		} );

		it( 'view li converter should not fire if change was already consumed', () => {
			editor.data.viewToModel.on( 'element:li', ( evt, data, consumable ) => {
				consumable.consume( data.input, { name: true } );
			}, { priority: 'highest' } );

			editor.setData( '<ul><li></li></ul>' );

			expect( getModelData( doc, { withoutSelection: true } ) ).to.equal( '' );
		} );

		it( 'view ul converter should not fire if change was already consumed', () => {
			editor.data.viewToModel.on( 'element:ul', ( evt, data, consumable ) => {
				consumable.consume( data.input, { name: true } );
			}, { priority: 'highest' } );

			editor.setData( '<ul><li></li></ul>' );

			expect( getModelData( doc, { withoutSelection: true } ) ).to.equal( '' );
		} );
	} );

	describe( 'position mapping', () => {
		let viewRoot;

		beforeEach( () => {
			const data =
				'<paragraph>foo</paragraph>' +
				'<listItem indent="0" type="bulleted">xxx</listItem>' +
				'<listItem indent="0" type="bulleted">yyy</listItem>' +
				'<listItem indent="0" type="bulleted">zzz</listItem>' +
				'<paragraph>bar</paragraph>';

			setModelData( doc, data );

			viewRoot = editor.editing.view.getRoot();
		} );

		describe( 'model to view', () => {
			it( 'before listItem mapped to first LI => before UL', () => {
				const position = editor.editing.mapper.toViewPosition( ModelPosition.createAt( root, 1 ) );

				expect( position.parent ).to.equal( viewRoot );
				expect( position.offset ).to.equal( 1 );
				expect( position.nodeAfter.name ).to.equal( 'ul' );
			} );

			it( 'before listItem mapped to not-first LI => before LI', () => {
				let position = editor.editing.mapper.toViewPosition( ModelPosition.createAt( root, 2 ) );

				expect( position.parent.name ).to.equal( 'ul' );
				expect( position.offset ).to.equal( 1 );

				position = editor.editing.mapper.toViewPosition( ModelPosition.createAt( root, 3 ) );

				expect( position.parent.name ).to.equal( 'ul' );
				expect( position.offset ).to.equal( 2 );
			} );

			it( 'after listItem mapped to last LI => after UL', () => {
				const position = editor.editing.mapper.toViewPosition( ModelPosition.createAt( root, 4 ) );

				expect( position.parent ).to.equal( viewRoot );
				expect( position.offset ).to.equal( 2 );
				expect( position.nodeBefore.name ).to.equal( 'ul' );
			} );
		} );

		describe( 'view to model', () => {
			it( 'before UL => before listItem mapped to first LI of that UL', () => {
				const position = editor.editing.mapper.toModelPosition( ViewPosition.createAt( viewRoot, 1 ) );

				expect( position.path ).to.deep.equal( [ 1 ] );
			} );

			it( 'before LI => before listItem mapped to that LI', () => {
				let position = editor.editing.mapper.toModelPosition( ViewPosition.createAt( viewRoot.getChild( 1 ), 0 ) );
				expect( position.path ).to.deep.equal( [ 1 ] );

				position = editor.editing.mapper.toModelPosition( ViewPosition.createAt( viewRoot.getChild( 1 ), 1 ) );
				expect( position.path ).to.deep.equal( [ 2 ] );

				position = editor.editing.mapper.toModelPosition( ViewPosition.createAt( viewRoot.getChild( 1 ), 2 ) );
				expect( position.path ).to.deep.equal( [ 3 ] );
			} );

			it( 'after UL => after listItem mapped to last LI of that UL', () => {
				const position = editor.editing.mapper.toModelPosition( ViewPosition.createAt( viewRoot, 2 ) );

				expect( position.path ).to.deep.equal( [ 4 ] );
			} );

			it( 'after LI => after listItem mapped to that LI', () => {
				const position = editor.editing.mapper.toModelPosition( ViewPosition.createAt( viewRoot.getChild( 1 ), 3 ) );

				expect( position.path ).to.deep.equal( [ 4 ] );
			} );

			it( 'falls back to default algorithm for not described cases #1', () => {
				// This is mostly for CC.
				setModelData( doc, '<listItem indent="0" type="bulleted"></listItem>' );

				const viewListItem = editor.editing.mapper.toViewElement( root.getChild( 0 ) );
				const position = editor.editing.mapper.toModelPosition( ViewPosition.createAt( viewListItem, 0 ) );

				expect( position.path ).to.deep.equal( [ 0, 0 ] );
			} );

			it( 'falls back to default algorithm for not described cases #2', () => {
				// This is mostly for CC.
				setModelData( doc, '<paragraph>foo</paragraph>' );

				const position = editor.editing.mapper.toModelPosition( ViewPosition.createAt( viewRoot.getChild( 0 ), 'end' ) );

				expect( position.path ).to.deep.equal( [ 0, 3 ] );
			} );
		} );
	} );
} );
