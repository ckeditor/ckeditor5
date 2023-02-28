---
category: installation
order: 10
menu-title: Overview
meta-title: CKEditor 5 installation documentation
meta-description: Learn how to install, integrate, configure and develop CKEditor 5. Browse through API documentation and online samples.
---

# Getting started with CKEditor 5

CKEditor 5 provides every type of WYSIWYG editing solution imaginable. From editors similar to Google Docs and Medium, to Slack or Twitter like applications, all is possible within a single editing framework. It is an ultra-modern JavaScript rich text editor with MVC architecture, custom data model and virtual DOM, written from scratch in ES6 with excellent webpack support. Find out the most convenient way to start using it!

<span class="navigation-hint_mobile">
<info-box>
	Use the **main menu button in the upper-left corner** to navigate through the documentation.
</info-box>
</span>

<info-box>
	**Not sure which installation method is best for you?** <button type="button" class="quiz-button quiz-button_start">Take a short quiz!</button>
</info-box>

## Migrating from CKEditor 4

If you are an existing CKEditor 4 user who wants to migrate to CKEditor 5, please refer to the {@link updating/migration-from-ckeditor-4 CKEditor 4 migration guide} for tips about such an installation. The "Getting started" section is an introduction to CKEditor 5 and is mostly aimed at new users who want to install and configure their WYSIWYG editor. You may want to get familiar with these guides before the migration, too.

## Start using CKEditor 5 instantly with CDN

Start using CKEditor 5 instantly thanks to the power of our CDN. Check out the {@link installation/getting-started/quick-start Quick start guide}.

## Installing predefined CKEditor 5 builds

Predefined CKEditor 5 builds are ready-to-use distributions aimed at specific needs that you can simply download and use out of the box. Learn more about the {@link installation/getting-started/predefined-builds available predefined builds} and choose the right one for you. This is the fastest way to kick-off your CKEditor 5 installation.

## Customizing the CKEditor 5 installation

