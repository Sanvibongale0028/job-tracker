const { Pool } = require('pg'); 
require('dotenv').config();  

// manages multiple DB connections efficiently
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl:  {
        rejectUnauthorized: false
    }
});

pool.connect((err, client, release) => {
    if(err)  {
        console.error("Database connection failed:", err.message);
    }
    else  {
        console.log("Database connected successfully!");
    }
});

module.exports = pool;