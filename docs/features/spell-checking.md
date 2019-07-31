---
category: features
---

# Spell checking

{@snippet build-classic-source}

[WebSpellChecker](https://webspellchecker.com/) with [WProofreader](https://webspellchecker.com/wsc-proofreader/#proofreader-ckeditor5) brings support for spell checking in the editor. This product is a multilingual proofreading tool which provides grammar and spellchecking features to the editor.

## Demo

{@snippet features/wproofreader}

## Installation

WProofreader is installed separately from CKEditor5 and cannot be combined into a bundle as other features. To use this tool, it is necessary to provide separate configuration for WProofreader besides CKEditor5.

Example configuration for this feature, when is hosted on the cloud might be found bellow:
```html
<script type="text/javascript" src="https://svc.webspellchecker.net/spellcheck31/wscbundle/wscbundle.js"></script>
<script>
  window.WEBSPELLCHECKER_CONFIG = {
    autoSearch: true,
    enableGrammar: true,
    serviceId: 'your-service-ID'
  };
</script>
```

More details about installation and configuration options might be found under [this link](https://github.com/WebSpellChecker/wproofreader#get-started).
