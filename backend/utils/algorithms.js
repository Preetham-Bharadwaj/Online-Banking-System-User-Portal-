/**
 * DSA UTILS - Advanced Algorithmic Implementations for Banking
 * Includes: Trie, Sorting, Graph, DP, and Greedy algorithms.
 */

// 1. TRIE FOR AUTOCOMPLETE
class TrieNode {
    constructor() {
        this.children = {};
        this.isEndOfWord = false;
        this.data = null; // Store full string or user info
    }
}

class Trie {
    constructor() {
        this.root = new TrieNode();
    }

    insert(word, data) {
        let node = this.root;
        for (const char of word.toLowerCase()) {
            if (!node.children[char]) node.children[char] = new TrieNode();
            node = node.children[char];
        }
        node.isEndOfWord = true;
        node.data = data;
    }

    search(prefix) {
        let node = this.root;
        for (const char of prefix.toLowerCase()) {
            if (!node.children[char]) return [];
            node = node.children[char];
        }
        return this._findAllWithPrefix(node);
    }

    _findAllWithPrefix(node) {
        let results = [];
        if (node.isEndOfWord) results.push(node.data);
        for (const char in node.children) {
            results = results.concat(this._findAllWithPrefix(node.children[char]));
        }
        return results;
    }
}

// 2. SORTING ALGORITHMS
const mergeSort = (arr, compareFn) => {
    if (arr.length <= 1) return arr;
    const mid = Math.floor(arr.length / 2);
    const left = mergeSort(arr.slice(0, mid), compareFn);
    const right = mergeSort(arr.slice(mid), compareFn);
    return merge(left, right, compareFn);
};

const merge = (left, right, compareFn) => {
    let result = [], l = 0, r = 0;
    while (l < left.length && r < right.length) {
        if (compareFn(left[l], right[r]) <= 0) result.push(left[l++]);
        else result.push(right[r++]);
    }
    return result.concat(left.slice(l)).concat(right.slice(r));
};

const quickSort = (arr, compareFn) => {
    if (arr.length <= 1) return arr;
    const pivot = arr[arr.length - 1];
    const left = [], right = [];
    for (let i = 0; i < arr.length - 1; i++) {
        if (compareFn(arr[i], pivot) <= 0) left.push(arr[i]);
        else right.push(arr[i]);
    }
    return [...quickSort(left, compareFn), pivot, ...quickSort(right, compareFn)];
};

// 3. GRAPH ALGORITHMS FOR FRAUD DETECTION
class TransactionGraph {
    constructor() {
        this.adj = new Map();
    }

    addTransaction(sender, receiver, amount) {
        if (!this.adj.has(sender)) this.adj.set(sender, []);
        this.adj.get(sender).push({ to: receiver, amount });
    }

    // Detect Circular Transfers (Suspicious)
    findCycles(startNode) {
        const visited = new Set();
        const stack = new Set();
        const cycles = [];

        const dfs = (node, path) => {
            visited.add(node);
            stack.add(node);
            path.push(node);

            const neighbors = this.adj.get(node) || [];
            for (const { to } of neighbors) {
                if (stack.has(to)) {
                    cycles.push([...path, to]);
                } else if (!visited.has(to)) {
                    dfs(to, path);
                }
            }

            stack.delete(node);
            path.pop();
        };

        dfs(startNode, []);
        return cycles;
    }
}

// 4. GREEDY & DP FOR FORECASTING
const budgetOptimization = (income, budgets) => {
    // Greedy: Reduce highest spending luxury categories first
    const sorted = [...budgets].sort((a, b) => b.spent - a.spent);
    return sorted.map(b => ({
        ...b,
        recommendation: b.spent > b.limit ? `Reduce ${b.category} by ${Math.round((b.spent - b.limit) / b.spent * 100)}%` : 'On track'
    }));
};

const forecastSavings = (history) => {
    // DP: Simple spending prediction based on moving average
    // In complex DP we'd use states, here we'll simulate a 3-month forecast
    const avgSpend = history.reduce((a, b) => a + b, 0) / (history.length || 1);
    return [avgSpend, avgSpend * 0.95, avgSpend * 0.9]; // Predicting slight decrease
};

module.exports = {
    Trie,
    mergeSort,
    quickSort,
    TransactionGraph,
    budgetOptimization,
    forecastSavings
};
