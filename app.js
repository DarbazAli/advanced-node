const epxress = require('express');

const app = epxress();

app.listen(3000, () => console.log("Listenting on 3000"))

app.set('view engine', 'pug');
app.set('views', 'views');

app.get('/', (req, res) => res.render("index"))