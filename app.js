'use strict';
console.clear();
const log = console.log;
const PORT = process.env.PORT || 3000

const express = require('express');

const app = express();

app.listen(PORT, log(`Server running on port ${PORT}`))