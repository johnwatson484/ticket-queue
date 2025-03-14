import neoStandard from 'neostandard'

export default neoStandard({
  globals: ['describe', 'beforeEach', 'expect', 'test', 'afterEach', 'jest', 'beforeAll', 'afterAll'],
  ts: true,
  ignores: ['**/dist/**', 'scripts/**']
})