Learn how to install a custom CKEditor 5 easily with the use of {@link installation/getting-started/quick-start-other#creating-custom-builds-with-online-builder online builder} or {@link installation/getting-started/quick-start-other#building-the-editor-from-source build the editor from scratch}, and learn to {@link installation/getting-started/configuration configure it}.

## Integration with frameworks

Get to know the supported {@link installation/frameworks/overview integrations with popular JavaScript frameworks} such as React, Angular or Vue, and learn to utilize them and to integrate CKEditor 5 with your software.

## Advanced installation concepts

Find out more about the {@link installation/plugins/plugins plugin development}, how to {@link installation/getting-started/getting-and-setting-data handle and save the data} and what the {@link installation/plugins/features-html-output-overview features' HTML output} is for each plugin. Learn about alternative setups such as {@link installation/advanced/dll-builds DLL builds} or {@link installation/advanced/integrating-from-source-webpack integrating CKEditor 5 from source}.

**Related links**

 * {@link updating/updating-ckeditor-5 Updating CKEditor 5} &ndash; Find out how to keep you installation up-to-date at all times.
 * {@link features/index Features} &ndash; Learn more about the CKEditor 5 features.
 * {@link examples/index Examples} &ndash; Try live demos of available predefined builds and custom solutions.
 * {@link framework/index CKEditor 5 Framework} &ndash; Learn how to work with CKEditor 5 Framework, customize it, create your own plugins or custom editors, how to change the UI or even bring your own UI to the editor.

<script type="text/javascript">
	const QUIZ_DEFAULT_HEADER = 'Installation method quiz';
	const QUIZ_RESOLUTION_BUTTON_DEFINITIONS = [
		{
			classes: [ 'quiz-button', 'quiz-button_restart' ],
			text: 'Restart the quiz',
			navigateToPaneId: 'quiz-question-usingCDN'
		}
	];
	const QUIZ_PANE_DEFINITIONS = {
		// This pane is not rendered. This definition is for the button click handlers to work properly only.
		'quiz-start': {
			buttons: [
				{
					classes: [ 'quiz-button', 'quiz-button_start' ],
					text: 'Take a short quiz',
					navigateToPaneId: 'quiz-question-usingCDN',
				}
			]
		},

		// ------------------------------ Questions -----------------------------------------------

		'quiz-question-usingCDN': {
			content: 'Do you need an immediate pre-made solution?',
			hint: 'CKEditor 5 can be instantly run from <a href="#start-using-ckeditor-5-instantly-with-cdn">CDN</a> providing working editor in seconds. This is the fastest way to start.',
			buttons: [
				getDecisionButtonDefinition( true, 'quiz-resolution-usingCDN' ),
				getDecisionButtonDefinition( false, 'quiz-question-usingBuilds' ),
			]
		},

		'quiz-question-usingBuilds': {
			content: 'Do you need a working, out-of-the box solution?',
			hint: 'CKEditor 5 comes with ready-to-use <a href="#installing-predefined-ckeditor-5-builds">predefined builds</a> that offer working solutions for different use cases. This is a quick way to start.',
			buttons: [
				getDecisionButtonDefinition( true, 'quiz-resolution-usingBuilds' ),
				getDecisionButtonDefinition( false, 'quiz-question-onlineBuilder' ),
			]
		},

		'quiz-question-onlineBuilder': {
			content: 'Do you need a ready-to-use, custom solution?',
			hint: 'CKEditor 5 online builder allows users to create a downloadable working copy with custom set of features. This is the easiest way to prepare a custom editor',
			buttons: [
				getDecisionButtonDefinition( true, 'quiz-resolution-onlineBuilder' ),
				getDecisionButtonDefinition( false, 'quiz-question-fromSource' ),
			]
		},

		'quiz-question-fromSource': {
			content: 'Do you want to configure your own custom-tailored installation?',
			hint: 'Building CKEditor 5 from source allows you to fully control the building process and every aspect of the final editor.',
			buttons: [
				getDecisionButtonDefinition( true, 'quiz-resolution-fromSource' ),
				getDecisionButtonDefinition( false, 'quiz-question-usingFrameworks' ),
			]
		},

		'quiz-question-usingFrameworks': {
			content: 'Do you want to integrate CKEditor into an existing React, Vue.js or Angular project?',
			hint: 'CKEditor 5 comes with ready-to-use <a href="#integration-with-frameworks">adapters</a> for popular frontend frameworks. You can use them to quickly bootstrap your project.',
			buttons: [
				getDecisionButtonDefinition( true, 'quiz-resolution-usingFrameworks' ),
				getDecisionButtonDefinition( false, 'quiz-question-usingDLL' ),
			]
		},

		'quiz-question-usingDLL': {
			content: 'Do you want to design and maintain your installation without the need to recompile each time on update?',
			hint: 'CKEditor 5 DLL build allows adding plugins to an editor build without having to rebuild the build itself.',
			buttons: [
				getDecisionButtonDefinition( true, 'quiz-resolution-usingDLL' ),
				getDecisionButtonDefinition( false, 'quiz-question-migrateFromV4' ),
			]
		},

		'quiz-question-migrateFromV4': {
			content: 'Do you want to migrate from your existing CKEditor 4 installation?',
			buttons: [
				getDecisionButtonDefinition( true, 'quiz-resolution-migrateFromV4' ),
				getDecisionButtonDefinition( false, 'quiz-resolution-endOfTheWorld' ),
			]
		},

		// ------------------------------ Resolutions ----------------------------------------------

		'quiz-resolution-usingCDN': {
			content: 'Based on your answers, you should check out the {@link installation/getting-started/quick-start CDN installation}. You can also browse other installation methods listed below.',
			buttons: QUIZ_RESOLUTION_BUTTON_DEFINITIONS
		},

		'quiz-resolution-usingBuilds': {
			content: 'Based on your answers, you should check out the {@link installation/getting-started/predefined-builds predefined builds}. You can also browse other installation methods listed below.',
			buttons: QUIZ_RESOLUTION_BUTTON_DEFINITIONS
		},

		'quiz-resolution-onlineBuilder': {
			content: 'Based on your answers, you should check out the {@link installation/getting-started/quick-start-other#creating-custom-builds-with-online-builder online builder}. You can also browse other installation methods listed below.',
			buttons: QUIZ_RESOLUTION_BUTTON_DEFINITIONS
		},

		'quiz-resolution-fromSource': {
			content: 'Based on your answers, you should check out the {@link installation/getting-started/quick-start-other#building-the-editor-from-source building CKEditor 5 from source}. You can also browse other installation methods listed below.',
			buttons: QUIZ_RESOLUTION_BUTTON_DEFINITIONS
		},

		'quiz-resolution-usingFrameworks': {
			content: 'Based on your answers, you should check out official {@link installation/frameworks/overview integrations with popular JavaScript frameworks}. You can also browse other installation methods listed below.',
			buttons: QUIZ_RESOLUTION_BUTTON_DEFINITIONS
		},

		'quiz-resolution-usingDLL': {
			content: 'Based on your answers, you should check out the {@link installation/advanced/dll-builds DLL webpack} solution. You can also browse other installation methods listed below.',
			buttons: QUIZ_RESOLUTION_BUTTON_DEFINITIONS
		},

		'quiz-resolution-migrateFromV4': {
			content: 'Based on your answers, you should check out the {@link updating/migration-from-ckeditor-4 CKEditor 4 migration guide}.',
			buttons: QUIZ_RESOLUTION_BUTTON_DEFINITIONS
		},

		'quiz-resolution-endOfTheWorld': {
			content: 'The solution you need is not clear. Please browse the documentation to look for further answers.',
			buttons: QUIZ_RESOLUTION_BUTTON_DEFINITIONS
		}
	};

	window.addEventListener( 'DOMContentLoaded', () => setUpTheInstallationQuiz() );

	function setUpTheInstallationQuiz() {
		const startButtonElement = document.querySelector( '.quiz-button_start' );
		setupQuizPaneButton( startButtonElement, getPaneDefinition( 'quiz-start' ).buttons[ 0 ] );

		const startPaneElement = startButtonElement.closest( '.info-box' );
		const quizPaneElements = generateQuizPaneElements( startPaneElement );

		for ( const paneId in quizPaneElements ) {
			startPaneElement.parentNode.insertBefore( quizPaneElements[ paneId ], startPaneElement.nextSibling );
		}

		setupQuizNavigation( quizPaneElements );
	}

	function generateQuizPaneElements( startPaneElement ) {
		const paneElements = {};

		for ( const paneName in QUIZ_PANE_DEFINITIONS ) {
			let paneElement;

			if ( paneName !== 'quiz-start' ) {
				const paneDefinition = getPaneDefinition( paneName );
				paneElement = startPaneElement.cloneNode();

				paneElement.innerHTML = `
					<h3>${ paneDefinition.header || QUIZ_DEFAULT_HEADER }</h3>
					<p class="quiz-message">${ paneDefinition.content }</p>
					<div class="quiz-buttons">${ generateQuizPaneButtons( paneDefinition ) }</div>
					${ paneDefinition.hint ? `<p class="quiz-hint">${ paneDefinition.hint }</p>` : '' }
				`;
			} else {
				// Not creating the start pane this way to take advantage of Umberto and its generator.
				// The start pane will be cloned and other panes will have the same Umberto classes.
				// It will prevent the quiz DOM structure from getting outdated.
				paneElement = startPaneElement;
			}

			paneElement.id = paneName;
			paneElement.classList.add( 'quiz-pane' );
			paneElements[ paneName ] = paneElement;
		}

		return paneElements;
	}

	function generateQuizPaneButtons( paneDefinition ) {
		return paneDefinition.buttons.map( buttonDefinition => {
			const buttonElement = document.createElement( 'button' );

			setupQuizPaneButton( buttonElement, buttonDefinition );

			return buttonElement;
		} ).reduce( ( previousValue, currentValue ) => previousValue + currentValue.outerHTML, '' );
	}

	function setupQuizPaneButton( buttonElement, definition ) {
		buttonElement.setAttribute( 'type', 'button' );
		buttonElement.innerHTML = definition.text;
		buttonElement.classList.add( ...definition.classes );
		buttonElement.dataset.navigateToPaneId = definition.navigateToPaneId;
	}

	function setupQuizNavigation( quizPaneElements ) {
		for ( const paneName in quizPaneElements ) {
			if ( paneName === 'quiz-start' ) {
				continue;
			}

			hideQuizPane( quizPaneElements[ paneName ] );
		}

		document.addEventListener( 'click', event => {
			if ( !event.target.matches( '.quiz-button' ) ) {
				return;
			}

			const parentPaneElement = event.target.closest( '.info-box' );
			const parentPaneDefinition = getPaneDefinition( parentPaneElement.id );

			hideQuizPane( parentPaneElement );
			showQuizPane( quizPaneElements[ event.target.dataset.navigateToPaneId ] );

			// Allow tracking the usage of the quiz in GA.
			window.location.hash = `installation-quiz-navigation:${ event.target.dataset.navigateToPaneId }`;
		}, false );
	}

	function showQuizPane( paneElement ) {
		paneElement.style.display = 'block';
	}

	function hideQuizPane( paneElement ) {
		paneElement.style.display = 'none';
	}

	function getPaneDefinition( id ) {
		return QUIZ_PANE_DEFINITIONS[ id ];
	}

	function getDecisionButtonDefinition( isYes, navigateToPaneId ) {
		return {
			classes: [ 'quiz-button' ],
			text: isYes ? 'Yes' : 'No',
			navigateToPaneId
		};
	}
</script>

<style>
div.quiz-pane h3 {
	font-size: 1em;
	font-weight: bold;
	margin-bottom: 1em;
}

div.quiz-pane p.quiz-message {
	font-size: 1.2em;
	margin-bottom: 1em;
	text-align: center;
}

div.quiz-pane p.quiz-hint {
	font-size: .8em;
	opacity: 0.6;
	margin-top: 1em;
	text-align: center;
}

div.quiz-pane .quiz-hint::before {
	content: "ℹ️";
	margin-right: .4em;
}

div.quiz-pane .quiz-buttons {
	display: flex;
	align-content: center;
	justify-content: center;
}

div.quiz-pane button.quiz-button {
	all: unset;
	border: 1px solid #1b3af2;
	border-radius: 100px;
	padding: 2px 10px;
	color: #1b3af2;
	background: transparent;
	min-width: 80px;
	text-align: center;
}

div.quiz-pane button.quiz-button:hover {
	background: #e6eaff;
}

div.quiz-pane button.quiz-button:active,
div.quiz-pane button.quiz-button:focus {
	background: #aebbff;
}

div.quiz-pane .quiz-buttons button.quiz-button + button {
	margin-left: 1em;
}

div.quiz-pane button.quiz-button_restart {
	border: 0px;
}

div.quiz-pane button.quiz-button_restart::before {
	content: "↺";
	margin-right: .5em;
}

div.quiz-pane[id="quiz-start"] p {
	display: flex;
	justify-content: space-between;
	align-content: center;
	flex-direction: row;
	flex-wrap: nowrap;
	align-items: center;
}
</style>
