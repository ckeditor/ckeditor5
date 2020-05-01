/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor';
import DeleteCommand from '../src/deletecommand';
import Delete from '../src/delete';
import ChangeBuffer from '../src/utils/changebuffer';
import { getData, setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

describe( 'DeleteCommand', () => {
	let editor, model, doc;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		return ModelTestEditor.create()
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				doc = model.document;

				const command = new DeleteCommand( editor, 'backward' );
				editor.commands.add( 'delete', command );

				model.schema.register( 'paragraph', { inheritAllFrom: '$block' } );
				model.schema.register( 'heading1', { inheritAllFrom: '$block' } );
			} );
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	it( 'has direction', () => {
		const command = new DeleteCommand( editor, 'forward' );

		expect( command ).to.have.property( 'direction', 'forward' );
	} );

	describe( 'buffer', () => {
		it( 'has buffer getter', () => {
			expect( editor.commands.get( 'delete' ).buffer ).to.be.an.instanceof( ChangeBuffer );
		} );

		it( 'has a buffer limit configured to default value of 20', () => {
			expect( editor.commands.get( 'delete' ).buffer ).to.have.property( 'limit', 20 );
		} );

		it( 'has a buffer configured to config.typing.undoStep', () => {
			return VirtualTestEditor
				.create( {
					plugins: [ Delete ],
					typing: {
						undoStep: 5
					}
				} )
				.then( editor => {
					expect( editor.commands.get( 'delete' ).buffer ).to.have.property( 'limit', 5 );
				} );
		} );
	} );

	describe( 'execute()', () => {
		it( 'uses enqueueChange', () => {
			setData( model, '<paragraph>foo[]bar</paragraph>' );

			model.enqueueChange( () => {
				editor.execute( 'delete' );

				// We expect that command is executed in enqueue changes block. Since we are already in
				// an enqueued block, the command execution will be postponed. Hence, no changes.
				expect( getData( model ) ).to.equal( '<paragraph>foo[]bar</paragraph>' );
			} );

			// After all enqueued changes are done, the command execution is reflected.
			expect( getData( model ) ).to.equal( '<paragraph>fo[]bar</paragraph>' );
		} );

		it( 'locks buffer when executing', () => {
			setData( model, '<paragraph>foo[]bar</paragraph>' );

			const buffer = editor.commands.get( 'delete' )._buffer;
			const lockSpy = testUtils.sinon.spy( buffer, 'lock' );
			const unlockSpy = testUtils.sinon.spy( buffer, 'unlock' );

			editor.execute( 'delete' );

			expect( lockSpy.calledOnce ).to.be.true;
			expect( unlockSpy.calledOnce ).to.be.true;
		} );

		it( 'deletes previous character when selection is collapsed', () => {
			setData( model, '<paragraph>foo[]bar</paragraph>' );

			editor.execute( 'delete' );

			expect( getData( model ) ).to.equal( '<paragraph>fo[]bar</paragraph>' );
		} );

		it( 'deletes selection contents', () => {
			setData( model, '<paragraph>fo[ob]ar</paragraph>' );

			editor.execute( 'delete' );

			expect( getData( model ) ).to.equal( '<paragraph>fo[]ar</paragraph>' );
		} );

		it( 'deletes contents of selection passed in options', () => {
			setData( model, '<paragraph>fo[ob]ar</paragraph>' );

			const selection = model.createSelection( model.createRangeIn( model.document.getRoot() ) );

			editor.execute( 'delete', { selection } );

			expect( getData( model ) ).to.equal( '<paragraph>[]</paragraph>' );
		} );

		it( 'merges elements', () => {
			setData( model, '<paragraph>foo</paragraph><paragraph>[]bar</paragraph>' );

			editor.execute( 'delete' );

			expect( getData( model ) ).to.equal( '<paragraph>foo[]bar</paragraph>' );
		} );

		it( 'does not try to delete when selection is at the boundary', () => {
			const spy = sinon.spy();

			editor.model.on( 'deleteContent', spy );
			setData( model, '<paragraph>[]foo</paragraph>' );

			editor.execute( 'delete' );

			expect( getData( model ) ).to.equal( '<paragraph>[]foo</paragraph>' );
			expect( spy.callCount ).to.equal( 0 );
		} );

		it( 'passes options to modifySelection', () => {
			const spy = sinon.spy();

			editor.model.on( 'modifySelection', spy );
			setData( model, '<paragraph>foo[]bar</paragraph>' );

			editor.commands.get( 'delete' ).direction = 'forward';

			editor.execute( 'delete', { unit: 'word' } );

			expect( spy.callCount ).to.equal( 1 );

			const modifyOpts = spy.args[ 0 ][ 1 ][ 1 ];
			expect( modifyOpts ).to.have.property( 'direction', 'forward' );
			expect( modifyOpts ).to.have.property( 'unit', 'word' );
		} );

		it( 'passes options to deleteContent #1', () => {
			const spy = sinon.spy();

			editor.model.on( 'deleteContent', spy );
			setData( model, '<paragraph>foo[]bar</paragraph>' );

			editor.execute( 'delete' );

			expect( spy.callCount ).to.equal( 1 );

			const deleteOpts = spy.args[ 0 ][ 1 ][ 1 ];
			expect( deleteOpts ).to.have.property( 'doNotResetEntireContent', true );
		} );

		it( 'passes options to deleteContent #2', () => {
			const spy = sinon.spy();

			editor.model.on( 'deleteContent', spy );
			setData( model, '<paragraph>[foobar]</paragraph>' );

			editor.execute( 'delete' );

			expect( spy.callCount ).to.equal( 1 );

			const deleteOpts = spy.args[ 0 ][ 1 ][ 1 ];
			expect( deleteOpts ).to.have.property( 'doNotResetEntireContent', false );
		} );

		it( 'should pass the "direction" option to Model#deleteContent method', () => {
			const spy = sinon.spy();
			const forwardCommand = new DeleteCommand( editor, 'forward' );
			editor.commands.add( 'forwardDelete', forwardCommand );

			editor.model.on( 'deleteContent', spy );
			setData( model, '<paragraph>foo[]bar</paragraph>' );

			editor.execute( 'delete' );

			expect( spy.callCount ).to.equal( 1 );

			let deleteOpts = spy.args[ 0 ][ 1 ][ 1 ];
			expect( deleteOpts ).to.have.property( 'direction', 'backward' );

			editor.execute( 'forwardDelete' );

			expect( spy.callCount ).to.equal( 2 );

			deleteOpts = spy.args[ 1 ][ 1 ][ 1 ];
			expect( deleteOpts ).to.have.property( 'direction', 'forward' );
		} );

		it( 'leaves an empty paragraph after removing the whole content from editor', () => {
			setData( model, '<heading1>[Header 1</heading1><paragraph>Some text.]</paragraph>' );

			editor.execute( 'delete' );

			expect( getData( model ) ).to.equal( '<paragraph>[]</paragraph>' );
		} );

		it( 'leaves an empty paragraph after removing the whole content inside limit element', () => {
			model.schema.register( 'section', {
				inheritAllFrom: '$root',
				allowIn: '$root',
				isLimit: true
			} );

			setData( model,
				'<heading1>Foo</heading1>' +
					'<section>' +
						'<heading1>[Header 1</heading1>' +
						'<paragraph>Some text.]</paragraph>' +
					'</section>' +
				'<paragraph>Bar.</paragraph>'
			);

			editor.execute( 'delete' );

			expect( getData( model ) ).to.equal(
				'<heading1>Foo</heading1>' +
				'<section>' +
					'<paragraph>[]</paragraph>' +
				'</section>' +
				'<paragraph>Bar.</paragraph>'
			);
		} );

		it( 'leaves an empty paragraph after removing another paragraph from block element', () => {
			model.schema.register( 'section', {
				inheritAllFrom: '$block',
				isLimit: true
			} );
			model.schema.register( 'blockQuote', { inheritAllFrom: '$block' } );
			model.schema.extend( 'section', { allowIn: '$root' } );
			model.schema.extend( 'paragraph', { allowIn: 'section' } );
			model.schema.extend( 'blockQuote', { allowIn: 'section' } );
			model.schema.extend( 'paragraph', { allowIn: 'blockQuote' } );

			setData( model, '<section><blockQuote><paragraph>[]</paragraph></blockQuote></section>' );

			editor.execute( 'delete' );

			expect( getData( model ) ).to.equal( '<section><paragraph>[]</paragraph></section>' );
		} );

		it( 'leaves an empty paragraph after removing the whole content when root element was not added as Schema limit', () => {
			model.schema.extend( '$root', {
				isLimit: false
			} );

			expect( model.schema.isLimit( '$root' ) ).to.be.false;

			setData( model, '<heading1>[]</heading1>' );

			editor.execute( 'delete' );

			expect( getData( model ) ).to.equal( '<paragraph>[]</paragraph>' );
		} );

		it( 'replaces an empty element with paragraph', () => {
			setData( model, '<heading1>[]</heading1>' );

			editor.execute( 'delete' );

			expect( getData( model ) ).to.equal( '<paragraph>[]</paragraph>' );
		} );

		it( 'does not replace an element when Backspace or Delete key is held', () => {
			setData( model, '<heading1>Bar[]</heading1>' );

			for ( let sequence = 1; sequence < 10; ++sequence ) {
				editor.execute( 'delete', { sequence } );
			}

			expect( getData( model ) ).to.equal( '<heading1>[]</heading1>' );
		} );

		it( 'does not replace with paragraph in another paragraph already occurs in limit element', () => {
			setData( model, '<paragraph>[]</paragraph>' );

			const element = doc.getRoot().getNodeByPath( [ 0 ] );

			editor.execute( 'delete' );

			expect( element ).is.equal( doc.getRoot().getNodeByPath( [ 0 ] ) );
		} );

		it( 'does not replace an element if a paragraph is not allowed in current position', () => {
			model.schema.addChildCheck( ( ctx, childDef ) => {
				if ( ctx.endsWith( '$root' ) && childDef.name == 'paragraph' ) {
					return false;
				}
			} );

			setData( model, '<heading1>[]</heading1>' );

			editor.execute( 'delete' );

			expect( getData( model ) ).to.equal( '<heading1>[]</heading1>' );
		} );
	} );
} );
