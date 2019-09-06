import buildStore from '../'
import * as path from 'path';
import testSuite from 'macoolka-store-core/lib/testSuite'
describe('store local', () => {
    try {
        const store = buildStore(path.join(__dirname, 'fixtures', 'tests'))
        testSuite(store, { providerName: 'local', largeSize: true, root: path.join(__dirname, 'files') })
    } catch (error) {
        console.log(error)
    }
});
