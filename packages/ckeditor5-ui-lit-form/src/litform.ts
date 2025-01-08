/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module ui-lit-form/lit-form
 */

import { type Editor, Plugin } from 'ckeditor5/src/core.js';
import { ButtonView } from 'ckeditor5/src/ui.js';
import {
	getRegistry,
	UIComponents,
	html,
	type CKForm,
	type CKInput,
	type ComponentRegisterEvent,
	type ComponentCreateEvent
} from '@ckeditor/ckeditor5-ui-components';
import FormView from './ui/formview.js';
import Form from './ui/form.js';

export default class LitForm extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'LitForm' as const;
	}

	public static get requires() {
		return [ UIComponents ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public static override get isOfficialPlugin(): true {
		return true;
	}

	/**
	 * @inheritDoc
	 */
	constructor( editor: Editor ) {
		super( editor );

		//
		// Overriding component class.
		//

		editor.on<ComponentRegisterEvent<CKForm>>( 'componentRegister', ( _evt, data ) => {
			if ( data.name !== 'ck-form' ) {
				return;
			}

			console.log( 'componentRegister', data.component );

			// Approach 1
			//
			// There needs to be proper generics for event listener. Super 'CKComponent' class type can be used too.
			// The caveat is that this event is fired for every component, so additional check
			// for type is needed (and it means generics value is not really true).
			class BetterForm extends data.component {
				public static componentName = 'betterform';

				public override render() {
					const template = super.render();

					return html`
						<div>
							<h3>Better Form</h3>
							${ template }
						</div>
					`;
				}
			}

			// Approach 2
			//
			// If we know what class it is, it can be simply done like below, but this means
			// class would need to be exported publicly.
			// With previous "extends data.component" approach, only class type can be exported.
			//
			// class BetterForm extends CKForm {
			// 	public static override componentName = 'betterform';

			// 	public override render() {
			// 		const template = super.render();

			// 		return html`
			// 			<div>
			// 				<h3>Better Form</h3>
			// 				${ template }
			// 			</div>
			// 		`;
			// 	}
			// }

			data.component = BetterForm;
		} );

		//
		// Overriding component instance.
		//

		// Typescript complains about wrong event type. Since firing this event on window is a quick workaround,
		// I did not spend time fixing it.
		// Can be done like https://stackoverflow.com/a/68783088.
		window.addEventListener( 'componentInstanceCreated', ( evt: ComponentCreateEvent<CKInput> ) => {
			console.log( 'componentInstanceCreated', evt.detail );

			if ( evt.detail.name === 'ck-labeledinput:input' && evt.detail.namespace === 'link' ) {
				// This is so meh... I really don't like such way of extending component instance.
				const instance = evt.detail.instance;
				instance.render = () => {
					return html`
						<div>
							<input
								style="border: 1px solid blue;"
								class="input-component"
								type="input"
								id=${ instance.uid }
								@input=${ instance.onInput }
							/>
						</div>
					`;
				};

				// The only reasonable way I can think of now would be extending class and passing instance.
				// But it won't work since the element is being connected to the DOM already so can't be replaced like that.
				//
				// And even if it could, there are some issues - https://stackoverflow.com/a/61883392
				// class BetterInput extends CKInput {
				// 	public static override componentName = 'better-input';

				// 	public override render() {
				// 		return html`
				// 			<div>
				// 				<input
				// 					style="border: 1px solid blue;"
				// 					class="input-component"
				// 					type="input"
				// 					id=${ this.uid }
				// 					@input=${ this.onInput }
				// 				/>
				// 			</div>
				// 		`;
				// 	}
				// }

				// getRegistry( editor ).register( 'better-input', BetterInput );
				// const instance = document.createElement( 'better-input' );
				// evt.detail.instance = instance;

				// What if we provide class here so it can be extended the sam way as for 'componentRegister' but pass
				// an instance instead of a class?
			}
		} );
	}

	public init(): void {
		const editor = this.editor;

		getRegistry( editor ).register( Form.componentName, Form );

		editor.ui.componentFactory.add( 'litform', () => {
			const t = this.editor.locale.t;
			const button = this._createDialogButton( ButtonView );

			button.tooltip = true;
			button.label = t( 'Lit Form' );

			return button;
		} );
	}

	private _createDialogButton<T extends typeof ButtonView >( ButtonClass: T ): InstanceType<T> {
		const editor = this.editor;
		const buttonView = new ButtonClass( editor.locale ) as InstanceType<T>;

		buttonView.on( 'execute', () => {
			this._showDialog();
		} );

		return buttonView;
	}

	private _showDialog() {
		const editor = this.editor;
		const dialog = editor.plugins.get( 'Dialog' );
		const t = editor.locale.t;

		dialog.show( {
			id: 'litform-dialog',
			title: t( 'Lit Form' ),
			content: new FormView( editor.locale, dialog ),
			isModal: true,
			onShow: () => {},
			actionButtons: []
		} );
	}
}
