/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global describe, it, beforeEach, afterEach */

'use strict';

const chai = require( 'chai' );
const expect = chai.expect;
const sinon = require( 'sinon' );
const gulp = require( 'gulp' );
const gutil = require( 'gulp-util' );
const path = require( 'path' );
const stream = require( 'stream' );
const Vinyl = require( 'vinyl' );
const through = require( 'through2' );
const mainUtils = require( '../../tasks/utils' );

describe( 'build-utils', () => {
	const utils = require( '../../tasks/build/utils' );
	let sandbox;

	beforeEach( () => {
		sandbox = sinon.sandbox.create();
	} );

	afterEach( () => {
		sandbox.restore();
	} );

	it( 'should be extended by top level utils', () => {
		expect( utils.clean ).to.be.equal( mainUtils.clean );
	} );

	describe( 'noop', () => {
		it( 'should return PassTrough stream', () => {
			const PassThrough = stream.PassThrough;
			const ret = utils.noop();
			expect( ret instanceof PassThrough ).to.equal( true );
		} );

		it( 'should return a duplex stream when given a callback and call that callback', () => {
			const spy = sinon.spy();
			const ret = utils.noop( spy );

			ret.write( 'foo' );

			expect( spy.called ).to.equal( true );
			expect( ret.writable ).to.equal( true );
			expect( ret.readable ).to.equal( true );
		} );
	} );

	describe( 'destBuild', () => {
		it( 'should return stream created with gulp.dest', () => {
			const buildDir = 'build/';
			const format = 'amd';
			const destSpy = sandbox.spy( gulp, 'dest' );
			const stream = utils.destBuild( buildDir, format );

			sinon.assert.calledOnce( destSpy );
			sinon.assert.calledWithExactly( destSpy, path.join( buildDir, format ) );
			expect( stream ).to.equal( destSpy.firstCall.returnValue );
		} );
	} );

	describe( 'transpile', () => {
		it( 'should return babel transform stream', ( done ) => {
			const Stream = stream.Stream;
			const modulePath = '../files/utils/lib';
			const appendModuleExtensionSpy = sandbox.spy( utils, 'appendModuleExtension' );

			const babelStream = utils.transpile( 'amd', utils.getBabelOptionsForTests( 'amd' ) );

			expect( babelStream instanceof Stream ).to.equal( true );
			expect( babelStream.readable ).to.equal( true );
			expect( babelStream.writable ).to.equal( true );

			babelStream.on( 'finish', () => {
				sinon.assert.calledOnce( appendModuleExtensionSpy );
				expect( appendModuleExtensionSpy.args[ 0 ][ 0 ] ).to.equal( modulePath );

				done();
			} );

			babelStream.pipe(
				utils.noop( ( file ) => {
					expect( file.contents.toString() ).to.match( /define\(\'tests\'/ );
				} )
			);

			babelStream.write( new Vinyl( {
				cwd: '/',
				base: '/test/',
				path: '/test/file.js',
				contents: new Buffer( `import * as lib from '${ modulePath }';` )
			} ) );

			babelStream.end();
		} );

		it( 'should report error when transpiling fails', ( done ) => {
			const babelStream = utils.transpile( 'amd' );
			const utilLogStub = sandbox.stub( gutil, 'log' );
			const consoleLogStub = sandbox.stub( console, 'log' );

			babelStream.once( 'finish', () => {
				sinon.assert.calledTwice( utilLogStub );
				sinon.assert.calledOnce( consoleLogStub );
				done();
			} );

			babelStream.write( new Vinyl( {
				cwd: '/',
				base: '/test/',
				path: '/test/file.js',
				contents: new Buffer( 'class ;' )
			} ) );

			babelStream.end();
		} );
	} );

	describe( 'getBabelOptionsForSource', () => {
		it( 'should return plugins for amd format', () => {
			const plugins = [ 'foo' ];
			sandbox.stub( utils, 'getBabelPlugins', () => plugins );

			const options = utils.getBabelOptionsForSource( 'amd' );

			expect( options ).to.have.property( 'plugins', plugins );
			expect( options ).to.have.property( 'resolveModuleSource' );
			expect( options.resolveModuleSource ).to.equal( utils.appendModuleExtension );
		} );

		it( 'should return plugins for cjs format', () => {
			const plugins = [ 'foo' ];
			sandbox.stub( utils, 'getBabelPlugins', () => plugins );

			const options = utils.getBabelOptionsForSource( 'cjs' );

			expect( options ).to.have.property( 'plugins', plugins );
			expect( options ).to.have.property( 'resolveModuleSource' );
			expect( options.resolveModuleSource ).to.equal( utils.resolveModuleSource );
		} );
	} );

	describe( 'getBabelOptionsForTests', () => {
		it( 'should return plugins for amd format', () => {
			const plugins = [ 'foo' ];
			sandbox.stub( utils, 'getBabelPlugins', () => plugins );

			const options = utils.getBabelOptionsForTests( 'amd' );

			expect( options ).to.have.property( 'plugins', plugins );
			expect( options ).to.have.property( 'resolveModuleSource' );
			expect( options ).to.have.property( 'moduleIds', true );
			expect( options ).to.have.property( 'moduleId', 'tests' );
			expect( options.resolveModuleSource ).to.equal( utils.appendModuleExtension );
		} );

		it( 'should return plugins for cjs format', () => {
			const plugins = [ 'foo' ];
			sandbox.stub( utils, 'getBabelPlugins', () => plugins );

			const options = utils.getBabelOptionsForTests( 'cjs' );

			expect( options ).to.have.property( 'plugins', plugins );
			expect( options ).to.have.property( 'resolveModuleSource' );
			expect( options ).to.have.property( 'moduleIds', true );
			expect( options ).to.have.property( 'moduleId', 'tests' );
			expect( options.resolveModuleSource ).to.equal( utils.resolveModuleSource );
		} );
	} );

	describe( 'getBabelPlugins', () => {
		it( 'should return plugins for amd format', () => {
			expect( utils.getBabelPlugins( 'amd' ) ).to.be.an( 'array' );
		} );

		it( 'should return plugins for cjs format', () => {
			expect( utils.getBabelPlugins( 'cjs' ) ).to.be.an( 'array' );
		} );

		it( 'should throw an exception when incorrect format is provided', () => {
			const format = 'incorrect-format';

			expect( () => {
				utils.getBabelPlugins( format );
			} ).to.throw( Error, `Incorrect format: ${ format }` );
		} );
	} );

	describe( 'getBabelPlugins', () => {
		it( 'should return plugins for amd format', () => {
			expect( utils.getBabelPlugins( 'amd' ) ).to.be.an( 'array' );
		} );

		it( 'should throw an exception when incorrect format is provided', () => {
			const format = 'incorrect-format';

			expect( () => {
				utils.getBabelPlugins( format );
			} ).to.throw( Error, `Incorrect format: ${ format }` );
		} );
	} );

	describe( 'getConversionStreamGenerator', () => {
		beforeEach( () => {
			sandbox.stub( utils, 'getBabelOptionsForSource', () => 'src' );
			sandbox.stub( utils, 'getBabelOptionsForTests', () => 'tests' );

			// Stub to avoid writing to the fs.
			sandbox.stub( utils, 'destBuild', () => utils.noop() );

			// The transpile converted with append to file contents what was
			// passed to it as an options object and that's a result of getBabelOptions*,
			// which is stubbed above (will return 'src' or 'tests').
			sandbox.stub( utils, 'transpile', ( format, options ) => {
				return through( { objectMode: true }, ( file, encoding, callback ) => {
					file.contents = new Buffer( file.contents.toString() + ';' + format + ';' + options );

					callback( null, file );
				} );
			} );

			sandbox.stub( utils, 'appendBenderLauncher', () => {
				return through( { objectMode: true }, ( file, encoding, callback ) => {
					file.contents = new Buffer( file.contents.toString() + ';launcher' );

					callback( null, file );
				} );
			} );
		} );

		it( 'should return function that can be used for creating conversion streams', () => {
			const buildDir = 'build/';
			const formats = [ 'amd', 'cjs', 'esnext' ];
			const fn = utils.getConversionStreamGenerator( buildDir );
			const streams = formats.reduce( fn, [] );

			expect( streams.length ).to.equal( formats.length );
		} );

		describe( 'created conversion stream', () => {
			it( 'should process source JS file', ( done ) => {
				const buildDir = 'build/';
				const formats = [ 'amd' ];
				const fn = utils.getConversionStreamGenerator( buildDir );
				const streams = formats.reduce( fn, [] );

				expect( streams ).to.have.length( 1 );

				const stream = streams[ 0 ];

				stream.pipe(
					utils.noop( ( file ) => {
						expect( file.contents.toString() ).to.equal( 'foo();amd;src' );
						done();
					} )
				);

				stream.write( new Vinyl( {
					cwd: './',
					path: 'ckeditor5/core/file.js',
					contents: new Buffer( 'foo()' )
				} ) );
			} );
		} );

		describe( 'created conversion stream', () => {
			it( 'should process test file in amd format', ( done ) => {
				const buildDir = 'build/';
				const formats = [ 'amd' ];
				const fn = utils.getConversionStreamGenerator( buildDir );
				const streams = formats.reduce( fn, [] );

				expect( streams ).to.have.length( 1 );

				const stream = streams[ 0 ];

				stream.pipe(
					utils.noop( ( file ) => {
						expect( file.contents.toString() ).to.equal( 'foo();amd;tests;launcher' );
						done();
					} )
				);

				stream.write( new Vinyl( {
					cwd: './',
					path: 'tests/core/file.js',
					contents: new Buffer( 'foo()' )
				} ) );
			} );

			it( 'should process test file in cjs format', ( done ) => {
				const buildDir = 'build/';
				const formats = [ 'cjs' ];
				const fn = utils.getConversionStreamGenerator( buildDir );
				const streams = formats.reduce( fn, [] );

				expect( streams ).to.have.length( 1 );

				const stream = streams[ 0 ];

				stream.pipe(
					utils.noop( ( file ) => {
						expect( file.contents.toString() ).to.equal( 'foo();cjs;tests' );
						done();
					} )
				);

				stream.write( new Vinyl( {
					cwd: './',
					path: 'tests/core/file.js',
					contents: new Buffer( 'foo()' )
				} ) );
			} );
		} );
	} );

	describe( 'pickVersionedFile', () => {
		it( 'should rename file for provided format', ( done ) => {
			const rename = utils.pickVersionedFile( 'amd' );

			rename.pipe(
				utils.noop( ( data ) => {
					expect( data.basename ).to.equal( 'load.js' );
					done();
				} )
			);

			rename.write( new Vinyl( {
				cwd: '/',
				base: '/test/',
				path: '/test/load__amd.js',
				contents: new Buffer( '' )
			} ) );

			rename.end();
		} );

		it( 'should remove files in other formats', ( done ) => {
			const rename = utils.pickVersionedFile( 'amd' );
			const spy = sandbox.spy( ( data ) => {
				expect( data.basename ).to.equal( 'load.js' );
			} );

			rename.pipe(
				utils.noop( spy )
			);

			rename.on( 'end', () => {
				sinon.assert.calledOnce( spy );
				done();
			} );

			const amd = new Vinyl( {
				cwd: '/',
				base: '/test/',
				path: '/test/load__amd.js',
				contents: new Buffer( '' )
			} );

			const cjs = new Vinyl( {
				cwd: '/',
				base: '/test/',
				path: '/test/load__cjs.js',
				contents: new Buffer( '' )
			} );

			const esnext = new Vinyl( {
				cwd: '/',
				base: '/test/',
				path: '/test/load__esnext.js',
				contents: new Buffer( '' )
			} );

			rename.write( cjs );
			rename.write( amd );
			rename.write( esnext );
			rename.end();
		} );
	} );

	describe( 'renamePackageFiles', () => {
		it( 'should move source files to correct directories', ( done ) => {
			const rename = utils.renamePackageFiles();

			rename.pipe(
				utils.noop( ( data ) => {
					expect( data.path ).to.equal( path.normalize( 'ckeditor5/core/foo/file.js' ) );
					done();
				} )
			);

			rename.write( new Vinyl( {
				cwd: './',
				path: path.normalize( 'ckeditor5-core/src/foo/file.js' ),
				contents: new Buffer( '' )
			} ) );

			rename.end();
		} );

		it( 'should move test files to correct directories', ( done ) => {
			const rename = utils.renamePackageFiles();

			rename.pipe(
				utils.noop( ( data ) => {
					expect( data.path ).to.equal( path.normalize( 'tests/core/foo/file.js' ) );
					done();
				} )
			);

			rename.write( new Vinyl( {
				cwd: './',
				path: path.normalize( 'ckeditor5-core/tests/foo/file.js' ),
				contents: new Buffer( '' )
			} ) );

			rename.end();
		} );

		it( 'should throw error when wrong path provided 1', () => {
			const rename = utils.renamePackageFiles();

			expect( () => {
				rename.write( new Vinyl( {
					cwd: './',
					path: 'plugin/src/file.js',
					contents: new Buffer( '' )
				} ) );
			} ).to.throw( Error );
		} );

		it( 'should throw error when wrong path provided 2', () => {
			const rename = utils.renamePackageFiles();

			expect( () => {
				rename.write( new Vinyl( {
					cwd: './',
					path: 'ckeditor5-core/file.js',
					contents: new Buffer( '' )
				} ) );
			} ).to.throw( Error );
		} );
	} );

	describe( 'renameCKEditor5Files', () => {
		it( 'should move source files to correct directories', ( done ) => {
			const rename = utils.renameCKEditor5Files();

			rename.pipe(
				utils.noop( ( data ) => {
					expect( data.path ).to.equal( path.normalize( 'ckeditor5/foo/file.js' ) );
					done();
				} )
			);

			rename.write( new Vinyl( {
				cwd: './',
				path: path.normalize( 'src/foo/file.js' ),
				contents: new Buffer( '' )
			} ) );

			rename.end();
		} );

		it( 'should move test files to correct directories', ( done ) => {
			const rename = utils.renameCKEditor5Files();

			rename.pipe(
				utils.noop( ( data ) => {
					expect( data.path ).to.equal( path.normalize( 'tests/ckeditor5/foo/file.js' ) );
					done();
				} )
			);

			rename.write( new Vinyl( {
				cwd: './',
				path: path.normalize( 'tests/foo/file.js' ),
				contents: new Buffer( '' )
			} ) );

			rename.end();
		} );

		it( 'should throw error when wrong path provided 1', () => {
			const rename = utils.renameCKEditor5Files();

			expect( () => {
				rename.write( new Vinyl( {
					cwd: './',
					path: 'plugin/src/file.js',
					contents: new Buffer( '' )
				} ) );
			} ).to.throw( Error );
		} );
	} );

	describe( 'appendModuleExtension', () => {
		it( 'appends module extension when path provided', () => {
			const filePath = './path/to/file';
			const source = utils.appendModuleExtension( filePath );

			expect( source ).to.equal( filePath + '.js' );
		} );

		it( 'appends module extension when URL is provided', () => {
			const url = 'http://example.com/lib';
			const source = utils.appendModuleExtension( url );

			expect( source ).to.equal( url + '.js' );
		} );

		it( 'returns unchanged if module is provided', () => {
			const module = 'lib/module';
			const source = utils.appendModuleExtension( module );

			expect( source ).to.equal( module );
		} );
	} );

	describe( 'appendBenderLauncher', () => {
		it( 'appends the launcher code to a file', ( done ) => {
			const stream = utils.appendBenderLauncher();

			stream.pipe(
				utils.noop( ( data ) => {
					expect( data.contents.toString() ).equal( 'foo();' + utils.benderLauncherCode );
					done();
				} )
			);

			stream.write( new Vinyl( {
				cwd: './',
				path: 'tests/file.js',
				contents: new Buffer( 'foo();' )
			} ) );

			stream.end();
		} );

		// #62
		it( 'does nothing to a null file', ( done ) => {
			const stream = utils.appendBenderLauncher();

			stream.pipe(
				utils.noop( ( data ) => {
					expect( data.contents ).to.equal( null );
					done();
				} )
			);

			stream.write( new Vinyl( {
				cwd: './',
				path: 'tests/file.js',
				contents: null
			} ) );

			stream.end();
		} );
	} );

	describe( 'isTestFile', () => {
		function test( path, expected ) {
			it( `returns ${ expected} for ${ path }`, () => {
				const file = new Vinyl( {
					cwd: './',
					path: path,
					contents: new Buffer( '' )
				} );

				expect( utils.isTestFile( file ) ).to.equal( expected );
			} );
		}

		test( 'tests/file.js', true );
		test( 'tests/foo/file.js', true );
		test( 'tests/tests.js', true );
		test( 'tests/_utils-tests/foo.js', true );

		test( 'foo/file.js', false );
		test( 'foo/tests/file.js', false );
		test( 'tests/_foo/file.js', false );
	} );

	describe( 'getPackages', () => {
		it( 'returns collected paths to ckeditor5-* packages', ( done ) => {
			const fs = require( 'fs' );
			const readDirStub = sandbox.stub( fs, 'readdirSync', () => {
				return [
					'ckeditor5-core',
					'ckeditor5-theme-default'
				];
			} );
			const statStub = sandbox.stub( fs, 'lstatSync', () => {
				return {
					isDirectory() {
						return true;
					},
					isSymbolicLink() {
						return false;
					}
				};
			} );

			expect( utils.getPackages( '.' ) ).to.have.members( [
				'node_modules/ckeditor5-core',
				'node_modules/ckeditor5-theme-default'
			] );

			sinon.assert.calledOnce( readDirStub );
			sinon.assert.calledTwice( statStub );

			done();
		} );
	} );

	describe( 'filterThemeEntryPoints', () => {
		it( 'returns a stream containing theme entry points only', ( done ) => {
			const stream = require( 'stream' );
			const entryPoints = [];

			function fakeInputStream() {
				const files = [
					new Vinyl( {
						cwd: './',
						path: 'foo/bar/_helper.scss',
						contents: new Buffer( '' )
					} ),
					new Vinyl( {
						cwd: './',
						path: 'foo/bar/component.scss',
						contents: new Buffer( '' )
					} ),
					new Vinyl( {
						cwd: './',
						path: 'foo/bar/theme.scss',
						contents: new Buffer( '' )
					} ),
					new Vinyl( {
						cwd: './',
						path: 'foo/bar/_theme.scss',
						contents: new Buffer( '' )
					} )
				];

				const fake = new stream.Readable( { objectMode: true } );

				fake._read = () => {
					fake.push( files.pop() || null );
				};

				return fake;
			}

			fakeInputStream()
				.pipe( utils.filterThemeEntryPoints() )
				.pipe( through.obj( ( file, encoding, callback ) => {
					entryPoints.push( file.path );

					callback();
				}, () => {
					expect( entryPoints ).to.have.members( [ 'foo/bar/theme.scss' ] );

					done();
				} ) );
		} );
	} );

	describe( 'compileThemes', () => {
		it( 'returns a stream containing compiled CSS file', ( done ) => {
			const stream = require( 'stream' );
			let compiledThemePath;
			let compiledThemeCss;

			function fakeInputStream() {
				const files = [
					new Vinyl( {
						cwd: './',
						path: 'aaa/aaa/theme.scss',
						contents: new Buffer( '' )
					} ),
					new Vinyl( {
						cwd: './',
						path: 'zzz/ckeditor5-theme-quz/theme.scss',
						contents: new Buffer( '' )
					} ),
					new Vinyl( {
						cwd: './',
						path: 'C:\\win\\dows\\theme.scss',
						contents: new Buffer( '' )
					} )
				];

				const fake = new stream.Readable( { objectMode: true } );

				fake._read = () => {
					fake.push( files.pop() || null );
				};

				return fake;
			}

			sandbox.stub( utils, 'getSassOptions', dataToRender => {
				return {
					data: dataToRender,
					outputStyle: 'expanded',
					importer: url => {
						return { file: url, contents: `/*! ${ url } */` };
					}
				};
			} );

			fakeInputStream()
				.pipe( utils.compileThemes( 'abc.css' ) )
				.pipe( through.obj( ( file, encoding, callback ) => {
					compiledThemePath = file.path;
					compiledThemeCss = file.contents;

					callback();
				}, () => {
					expect( compiledThemePath ).to.be.equal( 'abc.css' );
					expect( compiledThemeCss.toString() ).to.be.equal(
// Note: Order matters. The first one should be ckeditor5-theme-* in order
// to provide necessary dependencies (mixins, vars) for the following files.
`/*! zzz/ckeditor5-theme-quz/theme.scss */
/*! aaa/aaa/theme.scss */
/*! C:\\win\\dows\\theme.scss */
` );

					done();
				} ) );
		} );
	} );

	describe( 'getSassOptions', () => {
		it( 'should return default options for SASS', () => {
			const options = utils.getSassOptions( 'foo' );

			expect( options ).to.have.property( 'data', 'foo' );
			expect( options ).to.have.property( 'sourceMap', true );
			expect( options ).to.have.property( 'sourceMapEmbed', true );
			expect( options ).to.have.property( 'outputStyle', 'expanded' );
			expect( options ).to.have.property( 'sourceComments', true );
		} );
	} );

	describe( 'parseArguments', () => {
		it( 'returns object with defaults', () => {
			const args = utils.parseArguments();

			expect( args.formats ).to.have.members( [ 'amd' ] );
			expect( args.watch ).to.be.equal( false );
		} );
	} );

	describe( 'getIconSpriteOptions', () => {
		it( 'returns object with defaults', () => {
			const options = utils.getIconSpriteOptions();

			expect( options ).to.have.all.keys( [ 'shape', 'svg', 'mode' ] );
		} );

		it( 'returns icon ids generator out of svg file names', () => {
			const options = utils.getIconSpriteOptions();

			expect( options.shape.id.generator( 'foo.svg' ) ).to.equal( 'ck-icon-foo' );
			expect( options.shape.id.generator( 'foo/bar/foo.svg' ) ).to.equal( 'ck-icon-foo' );
			expect( options.shape.id.generator( 'C:\\foo\\foo.svg' ) ).to.equal( 'ck-icon-foo' );
		} );

		it( 'returns configuration to output JavaScript sprite', () => {
			const options = utils.getIconSpriteOptions();

			expect( options.mode.symbol.render.js.dest ).to.equal( 'iconmanagermodel.js' );
		} );
	} );

	describe( 'getThemeFormatDestStreams', () => {
		it( 'returns array of streams for each format', () => {
			const streams = utils.getThemeFormatDestStreams( 'foo', [ 'a', 'b' ] );

			expect( streams ).to.be.an( 'array' );
			expect( streams ).to.have.length( 2 );
		} );
	} );

	describe( 'resolveModuleSource', () => {
		it( 'does not modify relative source paths', () => {
			const source = '../module';
			const resolved = utils.resolveModuleSource( source, '' );
			expect( resolved ).to.equal( source );
		} );

		it( 'resolves absolute source paths', () => {
			const source = '/ckeditor5/path/to/module.js';
			const file = path.join( process.cwd(), 'tests', 'module', 'module.js' );

			const resolved = utils.resolveModuleSource( source, file );
			expect( resolved ).to.equal( '../../ckeditor5/path/to/module.js' );
		} );
	} );
} );
