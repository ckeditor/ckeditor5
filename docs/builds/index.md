---
category: builds
order: 10
toc: false
feedback-widget: false
meta-title: CKEditor 5 builds documentation
meta-description: Learn how to install, integrate, configure and develop CKEditor 5 builds. Browse through API documentation and online samples.
---

# Installing CKEditor 5

Learn how to install CKEditor 5 from scratch or using predefined builds. Integrate CKEditor 5 with your software, keep it updated and find out hot you can help developing it.

<info-box>
	Use the <span class="navigation-hint_desktop">**navigation tree on the left**</span><span class="navigation-hint_mobile">**main menu button in the upper-left corner**</span> to navigate through the documentation. Newly added or meaningfully updated guides are marked with a <span class="tree__item__badge tree__item__badge_new">NEW</span> icon for easy spotting.
</info-box>

<info-box>
	**Not sure which installation method is best for you?** <button type="button" class="quiz-button quiz-button_start">Take a short quiz</button>
</info-box>

## Predefined CKEditor 5 builds

Learn more about the {@link builds/guides/overview available predefined builds} and choosing the right one for you. This is the fastest way to kick-off you CKEditor 5 installation.

## Installing CKEditor 5

Get to know how to {@link builds/guides/integration/installation install the editor}, {@link builds/guides/integration/configuration configure it}, and {@link builds/guides/integration/csp secure}.

Find out how to {@link builds/guides/integration/saving-data handle and save the data} and what the {@link builds/guides/integration/features-html-output-overview features' HTML output} is for each plugin.

## Frameworks integration

Get to know the and the supported {@link builds/guides/frameworks/overview integrations with popular JavaScript frameworks} and learn to utilize them.

## CKEditor 5 development

Get to know more about the {@link builds/guides/development/plugins plugin development}. Find out how to {@link builds/guides/development/custom-builds create custom builds} and update your CKEditor 5 on the go with the {@link builds/guides/development/dll-builds DLL webpack} solution.

## Migrating from CKEditor 4 and previous versions

Refer to the {@link builds/guides/migration/migration-from-ckeditor-4 CKEditor 4 migration guide} or other migration guides if you are updating your CKEditor 5 installation.

## Related links

 * {@link examples/index Examples} &ndash; Try live demos of all available builds.
 * {@link features/index Features} &ndash; Learn about some of the features included in CKEditor 5 builds.

<script type="text/javascript">
	const QUIZ_DEFAULT_HEADER = 'Installation method quiz';
	const QUIZ_RESOLUTION_BUTTON_DEFINITIONS = [
		{
			classes: [ 'quiz-button', 'quiz-button_restart' ],
			text: 'Restart the quiz',
			navigateToPaneId: 'quiz-question-usingFrameworks'
		}
	];
	const QUIZ_PANE_DEFINITIONS = {
		// This pane is not rendered. This definition is for the button click handlers to work properly only.
		'quiz-start': {
			buttons: [
				{
					classes: [ 'quiz-button', 'quiz-button_start' ],
					text: 'Take a short quiz',
					navigateToPaneId: 'quiz-question-usingFrameworks',
				}
			]
		},

		// ------------------------------ Questions -----------------------------------------------

		'quiz-question-usingFrameworks': {
			content: 'Do you want integrate CKEditor into an existing React, Vue.js or Angular project?',
			hint: 'CKEditor 5 comes with ready-to-use <a href="#frameworks-integration">adapters</a> for popular front–end frameworks. You can use them to quickly bootstrap your project.',
			buttons: [
				getDecisionButtonDefinition( true, 'quiz-resolution-usingFrameworks' ),
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

		'quiz-resolution-usingFrameworks': {
			content: 'Based on you previous answers, we you should check out official {@link builds/guides/frameworks/overview integrations with popular JavaScript frameworks}. You can also browse other installation methods listed below.',
			buttons: QUIZ_RESOLUTION_BUTTON_DEFINITIONS
		},

		'quiz-resolution-migrateFromV4': {
			content: 'Based on you previous answers, we recommend you to check out the {@link builds/guides/migration/migration-from-ckeditor-4 CKEditor 4 migration guide}.',
			buttons: QUIZ_RESOLUTION_BUTTON_DEFINITIONS
		},

		'quiz-resolution-endOfTheWorld': {
			content: 'This message will be displayed when there is no easy answer.',
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
