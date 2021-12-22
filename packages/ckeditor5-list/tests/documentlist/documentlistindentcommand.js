/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import DocumentListIndentCommand from '../../src/documentlist/documentlistindentcommand';
import stubUid from './_utils/uid';
import { modelList } from './_utils/utils';

import Editor from '@ckeditor/ckeditor5-core/src/editor/editor';
import Model from '@ckeditor/ckeditor5-engine/src/model/model';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import { setData, getData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

describe( 'DocumentListIndentCommand', () => {
	let editor, model, doc, root;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		editor = new Editor();
		editor.model = new Model();

		model = editor.model;
		doc = model.document;
		root = doc.createRoot();

		model.schema.register( 'paragraph', { inheritAllFrom: '$block' } );
		model.schema.register( 'blockQuote', { inheritAllFrom: '$container' } );
		model.schema.extend( '$container', { allowAttributes: [ 'listType', 'listIndent', 'listItemId' ] } );
	} );

	describe( 'forward (indent)', () => {
		let command;

		beforeEach( () => {
			command = new DocumentListIndentCommand( editor, 'forward' );
		} );

		afterEach( () => {
			command.destroy();
		} );

		describe( 'isEnabled', () => {
			describe( 'single block per list item', () => {
				it( 'should be true if selection starts in list item', () => {
					setData( model,
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">0</paragraph>' +
						'<paragraph listIndent="0" listItemId="b" listType="bulleted">1</paragraph>' +
						'<paragraph listIndent="1" listItemId="c" listType="bulleted">2</paragraph>' +
						'<paragraph listIndent="2" listItemId="d" listType="bulleted">3</paragraph>' +
						'<paragraph listIndent="2" listItemId="e" listType="bulleted">4</paragraph>' +
						'<paragraph listIndent="1" listItemId="f" listType="bulleted">[]5</paragraph>' +
						'<paragraph listIndent="0" listItemId="g" listType="bulleted">6</paragraph>'
					);

					expect( command.isEnabled ).to.be.true;
				} );

				it( 'should be false if selection starts in first list item', () => {
					setData( model,
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">[]0</paragraph>' +
						'<paragraph listIndent="0" listItemId="b" listType="bulleted">1</paragraph>' +
						'<paragraph listIndent="1" listItemId="c" listType="bulleted">2</paragraph>' +
						'<paragraph listIndent="2" listItemId="d" listType="bulleted">3</paragraph>' +
						'<paragraph listIndent="2" listItemId="e" listType="bulleted">4</paragraph>' +
						'<paragraph listIndent="1" listItemId="f" listType="bulleted">5</paragraph>' +
						'<paragraph listIndent="0" listItemId="g" listType="bulleted">6</paragraph>'
					);

					expect( command.isEnabled ).to.be.false;
				} );

				it( 'should be false if selection starts in first list item at given indent', () => {
					setData( model,
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
						'<paragraph listIndent="1" listItemId="b" listType="bulleted">b</paragraph>' +
						'<paragraph listIndent="0" listItemId="c" listType="bulleted">c</paragraph>' +
						'<paragraph listIndent="1" listItemId="d" listType="bulleted">[]d</paragraph>' +
						'<paragraph listIndent="2" listItemId="e" listType="bulleted">e</paragraph>'
					);

					expect( command.isEnabled ).to.be.false;
				} );

				it( 'should be false if selection starts in first list item (different list type)', () => {
					setData( model,
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
						'<paragraph listIndent="1" listItemId="b" listType="bulleted">b</paragraph>' +
						'<paragraph listIndent="0" listItemId="c" listType="numbered">c</paragraph>' +
						'<paragraph listIndent="1" listItemId="d" listType="bulleted">d</paragraph>' +
						'<paragraph listIndent="0" listItemId="e" listType="bulleted">[]e</paragraph>'
					);

					expect( command.isEnabled ).to.be.false;
				} );

				it( 'should be false if selection is in first list item with different type than previous list', () => {
					setData( model,
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
						'<paragraph listIndent="0" listItemId="b" listType="numbered">[]b</paragraph>'
					);

					expect( command.isEnabled ).to.be.false;
				} );

				it( 'should be false if selection starts in a list item that has bigger indent than it\'s previous sibling', () => {
					setData( model,
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">0</paragraph>' +
						'<paragraph listIndent="0" listItemId="b" listType="bulleted">1</paragraph>' +
						'<paragraph listIndent="1" listItemId="c" listType="bulleted">[]2</paragraph>' +
						'<paragraph listIndent="2" listItemId="d" listType="bulleted">3</paragraph>' +
						'<paragraph listIndent="2" listItemId="e" listType="bulleted">4</paragraph>' +
						'<paragraph listIndent="1" listItemId="f" listType="bulleted">5</paragraph>' +
						'<paragraph listIndent="0" listItemId="g" listType="bulleted">6</paragraph>'
					);

					expect( command.isEnabled ).to.be.false;
				} );

				it( 'should be false if selection starts before a list item', () => {
					setData( model,
						'<paragraph>[]x</paragraph>' +
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">0</paragraph>' +
						'<paragraph listIndent="0" listItemId="b" listType="bulleted">1</paragraph>'
					);

					expect( command.isEnabled ).to.be.false;
				} );
			} );

			describe( 'multiple blocks per list item', () => {
				it( 'should be true if selection starts in the first block of list item', () => {
					setData( model,
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">0</paragraph>' +
						'<paragraph listIndent="0" listItemId="b" listType="bulleted">[]1</paragraph>' +
						'<paragraph listIndent="0" listItemId="b" listType="bulleted">2</paragraph>' +
						'<paragraph listIndent="0" listItemId="b" listType="bulleted">3</paragraph>'
					);

					expect( command.isEnabled ).to.be.true;
				} );

				it( 'should be false if selection starts in the second block of list item', () => {
					setData( model,
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">0</paragraph>' +
						'<paragraph listIndent="0" listItemId="b" listType="bulleted">1</paragraph>' +
						'<paragraph listIndent="0" listItemId="b" listType="bulleted">[]2</paragraph>' +
						'<paragraph listIndent="0" listItemId="b" listType="bulleted">3</paragraph>'
					);

					expect( command.isEnabled ).to.be.false;
				} );

				it( 'should be false if selection starts in the last block of list item', () => {
					setData( model,
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">0</paragraph>' +
						'<paragraph listIndent="0" listItemId="b" listType="bulleted">1</paragraph>' +
						'<paragraph listIndent="0" listItemId="b" listType="bulleted">2</paragraph>' +
						'<paragraph listIndent="0" listItemId="b" listType="bulleted">[]3</paragraph>'
					);

					expect( command.isEnabled ).to.be.false;
				} );

				it( 'should be false if selection starts in first list item', () => {
					setData( model,
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">[]0</paragraph>' +
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">1</paragraph>'
					);

					expect( command.isEnabled ).to.be.false;
				} );

				it( 'should be false if selection starts in the first list item at given indent', () => {
					setData( model,
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
						'<paragraph listIndent="1" listItemId="b" listType="bulleted">[]b</paragraph>' +
						'<paragraph listIndent="1" listItemId="b" listType="bulleted">c</paragraph>'
					);

					expect( command.isEnabled ).to.be.false;
				} );

				it( 'should be false if selection is in first list item with different type than previous list', () => {
					setData( model,
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
						'<paragraph listIndent="0" listItemId="b" listType="numbered">[]b</paragraph>' +
						'<paragraph listIndent="0" listItemId="b" listType="numbered">b</paragraph>'
					);

					expect( command.isEnabled ).to.be.false;
				} );

				describe( 'multiple list items selection', () => {
					it( 'should be true if selection starts in the middle block of list item and spans multiple items', () => {
						setData( model,
							'<paragraph listIndent="0" listItemId="a" listType="bulleted">0</paragraph>' +
							'<paragraph listIndent="0" listItemId="b" listType="bulleted">1</paragraph>' +
							'<paragraph listIndent="0" listItemId="b" listType="bulleted">[2</paragraph>' +
							'<paragraph listIndent="0" listItemId="c" listType="bulleted">3]</paragraph>' +
							'<paragraph listIndent="0" listItemId="c" listType="bulleted">4</paragraph>'
						);

						expect( command.isEnabled ).to.be.true;
					} );
				} );
			} );
		} );

		describe( 'execute()', () => {
			describe( 'single block per list item', () => {
				it( 'should use parent batch', () => {
					setData( model,
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">0</paragraph>' +
						'<paragraph listIndent="0" listItemId="b" listType="bulleted">1</paragraph>' +
						'<paragraph listIndent="1" listItemId="c" listType="bulleted">2</paragraph>' +
						'<paragraph listIndent="2" listItemId="d" listType="bulleted">3</paragraph>' +
						'<paragraph listIndent="2" listItemId="e" listType="bulleted">4</paragraph>' +
						'<paragraph listIndent="1" listItemId="f" listType="bulleted">[]5</paragraph>' +
						'<paragraph listIndent="0" listItemId="g" listType="bulleted">6</paragraph>'
					);

					model.change( writer => {
						expect( writer.batch.operations.length ).to.equalMarkup( 0 );

						command.execute();

						expect( writer.batch.operations.length ).to.be.above( 0 );
					} );
				} );

				it( 'should increment indent attribute by 1', () => {
					setData( model, modelList( [
						'* 0',
						'* 1',
						'  * 2',
						'    * 3',
						'    * 4',
						'  * []5',
						'* 6'
					] ) );

					command.execute();

					expect( getData( model ) ).to.equalMarkup( modelList( [
						'* 0',
						'* 1',
						'  * 2',
						'    * 3',
						'    * 4',
						'    * []5',
						'* 6'
					] ) );
				} );

				it( 'should increment indent of all sub-items of indented item', () => {
					setData( model,
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">0</paragraph>' +
						'<paragraph listIndent="0" listItemId="b" listType="bulleted">[]1</paragraph>' +
						'<paragraph listIndent="1" listItemId="c" listType="bulleted">2</paragraph>' +
						'<paragraph listIndent="2" listItemId="d" listType="bulleted">3</paragraph>' +
						'<paragraph listIndent="2" listItemId="e" listType="bulleted">4</paragraph>' +
						'<paragraph listIndent="1" listItemId="f" listType="bulleted">5</paragraph>' +
						'<paragraph listIndent="0" listItemId="g" listType="bulleted">6</paragraph>'
					);

					command.execute();

					expect( getData( model, { withoutSelection: true } ) ).to.equalMarkup(
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">0</paragraph>' +
						'<paragraph listIndent="1" listItemId="b" listType="bulleted">1</paragraph>' +
						'<paragraph listIndent="2" listItemId="c" listType="bulleted">2</paragraph>' +
						'<paragraph listIndent="3" listItemId="d" listType="bulleted">3</paragraph>' +
						'<paragraph listIndent="3" listItemId="e" listType="bulleted">4</paragraph>' +
						'<paragraph listIndent="2" listItemId="f" listType="bulleted">5</paragraph>' +
						'<paragraph listIndent="0" listItemId="g" listType="bulleted">6</paragraph>'
					);
				} );

				it( 'should increment indent of all selected item when multiple items are selected', () => {
					setData( model,
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">0</paragraph>' +
						'<paragraph listIndent="0" listItemId="b" listType="bulleted">[1</paragraph>' +
						'<paragraph listIndent="1" listItemId="c" listType="bulleted">2</paragraph>' +
						'<paragraph listIndent="2" listItemId="d" listType="bulleted">3]</paragraph>' +
						'<paragraph listIndent="2" listItemId="e" listType="bulleted">4</paragraph>' +
						'<paragraph listIndent="1" listItemId="f" listType="bulleted">5</paragraph>' +
						'<paragraph listIndent="0" listItemId="g" listType="bulleted">6</paragraph>'
					);

					command.execute();

					expect( getData( model, { withoutSelection: true } ) ).to.equalMarkup(
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">0</paragraph>' +
						'<paragraph listIndent="1" listItemId="b" listType="bulleted">1</paragraph>' +
						'<paragraph listIndent="2" listItemId="c" listType="bulleted">2</paragraph>' +
						'<paragraph listIndent="3" listItemId="d" listType="bulleted">3</paragraph>' +
						'<paragraph listIndent="2" listItemId="e" listType="bulleted">4</paragraph>' +
						'<paragraph listIndent="1" listItemId="f" listType="bulleted">5</paragraph>' +
						'<paragraph listIndent="0" listItemId="g" listType="bulleted">6</paragraph>'
					);
				} );

				it( 'should fire "afterExecute" event after finish all operations with all changed items', done => {
					setData( model,
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">0</paragraph>' +
						'<paragraph listIndent="0" listItemId="b" listType="bulleted">[]1</paragraph>' +
						'<paragraph listIndent="1" listItemId="c" listType="bulleted">2</paragraph>' +
						'<paragraph listIndent="2" listItemId="d" listType="bulleted">3</paragraph>' +
						'<paragraph listIndent="2" listItemId="e" listType="bulleted">4</paragraph>' +
						'<paragraph listIndent="1" listItemId="f" listType="bulleted">5</paragraph>' +
						'<paragraph listIndent="0" listItemId="g" listType="bulleted">6</paragraph>'
					);

					command.on( 'afterExecute', ( evt, data ) => {
						expect( data ).to.deep.equalMarkup( [
							root.getChild( 1 ),
							root.getChild( 2 ),
							root.getChild( 3 ),
							root.getChild( 4 ),
							root.getChild( 5 )
						] );

						done();
					} );

					command.execute();
				} );
			} );

			describe( 'multiple blocks per list item', () => {
				it( 'should change indent of all blocks of a list item', () => {
					setData( model,
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">0</paragraph>' +
						'<paragraph listIndent="0" listItemId="b" listType="bulleted">[]1</paragraph>' +
						'<paragraph listIndent="0" listItemId="b" listType="bulleted">2</paragraph>' +
						'<paragraph listIndent="0" listItemId="b" listType="bulleted">3</paragraph>' +
						'<paragraph listIndent="0" listItemId="c" listType="bulleted">4</paragraph>'
					);

					command.execute();

					expect( getData( model, { withoutSelection: true } ) ).to.equalMarkup(
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">0</paragraph>' +
						'<paragraph listIndent="1" listItemId="b" listType="bulleted">1</paragraph>' +
						'<paragraph listIndent="1" listItemId="b" listType="bulleted">2</paragraph>' +
						'<paragraph listIndent="1" listItemId="b" listType="bulleted">3</paragraph>' +
						'<paragraph listIndent="0" listItemId="c" listType="bulleted">4</paragraph>'
					);
				} );

				it( 'should do nothing if the following block of bigger list item is selected', () => {
					setData( model,
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">0</paragraph>' +
						'<paragraph listIndent="0" listItemId="b" listType="bulleted">1</paragraph>' +
						'<paragraph listIndent="0" listItemId="b" listType="bulleted">[]2</paragraph>' +
						'<paragraph listIndent="0" listItemId="b" listType="bulleted">3</paragraph>' +
						'<paragraph listIndent="0" listItemId="c" listType="bulleted">4</paragraph>'
					);

					command.isEnabled = true;
					command.execute();

					expect( getData( model, { withoutSelection: true } ) ).to.equalMarkup(
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">0</paragraph>' +
						'<paragraph listIndent="0" listItemId="b" listType="bulleted">1</paragraph>' +
						'<paragraph listIndent="0" listItemId="b" listType="bulleted">2</paragraph>' +
						'<paragraph listIndent="0" listItemId="b" listType="bulleted">3</paragraph>' +
						'<paragraph listIndent="0" listItemId="c" listType="bulleted">4</paragraph>'
					);
				} );

				it( 'should increment indent of all sub-items of indented item', () => {
					setData( model,
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">0</paragraph>' +
						'<paragraph listIndent="0" listItemId="b" listType="bulleted">[]1</paragraph>' +
						'<paragraph listIndent="1" listItemId="c" listType="bulleted">2</paragraph>' +
						'<paragraph listIndent="2" listItemId="d" listType="bulleted">3</paragraph>' +
						'<paragraph listIndent="2" listItemId="d" listType="bulleted">4</paragraph>' +
						'<paragraph listIndent="1" listItemId="e" listType="bulleted">5</paragraph>' +
						'<paragraph listIndent="0" listItemId="b" listType="bulleted">6</paragraph>' +
						'<paragraph listIndent="0" listItemId="f" listType="bulleted">6</paragraph>'
					);

					command.execute();

					expect( getData( model, { withoutSelection: true } ) ).to.equalMarkup(
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">0</paragraph>' +
						'<paragraph listIndent="1" listItemId="b" listType="bulleted">1</paragraph>' +
						'<paragraph listIndent="2" listItemId="c" listType="bulleted">2</paragraph>' +
						'<paragraph listIndent="3" listItemId="d" listType="bulleted">3</paragraph>' +
						'<paragraph listIndent="3" listItemId="d" listType="bulleted">4</paragraph>' +
						'<paragraph listIndent="2" listItemId="e" listType="bulleted">5</paragraph>' +
						'<paragraph listIndent="1" listItemId="b" listType="bulleted">6</paragraph>' +
						'<paragraph listIndent="0" listItemId="f" listType="bulleted">6</paragraph>'
					);
				} );

				it( 'should increment indent of all sub-items of indented item (at end of list item)', () => {
					setData( model,
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">0</paragraph>' +
						'<paragraph listIndent="0" listItemId="b" listType="bulleted">[]1</paragraph>' +
						'<paragraph listIndent="0" listItemId="b" listType="bulleted">2</paragraph>' +
						'<paragraph listIndent="1" listItemId="c" listType="bulleted">3</paragraph>' +
						'<paragraph listIndent="2" listItemId="d" listType="bulleted">4</paragraph>' +
						'<paragraph listIndent="2" listItemId="d" listType="bulleted">5</paragraph>' +
						'<paragraph listIndent="1" listItemId="e" listType="bulleted">6</paragraph>' +
						'<paragraph listIndent="0" listItemId="f" listType="bulleted">8</paragraph>'
					);

					command.execute();

					expect( getData( model, { withoutSelection: true } ) ).to.equalMarkup(
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">0</paragraph>' +
						'<paragraph listIndent="1" listItemId="b" listType="bulleted">1</paragraph>' +
						'<paragraph listIndent="1" listItemId="b" listType="bulleted">2</paragraph>' +
						'<paragraph listIndent="2" listItemId="c" listType="bulleted">3</paragraph>' +
						'<paragraph listIndent="3" listItemId="d" listType="bulleted">4</paragraph>' +
						'<paragraph listIndent="3" listItemId="d" listType="bulleted">5</paragraph>' +
						'<paragraph listIndent="2" listItemId="e" listType="bulleted">6</paragraph>' +
						'<paragraph listIndent="0" listItemId="f" listType="bulleted">8</paragraph>'
					);
				} );

				it( 'should increment indent of all selected list items when multiple items are selected partially', () => {
					setData( model,
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">0</paragraph>' +
						'<paragraph listIndent="0" listItemId="b" listType="bulleted">1</paragraph>' +
						'<paragraph listIndent="0" listItemId="b" listType="bulleted">[2</paragraph>' +
						'<paragraph listIndent="0" listItemId="c" listType="bulleted">3]</paragraph>' +
						'<paragraph listIndent="0" listItemId="c" listType="bulleted">4</paragraph>' +
						'<paragraph listIndent="0" listItemId="d" listType="bulleted">5</paragraph>'
					);

					command.execute();

					expect( getData( model, { withoutSelection: true } ) ).to.equalMarkup(
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">0</paragraph>' +
						'<paragraph listIndent="1" listItemId="b" listType="bulleted">1</paragraph>' +
						'<paragraph listIndent="1" listItemId="b" listType="bulleted">2</paragraph>' +
						'<paragraph listIndent="1" listItemId="c" listType="bulleted">3</paragraph>' +
						'<paragraph listIndent="1" listItemId="c" listType="bulleted">4</paragraph>' +
						'<paragraph listIndent="0" listItemId="d" listType="bulleted">5</paragraph>'
					);
				} );

				it( 'should not increment indent of items from the following list even if it was selected', () => {
					setData( model,
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">0</paragraph>' +
						'<paragraph listIndent="0" listItemId="b" listType="bulleted">[1</paragraph>' +
						'<paragraph>2</paragraph>' +
						'<paragraph listIndent="0" listItemId="c" listType="bulleted">3]</paragraph>' +
						'<paragraph listIndent="0" listItemId="d" listType="bulleted">4</paragraph>'
					);

					command.execute();

					expect( getData( model, { withoutSelection: true } ) ).to.equalMarkup(
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">0</paragraph>' +
						'<paragraph listIndent="1" listItemId="b" listType="bulleted">1</paragraph>' +
						'<paragraph>2</paragraph>' +
						'<paragraph listIndent="0" listItemId="c" listType="bulleted">3</paragraph>' +
						'<paragraph listIndent="0" listItemId="d" listType="bulleted">4</paragraph>'
					);
				} );

				it( 'should fire "afterExecute" event after finish all operations with all changed items', done => {
					setData( model,
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">0</paragraph>' +
						'<paragraph listIndent="0" listItemId="b" listType="bulleted">[]1</paragraph>' +
						'<paragraph listIndent="1" listItemId="c" listType="bulleted">2</paragraph>' +
						'<paragraph listIndent="2" listItemId="d" listType="bulleted">3</paragraph>' +
						'<paragraph listIndent="2" listItemId="e" listType="bulleted">4</paragraph>' +
						'<paragraph listIndent="1" listItemId="f" listType="bulleted">5</paragraph>' +
						'<paragraph listIndent="0" listItemId="g" listType="bulleted">6</paragraph>'
					);

					command.on( 'afterExecute', ( evt, data ) => {
						expect( data ).to.deep.equalMarkup( [
							root.getChild( 1 ),
							root.getChild( 2 ),
							root.getChild( 3 ),
							root.getChild( 4 ),
							root.getChild( 5 )
						] );

						done();
					} );

					command.execute();
				} );
			} );
		} );
	} );

	describe( 'backward (outdent)', () => {
		let command;

		beforeEach( () => {
			command = new DocumentListIndentCommand( editor, 'backward' );
		} );

		afterEach( () => {
			command.destroy();
		} );

		describe( 'isEnabled', () => {
			it( 'should be true if selection starts in list item', () => {
				setData( model,
					'<paragraph listIndent="0" listItemId="a" listType="bulleted">0</paragraph>' +
					'<paragraph listIndent="0" listItemId="b" listType="bulleted">1</paragraph>' +
					'<paragraph listIndent="1" listItemId="c" listType="bulleted">2</paragraph>' +
					'<paragraph listIndent="2" listItemId="d" listType="bulleted">3</paragraph>' +
					'<paragraph listIndent="2" listItemId="e" listType="bulleted">4</paragraph>' +
					'<paragraph listIndent="1" listItemId="f" listType="bulleted">[]5</paragraph>' +
					'<paragraph listIndent="0" listItemId="g" listType="bulleted">6</paragraph>'
				);

				expect( command.isEnabled ).to.be.true;
			} );

			it( 'should be true if selection starts in first list item', () => {
				setData( model,
					'<paragraph listIndent="0" listItemId="a" listType="bulleted">[]0</paragraph>' +
					'<paragraph listIndent="0" listItemId="b" listType="bulleted">1</paragraph>' +
					'<paragraph listIndent="1" listItemId="c" listType="bulleted">2</paragraph>' +
					'<paragraph listIndent="2" listItemId="d" listType="bulleted">3</paragraph>' +
					'<paragraph listIndent="2" listItemId="e" listType="bulleted">4</paragraph>' +
					'<paragraph listIndent="1" listItemId="f" listType="bulleted">5</paragraph>' +
					'<paragraph listIndent="0" listItemId="g" listType="bulleted">6</paragraph>'
				);

				expect( command.isEnabled ).to.be.true;
			} );

			it( 'should be true if selection starts in a list item that has bigger indent than it\'s previous sibling', () => {
				setData( model,
					'<paragraph listIndent="0" listItemId="a" listType="bulleted">0</paragraph>' +
					'<paragraph listIndent="0" listItemId="b" listType="bulleted">1</paragraph>' +
					'<paragraph listIndent="1" listItemId="c" listType="bulleted">[]2</paragraph>' +
					'<paragraph listIndent="2" listItemId="d" listType="bulleted">3</paragraph>' +
					'<paragraph listIndent="2" listItemId="e" listType="bulleted">4</paragraph>' +
					'<paragraph listIndent="1" listItemId="f" listType="bulleted">5</paragraph>' +
					'<paragraph listIndent="0" listItemId="g" listType="bulleted">6</paragraph>'
				);

				expect( command.isEnabled ).to.be.true;
			} );

			it( 'should be false if selection starts before a list', () => {
				setData( model,
					'<paragraph>[0</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="bulleted">1]</paragraph>' +
					'<paragraph listIndent="1" listItemId="b" listType="bulleted">2</paragraph>'
				);

				expect( command.isEnabled ).to.be.false;
			} );

			it( 'should be true with selection in the middle block of a list item', () => {
				setData( model,
					'<paragraph listIndent="0" listItemId="a" listType="bulleted">0</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="bulleted">[]1</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="bulleted">2</paragraph>'
				);

				expect( command.isEnabled ).to.be.true;
			} );

			it( 'should be true with selection in the last block of a list item', () => {
				setData( model,
					'<paragraph listIndent="0" listItemId="a" listType="bulleted">0</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="bulleted">1</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="bulleted">[]2</paragraph>'
				);

				expect( command.isEnabled ).to.be.true;
			} );
		} );

		describe( 'execute()', () => {
			it( 'should decrement indent attribute by 1 (if it is bigger than 0)', () => {
				setData( model,
					'<paragraph listIndent="0" listItemId="a" listType="bulleted">0</paragraph>' +
					'<paragraph listIndent="0" listItemId="b" listType="bulleted">1</paragraph>' +
					'<paragraph listIndent="1" listItemId="c" listType="bulleted">2</paragraph>' +
					'<paragraph listIndent="2" listItemId="d" listType="bulleted">3</paragraph>' +
					'<paragraph listIndent="2" listItemId="e" listType="bulleted">4</paragraph>' +
					'<paragraph listIndent="1" listItemId="f" listType="bulleted">[]5</paragraph>' +
					'<paragraph listIndent="0" listItemId="g" listType="bulleted">6</paragraph>'
				);

				command.execute();

				expect( getData( model, { withoutSelection: true } ) ).to.equalMarkup(
					'<paragraph listIndent="0" listItemId="a" listType="bulleted">0</paragraph>' +
					'<paragraph listIndent="0" listItemId="b" listType="bulleted">1</paragraph>' +
					'<paragraph listIndent="1" listItemId="c" listType="bulleted">2</paragraph>' +
					'<paragraph listIndent="2" listItemId="d" listType="bulleted">3</paragraph>' +
					'<paragraph listIndent="2" listItemId="e" listType="bulleted">4</paragraph>' +
					'<paragraph listIndent="0" listItemId="f" listType="bulleted">5</paragraph>' +
					'<paragraph listIndent="0" listItemId="g" listType="bulleted">6</paragraph>'
				);
			} );

			it( 'should remove list attributes (if indent is less than to 0)', () => {
				setData( model,
					'<paragraph listIndent="0" listItemId="a" listType="bulleted">[]0</paragraph>' +
					'<paragraph listIndent="0" listItemId="b" listType="bulleted">1</paragraph>' +
					'<paragraph listIndent="1" listItemId="c" listType="bulleted">2</paragraph>' +
					'<paragraph listIndent="2" listItemId="d" listType="bulleted">3</paragraph>' +
					'<paragraph listIndent="2" listItemId="e" listType="bulleted">4</paragraph>' +
					'<paragraph listIndent="1" listItemId="f" listType="bulleted">5</paragraph>' +
					'<paragraph listIndent="0" listItemId="g" listType="bulleted">6</paragraph>'
				);

				command.execute();

				expect( getData( model, { withoutSelection: true } ) ).to.equalMarkup(
					'<paragraph>0</paragraph>' +
					'<paragraph listIndent="0" listItemId="b" listType="bulleted">1</paragraph>' +
					'<paragraph listIndent="1" listItemId="c" listType="bulleted">2</paragraph>' +
					'<paragraph listIndent="2" listItemId="d" listType="bulleted">3</paragraph>' +
					'<paragraph listIndent="2" listItemId="e" listType="bulleted">4</paragraph>' +
					'<paragraph listIndent="1" listItemId="f" listType="bulleted">5</paragraph>' +
					'<paragraph listIndent="0" listItemId="g" listType="bulleted">6</paragraph>'
				);
			} );

			it( 'should decrement indent of all sub-items of outdented item', () => {
				setData( model,
					'<paragraph listIndent="0" listItemId="a" listType="bulleted">0</paragraph>' +
					'<paragraph listIndent="0" listItemId="b" listType="bulleted">[]1</paragraph>' +
					'<paragraph listIndent="1" listItemId="c" listType="bulleted">2</paragraph>' +
					'<paragraph listIndent="2" listItemId="d" listType="bulleted">3</paragraph>' +
					'<paragraph listIndent="2" listItemId="e" listType="bulleted">4</paragraph>' +
					'<paragraph listIndent="1" listItemId="f" listType="bulleted">5</paragraph>' +
					'<paragraph listIndent="0" listItemId="g" listType="bulleted">6</paragraph>'
				);

				command.execute();

				expect( getData( model, { withoutSelection: true } ) ).to.equalMarkup(
					'<paragraph listIndent="0" listItemId="a" listType="bulleted">0</paragraph>' +
					'<paragraph>1</paragraph>' +
					'<paragraph listIndent="0" listItemId="c" listType="bulleted">2</paragraph>' +
					'<paragraph listIndent="1" listItemId="d" listType="bulleted">3</paragraph>' +
					'<paragraph listIndent="1" listItemId="e" listType="bulleted">4</paragraph>' +
					'<paragraph listIndent="0" listItemId="f" listType="bulleted">5</paragraph>' +
					'<paragraph listIndent="0" listItemId="g" listType="bulleted">6</paragraph>'
				);
			} );

			it( 'should outdent all selected item when multiple items are selected', () => {
				setData( model,
					'<paragraph listIndent="0" listItemId="a" listType="bulleted">0</paragraph>' +
					'<paragraph listIndent="0" listItemId="b" listType="bulleted">[1</paragraph>' +
					'<paragraph listIndent="1" listItemId="c" listType="bulleted">2</paragraph>' +
					'<paragraph listIndent="2" listItemId="d" listType="bulleted">3]</paragraph>' +
					'<paragraph listIndent="2" listItemId="e" listType="bulleted">4</paragraph>' +
					'<paragraph listIndent="1" listItemId="f" listType="bulleted">5</paragraph>' +
					'<paragraph listIndent="0" listItemId="g" listType="bulleted">6</paragraph>'
				);

				command.execute();

				expect( getData( model, { withoutSelection: true } ) ).to.equalMarkup(
					'<paragraph listIndent="0" listItemId="a" listType="bulleted">0</paragraph>' +
					'<paragraph>1</paragraph>' +
					'<paragraph listIndent="0" listItemId="c" listType="bulleted">2</paragraph>' +
					'<paragraph listIndent="1" listItemId="d" listType="bulleted">3</paragraph>' +
					'<paragraph listIndent="2" listItemId="e" listType="bulleted">4</paragraph>' +
					'<paragraph listIndent="1" listItemId="f" listType="bulleted">5</paragraph>' +
					'<paragraph listIndent="0" listItemId="g" listType="bulleted">6</paragraph>'
				);
			} );

			it( 'should outdent all blocks of partly selected item when multiple items are selected', () => {
				setData( model,
					'<paragraph listIndent="0" listItemId="a" listType="bulleted">0</paragraph>' +
					'<paragraph listIndent="1" listItemId="b" listType="bulleted">1</paragraph>' +
					'<paragraph listIndent="1" listItemId="b" listType="bulleted">[2</paragraph>' +
					'<paragraph listIndent="2" listItemId="c" listType="bulleted">3]</paragraph>' +
					'<paragraph listIndent="2" listItemId="c" listType="bulleted">4</paragraph>' +
					'<paragraph listIndent="1" listItemId="d" listType="bulleted">5</paragraph>' +
					'<paragraph listIndent="0" listItemId="e" listType="bulleted">6</paragraph>'
				);

				command.execute();

				expect( getData( model, { withoutSelection: true } ) ).to.equalMarkup(
					'<paragraph listIndent="0" listItemId="a" listType="bulleted">0</paragraph>' +
					'<paragraph listIndent="0" listItemId="b" listType="bulleted">1</paragraph>' +
					'<paragraph listIndent="0" listItemId="b" listType="bulleted">2</paragraph>' +
					'<paragraph listIndent="1" listItemId="c" listType="bulleted">3</paragraph>' +
					'<paragraph listIndent="1" listItemId="c" listType="bulleted">4</paragraph>' +
					'<paragraph listIndent="1" listItemId="d" listType="bulleted">5</paragraph>' +
					'<paragraph listIndent="0" listItemId="e" listType="bulleted">6</paragraph>'
				);
			} );

			it( 'should split list item if selection is in the following list item block', () => {
				setData( model,
					'<paragraph listIndent="0" listItemId="a" listType="bulleted">0</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="bulleted">[]1</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="bulleted">2</paragraph>' +
					'<paragraph listIndent="0" listItemId="b" listType="bulleted">3</paragraph>'
				);

				stubUid();
				command.execute();

				expect( getData( model, { withoutSelection: true } ) ).to.equalMarkup(
					'<paragraph listIndent="0" listItemId="a" listType="bulleted">0</paragraph>' +
					'<paragraph listIndent="0" listItemId="e00000000000000000000000000000000" listType="bulleted">1</paragraph>' +
					'<paragraph listIndent="0" listItemId="e00000000000000000000000000000000" listType="bulleted">2</paragraph>' +
					'<paragraph listIndent="0" listItemId="b" listType="bulleted">3</paragraph>'
				);
			} );

			it( 'should split list item if selection is in the last list item block', () => {
				setData( model,
					'<paragraph listIndent="0" listItemId="a" listType="bulleted">0</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="bulleted">1</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="bulleted">[]2</paragraph>' +
					'<paragraph listIndent="0" listItemId="b" listType="bulleted">3</paragraph>'
				);

				stubUid();
				command.execute();

				expect( getData( model, { withoutSelection: true } ) ).to.equalMarkup(
					'<paragraph listIndent="0" listItemId="a" listType="bulleted">0</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="bulleted">1</paragraph>' +
					'<paragraph listIndent="0" listItemId="e00000000000000000000000000000000" listType="bulleted">2</paragraph>' +
					'<paragraph listIndent="0" listItemId="b" listType="bulleted">3</paragraph>'
				);
			} );
		} );
	} );
} );
