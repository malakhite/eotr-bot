// @ts-check

import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';
import importPlugin from 'eslint-plugin-import';
import prettier from 'eslint-config-prettier';

const config = defineConfig([
	js.configs.recommended,
	tseslint.configs.recommended,
	importPlugin.flatConfigs.recommended,
	importPlugin.flatConfigs.typescript,
	{
		rules: {
			'@typescript-eslint/interface-name-prefix': 'off',
			'@typescript-eslint/explicit-function-return-type': 'off',
			'@typescript-eslint/explicit-module-boundary-types': 'off',
			'@typescript-eslint/no-explicit-any': 'off',

			// 'import/order': [
			// 	1,
			// 	{
			// 		groups: [
			// 			'external',
			// 			'builtin',
			// 			'internal',
			// 			'sibling',
			// 			'parent',
			// 			'index',
			// 			'type',
			// 		],
			// 		'newlines-between': 'always',

			// 		alphabetize: {
			// 			order: 'asc',
			// 		},
			// 	},
			// ],
		},
		settings: {
			'import/resolver': {
				typescript: {
					alwaysTryTypes: true,
				},
			},
		},
	},
	prettier,
]);

export default config;
