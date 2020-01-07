/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import CodeBlockEditing from '../src/codeblockediting';
import OutdentCodeBlockCommand from '../src/outdentcodeblockcommand';

import AlignmentEditing from '@ckeditor/ckeditor5-alignment/src/alignmentediting';
import BoldEditing from '@ckeditor/ckeditor5-basic-styles/src/bold/boldediting';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import BlockQuoteEditing from '@ckeditor/ckeditor5-block-quote/src/blockquoteediting';

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor';
import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

describe( 'OutdentCodeBlockCommand', () => {
	let editor, model, outdentCommand;

	beforeEach( () => {
		return ModelTestEditor
			.create( {
				plugins: [ CodeBlockEditing, Paragraph, BlockQuoteEditing, AlignmentEditing, BoldEditing ]
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				outdentCommand = new OutdentCodeBlockCommand( editor, 'backward' );
			} );
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	describe( '#isEnabled', () => {
		it( 'should be true when the selection is in a line containing the indent sequence', () => {
			setModelData( model, '<codeBlock language="foo">f[]oo</codeBlock>' );

			// <codeBlock language="foo">	f[]oo</codeBlock>
			model.change( writer => {
				writer.insertText( '	', model.document.getRoot().getChild( 0 ) );
			} );

			expect( outdentCommand.isEnabled ).to.be.true;
		} );

		it( 'should be true when any line in the selection contains more than the indent sequence', () => {
			setModelData( model, '<codeBlock language="foo">f[oo</codeBlock><paragraph>ba]r</paragraph>' );

			// <codeBlock language="foo">	f[oo</codeBlock><paragraph>ba]r</paragraph>
			model.change( writer => {
				writer.insertText( '	', model.document.getRoot().getChild( 0 ) );
			} );

			expect( outdentCommand.isEnabled ).to.be.true;
		} );

		it( 'should be true when any line in the selection contains the indent sequence', () => {
			setModelData( model, '<codeBlock language="foo">f[oo</codeBlock><codeBlock language="foo">ba]r</codeBlock>' );

			// <codeBlock language="foo">f[oo</codeBlock><codeBlock language="foo">	ba]r</codeBlock>
			model.change( writer => {
				writer.insertText( '	', model.document.getRoot().getChild( 1 ) );
			} );

			expect( outdentCommand.isEnabled ).to.be.true;
		} );

		it( 'should be false when the indent sequence is in other element', () => {
			setModelData( model, '<paragraph>foo[]</paragraph>' );

			// <paragraph>	foo[]</paragraph>
			model.change( writer => {
				writer.insertText( '	', model.document.getRoot().getChild( 0 ) );
			} );

			expect( outdentCommand.isEnabled ).to.be.false;
		} );

		it( 'should be false when there is no indent sequence in the line (caret inside text)', () => {
			setModelData( model, '<codeBlock language="foo">f[]oo</codeBlock>' );

			expect( outdentCommand.isEnabled ).to.be.false;
		} );

		it( 'should be false when there is no indent sequence in the line (empty line)', () => {
			setModelData( model, '<codeBlock language="foo">[]</codeBlock>' );

			expect( outdentCommand.isEnabled ).to.be.false;
		} );

		it( 'should be false when there is no indent sequence in the line (caret at the end of a block)', () => {
			setModelData( model, '<codeBlock language="foo">foo[]</codeBlock>' );

			expect( outdentCommand.isEnabled ).to.be.false;
		} );

		it( 'should be false when there is no corrent sequence in the line', () => {
			setModelData( model, '<codeBlock language="foo">foo[]</codeBlock>' );

			// <codeBlock language="foo">    foo[]</codeBlock>
			model.change( writer => {
				writer.insertText( '    ', model.document.getRoot().getChild( 0 ) );
			} );

			expect( outdentCommand.isEnabled ).to.be.false;
		} );

		it( 'should be false when the sequence is not in leading characters of the line', () => {
			setModelData( model, '<codeBlock language="foo">barfoo[]</codeBlock>' );

			// <codeBlock language="foo">bar	foo[]</codeBlock>
			model.change( writer => {
				writer.insertText( '	', model.document.getRoot().getChild( 0 ), 3 );
			} );

			expect( outdentCommand.isEnabled ).to.be.false;
		} );

		it( 'should be false when the sequence is not in leading characters of the line (after other white-space characters)', () => {
			setModelData( model, '<codeBlock language="foo">foo[]</codeBlock>' );

			// <codeBlock language="foo">foo[]</codeBlock>
			model.change( writer => {
				writer.insertText( '    	    ', model.document.getRoot().getChild( 0 ), 0 );
			} );

			expect( outdentCommand.isEnabled ).to.be.false;
		} );

		describe( 'config.codeBlock.indentSequence', () => {
			it( 'should be respected (#1)', () => {
				return ModelTestEditor
					.create( {
						plugins: [ CodeBlockEditing, Paragraph, BlockQuoteEditing, AlignmentEditing, BoldEditing ],
						codeBlock: {
							indentSequence: '  '
						}
					} )
					.then( newEditor => {
						const editor = newEditor;
						const model = editor.model;
						const outdentCommand = new OutdentCodeBlockCommand( editor );

						setModelData( model, '<codeBlock language="foo">foo[]</codeBlock>' );

						// <codeBlock language="foo">    foo[]</codeBlock>
						model.change( writer => {
							writer.insertText( '    ', model.document.getRoot().getChild( 0 ) );
						} );

						expect( outdentCommand.isEnabled ).to.be.true;

						return editor.destroy();
					} );
			} );

			it( 'should be respected (#2)', () => {
				return ModelTestEditor
					.create( {
						plugins: [ CodeBlockEditing, Paragraph, BlockQuoteEditing, AlignmentEditing, BoldEditing ],
						codeBlock: {
							indentSequence: '  '
						}
					} )
					.then( newEditor => {
						const editor = newEditor;
						const model = editor.model;
						const outdentCommand = new OutdentCodeBlockCommand( editor );

						setModelData( model, '<codeBlock language="foo"> foo[]</codeBlock>' );

						// <codeBlock language="foo"> foo[]</codeBlock>
						model.change( writer => {
							writer.insertText( ' ', model.document.getRoot().getChild( 0 ) );
						} );

						expect( outdentCommand.isEnabled ).to.be.false;

						return editor.destroy();
					} );
			} );

			it( 'should disable the command when the config is not set', () => {
				return ModelTestEditor
					.create( {
						plugins: [ CodeBlockEditing, Paragraph, BlockQuoteEditing, AlignmentEditing, BoldEditing ],
						codeBlock: {
							indentSequence: false
						}
					} )
					.then( newEditor => {
						const editor = newEditor;
						const model = editor.model;
						const outdentCommand = new OutdentCodeBlockCommand( editor );

						setModelData( model, '<codeBlock language="foo">foo[]</codeBlock>' );

						// <codeBlock language="foo">	foo[]</codeBlock>
						model.change( writer => {
							writer.insertText( '	', model.document.getRoot().getChild( 0 ) );
						} );

						expect( outdentCommand.isEnabled ).to.be.false;

						return editor.destroy();
					} );
			} );
		} );
	} );

	describe( 'execute()', () => {
		it( 'should outdent a single line', () => {
			setModelData( model, '<codeBlock language="foo">f[]oo</codeBlock>' );

			// <codeBlock language="foo">	f[]oo</codeBlock>
			model.change( writer => {
				writer.insertText( '	', model.document.getRoot().getChild( 0 ) );
			} );

			outdentCommand.execute();

			expect( getModelData( model ) ).to.equal( '<codeBlock language="foo">f[]oo</codeBlock>' );
		} );

		it( 'should outdent only one level in a single line', () => {
			setModelData( model, '<codeBlock language="foo">f[]oo</codeBlock>' );

			// <codeBlock language="foo">		f[]oo</codeBlock>
			model.change( writer => {
				writer.insertText( '		', model.document.getRoot().getChild( 0 ) );
			} );

			outdentCommand.execute();

			expect( getModelData( model ) ).to.equal( '<codeBlock language="foo">	f[]oo</codeBlock>' );
		} );

		it( 'should outdent multiple lines', () => {
			setModelData( model, '<codeBlock language="foo">f[oo<softBreak></softBreak>ba]r</codeBlock>' );

			// <codeBlock language="foo">	f[oo<softBreak></softBreak>	ba]r</codeBlock>
			model.change( writer => {
				writer.insertText( '	', model.document.getRoot().getChild( 0 ), 4 );
				writer.insertText( '	', model.document.getRoot().getChild( 0 ), 0 );
			} );

			outdentCommand.execute();

			expect( getModelData( model ) ).to.equal( '<codeBlock language="foo">f[oo<softBreak></softBreak>ba]r</codeBlock>' );
		} );

		it( 'should outdent only one level across multiple lines', () => {
			setModelData( model, '<codeBlock language="foo">f[oo<softBreak></softBreak>ba]r</codeBlock>' );

			// <codeBlock language="foo">	f[oo<softBreak></softBreak>		ba]r</codeBlock>
			model.change( writer => {
				writer.insertText( '		', model.document.getRoot().getChild( 0 ), 4 );
				writer.insertText( '	', model.document.getRoot().getChild( 0 ), 0 );
			} );

			outdentCommand.execute();

			expect( getModelData( model ) ).to.equal( '<codeBlock language="foo">f[oo<softBreak></softBreak>	ba]r</codeBlock>' );
		} );

		it( 'should outdent some lines', () => {
			setModelData( model, '<codeBlock language="foo">f[oo<softBreak></softBreak>ba]r</codeBlock>' );

			// <codeBlock language="foo">f[oo<softBreak></softBreak>	ba]r</codeBlock>
			model.change( writer => {
				writer.insertText( '	', model.document.getRoot().getChild( 0 ), 4 );
			} );

			outdentCommand.execute();

			expect( getModelData( model ) ).to.equal( '<codeBlock language="foo">f[oo<softBreak></softBreak>ba]r</codeBlock>' );
		} );

		describe( 'config.codeBlock.indentSequence', () => {
			it( 'should be respected', () => {
				return ModelTestEditor
					.create( {
						plugins: [ CodeBlockEditing, Paragraph, BlockQuoteEditing, AlignmentEditing, BoldEditing ],
						codeBlock: {
							indentSequence: '  '
						}
					} )
					.then( newEditor => {
						const editor = newEditor;
						const model = editor.model;
						const outdentCommand = new OutdentCodeBlockCommand( editor );

						setModelData( model, '<codeBlock language="foo">f[]oo</codeBlock>' );

						// <codeBlock language="foo">  f[]oo</codeBlock>
						model.change( writer => {
							writer.insertText( '  ', model.document.getRoot().getChild( 0 ) );
						} );

						outdentCommand.execute();

						expect( getModelData( model ) ).to.equal( '<codeBlock language="foo">f[]oo</codeBlock>' );

						return editor.destroy();
					} );
			} );
		} );
	} );
} );
