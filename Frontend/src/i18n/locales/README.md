# Translation Structure

YOGO uses `react-i18next` with JSON namespaces.

Current namespace:

- `common.json` - shared brand, navigation, footer, and page copy.

Initial active language:

- `en` English

Prepared future languages:

- `de` German
- `fr` French
- `nl` Dutch
- `it` Italian
- `es` Spanish
- `ru` Russian
- `zh-CN` Chinese Simplified

Future language files should mirror `en/common.json` key-for-key before being
enabled in `src/i18n/languages.js`.
