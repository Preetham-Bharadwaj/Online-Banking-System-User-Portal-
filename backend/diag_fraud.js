const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../OBS-Admin/.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTransactions() {
    const { data: transactions, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

    if (error) {
        console.error('Error fetching transactions:', error);
        return;
    }

    console.log('Recent Transactions:');
    transactions.forEach(tx => {
        console.log(`ID: ${tx.id}, Ref: ${tx.transaction_id}, Sender: ${tx.sender_id}, Receiver: ${tx.receiver_id}, Amount: ${tx.amount}, Status: ${tx.status}, Type: ${tx.payment_type}`);
    });

    const { TransactionGraph } = require('./utils/algorithms');
    const graph = new TransactionGraph();
    transactions.forEach(tx => {
        if (tx.sender_id && tx.receiver_id) {
            graph.addTransaction(tx.sender_id, tx.receiver_id, tx.amount);
        }
    });

    const actors = new Set(transactions.map(t => t.sender_id).filter(Boolean));
    console.log('\nActors:', Array.from(actors));
    
    actors.forEach(userId => {
        const cycles = graph.findCycles(userId);
        if (cycles.length > 0) {
            console.log(`Cycles for ${userId}:`, JSON.stringify(cycles));
        } else {
            console.log(`No cycles for ${userId}`);
        }
    });
}

checkTransactions();
