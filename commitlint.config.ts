export default {
    extends: ['@commitlint/config-conventional'],

    ignores: [
        (message) => false
    ],

    plugins: [],

    rules: {
        'body-max-line-length': [0, 'always', 150],
    }
};