---
type: Minor breaking change
scope:
  - ckeditor5-fullscreen
see:
  - https://github.com/ckeditor/ckeditor5/issues/3891
---

The default container of the fullscreen mode has changed. When `config.fullscreen.container` is not set, the fullscreen mode is mounted in the shared `config.ui.overlayContainer`, if there is one, and otherwise in the shadow root the editor lives in. It falls back to the `<body>` element, which used to be the only default, when there is neither. An explicitly configured container is still honored.

The option is also no longer given a default value internally, so `editor.config.get( 'fullscreen.container' )` returns `undefined` instead of the `<body>` element when the integrator did not set it.

Custom CSS may need updating: the wrapper of a fullscreen mode that fills an integrator-provided container is marked with the `ck-fullscreen__main-wrapper_custom-container` class now.
