'use strict';

let dirtyFiles,
	ignoreList;

const dependencyRegExp = /^ckeditor5-/;
const TEMPLATE_PATH = './dev/tasks/templates';

module.exports = {
	/**
	 * Check if a task (including its optional target) is in the queue of tasks to be executed by Grunt.
	 *
	 * @param grunt {Object} The Grunt object.
	 * @param task {String} The task name. May optionally include the target (e.g. 'task:target').
	 * @returns {Boolean} "true" if the task is in the queue.
	 */
	checkTaskInQueue( grunt, task ) {
		const cliTasks = grunt.cli.tasks;

		// Check if the task has been called directly.
		const isDirectCall = ( cliTasks.indexOf( task ) > -1 );
		// Check if this is a "default" call and that the task is inside "default".
		const isDefaultTask = ( cliTasks.indexOf( 'default' ) > -1 ) || !cliTasks.length;
		// Hacking Grunt hard.
		const isTaskInDefault = isDefaultTask && ( grunt.task._tasks.default.info.indexOf( '"' + task + '"' ) > -1 );

		return isDirectCall || isTaskInDefault;
	},

	/**
	 * Configures a multi-task and defines targets that are queued to be run by Grunt.
	 *
	 * @param grunt {Object} The Grunt object.
	 * @param options {Object} A list of options for the method. See the jscs and jshint tasks for example.
	 */
	setupMultitaskConfig( grunt, options ) {
		const task = options.task;
		const taskConfig = {};
		const config = taskConfig[ task ] = {
			options: options.defaultOptions
		};

		// "all" is the default target to be used if others are not to be run.
		const all = options.targets.all;
		let isAll = true;

		delete options.targets.all;

		Object.getOwnPropertyNames( options.targets ).forEach( function( target ) {
			if ( this.checkTaskInQueue( grunt, task + ':' + target ) ) {
				config[ target ] = options.targets[ target ]();
				isAll = false;
			}
		}, this );

		if ( isAll ) {
			config.all = all();
		}

		// Append .gitignore entries to the ignore list.
		if ( options.addGitIgnore ) {
			let ignoreProp = task + '.options.' + options.addGitIgnore;
			let ignores = grunt.config.get( ignoreProp ) || [];

			ignores = ignores.concat( this.getGitIgnore( grunt ) );
			grunt.config.set( ignoreProp, ignores );
		}

		// Merge over configurations set in gruntfile.js.
		grunt.config.merge( taskConfig );
	},

	/**
	 * Gets the list of ignores from `.gitignore`.
	 *
	 * @param grunt {Object} The Grunt object.
	 * @returns {String[]} The list of ignores.
	 */
	getGitIgnore( grunt ) {
		if ( !ignoreList ) {
			ignoreList = grunt.file.read( '.gitignore' );

			ignoreList = ignoreList
				// Remove comment lines.
				.replace( /^#.*$/gm, '' )
				// Transform into array.
				.split( /\n+/ )
				// Remove empty entries.
				.filter( function( path ) {
					return !!path;
				} );
		}

		return ignoreList;
	},

	/**
	 * Gets the list of files that are supposed to be included in the next Git commit.
	 *
	 * @returns {String[]} A list of file paths.
	 */
	getGitDirtyFiles() {
		// Cache it, so it is executed only once when running multiple tasks.
		if ( !dirtyFiles ) {
			dirtyFiles = this
				// Compare the state of index with HEAD.
				.shExec( 'git diff-index --name-only HEAD' )
				// Remove trailing /n to avoid an empty entry.
				.replace( /\s*$/, '' )
				// Transform into array.
				.split( '\n' );

			// If nothing is returned, the array will one one empty string only.
			if ( dirtyFiles.length == 1 && !dirtyFiles[ 0 ] ) {
				dirtyFiles = [];
			}
		}

		return dirtyFiles;
	},

	/**
	 * Executes a shell command.
	 *
	 * @param command {String} The command to be executed.
	 * @returns {String} The command output.
	 */
	shExec( command ) {
		const sh = require( 'shelljs' );
		sh.config.silent = true;

		const ret = sh.exec( command );

		if ( ret.code ) {
			throw new Error(
				'Error while executing `' + command + '`:\n\n' +
				ret.output
			);
		}

		return ret.output;
	},

	/**
	 * Links directory located in source path to directory located in destination path.
	 * @param {String} source
	 * @param {String} destination
	 */
	linkDirectories( source, destination ) {
		const fs = require( 'fs' );
		// Remove destination directory if exists.
		if ( this.isDirectory( destination ) ) {
			this.shExec( `rm -rf ${ destination }` );
		}

		fs.symlinkSync( source, destination, 'dir' );
	},

	/**
	 * Returns dependencies that starts with ckeditor5-, and have valid, short GitHub url. Returns null if no
	 * dependencies are found.
	 *
	 * @param {Object} dependencies Dependencies object loaded from package.json file.
	 * @returns {Object|null}
	 */
	getCKEditorDependencies( dependencies ) {
		let result = null;

		if ( dependencies ) {
			Object.keys( dependencies ).forEach( function( key ) {
				if ( dependencyRegExp.test( key ) ) {
					if ( result === null ) {
						result = {};
					}

					result[ key ] = dependencies[ key ];
				}
			} );
		}

		return result;
	},

	/**
	 * Returns array with all directories under specified path.
	 *
	 * @param {String} path
	 * @returns {Array}
	 */
	getDirectories( path ) {
		const fs = require( 'fs' );
		const pth = require( 'path' );

		return fs.readdirSync( path ).filter( item => {
			return this.isDirectory( pth.join( path, item ) );
		} );
	},

	/**
	 * Returns true if path points to existing directory.
	 *
	 * @param {String} path
	 * @returns {Boolean}
	 */
	isDirectory( path ) {
		const fs = require( 'fs' );

		try {
			return fs.statSync( path ).isDirectory();
		} catch ( e ) {}

		return false;
	},

	/**
	 * Returns true if path points to existing file.
	 *
	 * @param {String} path
	 * @returns {Boolean}
	 */
	isFile( path ) {
		const fs = require( 'fs' );

		try {
			return fs.statSync( path ).isFile();
		} catch ( e ) {}

		return false;
	},

	/**
	 * Returns all directories under specified path that match 'ckeditor5' pattern.
	 *
	 * @param {String} path
	 * @returns {Array}
	 */
	getCKE5Directories( path ) {
		return this.getDirectories( path ).filter( dir => {
			return dependencyRegExp.test( dir );
		} );
	},

	/**
	 * Updates JSON file under specified path.
	 * @param {String} path Path to file on disk.
	 * @param {Function} updateFunction Function that will be called with parsed JSON object. It should return
	 * modified JSON object to save.
	 */
	updateJSONFile( path, updateFunction ) {
		const fs = require( 'fs' );

		const contents = fs.readFileSync( path, 'utf-8' );
		let json = JSON.parse( contents );
		json = updateFunction( json );

		fs.writeFileSync( path, JSON.stringify( json, null, 2 ), 'utf-8' );
	},

	/**
	 * Returns name of the NPM module located under provided path.
	 *
	 * @param {String} modulePath Path to NPM module.
     */
	readPackageName( modulePath ) {
		const fs = require( 'fs' );
		const path = require( 'path' );
		const packageJSONPath = path.join( modulePath, 'package.json' );

		if ( !this.isFile( packageJSONPath ) ) {
			return null;
		}

		const contents = fs.readFileSync( packageJSONPath, 'utf-8' );
		const json = JSON.parse( contents );

		return json.name || null;
	},

	/**
	 * Calls `npm install` command in specified path.
	 *
	 * @param {String} path
	 */
	npmInstall( path ) {
		this.shExec( `cd ${ path } && npm install` );
	},

	/**
	 * Calls `npm uninstall <name>` command in specified path.
	 *
	 * @param {String} path
	 */
	npmUninstall( path, name ) {
		this.shExec( `cd ${ path } && npm uninstall ${ name }` );
	},

	/**
	 * Calls `npm update` command in specified path.
	 *
	 * @param {String} path
	 */
	npmUpdate( path ) {
		this.shExec( `cd ${ path } && npm update` );
	},

	/**
	 * Installs Git hooks in specified repository.
	 *
	 * @param {String} path
	 */
	installGitHooks( path ) {
		this.shExec( `cd ${ path } && grunt githooks` );
	},

	/**
	 * Copies template files to specified destination.
	 *
	 * @param {String} destination
	 */
	copyTemplateFiles( destination ) {
		const path = require( 'path' );
		const templatesPath = path.resolve( TEMPLATE_PATH );
		this.shExec( `cp ${ path.join( templatesPath, '*.md' ) } ${ destination }` );
	},

	/**
	 * Executes 'npm view' command for provided module name and returns Git url if one is found. Returns null if
	 * module cannot be found.
	 *
	 * @param {String} name Name of the module.
	 * @returns {*}
     */
	getGitUrlFromNpm( name ) {
		try {
			const info = JSON.parse( this.shExec( `npm view ${ name } repository --json` ) );

			if ( info && info.type == 'git' ) {
				return info.url;
			}
		} catch ( error ) {
			// Throw error only when different than E404.
			if ( error.message.indexOf( 'npm ERR! code E404' ) == -1 ) {
				throw error;
			}
		}

		return null;
	}
};
