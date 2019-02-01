#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* eslint-env node */

/*

This script assumes that is being executed on Travis CI. It requires three environment variables:
- SLACK_WEBHOOK_URL - a URL where the notification should be sent
- START_TIME - POSIX time (when the script has begun the job)
- END_TIME - POSIX time (when the script has finished the job)

It also has some dependencies:
- "slack-notify"
- "@octokit/rest@^16.13.4"

 */

const buildBranch = process.env.TRAVIS_BRANCH;

// Send a notification only for main branches...
if ( buildBranch !== 'master' && buildBranch !== 'master-revisions' ) {
	process.exit();
}

// ...and "push" builds...
if ( process.env.TRAVIS_EVENT_TYPE !== 'push' ) {
	process.exit();
}

// ...and for builds that failed.
if ( process.env.TRAVIS_TEST_RESULT == 0 ) {
	process.exit();
}

const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

const slack = require( 'slack-notify' )( SLACK_WEBHOOK_URL );
const GitHubApi = require( '@octokit/rest' );
const github = new GitHubApi( {
	version: '3.0.0'
} );

const buildId = process.env.TRAVIS_JOB_NUMBER.split( '.' )[ 0 ];
const buildUrl = process.env.TRAVIS_JOB_WEB_URL;
const buildCommit = process.env.TRAVIS_COMMIT;
const [ owner, repo ] = process.env.TRAVIS_REPO_SLUG.split( '/' );
const commitUrl = `https://github.com/${ owner }/${ repo }/commit/${ buildCommit }`;
const shortCommit = buildCommit.substring( 0, 7 );
const execTime = getExecuteTime( parseInt( process.env.END_TIME ), parseInt( process.env.START_TIME ) );

const message = `Build <${ buildUrl }|#${ buildId }> (<${ commitUrl }|${ shortCommit }>) of \
${ owner }/${ repo }@${ buildBranch } by [Author] errored \
in ${ execTime.mins } min ${ execTime.secs } sec`;

const messageOptions = {
	icon_url: 'https://a.slack-edge.com/66f9/img/services/travis_36.png',
	unfurl_links: 1,
	username: 'Travis CI',
	attachments: [
		{
			color: 'danger',
		}
	]
};

slack.onError = err => {
	console.log( 'API error occurred:', err );
};

github.repos.getCommit( { owner, repo, sha: buildCommit } )
	.then( response => {
		messageOptions.attachments[ 0 ].text = message.replace( '[Author]', response.data.commit.author.name );
	} )
	.catch( () => {
		messageOptions.attachments[ 0 ].text = message.replace( 'by [Author] ', '' );
		messageOptions.attachments[ 0 ].pretext = '_Could not fetch an author of the commit._';
	} )
	.then( () => {
		slack.send( messageOptions );
	} );

/**
 * @param {Number} endTime
 * @param {Number} startTime
 * @returns {Object}
 */
function getExecuteTime( endTime, startTime ) {
	const execTime = {
		ms: endTime - startTime
	};

	execTime.days = Math.floor( execTime.ms / 86400 );
	execTime.hours = Math.floor( ( execTime.ms - 86400 * execTime.days ) / 3600 );
	execTime.mins = Math.floor( ( ( execTime.ms - 86400 * execTime.days ) - 3600 * execTime.hours ) / 60 );
	execTime.secs = ( ( execTime.ms - 86400 * execTime.days ) - 3600 * execTime.hours ) - 60 * execTime.mins;

	return execTime;
}
