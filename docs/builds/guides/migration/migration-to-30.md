
---
category: builds-migration
menu-title: Migration to v30.x
order: 94
modified_at: 2021-07-13
---

## Migration to CKEditor 5 v30.0.0

For the entire list of changes introduced in version 30.0.0, see the changelog for CKEditor 5 v30.0.0.

Listed below are the most important changes that require your attention when upgrading to CKEditor 5 v30.0.0.

### Matcher pattern API change

Starting from v30.0.0, the {@link module:engine/view/matcher~Matcher} feature deprecated matching `style` and `class` HTML attributes using `attributes` key-value pairs pattern.

The {@link module:engine/view/matcher~Matcher} feature allows to match styles and classes by using dedicated `styles` and `classes` patterns. Since v29.0.0 it's also possible to match every possible value for these attributes by using Boolean type with `true` value. Therefore, to avoid confusion which pattern should be used to match classes and styles, we decided to deprecate matching classes and styles using `attributes` pattern.

Here is an example of changes you may need for proper integration with the {@link module:engine/view/matcher~Matcher} feature new API:

```js
// Old code.
new Matcher( {
	name: 'a',
	attributes: {
		'data-custom-attribute-1': /.*/,
		'data-custom-attribute-2': /.*/,
		style: true,
		class: true
	}
} );

// New code.
new Matcher( {
	name: 'a',
	attributes: {
		'data-custom-attribute-1': /.*/,
		'data-custom-attribute-2': /.*/
	},
	styles: true,
	classes: true
} );
```

### Link decorators API change

{@link builds/guides/migration/migration-to-30#matcher-pattern-api-change Matcher pattern API change} also improves how the {@link module:link/link~LinkDecoratorDefinition link decorators} should be defined (both {@link module:link/link~LinkDecoratorManualDefinition manual decorator} and {@link module:link/link~LinkDecoratorAutomaticDefinition automatic decorator}). Similary to the {@link module:engine/view/matcher~Matcher} feature API, `style` and `class` HTML attributes should be defined using respectively `classes` and `styles` properties.

Here is an example of changes you may need for proper integration with the {@link module:link/link~LinkDecoratorDefinition link decorators} API change:

```js
// Old code.
ClassicEditor
    .create( ..., {
        // ...
        link: {
            decorators: {
                addGreenLink: {
                    mode: 'automatic',
                    attributes: {
                        class: 'my-green-link',
						style: 'color:green;'
                    }
                }
            }
        }
    } )
// New code.
ClassicEditor
    .create( ..., {
        // ...
        link: {
            decorators: {
                addGreenLink: {
                    mode: 'automatic',
                    classes: 'my-green-link',
					styles: {
						color: 'green'
					}
                }
            }
        }
    } )
```
