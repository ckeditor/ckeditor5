/* jshint browser: false, node: true, strict: true */

'use strict';

const gulp = require( 'gulp' );

const config = {
	ROOT_DIR: '.',
	BUILD_DIR: 'build',
	BUNDLE_DIR: 'bundle',
	WORKSPACE_DIR: '..',

	// Files ignored by jshint and jscs tasks. Files from .gitignore will be added automatically during tasks execution.
	IGNORED_FILES: [
		'src/lib/**'
	]
};

require( './dev/tasks/build/tasks' )( config ).register();
require( './dev/tasks/bundle/tasks' )( config ).register();
require( './dev/tasks/test/tasks' )( config ).register();
require( './dev/tasks/docs/tasks' )( config ).register();

// Lint tasks.
const ckeditor5Lint = require( 'ckeditor5-dev-lint' )( config );
gulp.task( 'lint', ckeditor5Lint.lint );
gulp.task( 'lint-staged', ckeditor5Lint.lintStaged );
gulp.task( 'default', [ 'build' ] );
gulp.task( 'pre-commit', [ 'lint-staged' ] );

// Development environment tasks.
const ckeditor5DevEnv = require( 'ckeditor5-dev-env' )( config.WORKSPACE_DIR );
gulp.task( 'init', ckeditor5DevEnv.initRepository );
gulp.task( 'create-package', ckeditor5DevEnv.createPackage );
gulp.task( 'update', ckeditor5DevEnv.updateRepositories );
gulp.task( 'pull', ckeditor5DevEnv.updateRepositories );
gulp.task( 'status', ckeditor5DevEnv.checkStatus );
gulp.task( 'st', ckeditor5DevEnv.checkStatus );
gulp.task( 'relink', ckeditor5DevEnv.relink );
gulp.task( 'install', ckeditor5DevEnv.installPackage );
gulp.task( 'exec', ckeditor5DevEnv.execOnRepositories );
