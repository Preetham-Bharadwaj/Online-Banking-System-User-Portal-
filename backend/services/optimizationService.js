const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const supabase = require('../config/supabase');

const ENGINE_PATH = path.join(__dirname, '../../optimization-engine');
const ENGINE_EXE = path.join(ENGINE_PATH, 'engine.exe');

const runOptimization = async (command, args = []) => {
    // 1. Fetch data from Supabase
    const { data: users } = await supabase.from('users').select('*');
    const { data: transactions } = await supabase.from('transactions').select('*');

    // 2. Write to data folder for C++ engine
    fs.writeFileSync(path.join(ENGINE_PATH, 'data/users.json'), JSON.stringify(users, null, 2));
    fs.writeFileSync(path.join(ENGINE_PATH, 'data/transactions.json'), JSON.stringify(transactions, null, 2));

    // 3. Execute C++ engine
    return new Promise((resolve, reject) => {
        const cmd = `${ENGINE_EXE} ${command} ${args.join(' ')}`;
        exec(cmd, { cwd: ENGINE_PATH }, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing engine: ${error}`);
                return reject(error);
            }
            
            // 4. Read result
            const resultFileMap = {
                'sort': 'sorted_transactions.json',
                'autocomplete': 'autocomplete_results.json',
                'fraud': 'fraud_results.json',
                'analytics': 'analytics_results.json'
            };

            const resultFile = resultFileMap[command];
            if (resultFile) {
                const resultPath = path.join(ENGINE_PATH, 'output', resultFile);
                if (fs.existsSync(resultPath)) {
                    const resultData = JSON.parse(fs.readFileSync(resultPath, 'utf8'));
                    return resolve(resultData);
                }
            }
            resolve({ message: 'Command executed successfully', stdout });
        });
    });
};

module.exports = {
    runOptimization
};
