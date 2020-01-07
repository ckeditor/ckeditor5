/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor';
import { setData, getData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

import IndentBlockCommand from '../src/indentblockcommand';
import IndentUsingClasses from '../src/indentcommandbehavior/indentusingclasses';
import IndentUsingOffset from '../src/indentcommandbehavior/indentusingoffset';

describe( 'IndentBlockCommand', () => {
	let editor, command, model;

	beforeEach( () => {
		return ModelTestEditor
			.create()
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;

				model.schema.register( 'parentBlock', {
					allowWhere: '$block',
					isLimit: true,
					isObject: true,
					isBlock: true
				} );

				model.schema.register( 'paragraph', {
					inheritAllFrom: '$block',
					allowAttributes: [ 'blockIndent' ],
					allowIn: 'parentBlock'
				} );

				model.schema.register( 'block', {
					inheritAllFrom: '$block'
				} );
			} );
	} );

	afterEach( () => {
		command.destroy();

		return editor.destroy();
	} );

	describe( 'common behavior', () => {
		let indentBehavior;

		beforeEach( () => {
			indentBehavior = {
				checkEnabled: sinon.stub().returns( true ),
				getNextIndent: sinon.stub()
			};

			command = new IndentBlockCommand( editor, indentBehavior );
		} );

		describe( 'refresh()', () => {
			it( 'should be disabled if a top-most block disallows indentBlock attribute', () => {
				setData( model, '[<parentBlock><paragraph>foo</paragraph></parentBlock>]' );
				command.refresh();
				expect( command.isEnabled ).to.be.false;
			} );
		} );

		describe( 'execute()', () => {
			it( 'should be executed for all selected blocks', () => {
				setData( model,
					'<paragraph>f[oo</paragraph>' +
					'<paragraph>foo</paragraph>' +
					'<paragraph>f]oo</paragraph>'
				);
				command.execute();
				sinon.assert.calledThrice( indentBehavior.getNextIndent );
			} );

			it( 'should be executed only for blocks that can have indentBlock attribute', () => {
				setData( model,
					'<paragraph>f[oo</paragraph>' +
					'<block>foo</block>' +
					'<paragraph>f]oo</paragraph>'
				);
				command.execute();
				sinon.assert.calledTwice( indentBehavior.getNextIndent );
			} );

			it( 'should be executed only for top-most blocks that can have indentBlock attribute', () => {
				setData( model,
					'<paragraph>f[oo</paragraph>' +
					'<parentBlock><paragraph>foo</paragraph><paragraph>foo</paragraph></parentBlock>' +
					'<paragraph>f]oo</paragraph>'
				);
				command.execute();
				sinon.assert.calledTwice( indentBehavior.getNextIndent );
			} );
		} );
	} );

	describe( 'indent', () => {
		describe( 'using classes', () => {
			beforeEach( () => {
				command = new IndentBlockCommand( editor, new IndentUsingClasses( {
					classes: [
						'indent-1',
						'indent-2',
						'indent-3',
						'indent-4'
					],
					direction: 'forward'
				} ) );
			} );

			describe( 'isEnabled', () => {
				it( 'should be false in block that does not support indent', () => {
					setData( model, '<block>f[]oo</block>' );
					expect( command.isEnabled ).to.be.false;
				} );

				it( 'should be true in non-indented block', () => {
					setData( model, '<paragraph>f[]oo</paragraph>' );
					expect( command.isEnabled ).to.be.true;
				} );

				it( 'should be true in indented block and there are still indentation classes', () => {
					setData( model, '<paragraph blockIndent="indent-2">f[]oo</paragraph>' );
					expect( command.isEnabled ).to.be.true;
				} );

				it( 'should be false in indented block in last indentation class', () => {
					setData( model, '<paragraph blockIndent="indent-4">f[]oo</paragraph>' );
					expect( command.isEnabled ).to.be.false;
				} );
			} );

			describe( 'execute()', () => {
				it( 'should set first indent class for non-indented block', () => {
					setData( model, '<paragraph>f[]oo</paragraph>' );
					command.execute();
					expect( getData( model ) ).to.equal( '<paragraph blockIndent="indent-1">f[]oo</paragraph>' );
				} );

				it( 'should set next indent class for indented block', () => {
					setData( model, '<paragraph blockIndent="indent-2">f[]oo</paragraph>' );
					command.execute();
					expect( getData( model ) ).to.equal( '<paragraph blockIndent="indent-3">f[]oo</paragraph>' );
				} );

				it( 'should be executed only for top-most blocks that can have indentBlock attribute', () => {
					setData( model,
						'<paragraph>f[oo</paragraph>' +
						'<parentBlock><paragraph>foo</paragraph><paragraph>foo</paragraph></parentBlock>' +
						'<paragraph>f]oo</paragraph>'
					);
					command.execute();
					expect( getData( model ) ).to.equal(
						'<paragraph blockIndent="indent-1">f[oo</paragraph>' +
						'<parentBlock><paragraph>foo</paragraph><paragraph>foo</paragraph></parentBlock>' +
						'<paragraph blockIndent="indent-1">f]oo</paragraph>'
					);
				} );
			} );
		} );

		describe( 'using offset', () => {
			beforeEach( () => {
				command = new IndentBlockCommand( editor, new IndentUsingOffset( {
					offset: 50,
					unit: 'px',
					direction: 'forward'
				} ) );
			} );

			describe( 'isEnabled', () => {
				it( 'should be false in block that does not support indent', () => {
					setData( model, '<block>f[]oo</block>' );
					expect( command.isEnabled ).to.be.false;
				} );

				it( 'should be true in non-indented block', () => {
					setData( model, '<paragraph>f[]oo</paragraph>' );
					expect( command.isEnabled ).to.be.true;
				} );

				it( 'should be true in indented block', () => {
					setData( model, '<paragraph blockIndent="50px">f[]oo</paragraph>' );
					expect( command.isEnabled ).to.be.true;
				} );

				it( 'should be true in indented block with different unit', () => {
					setData( model, '<paragraph blockIndent="2em">f[]oo</paragraph>' );
					expect( command.isEnabled ).to.be.true;
				} );
			} );

			describe( 'execute()', () => {
				it( 'should set first offset for non-indented block', () => {
					setData( model, '<paragraph>f[]oo</paragraph>' );
					command.execute();
					expect( getData( model ) ).to.equal( '<paragraph blockIndent="50px">f[]oo</paragraph>' );
				} );

				it( 'should calculate next offset for indented block', () => {
					setData( model, '<paragraph blockIndent="100px">f[]oo</paragraph>' );
					command.execute();
					expect( getData( model ) ).to.equal( '<paragraph blockIndent="150px">f[]oo</paragraph>' );
				} );

				it( 'should calculate next offset for indented block even if current indent is not tied to offset', () => {
					setData( model, '<paragraph blockIndent="27px">f[]oo</paragraph>' );
					command.execute();
					expect( getData( model ) ).to.equal( '<paragraph blockIndent="77px">f[]oo</paragraph>' );
				} );

				it( 'should set first offset if current indent has different unit', () => {
					setData( model, '<paragraph blockIndent="3mm">f[]oo</paragraph>' );
					command.execute();
					expect( getData( model ) ).to.equal( '<paragraph blockIndent="50px">f[]oo</paragraph>' );
				} );
			} );
		} );
	} );

	describe( 'outdent', () => {
		describe( 'using classes', () => {
			beforeEach( () => {
				command = new IndentBlockCommand( editor, new IndentUsingClasses( {
					classes: [
						'indent-1',
						'indent-2',
						'indent-3',
						'indent-4'
					],
					direction: 'backward'
				} ) );
			} );

			describe( 'isEnabled', () => {
				it( 'should be false in block that does not support indent', () => {
					setData( model, '<block>f[]oo</block>' );
					expect( command.isEnabled ).to.be.false;
				} );

				it( 'should be false in non-indented block', () => {
					setData( model, '<paragraph>f[]oo</paragraph>' );
					expect( command.isEnabled ).to.be.false;
				} );

				it( 'should be true in indented block onf first indentation class', () => {
					setData( model, '<paragraph blockIndent="indent-1">f[]oo</paragraph>' );
					expect( command.isEnabled ).to.be.true;
				} );

				it( 'should be true in indented block and there are still indentation classes', () => {
					setData( model, '<paragraph blockIndent="indent-2">f[]oo</paragraph>' );
					expect( command.isEnabled ).to.be.true;
				} );

				it( 'should be true in indented block in last indentation class', () => {
					setData( model, '<paragraph blockIndent="indent-4">f[]oo</paragraph>' );
					expect( command.isEnabled ).to.be.true;
				} );
			} );

			describe( 'execute()', () => {
				it( 'should set previous indent class for indented block', () => {
					setData( model, '<paragraph blockIndent="indent-2">f[]oo</paragraph>' );
					command.execute();
					expect( getData( model ) ).to.equal( '<paragraph blockIndent="indent-1">f[]oo</paragraph>' );
				} );
			} );
		} );

		describe( 'using offset', () => {
			beforeEach( () => {
				command = new IndentBlockCommand( editor, new IndentUsingOffset( {
					offset: 50,
					unit: 'px',
					direction: 'backward'
				} ) );
			} );

			describe( 'isEnabled', () => {
				it( 'should be false in block that does not support indent', () => {
					setData( model, '<block>f[]oo</block>' );
					expect( command.isEnabled ).to.be.false;
				} );

				it( 'should be false in non-indented block', () => {
					setData( model, '<paragraph>f[]oo</paragraph>' );
					expect( command.isEnabled ).to.be.false;
				} );

				it( 'should be true in indented block', () => {
					setData( model, '<paragraph blockIndent="50px">f[]oo</paragraph>' );
					expect( command.isEnabled ).to.be.true;
				} );

				it( 'should be true in indented block with different unit', () => {
					setData( model, '<paragraph blockIndent="2em">f[]oo</paragraph>' );
					expect( command.isEnabled ).to.be.true;
				} );
			} );

			describe( 'execute()', () => {
				it( 'should set remove offset if indent is on first offset', () => {
					setData( model, '<paragraph blockIndent="50px">f[]oo</paragraph>' );
					command.execute();
					expect( getData( model ) ).to.equal( '<paragraph>f[]oo</paragraph>' );
				} );

				it( 'should calculate next offset for indented block', () => {
					setData( model, '<paragraph blockIndent="100px">f[]oo</paragraph>' );
					command.execute();
					expect( getData( model ) ).to.equal( '<paragraph blockIndent="50px">f[]oo</paragraph>' );
				} );

				it( 'should calculate next offset for indented block even if current indent is not tied to offset', () => {
					setData( model, '<paragraph blockIndent="92px">f[]oo</paragraph>' );
					command.execute();
					expect( getData( model ) ).to.equal( '<paragraph blockIndent="42px">f[]oo</paragraph>' );
				} );

				it( 'should remove offset if current indent has different unit', () => {
					setData( model, '<paragraph blockIndent="3mm">f[]oo</paragraph>' );
					command.execute();
					expect( getData( model ) ).to.equal( '<paragraph>f[]oo</paragraph>' );
				} );
			} );
		} );
	} );
} );
