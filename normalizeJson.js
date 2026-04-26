const fs = require('fs');

const data = JSON.parse(fs.readFileSync('public/database.json', 'utf8'));

for (const [tableName, records] of Object.entries(data)) {
  if (!Array.isArray(records)) continue;

  const allKeys = new Set();
  
  // Step 1: Collect all keys for this table and identify data types
  const keyTypes = {};
  
  records.forEach(record => {
    Object.keys(record).forEach(key => {
      allKeys.add(key);
      if (record[key] !== null && record[key] !== undefined && record[key] !== "") {
        keyTypes[key] = typeof record[key];
      }
    });
  });

  // Step 2: Normalize all records
  records.forEach(record => {
    allKeys.forEach(key => {
      if (!(key in record)) {
        if (keyTypes[key] === 'string') record[key] = "";
        else if (keyTypes[key] === 'number') record[key] = 0;
        else if (keyTypes[key] === 'boolean') record[key] = false;
        else record[key] = null;
      }
    });
  });
}

fs.writeFileSync('public/database.json', JSON.stringify(data, null, 2));
console.log('Database normalization completed successfully.');
