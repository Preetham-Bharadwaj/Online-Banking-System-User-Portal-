const supabase = require('../config/supabase');
const { 
    Trie, 
    mergeSort, 
    TransactionGraph, 
    budgetOptimization, 
    forecastSavings 
} = require('../utils/algorithms');

/**
 * Service to handle algorithmic optimizations for the banking system
 * No longer requires external engine calls.
 */
const runOptimization = async (command, args = []) => {
    try {
        // 1. Fetch relevant data from Supabase
        const [
            { data: users },
            { data: transactions },
            { data: accounts },
            { data: budgets }
        ] = await Promise.all([
            supabase.from('users').select('*'),
            supabase.from('transactions').select('*').order('created_at', { ascending: false }).limit(1000),
            supabase.from('accounts').select('*'),
            supabase.from('budgets').select('*')
        ]);

        switch (command) {
            case 'autocomplete': {
                const query = (args[0] || '').toLowerCase();
                const trie = new Trie();
                users.forEach(u => {
                    if (u.upi_id) trie.insert(u.upi_id, { id: u.id, upi: u.upi_id, name: u.full_name });
                });
                return trie.search(query);
            }

            case 'sort': {
                // sort transactions by date descending using stable Merge Sort
                return mergeSort(transactions || [], (a, b) => {
                    return new Date(b.created_at) - new Date(a.created_at);
                });
            }

            case 'fraud': {
                const graph = new TransactionGraph();
                // Build graph from transactions
                const nameMap = {};
                users.forEach(u => {
                    nameMap[u.id] = u.full_name || u.upi_id || u.id;
                });

                transactions.forEach(tx => {
                    if (tx.sender_id && tx.receiver_id) {
                        graph.addTransaction(tx.sender_id, tx.receiver_id, tx.amount);
                    }
                });
                
                // Track detected cycles using normalized strings to avoid duplicates
                const foundCycles = new Set();
                const suspiciousCycles = [];
                const actors = new Set(transactions.map(t => t.sender_id).filter(Boolean));
                
                actors.forEach(userId => {
                    const cycles = graph.findCycles(userId);
                    cycles.forEach(cycle => {
                        // actualCycle is [A, B, C, A]
                        const lastNode = cycle[cycle.length - 1];
                        const firstEntry = cycle.indexOf(lastNode);
                        const nodes = cycle.slice(firstEntry, -1); // [A, B, C]
                        
                        if (nodes.length < 2) return;

                        // Normalize cycle: sort IDs to create a unique key for the set of participants
                        const canonicalKey = [...nodes].sort().join(','); 
                        if (!foundCycles.has(canonicalKey)) {
                            foundCycles.add(canonicalKey);
                            // Map IDs to Names for the UI
                            const nameCycle = nodes.map(id => nameMap[id] || id);
                            nameCycle.push(nameMap[lastNode] || lastNode); // Add name for the return path
                            suspiciousCycles.push(nameCycle);
                        }
                    });
                });
                return { suspicious_cycles: suspiciousCycles };
            }

            case 'analytics': {
                // Combine Greedy and DP for financial health
                const userBudgets = budgets || [];
                const optimization = budgetOptimization(0, userBudgets); // Recursive mapping
                
                // Simple DP forecast based on last 6 months
                const monthlySpending = transactions
                    .filter(tx => tx.transaction_type !== 'income')
                    .map(tx => Number(tx.amount || 0));
                
                const forecast = forecastSavings(monthlySpending.slice(-6));
                
                return {
                    budget_optimization: optimization,
                    spending_forecast: forecast,
                    insights: [
                        `Greedy Optimization: Found ${optimization.filter(o => o.recommendation !== 'On track').length} potential savings.`,
                        `DP Insight: Predicted spending for next month: ₹${Math.round(forecast[0]).toLocaleString()}`
                    ]
                };
            }

            default:
                return { message: "Unknown command executed successfully" };
        }
    } catch (error) {
        console.error(`Error in optimization service: ${error.message}`);
        throw error;
    }
};

module.exports = {
    runOptimization
};
