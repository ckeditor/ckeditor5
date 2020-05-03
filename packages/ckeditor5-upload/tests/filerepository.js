/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals window, console */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import PendingActions from '@ckeditor/ckeditor5-core/src/pendingactions';
import FileRepository from '../src/filerepository';

import Collection from '@ckeditor/ckeditor5-utils/src/collection';
import { createNativeFileMock, UploadAdapterMock, NativeFileReaderMock } from './_utils/mocks';
import FileReader from '../src/filereader';

describe( 'FileRepository', () => {
	let editor, fileRepository, adapterMock;

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
		sinon.restore();

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
			expect( pendingActions ).to.have.property( 'hasAny', false );
			expect( Array.from( pendingActions ) ).to.length( 0 );

			fileRepository.createLoader( createNativeFileMock() );

			expect( pendingActions ).to.have.property( 'hasAny', true );
			expect( Array.from( pendingActions, action => action.message ) ).to.have.members( [ 'Upload in progress 0%.' ] );
		} );

		it( 'should add only one pending action in a case of multiple load', () => {
			fileRepository.createLoader( createNativeFileMock() );
			fileRepository.createLoader( createNativeFileMock() );
			fileRepository.createLoader( createNativeFileMock() );

			expect( Array.from( pendingActions ) ).to.length( 1 );
		} );

		it( 'should remove pending action when all uploads are finished', () => {
			expect( pendingActions ).to.have.property( 'hasAny', false );
			expect( Array.from( pendingActions ) ).to.length( 0 );

			const loader1 = fileRepository.createLoader( createNativeFileMock() );
			const loader2 = fileRepository.createLoader( createNativeFileMock() );

			expect( pendingActions ).to.have.property( 'hasAny', true );
			expect( Array.from( pendingActions, action => action.message ) ).to.have.members( [ 'Upload in progress 0%.' ] );

			fileRepository.destroyLoader( loader1 );

			expect( pendingActions ).to.have.property( 'hasAny', true );
			expect( Array.from( pendingActions, action => action.message ) ).to.have.members( [ 'Upload in progress 0%.' ] );

			fileRepository.destroyLoader( loader2 );

			expect( pendingActions ).to.have.property( 'hasAny', false );
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
			const consoleWarnStub = sinon.stub( console, 'warn' );

			fileRepository.createUploadAdapter = undefined;

			expect( fileRepository.createLoader( createNativeFileMock() ) ).to.be.null;

			sinon.assert.calledOnce( consoleWarnStub );
			sinon.assert.calledWithExactly(
				consoleWarnStub,
				sinon.match( 'filerepository-no-upload-adapter: Upload adapter is not defined.' )
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

		// This is a test for a super edge case when a file promise was rejected,
		// but no one called read() or upload() yet. In this case we want to be sure
		// that we did not swallow this file promise rejection somewhere in createLoader().
		it( 'does not swallow the file promise rejection', done => {
			let fileRejecter;
			const fileMock = createNativeFileMock();
			const filePromise = new Promise( ( resolve, reject ) => {
				fileRejecter = reject;
			} );

			const loader = fileRepository.createLoader( filePromise );
			loader.file.catch( () => {
				done();
			} );

			fileRejecter( fileMock );
		} );
	} );

	describe( 'getLoader()', () => {
		it( 'should return null if loader does not exists', () => {
			const file1 = createNativeFileMock();
			const file2 = createNativeFileMock();
			fileRepository.createLoader( file2 );

			expect( fileRepository.getLoader( file1 ) ).to.be.null;
		} );

		it( 'should return loader by file instance (initialized with file)', () => {
			const file = createNativeFileMock();
			const loader = fileRepository.createLoader( file );

			expect( fileRepository.getLoader( file ) ).to.equal( loader );
		} );

		it( 'should return loader by promise instance (initialized with promise)', () => {
			const promise = Promise.resolve( createNativeFileMock() );
			const loader = fileRepository.createLoader( promise );

			expect( fileRepository.getLoader( promise ) ).to.equal( loader );
		} );

		it( 'should return loader by file instance (initialized with promise)', done => {
			const promise = Promise.resolve( createNativeFileMock() );
			const loader = fileRepository.createLoader( promise );

			loader.file.then( fileInstance => {
				expect( fileRepository.getLoader( fileInstance ) ).to.equal( loader );
				done();
			} );
		} );
	} );

	describe( 'destroyLoader()', () => {
		let file, loader, destroySpy;

		beforeEach( () => {
			file = createNativeFileMock();
			loader = fileRepository.createLoader( file );
			destroySpy = sinon.spy( loader, '_destroy' );
		} );

		it( 'should destroy provided loader', () => {
			fileRepository.destroyLoader( loader );

			sinon.assert.calledOnce( destroySpy );
			expect( fileRepository.getLoader( file ) ).to.be.null;
			expect( fileRepository.loaders.length ).to.equal( 0 );
			expect( Array.from( fileRepository._loadersMap.keys ).length ).to.equal( 0 );
		} );

		it( 'should destroy loader by provided file (initialized with file)', () => {
			fileRepository.destroyLoader( file );

			sinon.assert.calledOnce( destroySpy );
			expect( fileRepository.getLoader( file ) ).to.be.null;
			expect( fileRepository.loaders.length ).to.equal( 0 );
			expect( Array.from( fileRepository._loadersMap.keys ).length ).to.equal( 0 );
		} );

		it( 'should destroy loader by provided promise (initialized with promise)', () => {
			fileRepository.destroyLoader( loader );

			const promise = new Promise( resolve => resolve( createNativeFileMock() ) );
			const newLoader = fileRepository.createLoader( promise );

			destroySpy = sinon.spy( newLoader, '_destroy' );

			fileRepository.destroyLoader( promise );

			sinon.assert.calledOnce( destroySpy );
			expect( fileRepository.getLoader( promise ) ).to.be.null;
			expect( fileRepository.loaders.length ).to.equal( 0 );
			expect( Array.from( fileRepository._loadersMap.keys() ).length ).to.equal( 0 );
		} );

		it( 'should destroy loader by provided file (initialized with promise)', () => {
			fileRepository.destroyLoader( loader );

			const promise = Promise.resolve( createNativeFileMock() );
			const newLoader = fileRepository.createLoader( promise );

			destroySpy = sinon.spy( newLoader, '_destroy' );

			return newLoader.file.then( fileInstance => {
				expect( fileRepository.loaders.length ).to.equal( 1 );
				expect( Array.from( fileRepository._loadersMap.keys() ).length ).to.equal( 2 );

				fileRepository.destroyLoader( fileInstance );

				sinon.assert.calledOnce( destroySpy );

				expect( fileRepository.getLoader( fileInstance ) ).to.be.null;
				expect( fileRepository.loaders.length ).to.equal( 0 );
				expect( Array.from( fileRepository._loadersMap.keys() ).length ).to.equal( 0 );
			} );
		} );
	} );

	describe( 'Loader', () => {
		let loader, file, nativeReaderMock;

		beforeEach( () => {
			sinon.stub( window, 'FileReader' ).callsFake( () => {
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

			it( 'should initialize filePromiseWrapper', () => {
				expect( loader._filePromiseWrapper ).to.not.be.null;
				expect( loader._filePromiseWrapper.promise ).to.be.instanceOf( Promise );
				expect( loader._filePromiseWrapper.rejecter ).to.be.instanceOf( Function );
				expect( loader._filePromiseWrapper.isFulfilled ).to.be.false;
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

		describe( 'file getter', () => {
			it( 'should return promise', () => {
				expect( loader.file ).to.instanceof( Promise );
			} );

			it( 'should return promise which resolves to a file', () => {
				return loader.file.then( fileInstance => {
					expect( fileInstance ).to.equal( file );
				} );
			} );

			it( 'should return promise which resolves to null after loader is destroyed (destroy before)', () => {
				loader._destroy();

				return loader.file.then( fileInstance => {
					expect( fileInstance ).to.be.null;
				} );
			} );

			it( 'should return promise which resolves to null after loader is destroyed (destroy after)', () => {
				const promise = loader.file.then( fileInstance => {
					expect( fileInstance ).to.be.null;
				} );

				loader._destroy();

				return promise;
			} );

			it( 'should return promise which resolves to null after loader is destroyed (file promise resolved, destroy after)', () => {
				return loader._filePromiseWrapper.promise.then( () => {
					loader.file.then( fileInstance => {
						expect( fileInstance ).to.be.null;
					} );

					loader._destroy();
				} );
			} );
		} );

		describe( 'data getter', () => {
			it( 'should be undefined if no file loaded', () => {
				expect( loader.data ).to.be.undefined;
			} );

			it( 'should return promise which resolves to a file', () => {
				let resolveFile = null;

				const filePromise = new Promise( resolve => {
					resolveFile = resolve;
				} );

				const loader = fileRepository.createLoader( filePromise );

				const promise = loader.read()
					.then( () => {
						expect( loader.data ).to.equal( 'result data' );
					} );

				resolveFile( createNativeFileMock() );

				loader.file.then( () => nativeReaderMock.mockSuccess( 'result data' ) );

				return promise;
			} );
		} );

		describe( 'read()', () => {
			it( 'should throw error when status is different than idle', () => {
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

			it( 'should resolve promise when file promise is resolved', () => {
				let resolveFile = null;

				const filePromise = new Promise( resolve => {
					resolveFile = resolve;
				} );

				const loader = fileRepository.createLoader( filePromise );

				const promise = loader.read()
					.then( data => {
						expect( data ).to.equal( 'result data' );
						expect( loader.status ).to.equal( 'idle' );
					} );

				resolveFile( createNativeFileMock() );

				loader.file.then( () => nativeReaderMock.mockSuccess( 'result data' ) );

				return promise;
			} );

			it( 'should reject promise when file promise is rejected', () => {
				let rejectFile = null;

				const filePromise = new Promise( ( resolve, reject ) => {
					rejectFile = reject;
				} );

				const loader = fileRepository.createLoader( filePromise );

				const promise = loader.read().catch( e => {
					expect( e ).to.equal( 'File loading error' );
					expect( loader.status ).to.equal( 'error' );
				} );

				rejectFile( 'File loading error' );

				return promise;
			} );

			it( 'should reject promise when reading is aborted (before file promise is resolved)', () => {
				const promise = loader.read().catch( e => {
					expect( e ).to.equal( 'aborted' );
					expect( loader.status ).to.equal( 'aborted' );
				} );

				loader.abort();

				return promise;
			} );

			it( 'should reject promise when reading is aborted (after file promise is resolved)', () => {
				const promise = loader.read().catch( e => {
					expect( e ).to.equal( 'aborted' );
					expect( loader.status ).to.equal( 'aborted' );
				} );

				loader.file.then( () => loader.abort() );

				return promise;
			} );

			it( 'should reject promise on reading error (after file promise is resolved)', () => {
				const promise = loader.read().catch( e => {
					expect( e ).to.equal( 'reading error' );
					expect( loader.status ).to.equal( 'error' );
				} );

				loader.file.then( () => nativeReaderMock.mockError( 'reading error' ) );

				return promise;
			} );

			it( 'should resolve promise on reading complete (after file promise is resolved)', () => {
				const promise = loader.read()
					.then( data => {
						expect( data ).to.equal( 'result data' );
						expect( loader.status ).to.equal( 'idle' );
					} );

				loader.file.then( () => nativeReaderMock.mockSuccess( 'result data' ) );

				return promise;
			} );

			it( 'should abort upload if image is removed during the upload process', () => {
				const file = createNativeFileMock();
				const loader = fileRepository.createLoader( file );

				sinon.stub( loader._reader, 'read' ).callsFake( () => {
					expect( loader.status ).to.equal( 'reading' );

					// Reader is being aborted after file was read.
					// It can happen if an element (and its file that is being uploaded) will be removed during the upload process.
					loader.status = 'aborted';
				} );

				return loader.read()
					.then(
						() => {
							throw new Error( 'Supposed to be rejected.' );
						},
						status => {
							expect( status ).to.equal( 'aborted' );
							expect( loader.status ).to.equal( 'aborted' );
						}
					);
			} );
		} );

		describe( 'upload()', () => {
			it( 'should throw error when status is different than idle', () => {
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

			it( 'should resolve promise when file promise is resolved', () => {
				let resolveFile = null;

				const filePromise = new Promise( resolve => {
					resolveFile = resolve;
				} );

				const loader = fileRepository.createLoader( filePromise );

				const promise = loader.upload()
					.then( data => {
						expect( data ).to.equal( 'result data' );
						expect( loader.status ).to.equal( 'idle' );
					} );

				resolveFile( createNativeFileMock() );

				loader.file.then( () => adapterMock.mockSuccess( 'result data' ) );

				return promise;
			} );

			it( 'should reject promise when file promise is rejected', () => {
				let rejectFile = null;

				const filePromise = new Promise( ( resolve, reject ) => {
					rejectFile = reject;
				} );

				const loader = fileRepository.createLoader( filePromise );

				const promise = loader.upload().catch( e => {
					expect( e ).to.equal( 'File loading error' );
					expect( loader.status ).to.equal( 'error' );
				} );

				rejectFile( 'File loading error' );

				return promise;
			} );

			it( 'should reject promise when uploading is aborted (before file promise is resolved)', () => {
				const promise = loader.upload().catch( e => {
					expect( e ).to.equal( 'aborted' );
					expect( loader.status ).to.equal( 'aborted' );
				} );

				loader.abort();

				return promise;
			} );

			it( 'should reject promise when uploading is aborted (after file promise is resolved)', () => {
				const promise = loader.upload().catch( e => {
					expect( e ).to.equal( 'aborted' );
					expect( loader.status ).to.equal( 'aborted' );
				} );

				loader.file.then( () => loader.abort() );

				return promise;
			} );

			it( 'should reject promise on reading error (after file promise is resolved)', () => {
				const promise = loader.upload().catch( e => {
					expect( e ).to.equal( 'uploading error' );
					expect( loader.status ).to.equal( 'error' );
				} );

				loader.file.then( () => adapterMock.mockError( 'uploading error' ) );

				return promise;
			} );

			it( 'should resolve promise on reading complete (after file promise is resolved)', () => {
				const promise = loader.upload()
					.then( data => {
						expect( data ).to.equal( 'result data' );
						expect( loader.status ).to.equal( 'idle' );
					} );

				loader.file.then( () => adapterMock.mockSuccess( 'result data' ) );

				return promise;
			} );

			it( 'should monitor upload progress', () => {
				const promise = loader.upload()
					.then( data => {
						expect( data ).to.equal( 'result data' );
						expect( loader.status ).to.equal( 'idle' );
					} );

				loader.file.then( () => {
					expect( loader.uploaded ).to.equal( 0 );
					expect( loader.uploadTotal ).to.be.null;

					adapterMock.mockProgress( 1, 10 );
					expect( loader.uploaded ).to.equal( 1 );
					expect( loader.uploadTotal ).to.equal( 10 );

					adapterMock.mockProgress( 6, 10 );
					expect( loader.uploaded ).to.equal( 6 );
					expect( loader.uploadTotal ).to.equal( 10 );

					adapterMock.mockSuccess( 'result data' );
				} );

				return promise;
			} );
		} );

		describe( 'abort()', () => {
			let filePromiseRejecterSpy, readerAbortSpy, adapterAbortSpy;

			beforeEach( () => {
				filePromiseRejecterSpy = sinon.spy( loader._filePromiseWrapper, 'rejecter' );
				readerAbortSpy = sinon.spy( loader._reader, 'abort' );
				adapterAbortSpy = sinon.spy( loader._adapter, 'abort' );
			} );

			it( 'should abort correctly before read/upload is called', () => {
				loader.abort();

				expect( filePromiseRejecterSpy.callCount ).to.equal( 1 );
				expect( readerAbortSpy.callCount ).to.equal( 0 );
				expect( adapterAbortSpy.callCount ).to.equal( 0 );
			} );

			it( 'should abort correctly after successful read', () => {
				const promise = loader.read()
					.then( data => {
						expect( data ).to.equal( 'result data' );
						expect( loader.status ).to.equal( 'idle' );

						loader.abort();

						expect( filePromiseRejecterSpy.callCount ).to.equal( 0 );
						expect( readerAbortSpy.callCount ).to.equal( 0 );
						expect( adapterAbortSpy.callCount ).to.equal( 0 );
					} );

				loader.file.then( () => nativeReaderMock.mockSuccess( 'result data' ) );

				return promise;
			} );

			it( 'should abort correctly after successful upload', () => {
				const promise = loader.upload()
					.then( data => {
						expect( data ).to.equal( 'result data' );
						expect( loader.status ).to.equal( 'idle' );

						loader.abort();

						expect( filePromiseRejecterSpy.callCount ).to.equal( 0 );
						expect( readerAbortSpy.callCount ).to.equal( 0 );
						expect( adapterAbortSpy.callCount ).to.equal( 0 );
					} );

				loader.file.then( () => adapterMock.mockSuccess( 'result data' ) );

				return promise;
			} );
		} );
	} );
} );
