const epxress = require('express');

const app = epxress();

app.listen(3000, () => console.log("Listenting on 3000"))

app.get('/', (req, res) => res.send("Hello World"))