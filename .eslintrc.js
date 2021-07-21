module.exports = {
	root: true,
	parser: '@typescript-eslint/parser',
	plugins: ['@typescript-eslint'],
	extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
	parserOptions: {
		project: './tsconfig.json',
	},
	rules: {
		'@typescript-eslint/no-non-null-assertion': false,
		'@typescript-eslint/no-explicit-any': false,
	},
};
