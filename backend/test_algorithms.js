const { Trie, mergeSort, TransactionGraph } = require('./utils/algorithms');

console.log('--- TESTING ALGORITHMS ---');

// 1. Test Trie
const trie = new Trie();
trie.insert('preetham@finova', { id: 1 });
trie.insert('prem@finova', { id: 2 });
trie.insert('prakash@finova', { id: 3 });

const results = trie.search('pre');
console.log('Trie Search ("pre"):', results);
if (results.length === 2) console.log('✅ Trie Passed');
else console.error('❌ Trie Failed');

// 2. Test Merge Sort
const transactions = [
    { id: 1, amount: 500, created_at: '2023-01-01' },
    { id: 2, amount: 100, created_at: '2023-01-03' },
    { id: 3, amount: 1000, created_at: '2023-01-02' }
];

const sorted = mergeSort(transactions, (a, b) => new Date(b.created_at) - new Date(a.created_at));
console.log('Sorted Transactions (Desc):', sorted.map(t => t.id));
if (sorted[0].id === 2 && sorted[1].id === 3 && sorted[2].id === 1) console.log('✅ MergeSort Passed');
else console.error('❌ MergeSort Failed');

// 3. Test Graph
const graph = new TransactionGraph();
graph.addTransaction('A', 'B', 100);
graph.addTransaction('B', 'C', 100);
graph.addTransaction('C', 'A', 100); // Cycle!

const cycles = graph.findCycles('A');
console.log('Cycles Detected:', cycles);
if (cycles.length > 0) console.log('✅ Graph Cycle Detection Passed');
else console.error('❌ Graph Cycle Detection Failed');
