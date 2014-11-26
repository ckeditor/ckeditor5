/* global module */
/* global require */
/* global console */

'use strict';

module.exports = function( grunt ) {
	// Register our custom jscs task.
	grunt.registerTask( 'jscs', 'JavaScript Code Style checker', function() {
		task.call( this, grunt );
	} );
};

var defaultConfig = {
	'requireCurlyBraces': [
		'if', 'else', 'for', 'while', 'do', 'switch', 'try', 'catch'
	],
	'requireSpaceAfterKeywords': [
		'if', 'else', 'for', 'while', 'do', 'switch', 'return', 'try', 'catch'
	],
	'requireSpaceBeforeBlockStatements': true,
	'requireParenthesesAroundIIFE': true,
	'requireSpacesInConditionalExpression': {
		'afterTest': true,
		'beforeConsequent': true,
		'afterConsequent': true,
		'beforeAlternate': true
	},
	'requireSpacesInFunctionExpression': {
		'beforeOpeningCurlyBrace': true
	},
	'disallowSpacesInFunctionExpression': {
		'beforeOpeningRoundBrace': true
	},
	'requireBlocksOnNewline': true,
	'requireSpacesInsideObjectBrackets': 'all',
	'requireSpacesInsideArrayBrackets': 'all',
	'disallowSpaceAfterObjectKeys': true,
	'requireCommaBeforeLineBreak': true,
	'requireOperatorBeforeLineBreak': [
		'?', '=', '+', '-', '/', '*', '==', '===', '!=', '!==', '>', '>=', '<', '<=', '|', '||', '&', '&&', '^', '+=', '*=',
		'-=', '/=', '^='
	],
	'requireSpaceBeforeBinaryOperators': [
		'+', '-', '/', '*', '=', '==', '===', '!=', '!==', '>', '>=', '<', '<=', '|', '||', '&', '&&', '^', '+=', '*=', '-=',
		'/=', '^='
	],
	'requireSpaceAfterBinaryOperators': [
		'+', '-', '/', '*', '=', '==', '===', '!=', '!==', '>', '>=', '<', '<=', '|', '||', '&', '&&', '^', '+=', '*=', '-=',
		'/=', '^='
	],
	'disallowSpaceAfterPrefixUnaryOperators': [
		'++', '--', '+', '-', '~', '!'
	],
	'disallowSpaceBeforePostfixUnaryOperators': [
		'++', '--'
	],
	'disallowKeywords': [
		'with'
	],
	'validateLineBreaks': 'LF',
	'validateQuoteMarks': {
		'mark': '\'',
		'escape': true
	},
	'validateIndentation': '\t',
	'disallowMixedSpacesAndTabs': true,
	'disallowTrailingWhitespace': true,
	'disallowKeywordsOnNewLine': [
		'else', 'catch'
	],
	'maximumLineLength': 120,
	'safeContextKeyword': [
		'that'
	],
	'requireDotNotation': true,
	'disallowYodaConditions': true
};

var Vow = require( 'vow' ),
	Jscs = require( 'jscs' ),
	tools = require( './res/tools' );

function task( grunt ) {
	// Checking is asynchronous.
	var done = this.async();

	// Get the list of files that will end up in the next commit.
	var files = tools.getGitDirtyFiles();

	// Reduce the files list to *.js.
	files = files.filter( function( file ) {
		// Accepts .js files only
		return file && ( /\.js$/ ).test( file );
	} );

	// Create and configure the Checker.
	var checker = new Jscs();
	checker.registerDefaultRules();
	checker.configure( defaultConfig );

	// Get the check promises for each file.
	var checks = files.map( function( file ) {
		// Returns a check promise for each file.
		return checker.checkPath( file );
	} );

	// Once the promises are done...
	Vow.allResolved( checks ).spread( function() {
		var results, errorCount = 0;

		// grunt.async() hide errors, so better to catch them.
		try {
			results = Array.prototype.filter.call( arguments, function( promise ) {
				return promise && promise.isFulfilled();
			} ).map( function( promise ) {
				// Take the jscs error object out of each promise.
				return promise.valueOf()[ 0 ];
			} );

			// Loop throw all files with errors.
			results.forEach( function( fileErrors ) {
				// Loop through all errors in the file.
				fileErrors.getErrorList().forEach( function( error ) {
					errorCount++;
					console.log( fileErrors.explainError( error, true ) );
					console.log( '' );
				} );
			} );
		} catch ( e ) {
			console.log( e );
			done( false );
		}

		if ( errorCount ) {
			grunt.log.error( errorCount + ' code style errors found!' );
		} else {
			grunt.log.ok( results.length + ' files without code style errors.' );
		}

		done( !errorCount );
	} );
}
