/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals window */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import PendingActions from '@ckeditor/ckeditor5-core/src/pendingactions';
import FileRepository from '../src/filerepository';

import Collection from '@ckeditor/ckeditor5-utils/src/collection';
import { createNativeFileMock, UploadAdapterMock, NativeFileReaderMock } from './_utils/mocks';
import log from '@ckeditor/ckeditor5-utils/src/log';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import FileReader from '../src/filereader';

describe( 'FileRepository', () => {
	let editor, fileRepository, adapterMock;

	testUtils.createSinonSandbox();

	class UploadAdapterPluginMock extends Plugin {
		init() {
			fileRepository = this.editor.plugins.get( 'FileRepository' );

			fileRepository.createUploadAdapter = loader => {
				adapterMock = new UploadAdapterMock( loader );

				return adapterMock;
			};
		}
	}

	beforeEach( () => {
		return VirtualTestEditor
			.create( {
				plugins: [ FileRepository, UploadAdapterPluginMock ]
			} )
			.then( newEditor => {
				editor = newEditor;
			} );
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	it( 'should be initialized', () => {
		expect( fileRepository ).to.be.instanceOf( FileRepository );
	} );

	describe( 'init()', () => {
		it( 'should create loaders collection', () => {
			expect( fileRepository.loaders ).to.be.instanceOf( Collection );
		} );

		it( 'should initialize uploaded observable', done => {
			expect( fileRepository.uploaded ).to.equal( 0 );

			fileRepository.on( 'change:uploaded', ( evt, name, value ) => {
				expect( value ).to.equal( 10 );
				done();
			} );

			fileRepository.uploaded = 10;
		} );

		it( 'should initialize uploadTotal', done => {
			expect( fileRepository.uploadTotal ).to.be.null;

			fileRepository.on( 'change:uploadTotal', ( evt, name, value ) => {
				expect( value ).to.equal( 10 );
				done();
			} );

			fileRepository.uploadTotal = 10;
		} );

		it( 'should initialize uploadedPercent', done => {
			expect( fileRepository.uploadedPercent ).to.equal( 0 );

			fileRepository.on( 'change:uploadedPercent', ( evt, name, value ) => {
				expect( value ).to.equal( 20 );
				done();
			} );

			fileRepository.uploadTotal = 200;
			fileRepository.uploaded = 40;
		} );
	} );

	describe( 'pending actions', () => {
		let pendingActions;

		beforeEach( () => {
			pendingActions = editor.plugins.get( PendingActions );
		} );

		it( 'should requires PendingActions plugin', () => {
			expect( editor.plugins.get( PendingActions ) ).to.instanceof( PendingActions );
		} );

		it( 'should add pending action when upload is in progress', () => {
			expect( pendingActions ).to.have.property( 'isPending', false );
			expect( Array.from( pendingActions ) ).to.length( 0 );

			fileRepository.createLoader( createNativeFileMock() );

			expect( pendingActions ).to.have.property( 'isPending', true );
			expect( Array.from( pendingActions, action => action.message ) ).to.have.members( [ 'Upload in progress 0%.' ] );
		} );

		it( 'should add only one pending action in a case of multiple load', () => {
			fileRepository.createLoader( createNativeFileMock() );
			fileRepository.createLoader( createNativeFileMock() );
			fileRepository.createLoader( createNativeFileMock() );

			expect( Array.from( pendingActions ) ).to.length( 1 );
		} );

		it( 'should remove pending action when all uploads are finished', () => {
			expect( pendingActions ).to.have.property( 'isPending', false );
			expect( Array.from( pendingActions ) ).to.length( 0 );

			const loader1 = fileRepository.createLoader( createNativeFileMock() );
			const loader2 = fileRepository.createLoader( createNativeFileMock() );

			expect( pendingActions ).to.have.property( 'isPending', true );
			expect( Array.from( pendingActions, action => action.message ) ).to.have.members( [ 'Upload in progress 0%.' ] );

			fileRepository.destroyLoader( loader1 );

			expect( pendingActions ).to.have.property( 'isPending', true );
			expect( Array.from( pendingActions, action => action.message ) ).to.have.members( [ 'Upload in progress 0%.' ] );

			fileRepository.destroyLoader( loader2 );

			expect( pendingActions ).to.have.property( 'isPending', false );
			expect( Array.from( pendingActions ) ).to.length( 0 );
		} );

		it( 'should bind pending action message to upload percentage value', () => {
			fileRepository.createLoader( createNativeFileMock() );

			fileRepository.uploadedPercent = 10.345;

			expect( Array.from( pendingActions )[ 0 ] ).to.have.property( 'message', 'Upload in progress 10%.' );

			fileRepository.uploadedPercent = 30.235;

			expect( Array.from( pendingActions )[ 0 ] ).to.have.property( 'message', 'Upload in progress 30%.' );
		} );

		it( 'should add pending action correctly when one upload is after another', () => {
			const loader1 = fileRepository.createLoader( createNativeFileMock() );

			expect( pendingActions.first ).to.have.property( 'message', 'Upload in progress 0%.' );

			fileRepository.destroyLoader( loader1 );

			expect( pendingActions.first ).to.null;

			fileRepository.createLoader( createNativeFileMock() );

			expect( pendingActions.first ).to.have.property( 'message', 'Upload in progress 0%.' );
		} );
	} );

	describe( 'createLoader()', () => {
		it( 'should return null if adapter is not present', () => {
			const stub = testUtils.sinon.stub( log, 'error' );

			fileRepository.createUploadAdapter = undefined;

			expect( fileRepository.createLoader( createNativeFileMock() ) ).to.be.null;

			sinon.assert.calledOnce( stub );
			sinon.assert.calledWithExactly(
				stub,
				'filerepository-no-upload-adapter: Upload adapter is not defined.'
			);
		} );

		it( 'should setup listeners to update progress observables', () => {
			const loader1 = fileRepository.createLoader( createNativeFileMock() );
			const loader2 = fileRepository.createLoader( createNativeFileMock() );
			const loader3 = fileRepository.createLoader( createNativeFileMock() );

			loader1.uploaded = 10;
			loader1.uploadTotal = 100;
			loader2.uploaded = 50;
			loader2.uploadTotal = 200;
			loader3.uploaded = 40;
			loader3.uploadTotal = 200;

			expect( fileRepository.uploaded ).to.equal( 100 );
			expect( fileRepository.uploadTotal ).to.equal( 500 );
			expect( fileRepository.uploadedPercent ).to.equal( 20 );
		} );
	} );

	describe( 'getLoader()', () => {
		it( 'should return null if loader does not exists', () => {
			const file1 = createNativeFileMock();
			const file2 = createNativeFileMock();
			fileRepository.createLoader( file2 );

			expect( fileRepository.getLoader( file1 ) ).to.be.null;
		} );

		it( 'should return loader by file instance', () => {
			const file = createNativeFileMock();
			const loader = fileRepository.createLoader( file );

			expect( fileRepository.getLoader( file ) ).to.equal( loader );
		} );
	} );

	describe( 'destroyLoader()', () => {
		let file, loader, destroySpy;

		beforeEach( () => {
			file = createNativeFileMock();
			loader = fileRepository.createLoader( file );
			destroySpy = testUtils.sinon.spy( loader, '_destroy' );
		} );

		it( 'should destroy provided loader', () => {
			fileRepository.destroyLoader( loader );

			sinon.assert.calledOnce( destroySpy );
			expect( fileRepository.getLoader( file ) ).to.be.null;
		} );

		it( 'should destroy loader by provided file', () => {
			fileRepository.destroyLoader( file );

			sinon.assert.calledOnce( destroySpy );
			expect( fileRepository.getLoader( file ) ).to.be.null;
		} );
	} );

	describe( 'Loader', () => {
		let loader, file, nativeReaderMock;

		beforeEach( () => {
			testUtils.sinon.stub( window, 'FileReader' ).callsFake( () => {
				nativeReaderMock = new NativeFileReaderMock();

				return nativeReaderMock;
			} );

			file = createNativeFileMock();
			loader = fileRepository.createLoader( file );
		} );

		describe( 'constructor()', () => {
			it( 'should initialize id', () => {
				expect( loader.id ).to.be.a( 'string' );
			} );

			it( 'should initialize file', () => {
				expect( loader.file ).to.equal( file );
			} );

			it( 'should initialize adapter', () => {
				expect( loader._adapter ).to.equal( adapterMock );
			} );

			it( 'should initialize reader', () => {
				expect( loader._reader ).to.be.instanceOf( FileReader );
			} );

			it( 'should initialize status observable', done => {
				expect( loader.status ).to.equal( 'idle' );

				loader.on( 'change:status', ( evt, name, value ) => {
					expect( value ).to.equal( 'uploading' );
					done();
				} );

				loader.status = 'uploading';
			} );

			it( 'should initialize uploaded observable', done => {
				expect( loader.uploaded ).to.equal( 0 );

				loader.on( 'change:uploaded', ( evt, name, value ) => {
					expect( value ).to.equal( 100 );
					done();
				} );

				loader.uploaded = 100;
			} );

			it( 'should initialize uploadTotal observable', done => {
				expect( loader.uploadTotal ).to.equal( null );

				loader.on( 'change:uploadTotal', ( evt, name, value ) => {
					expect( value ).to.equal( 100 );
					done();
				} );

				loader.uploadTotal = 100;
			} );

			it( 'should initialize uploadedPercent observable', done => {
				expect( loader.uploadedPercent ).to.equal( 0 );

				loader.on( 'change:uploadedPercent', ( evt, name, value ) => {
					expect( value ).to.equal( 23 );
					done();
				} );

				loader.uploaded = 23;
				loader.uploadTotal = 100;
			} );

			it( 'should initialize uploadResponse observable', done => {
				const response = {};

				expect( loader.uploadResponse ).to.equal( null );

				loader.on( 'change:uploadResponse', ( evt, name, value ) => {
					expect( value ).to.equal( response );
					done();
				} );

				loader.uploadResponse = response;
			} );
		} );

		describe( 'read()', () => {
			it( 'should throw error when status is defferent than idle', () => {
				loader.status = 'uploading';

				expect( () => {
					loader.read();
				} ).to.throw( 'filerepository-read-wrong-status: You cannot call read if the status is different than idle.' );
			} );

			it( 'should return a promise', () => {
				expect( loader.read() ).to.be.instanceof( Promise );
			} );

			it( 'should set status to "reading"', () => {
				loader.read();

				expect( loader.status ).to.equal( 'reading' );
			} );

			it( 'should reject promise when reading is aborted', () => {
				const promise = loader.read().catch( e => {
					expect( e ).to.equal( 'aborted' );
					expect( loader.status ).to.equal( 'aborted' );
				} );

				loader.abort();

				return promise;
			} );

			it( 'should reject promise on reading error', () => {
				const promise = loader.read().catch( e => {
					expect( e ).to.equal( 'reading error' );
					expect( loader.status ).to.equal( 'error' );
				} );

				nativeReaderMock.mockError( 'reading error' );

				return promise;
			} );

			it( 'should resolve promise on reading complete', () => {
				const promise = loader.read()
					.then( data => {
						expect( data ).to.equal( 'result data' );
						expect( loader.status ).to.equal( 'idle' );
					} );

				nativeReaderMock.mockSuccess( 'result data' );

				return promise;
			} );
		} );

		describe( 'upload()', () => {
			it( 'should throw error when status is defferent than idle', () => {
				loader.status = 'reading';

				expect( () => {
					loader.upload();
				} ).to.throw( 'filerepository-upload-wrong-status: You cannot call upload if the status is different than idle.' );
			} );

			it( 'should return a promise', () => {
				expect( loader.upload() ).to.be.instanceof( Promise );
			} );

			it( 'should set status to "uploading"', () => {
				loader.upload();

				expect( loader.status ).to.equal( 'uploading' );
			} );

			it( 'should reject promise when uploading is aborted', () => {
				const promise = loader.upload().catch( e => {
					expect( e ).to.equal( 'aborted' );
					expect( loader.status ).to.equal( 'aborted' );
				} );

				loader.abort();

				return promise;
			} );

			it( 'should reject promise on reading error', () => {
				const promise = loader.upload().catch( e => {
					expect( e ).to.equal( 'uploading error' );
					expect( loader.status ).to.equal( 'error' );
				} );

				adapterMock.mockError( 'uploading error' );

				return promise;
			} );

			it( 'should resolve promise on reading complete', () => {
				const promise = loader.upload()
					.then( data => {
						expect( data ).to.equal( 'result data' );
						expect( loader.status ).to.equal( 'idle' );
					} );

				adapterMock.mockSuccess( 'result data' );

				return promise;
			} );

			it( 'should monitor upload progress', () => {
				const promise = loader.upload()
					.then( data => {
						expect( data ).to.equal( 'result data' );
						expect( loader.status ).to.equal( 'idle' );
					} );

				expect( loader.uploaded ).to.equal( 0 );
				expect( loader.uploadTotal ).to.be.null;

				adapterMock.mockProgress( 1, 10 );
				expect( loader.uploaded ).to.equal( 1 );
				expect( loader.uploadTotal ).to.equal( 10 );

				adapterMock.mockProgress( 6, 10 );
				expect( loader.uploaded ).to.equal( 6 );
				expect( loader.uploadTotal ).to.equal( 10 );

				adapterMock.mockSuccess( 'result data' );

				return promise;
			} );
		} );
	} );
} );
