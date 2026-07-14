// export default {
//   extends: ['@commitlint/config-conventional'],
//   rules: {
//     'type-enum': [
//       2,
//       'always',
//       ['feat', 'fix', 'docs', 'style', 'refactor', 'test', 'chore', 'perf', 'ci', 'revert'],
//     ],
//     'subject-case': [2, 'always', 'lower-case'],
//     'subject-max-length': [2, 'always', 100],
//   },
// };
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'docs', 'style', 'refactor', 'test', 'chore', 'perf', 'ci', 'revert'],
    ],
    'subject-case': [2, 'always', 'lower-case'],
    'subject-max-length': [2, 'always', 100],
  },
  helpUrl: '\n❌ COMMIT FAILED! Follow the format: <type>: <lowercase-message>\n\n' +
    '📌 Available Types:\n' +
    '  • feat     (New feature)        • fix    (Bug fix)\n' +
    '  • docs     (Documentation)      • style  (Formatting, semi-colons)\n' +
    '  • refactor (Code restructuring) • test   (Adding/fixing tests)\n' +
    '  • chore    (Build/deps/tools)   • perf   (Performance improve)\n' +
    '  • ci       (CI config/scripts)  • revert (Undo previous commit)\n\n' +
    '⚠️  Rules: Subject MUST be lowercase and max 100 characters.\n' +
    '👉 Example: git commit -m "feat: add user authentication"\n',
};