/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { modelList } from './_utils/utils';
import DocumentListMergeCommand from '../../src/documentlist/documentlistmergecommand';

import Editor from '@ckeditor/ckeditor5-core/src/editor/editor';
import Model from '@ckeditor/ckeditor5-engine/src/model/model';

import DeleteCommand from '@ckeditor/ckeditor5-typing/src/deletecommand';

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import { setData, getData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

describe( 'DocumentListMergeCommand', () => {
	let editor, model, doc, command;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		editor = new Editor();
		editor.model = new Model();

		model = editor.model;
		doc = model.document;
		doc.createRoot();

		model.schema.register( 'paragraph', { inheritAllFrom: '$block' } );
		model.schema.register( 'blockQuote', { inheritAllFrom: '$container' } );
		model.schema.extend( '$container', { allowAttributes: [ 'listType', 'listIndent', 'listItemId' ] } );
		command = new DocumentListMergeCommand( editor );
	} );

	afterEach( () => {
		command.destroy();
	} );

	// TODO add cases for forward delete
	describe( 'isEnabled', () => {
		describe( 'enabled if', () => {
			describe( 'when collapsed selection', () => {
				describe( 'selection at the start of a block (backward delete)', () => {
					it( 'if preceded by other list item of same indentation', () => {
						setData( model, modelList( [
							'* a',
							'* []b',
							'* c',
							'* d'
						] ) );

						expect( command.isEnabled ).to.be.true;

						setData( model, modelList( [
							'* a',
							'* b',
							'* []c',
							'* d'
						] ) );

						expect( command.isEnabled ).to.be.true;

						setData( model, modelList( [
							'* a',
							'* b',
							'* c',
							'* []d'
						] ) );

						expect( command.isEnabled ).to.be.true;
					} );

					it( 'if selection is at the beginning of list item that is preceded by other list item of lower indentation', () => {
						setData( model, modelList( [
							'* a',
							'* b',
							'  * []c',
							'    * d',
							'* e',
							'* f'
						] ) );

						expect( command.isEnabled ).to.be.true;
					} );

					it( 'if selection is at the beginning of list item that is preceded by other list item of higher indentation', () => {
						setData( model, modelList( [
							'* a',
							'* b',
							'  * c',
							'    * d',
							'  * []e',
							'* f',
							'* g'
						] ) );

						expect( command.isEnabled ).to.be.true;
					} );

					it( 'if selection is at the beginning of the first block of list item', () => {
						setData( model, modelList( [
							'* a',
							'* []b',
							'  c',
							'  d'
						] ) );

						expect( command.isEnabled ).to.be.true;
					} );

					it( 'if selection is at the beginning of noninitial block of list item', () => {
						setData( model, modelList( [
							'* a',
							'* b',
							'  []c',
							'  d'
						] ) );

						expect( command.isEnabled ).to.be.true;
					} );

					it( 'if selection is at the beginning of the last block of list item', () => {
						setData( model, modelList( [
							'* a',
							'* b',
							'  c',
							'  []d'
						] ) );

						expect( command.isEnabled ).to.be.true;
					} );

					it( 'if selection is at the beginning of noninitial block of list item proceed by indent', () => {
						setData( model, modelList( [
							'* a',
							'  * b',
							'  * c',
							'    * d',
							'    []e'
						] ) );

						expect( command.isEnabled ).to.be.true;
					} );
				} );

				describe( 'selection at the end of a block (forward delete)', () => {
					it( 'if followed by a list item of same indentation', () => {
						setData( model, modelList( [
							'* a[]',
							'* b',
							'* c',
							'* d'
						] ) );

						expect( command.isEnabled ).to.be.true;

						setData( model, modelList( [
							'* a',
							'* b',
							'* c[]',
							'* d'
						] ) );

						expect( command.isEnabled ).to.be.true;

						setData( model, modelList( [
							'* a',
							'* b[]',
							'* c',
							'* d'
						] ) );

						expect( command.isEnabled ).to.be.true;
					} );

					it( 'if selection is followed by other list item of higher indentation', () => {
						setData( model, modelList( [
							'* a',
							'* b',
							'  * c[]',
							'    * d',
							'* e',
							'* f'
						] ) );

						expect( command.isEnabled ).to.be.true;
					} );

					it( 'if selection is followed by a list item of lower indentation', () => {
						setData( model, modelList( [
							'* a',
							'* b',
							'  * c',
							'    * d',
							'  * e[]',
							'* f',
							'* g'
						] ) );

						expect( command.isEnabled ).to.be.true;
					} );

					it( 'if selection is at the end of the first block of list item', () => {
						setData( model, modelList( [
							'* a',
							'* b[]',
							'  c',
							'  d'
						] ) );

						expect( command.isEnabled ).to.be.true;
					} );

					it( 'if selection is at the end of noninitial block of list item', () => {
						setData( model, modelList( [
							'* a',
							'* b',
							'  c[]',
							'  d'
						] ) );

						expect( command.isEnabled ).to.be.true;
					} );

					it( 'if selection is at the end of the last block of list item that is not part of the last item in a list', () => {
						setData( model, modelList( [
							'* a',
							'* b',
							'  c',
							'  d[]',
							'* e'
						] ) );

						expect( command.isEnabled ).to.be.true;
					} );
				} );
			} );

			describe( 'when non-collapsed selection', () => {
				it( 'if selection is spaning only empty list items', () => {
					setData( model, modelList( [
						'* foo',
						'* [',
						'* ]',
						'  c'
					] ) );

					expect( command.isEnabled ).to.be.true;
				} );

				it( 'if selection starts at the end of list item and ends at the start of another', () => {
					setData( model, modelList( [
						'* a[',
						'* ]a',
						'* b'
					] ) );

					expect( command.isEnabled ).to.be.true;
				} );

				it( 'if selection ends at the beginning of another list item', () => {
					setData( model, modelList( [
						'* fo[o',
						'* ]a',
						'* b'
					] ) );

					expect( command.isEnabled ).to.be.true;
				} );

				describe( 'selection starts at the start of a list item', () => {
					it( 'should be enabled when selection ends at the end of another list item', () => {
						setData( model, modelList( [
							'* [a',
							'* b]',
							'* c'
						] ) );

						expect( command.isEnabled ).to.be.true;
					} );

					it( 'when selection ends at the end of another list item and spans multiple list items', () => {
						setData( model, modelList( [
							'* [a',
							'* b',
							'* c]'
						] ) );

						expect( command.isEnabled ).to.be.true;
					} );

					it( 'when selection ends at the end of another list item and spans multiple list items (multiple blocks)', () => {
						setData( model, modelList( [
							'* [a',
							'* b',
							'  c',
							'* d]'
						] ) );

						expect( command.isEnabled ).to.be.true;
					} );

					it( 'when selection ends at the end of indented list item', () => {
						setData( model, modelList( [
							'* [a',
							'* b',
							'  * c]',
							'* d'
						] ) );

						expect( command.isEnabled ).to.be.true;
					} );

					it( 'when selection ends at the non-initial block of a intended list item', () => {
						setData( model, modelList( [
							'* [a',
							'* b',
							'  * c',
							'    d]',
							'* e'
						] ) );

						expect( command.isEnabled ).to.be.true;
					} );

					it( 'when selection spans intended list item', () => {
						setData( model, modelList( [
							'* [a',
							'* b',
							'  * c',
							'    d',
							'* e]'
						] ) );

						expect( command.isEnabled ).to.be.true;
					} );

					it( 'when selection ends in the middle of list item', () => {
						setData( model, modelList( [
							'* [a',
							'* te]xt',
							'* e'
						] ) );

						expect( command.isEnabled ).to.be.true;
					} );
				} );

				describe( 'selection starts at in the middle of a list item', () => {
					it( 'should be enabled when selection ends at the end of another list item', () => {
						setData( model, modelList( [
							'* te[xt',
							'* b]',
							'* c'
						] ) );

						expect( command.isEnabled ).to.be.true;
					} );

					it( 'when selection ends at the end of another list item and spans multiple list items', () => {
						setData( model, modelList( [
							'* te[xt',
							'* b',
							'* c]'
						] ) );

						expect( command.isEnabled ).to.be.true;
					} );

					it( 'when selection ends at the end of another list item and spans multiple list items (multiple blocks)', () => {
						setData( model, modelList( [
							'* te[xt',
							'* b',
							'  c',
							'* d]'
						] ) );

						expect( command.isEnabled ).to.be.true;
					} );

					it( 'when selection ends at the end of indented list item', () => {
						setData( model, modelList( [
							'* te[xt',
							'* b',
							'  * c]',
							'* d'
						] ) );

						expect( command.isEnabled ).to.be.true;
					} );

					it( 'when selection ends at the non-initial block of a intended list item', () => {
						setData( model, modelList( [
							'* te[xt',
							'* b',
							'  * c',
							'    d]',
							'* e'
						] ) );

						expect( command.isEnabled ).to.be.true;
					} );

					it( 'when selection spans intended list item', () => {
						setData( model, modelList( [
							'* te[xt',
							'* b',
							'  * c',
							'    d',
							'* e]'
						] ) );

						expect( command.isEnabled ).to.be.true;
					} );

					it( 'when selection ends in the middle of list item', () => {
						setData( model, modelList( [
							'* te[xt',
							'* te]xt',
							'* e'
						] ) );

						expect( command.isEnabled ).to.be.true;
					} );
				} );

				describe( 'selection starts at the end of a list item', () => {
					it( 'should be enabled when selection ends at the end of another list item', () => {
						setData( model, modelList( [
							'* a[',
							'* b]',
							'* c'
						] ) );

						expect( command.isEnabled ).to.be.true;
					} );

					it( 'when selection ends at the end of another list item and spans multiple list items', () => {
						setData( model, modelList( [
							'* a[',
							'* b',
							'* c]'
						] ) );

						expect( command.isEnabled ).to.be.true;
					} );

					it( 'when selection ends at the end of another list item and spans multiple list items (multiple blocks)', () => {
						setData( model, modelList( [
							'* a[',
							'* b',
							'  c',
							'* d]'
						] ) );

						expect( command.isEnabled ).to.be.true;
					} );

					it( 'when selection ends at the end of indented list item', () => {
						setData( model, modelList( [
							'* a[',
							'* b',
							'  * c]',
							'* d'
						] ) );

						expect( command.isEnabled ).to.be.true;
					} );

					it( 'when selection ends at the non-initial block of a intended list item', () => {
						setData( model, modelList( [
							'* a[',
							'* b',
							'  * c',
							'    d]',
							'* e'
						] ) );

						expect( command.isEnabled ).to.be.true;
					} );

					it( 'when selection spans intended list item', () => {
						setData( model, modelList( [
							'* a[',
							'* b',
							'  * c',
							'    d',
							'* e]'
						] ) );

						expect( command.isEnabled ).to.be.true;
					} );

					it( 'when selection ends in the middle of list item', () => {
						setData( model, modelList( [
							'* a[',
							'* te]xt',
							'* e'
						] ) );

						expect( command.isEnabled ).to.be.true;
					} );
				} );
			} );
		} );

		describe( 'disabled', () => {
			describe( 'collapsed selection', () => {
				it( 'if selection is at the beginning of the first list item of a list', () => {
					setData( model, modelList( [
						'* []a',
						'* b',
						'* c',
						'* d'
					] ) );

					expect( command.isEnabled ).to.be.false;
				} );

				it( 'if selection is not at the beginning nor end of a list item', () => {
					setData( model, modelList( [
						'* te[]xt',
						'* b',
						'* c',
						'* d'
					] ) );

					expect( command.isEnabled ).to.be.false;

					setData( model, modelList( [
						'* a',
						'* te[]xt',
						'* c',
						'* d'
					] ) );

					expect( command.isEnabled ).to.be.false;

					setData( model, modelList( [
						'* a',
						'* b',
						'* c',
						'* te[]xt'
					] ) );

					expect( command.isEnabled ).to.be.false;
				} );

				it( 'if selection is not at the beginning nor end of a block', () => {
					setData( model, modelList( [
						'* a',
						'* b',
						'  te[]xt'
					] ) );

					expect( command.isEnabled ).to.be.false;
				} );

				it( 'if selection is outside list', () => {
					setData( model, modelList( [
						'foo[]',
						'* a',
						'* b',
						'  c'
					] ) );

					expect( command.isEnabled ).to.be.false;
				} );
			} );

			describe( 'non-collapsed selection', () => {
				it( 'if selection is spaning whole single list item', () => {
					setData( model, modelList( [
						'* [foo]',
						'* a',
						'* b',
						'  c'
					] ) );

					expect( command.isEnabled ).to.be.false;
				} );

				it( 'if selection is spaning part of single list item', () => {
					setData( model, modelList( [
						'* f[oo]oo',
						'* a',
						'* b',
						'  c'
					] ) );

					expect( command.isEnabled ).to.be.false;
				} );

				it( 'if selection is spaning the middle and the end of list item', () => {
					setData( model, modelList( [
						'* fo[ooo]',
						'* a',
						'* b',
						'  c'
					] ) );

					expect( command.isEnabled ).to.be.false;
				} );

				it( 'if selection is spaning the start and the middle of single list item', () => {
					setData( model, modelList( [
						'* [foo]oo',
						'* a',
						'* b',
						'  c'
					] ) );

					expect( command.isEnabled ).to.be.false;
				} );
			} );
		} );
	} );

	describe( 'execute()', () => {
		describe( 'backward delete', () => {
			let deleteCommand;

			beforeEach( () => {
				deleteCommand = new DeleteCommand( editor, 'backward' );
				editor.commands.add( 'delete', deleteCommand );
			} );

			afterEach( () => {
				deleteCommand.destroy();
			} );

			describe( 'collapsed selection at the beginning of a list item', () => {
				describe( 'item before is empty', () => {
					it( 'should merge non empty list item with with previous list item as a block', () => {
						setData( model, modelList( [
							'* ',
							'* []b'
						] ) );

						command.execute();

						expect( getData( model ) ).to.equalMarkup( modelList( [
							'* []b{id:001}'
						] ) );
					} );

					it( 'should merge empty list item with with previous empty list item', () => {
						setData( model, modelList( [
							'* ',
							'* []'
						] ) );

						command.execute();

						expect( getData( model ) ).to.equalMarkup( modelList( [
							'* []'
						] ) );
					} );

					it( 'should merge indented list item with with previous empty list item', () => {
						setData( model, modelList( [
							'* ',
							'  * []a'
						] ) );

						command.execute();

						expect( getData( model ) ).to.equalMarkup( modelList( [
							'* []a{id:001}'
						] ) );
					} );

					it( 'should merge indented empty list item with with previous empty list item', () => {
						setData( model, modelList( [
							'* ',
							'  * []'
						] ) );

						command.execute();

						expect( getData( model ) ).to.equalMarkup( modelList( [
							'* []'
						] ) );
					} );

					it( 'should merge list item with with previous indented empty list item', () => {
						setData( model, modelList( [
							'* ',
							'  * ',
							'* []a'
						] ) );

						command.execute();

						expect( getData( model ) ).to.equalMarkup( modelList( [
							'* ',
							'  * []a{id:002}'
						] ) );
					} );

					it( 'should merge empty list item with with previous indented empty list item', () => {
						setData( model, modelList( [
							'* ',
							'  * ',
							'* []'
						] ) );

						command.execute();

						expect( getData( model ) ).to.equalMarkup( modelList( [
							'* ',
							'  * []'
						] ) );
					} );
				} );

				describe( 'item before is not empty', () => {
					it( 'should merge non empty list item with with previous list item as a block', () => {
						setData( model, modelList( [
							'* a',
							'* []b'
						] ) );

						command.execute();

						expect( getData( model ) ).to.equalMarkup( modelList( [
							'* a',
							'  []b'
						] ) );
					} );

					it( 'should merge empty list item with with previous list item as a block', () => {
						setData( model, modelList( [
							'* a',
							'* []'
						] ) );

						command.execute();

						expect( getData( model ) ).to.equalMarkup( modelList( [
							'* a',
							'  []'
						] ) );
					} );

					it( 'should merge indented list item with with parent list item as a block', () => {
						setData( model, modelList( [
							'* a',
							'  * []b'
						] ) );

						command.execute();

						expect( getData( model ) ).to.equalMarkup( modelList( [
							'* a',
							'  []b'
						] ) );
					} );

					it( 'should merge indented empty list item with with parent list item as a block', () => {
						setData( model, modelList( [
							'* a',
							'  * []'
						] ) );

						command.execute();

						expect( getData( model ) ).to.equalMarkup( modelList( [
							'* a',
							'  []'
						] ) );
					} );

					it( 'should merge list item with with previous list item with higher indent as a block', () => {
						setData( model, modelList( [
							'* a',
							'  * b',
							'* []c'
						] ) );

						command.execute();

						expect( getData( model ) ).to.equalMarkup( modelList( [
							'* a',
							'  * b',
							'    []c'
						] ) );
					} );

					it( 'should merge empty list item with with previous list item with higher indent as a block', () => {
						setData( model, modelList( [
							'* a',
							'  * b',
							'* []'
						] ) );

						command.execute();

						expect( getData( model ) ).to.equalMarkup( modelList( [
							'* a',
							'  * b',
							'    []'
						] ) );
					} );

					it( 'should keep merged list item\'s children', () => {
						setData( model, modelList( [
							'* a',
							'  * []b',
							'    * c',
							'    * d',
							'      e',
							'    * f',
							'      * g',
							'        h'
						] ) );

						command.execute();

						expect( getData( model ) ).to.equalMarkup( modelList( [
							'* a',
							'  []b',
							'  * c',
							'  * d',
							'    e',
							'  * f',
							'    * g',
							'      h'
						] ) );
					} );
				} );
			} );

			describe( 'non-collapsed selection starting in first block of a list item', () => {
				describe( 'first position in empty block', () => {
					it( 'should merge two empty list items', () => {
						setData( model, modelList( [
							'* [',
							'* ]'
						] ) );

						command.execute();

						expect( getData( model ) ).to.equalMarkup( modelList( [
							'* []'
						] ) );
					} );

					it( 'should merge non empty list item', () => {
						setData( model, modelList( [
							'* [',
							'* ]text'
						] ) );

						command.execute();

						expect( getData( model ) ).to.equalMarkup( modelList( [
							'* []text{id:001}'
						] ) );
					} );

					it( 'should merge non empty list item and delete text', () => {
						setData( model, modelList( [
							'* [',
							'* te]xt'
						] ) );

						command.execute();

						expect( getData( model ) ).to.equalMarkup( modelList( [
							'* []xt{id:001}'
						] ) );
					} );

					it( 'should merge and adjust indentation of child list item when end selection is at the beginning of item', () => {
						setData( model, modelList( [
							'* [{id:002}',
							'* a',
							'  * ]b'
						] ) );

						command.execute();

						expect( getData( model ) ).to.equalMarkup( modelList( [
							'* []{id:002}',
							'  b'
						] ) );
					} );

					it( 'should merge and adjust indentation of child list items', () => {
						setData( model, modelList( [
							'* [',
							'* a',
							'  * b]c',
							'    * d'
						] ) );

						command.execute();

						expect( getData( model ) ).to.equalMarkup( modelList( [
							'* []c{id:002}',
							'  * d{id:003}'
						] ) );
					} );

					it( 'should merge and adjust indentation of child list items when selection at the end of an item', () => {
						setData( model, modelList( [
							'* [',
							'* a',
							'  * bc]',
							'    * d'
						] ) );

						command.execute();

						expect( getData( model ) ).to.equalMarkup( modelList( [
							'* []{id:000}',
							'  * d{id:003}'
						] ) );
					} );

					// fix expected
					it( 'should delete all items till the end of selection and merge last list item', () => {
						setData( model, modelList( [
							'* [',
							'* a',
							'  * b',
							'* ]d'
						] ) );

						command.execute();

						expect( getData( model ) ).to.equalMarkup( modelList( [
							'* []d{id:003}'
						] ) );
					} );

					it( 'should delete all items and text till the end of selection and merge last list item', () => {
						setData( model, modelList( [
							'* [',
							'* a',
							'  * b',
							'* d]e'
						] ) );

						command.execute();

						expect( getData( model ) ).to.equalMarkup( modelList( [
							'* []e{id:003}'
						] ) );
					} );
				} );

				describe( 'non-empty block', () => {
					it( 'should merge two list items', () => {
						setData( model, modelList( [
							'* [text',
							'* ano]ther'
						] ) );

						command.execute();

						expect( getData( model ) ).to.equalMarkup( modelList( [
							'* []ther'
						] ) );
					} );

					// Not related to merge command
					it( 'should merge two list itemsx', () => {
						setData( model, modelList( [
							'* te[xt',
							'* ano]ther'
						] ) );

						command.execute();

						expect( getData( model ) ).to.equalMarkup( modelList( [
							'* te[]ther'
						] ) );
					} );

					it( 'should merge non empty list item', () => {
						setData( model, modelList( [
							'* [',
							'* ]text'
						] ) );

						command.execute();

						expect( getData( model ) ).to.equalMarkup( modelList( [
							'* []text{id:001}'
						] ) );
					} );

					it( 'should merge non empty list item and delete text', () => {
						setData( model, modelList( [
							'* [',
							'* te]xt'
						] ) );

						command.execute();

						expect( getData( model ) ).to.equalMarkup( modelList( [
							'* []xt{id:001}'
						] ) );
					} );

					it( 'should merge and adjust indentation of child list item when end selection is at the beginning of item', () => {
						setData( model, modelList( [
							'* [',
							'* a',
							'  * ]b',
							'    * c'
						] ) );

						command.execute();
						// output is okay, fix expect
						expect( getData( model ) ).to.equalMarkup( modelList( [
							'* []b{id:002}',
							'  * c{id:003}'
						] ) );
					} );

					it( 'should merge and adjust indentation of child list items', () => {
						setData( model, modelList( [
							'* [',
							'* a',
							'  * b]c',
							'    * d'
						] ) );

						command.execute();

						expect( getData( model ) ).to.equalMarkup( modelList( [
							'* []c{id:002}',
							'  * d{id:003}'
						] ) );
					} );

					it( 'should merge and adjust indentation of child list items when selection at the end of an item', () => {
						setData( model, modelList( [
							'* [',
							'* a',
							'  * bc]',
							'    * d'
						] ) );

						command.execute();

						expect( getData( model ) ).to.equalMarkup( modelList( [
							'* []{id:000}',
							'  * d{id:003}'
						] ) );
					} );

					it( 'should delete all items till the end of selection and merge last list item', () => {
						setData( model, modelList( [
							'* [',
							'* a',
							'  * b',
							'* ]d'
						] ) );

						command.execute();

						// output is okay, fix expect
						expect( getData( model ) ).to.equalMarkup( modelList( [
							'* []d{id:003}'
						] ) );
					} );

					it( 'should delete all items and text till the end of selection and merge last list item', () => {
						setData( model, modelList( [
							'* [',
							'* a',
							'  * b',
							'* d]e'
						] ) );

						command.execute();

						expect( getData( model ) ).to.equalMarkup( modelList( [
							'* []e{id:003}'
						] ) );
					} );
				} );
			} );

			describe( 'selection at the beginning of a block', () => {

			} );
		} );

		describe( 'forward delete', () => {

		} );
	} );
} );
