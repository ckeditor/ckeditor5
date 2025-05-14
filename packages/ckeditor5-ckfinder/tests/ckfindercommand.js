/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';
import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import ImageBlockEditing from '@ckeditor/ckeditor5-image/src/image/imageblockediting.js';
import { ImageUploadEditing } from '@ckeditor/ckeditor5-image';
import LinkEditing from '@ckeditor/ckeditor5-link/src/linkediting.js';
import Notification from '@ckeditor/ckeditor5-ui/src/notification/notification.js';
import ClipboardPipeline from '@ckeditor/ckeditor5-clipboard/src/clipboardpipeline.js';

import CKFinderCommand from '../src/ckfindercommand.js';
import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils.js';

describe( 'CKFinderCommand', () => {
	let editor, command, model;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		return VirtualTestEditor
			.create( {
				plugins: [ Paragraph, ImageBlockEditing, ImageUploadEditing, LinkEditing, Notification, ClipboardPipeline ]
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;

				command = new CKFinderCommand( editor );

				setModelData( model, '<paragraph>f[o]o</paragraph>' );
			} );
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	describe( 'isEnabled', () => {
		it( 'should be true when the selection directly in the root', () => {
			model.enqueueChange( { isUndoable: false }, () => {
				setModelData( model, '[]' );

				command.refresh();
				expect( command.isEnabled ).to.be.true;
			} );
		} );

		it( 'should be true when the selection is in empty block', () => {
			setModelData( model, '<paragraph>[]</paragraph>' );

			expect( command.isEnabled ).to.be.true;
		} );

		it( 'should be true where only image is allowed', () => {
			model.schema.register( 'block', {
				inheritAllFrom: '$block',
				allowChildren: [ 'paragraph', 'imageBlock' ]
			} );

			// Block link attribute.
			model.schema.addAttributeCheck( ( ctx, attributeName ) => ( attributeName !== 'linkHref' ) );

			editor.conversion.for( 'downcast' ).elementToElement( { model: 'block', view: 'block' } );

			setModelData( model, '<block><paragraph>[]</paragraph></block>' );

			expect( command.isEnabled ).to.be.true;
		} );

		it( 'should be true where only link is allowed', () => {
			model.schema.register( 'block', {
				inheritAllFrom: '$block',
				allowChildren: 'paragraph'
			} );

			// Block image in block.
			model.schema.addChildCheck( ( context, childDefinition ) => {
				if ( childDefinition.name === 'imageBlock' && context.last.name === 'block' ) {
					return false;
				}
			} );

			editor.conversion.for( 'downcast' ).elementToElement( { model: 'block', view: 'block' } );

			setModelData( model, '<block><paragraph>[]</paragraph></block>' );

			expect( command.isEnabled ).to.be.true;
		} );

		it( 'should be false where link & image are not allowed', () => {
			model.schema.register( 'block', {
				inheritAllFrom: '$block',
				allowChildren: 'paragraph'
			} );

			// Block link attribute - image is not allowed in 'block'.
			model.schema.addAttributeCheck( ( ctx, attributeName ) => ( attributeName !== 'linkHref' ) );

			editor.conversion.for( 'downcast' ).elementToElement( { model: 'block', view: 'block' } );

			setModelData( model, '<block><paragraph>[]</paragraph></block>' );

			expect( command.isEnabled ).to.be.false;
		} );

		it( 'should be true when insertImage or link command is enabled', () => {
			setModelData( model, '<paragraph>[]</paragraph>' );
			const insertImage = editor.commands.get( 'insertImage' );
			const linkCommand = editor.commands.get( 'link' );

			insertImage.isEnabled = false;
			linkCommand.isEnabled = false;

			command.refresh();
			expect( command.isEnabled ).to.be.false;

			linkCommand.isEnabled = false;
			insertImage.isEnabled = true;

			command.refresh();
			expect( command.isEnabled ).to.be.true;

			linkCommand.isEnabled = true;
			insertImage.isEnabled = false;

			command.refresh();
			expect( command.isEnabled ).to.be.true;
		} );
	} );

	describe( 'execute()', () => {
		const finderMock = {
			on: ( eventName, callback ) => {
				finderMock[ eventName ] = callback;
			}
		};

		beforeEach( () => {
			window.CKFinder = {
				modal: config => {
					config.onInit( finderMock );
				},
				popup: config => {
					config.onInit( finderMock );
				}
			};
		} );

		it( 'should register proper listeners on CKFinder instance', () => {
			command.execute();

			expect( finderMock ).to.have.property( 'files:choose' );
			expect( finderMock ).to.have.property( 'file:choose:resizedImage' );
		} );

		it( 'should use CKFinder.modal() as default CKFinder opener method', () => {
			const spy = sinon.spy( window.CKFinder, 'modal' );

			command.execute();

			sinon.assert.calledOnce( spy );
		} );

		it( 'should use CKFinder.popup() when ckfinder.openerMethod is set to it', () => {
			const spy = sinon.spy( window.CKFinder, 'popup' );

			editor.config.set( 'ckfinder.openerMethod', 'popup' );

			command.execute();

			sinon.assert.calledOnce( spy );
		} );

		it( 'should throw if unsupported CKFinder opener method was set', () => {
			editor.config.set( 'ckfinder.openerMethod', 'foobar' );

			expectToThrowCKEditorError( () => {
				command.execute();
			}, 'ckfinder-unknown-openermethod', editor );
		} );

		it( 'should insert single chosen image', () => {
			const url = 'foo/bar.jpg';

			command.execute();

			mockFilesChooseEvent( [ mockFinderFile( url ) ] );

			expect( getModelData( model ) )
				.to.equal( `[<imageBlock src="${ url }"></imageBlock>]<paragraph>foo</paragraph>` );
		} );

		it( 'should insert link if chosen file is not an image', () => {
			const url = 'foo/bar.pdf';

			command.execute();

			mockFilesChooseEvent( [ mockFinderFile( url, false ) ] );

			expect( getModelData( model ) )
				.to.equal( `<paragraph>f[<$text linkHref="${ url }">o</$text>]o</paragraph>` );
		} );

		it( 'should pass CKFinder configuration options', () => {
			const spy = sinon.spy( window.CKFinder, 'modal' );

			const connectorPath = 'foo/bar.php';
			editor.config.set( 'ckfinder.options', { connectorPath } );

			command.execute();

			const openerMethodOptions = spy.args[ 0 ][ 0 ];

			expect( openerMethodOptions ).to.have.property( 'chooseFiles', true );
			expect( openerMethodOptions ).to.have.property( 'onInit' );
			expect( openerMethodOptions ).to.have.property( 'connectorPath', connectorPath );
		} );

		it( 'should call user-defined config.onInit() function', () => {
			const spy = sinon.spy();

			editor.config.set( 'ckfinder.options.onInit', spy );

			command.execute();

			sinon.assert.calledOnce( spy );
		} );

		it( 'should pass CKFinder instance to a user-defined config.onInit() function', () => {
			const spy = sinon.spy();

			editor.config.set( 'ckfinder.options.onInit', spy );

			command.execute();

			sinon.assert.calledWithExactly( spy, finderMock );
		} );

		it( 'should pass editor default language to the CKFinder instance', () => {
			const spy = sinon.spy( window.CKFinder, 'modal' );
			command.execute();

			const openerMethodOptions = spy.args[ 0 ][ 0 ];

			expect( openerMethodOptions ).to.have.property( 'language', 'en' );
		} );

		it( 'should pass editor language set by configuration to the CKFinder instance', () => {
			const finderMock = {
				on: ( eventName, callback ) => {
					finderMock[ eventName ] = callback;
				}
			};

			return VirtualTestEditor
				.create( {
					plugins: [ Paragraph, ImageBlockEditing, ImageUploadEditing, LinkEditing, Notification, ClipboardPipeline ],
					language: 'pl'
				} )
				.then( newEditor => {
					editor = newEditor;

					window.CKFinder = {
						modal: config => {
							config.onInit( finderMock );
						}
					};

					command = new CKFinderCommand( editor );

					setModelData( editor.model, '<paragraph>f[o]o</paragraph>' );
					const spy = sinon.spy( window.CKFinder, 'modal' );

					command.execute();

					const openerMethodOptions = spy.args[ 0 ][ 0 ];

					expect( openerMethodOptions ).to.have.property( 'language', 'pl' );
				} );
		} );

		it( 'should not pass editor language if it is set in ckfinder.options', () => {
			const spy = sinon.spy( window.CKFinder, 'modal' );

			editor.config.set( 'ckfinder.options.language', 'pl' );

			command.execute();

			const openerMethodOptions = spy.args[ 0 ][ 0 ];

			expect( openerMethodOptions ).to.have.property( 'language', 'pl' );
		} );

		it( 'should insert multiple chosen images as image widget', () => {
			const url1 = 'foo/bar1.jpg';
			const url2 = 'foo/bar2.jpg';
			const url3 = 'foo/bar3.jpg';

			command.execute();

			mockFilesChooseEvent( [ mockFinderFile( url1 ), mockFinderFile( url2 ), mockFinderFile( url3 ) ] );

			expect( getModelData( model ) ).to.equal(
				`<imageBlock src="${ url1 }"></imageBlock>` +
				`<imageBlock src="${ url2 }"></imageBlock>[<imageBlock src="${ url3 }"></imageBlock>]<paragraph>foo</paragraph>`
			);
		} );

		it( 'should insert images and links to a files from chosen files', () => {
			const url1 = 'foo/bar1.jpg';
			const url2 = 'foo/bar2.pdf';
			const url3 = 'foo/bar3.jpg';

			command.execute();

			mockFilesChooseEvent( [ mockFinderFile( url1 ), mockFinderFile( url2, false ), mockFinderFile( url3 ) ] );

			expect( getModelData( model ) ).to.equal(
				`<imageBlock src="${ url1 }"></imageBlock>` +
				`[<imageBlock src="${ url3 }"></imageBlock>]` +
				`<paragraph>f<$text linkHref="${ url2 }">o</$text>o</paragraph>`
			);
		} );

		it( 'should use CKFinder Proxy for privately hosted files', () => {
			const proxyUrl = 'bar/foo.jpg';

			finderMock.request = () => proxyUrl;

			command.execute();

			mockFilesChooseEvent( [ mockFinderFile( false ) ] );

			expect( getModelData( model ) ).to.equal(
				`[<imageBlock src="${ proxyUrl }"></imageBlock>]<paragraph>foo</paragraph>`
			);
		} );

		it( 'should insert resized image as image widget', () => {
			const url = 'foo/bar.jpg';

			command.execute();

			mockFinderEvent( 'file:choose:resizedImage', { resizedUrl: url } );

			expect( getModelData( model ) )
				.to.equal( `[<imageBlock src="${ url }"></imageBlock>]<paragraph>foo</paragraph>` );
		} );

		it( 'should show warning notification if no resized image URL was returned', done => {
			const notification = editor.plugins.get( Notification );

			notification.on( 'show:warning', ( evt, data ) => {
				expect( data.message ).to.equal( 'Could not obtain resized image URL.' );
				expect( data.title ).to.equal( 'Selecting resized image failed' );
				evt.stop();

				done();
			}, { priority: 'high' } );

			command.execute();

			mockFinderEvent( 'file:choose:resizedImage', { resizedUrl: undefined } );

			expect( getModelData( model ) )
				.to.equal( '<paragraph>f[o]o</paragraph>' );
		} );

		it( 'should show warning notification if image cannot be inserted', done => {
			model.schema.register( 'block', {
				inheritAllFrom: '$block',
				allowChildren: 'paragraph'
			} );

			// Block image in block.
			model.schema.addChildCheck( ( context, childDefinition ) => {
				if ( childDefinition.name === 'imageBlock' && context.last.name === 'block' ) {
					return false;
				}
			} );

			editor.conversion.for( 'downcast' ).elementToElement( { model: 'block', view: 'block' } );

			setModelData( model, '<block><paragraph>[]</paragraph></block>' );

			const notification = editor.plugins.get( Notification );

			notification.on( 'show:warning', ( evt, data ) => {
				expect( data.message ).to.equal( 'Could not insert image at the current position.' );
				expect( data.title ).to.equal( 'Inserting image failed' );
				evt.stop();

				done();
			}, { priority: 'high' } );

			command.execute();

			mockFinderEvent( 'file:choose:resizedImage', { resizedUrl: 'foo/bar.jpg' } );

			expect( getModelData( model ) )
				.to.equal( '<paragraph>f[o]o</paragraph>' );
		} );

		it( 'should not insert image nor crash when image could not be inserted', () => {
			model.schema.register( 'other', {
				allowIn: '$root',
				allowChildren: '$text',
				isLimit: true
			} );

			editor.conversion.for( 'downcast' ).elementToElement( { model: 'other', view: 'p' } );

			setModelData( model, '<other>[]</other>' );

			command.execute();

			mockFilesChooseEvent( [ mockFinderFile( 'foo/bar.jpg' ) ] );

			expect( getModelData( model ) ).to.equal( '<other>[]</other>' );
		} );

		it( 'does not alter the original config', () => {
			editor.config.set( 'ckfinder', { options: { foo: 'bar' } } );

			command.execute();

			expect( editor.config.get( 'ckfinder.options' ) ).to.deep.equal( { foo: 'bar' } );
		} );

		function mockFinderFile( url = 'foo/bar.jpg', isImage = true ) {
			return {
				isImage: () => isImage,
				getUrl: () => url
			};
		}

		function mockFinderEvent( eventName, data ) {
			finderMock[ eventName ]( { data } );
		}

		function mockFilesChooseEvent( files ) {
			const data = {
				files: {
					toArray: () => files
				}
			};

			mockFinderEvent( 'files:choose', data );
		}
	} );

	describe( '_affectsData', () => {
		it( 'does not affect data', () => {
			expect( command._affectsData ).to.be.false;
		} );
	} );
} );
