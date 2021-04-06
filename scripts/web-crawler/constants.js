#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

const DEFAULT_CONCURRENCY = require( 'os' ).cpus().length / 2;

const DEFAULT_TIMEOUT = 15 * 1000;

const DEFAULT_RESPONSIVENESS_CHECK_TIMEOUT = 1000;

const DEFAULT_REMAINING_ATTEMPTS = 3;

const ERROR_TYPES = {
	PAGE_CRASH: {
		event: 'error',
		description: 'Page crash'
	},
	UNCAUGHT_EXCEPTION: {
		event: 'pageerror',
		description: 'Uncaught exception'
	},
	REQUEST_FAILURE: {
		event: 'requestfailed',
		description: 'Request failure'
	},
	RESPONSE_FAILURE: {
		event: 'response',
		description: 'Response failure'
	},
	CONSOLE_ERROR: {
		event: 'console',
		description: 'Console error'
	},
	NAVIGATION_ERROR: {
		// Navigation error does not have the `event` property, because this error is not emitted by page.on() method as
		// event, but it is thrown as exception from page.goto() method.
		description: 'Navigation error'
	}
};

const PATTERN_TYPE_TO_ERROR_TYPE_MAP = {
	'page-crash': ERROR_TYPES.PAGE_CRASH,
	'uncaught-exception': ERROR_TYPES.UNCAUGHT_EXCEPTION,
	'request-failure': ERROR_TYPES.REQUEST_FAILURE,
	'response-failure': ERROR_TYPES.RESPONSE_FAILURE,
	'console-error': ERROR_TYPES.CONSOLE_ERROR,
	'navigation-error': ERROR_TYPES.NAVIGATION_ERROR
};

const IGNORE_ALL_ERRORS_WILDCARD = '*';

const META_TAG_NAME = 'x-cke-crawler-ignore-patterns';

const DATA_ATTRIBUTE_NAME = 'data-cke-crawler-skip';

module.exports = {
	DEFAULT_CONCURRENCY,
	DEFAULT_TIMEOUT,
	DEFAULT_RESPONSIVENESS_CHECK_TIMEOUT,
	DEFAULT_REMAINING_ATTEMPTS,
	ERROR_TYPES,
	PATTERN_TYPE_TO_ERROR_TYPE_MAP,
	IGNORE_ALL_ERRORS_WILDCARD,
	META_TAG_NAME,
	DATA_ATTRIBUTE_NAME
};
