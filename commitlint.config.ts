export default {
    extends: ['@commitlint/config-conventional'],

    ignores: [
        (message) => false
    ],

    plugins: [],

    rules: {
        'body-max-line-length': [1, 'always', 150],
        'footer-max-line-length': [1, 'always', 150],
    }
};