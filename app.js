const express = require('express');
const app = express();
const cors = require('cors');
const mysql = require('mysql2');
const path = require('path');
const corsOptions = {
  origin:"http://localhost:3000",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.static(path.join(__dirname + "/public")))

const con = mysql.createConnection({
    host: 'sql6.freesqldatabase.com',
    user: 'sql6681271',
    password: '4m27VyfWdV',
    database: 'sql6681271'
});

con.connect((err) => {
    if (err)
        console.log("Error occured", err);
    else
        console.log("connected with database");
});

app.post("/login", (req, res) => {
    const q = "SELECT admin FROM directors WHERE email= ? and pass = ?";
    con.query(q, [req.body.email, req.body.password], (err, result) => {
        if (err) throw err
        return (result.length > 0) ? res.json("success") : res.json("failed")
    })

})

app.get("/directors", (req, res) => {
    con.query("SELECT * FROM directors where designation != 'ceo'", (err, result) => {
        if (err) throw err
        return res.json(result)
    })
});
app.get("/directors/:email", (req, res) => {
    const email = req.params.email
    con.query(`SELECT admin, designation FROM directors where email = '${email}'`, (err, result) => {
        if (err) throw err
        return res.json(result)
    })
});

app.post("/directors", (req, res) => {
    const q = "INSERT INTO directors (firstname, lastname, designation, email, pass) VALUES (?)";
    const values = [
        req.body.fname,
        req.body.lname,
        req.body.des,
        req.body.email,
        req.body.password
    ]
    con.query(q, [values], (err) => {
        if (err) throw err
        res.json("visible")
    })
});

app.delete("/directors/:DirectorID", (req, res) => {
    const id = req.params.DirectorID

    const q = "DELETE FROM directors WHERE DirectorID = ?";

    con.query(q, [id], (err) => {
        if (err) throw err;
        return res.json("Deleted")
    })
});
app.put("/directors/:DirectorID", (req, res) => {
    const id = req.params.DirectorID
    const q = `update directors set admin = case when admin =1 then 0 else 1 end where DirectorID = ${id}`;
    con.query(q, (err, result) => {
        if (err) throw err
        return res.json("done")
    })
});

app.put("/directors/:DirectorID", (req, res) => {
    const id = req.params.DirectorID

    const q = "UPDATE directors SET `firstname` = ?, `lastname` = ?, `designation` = ?, `email` = ?, `pass` = ? WHERE DirectorID = ?";

    const values = [
        req.body.fname,
        req.body.lname,
        req.body.des,
        req.body.email,
        req.body.password
    ]

    con.query(q, [...values, parseInt(id)], (err) => {
        if (err) throw err;
        return res.json("Updated")
    })
});
app.post("/requests", (req, res) => {
    const q = "INSERT INTO requests (amount, des, slip, date, time, user) VALUES (?)";
    const time = new Date().getHours() + ":" + new Date().getMinutes() + ":" + new Date().getSeconds();
    const date = new Date().toISOString().slice(0, 10)

    const values = [
        req.body.amount,
        req.body.desc,
        req.body.payslip,
        date,
        time,
        req.body.user,
    ]
    // console.log(values)
    con.query(q, [values], (err) => {
        if (err) throw err
        res.json("visible")
    })
});

app.get("/requests", (req, res) => {
    con.query('SELECT * FROM requests', (err, result) => {
        if (err) throw err
        // console.log(result)
        return res.json(result)
    })
});

app.delete("/requests/:RequestID", (req, res) => {
    const time = new Date().getHours() + ":" + new Date().getMinutes() + ":" + new Date().getSeconds();
    const date = new Date().toISOString().slice(0, 10)
    const id = req.params.RequestID;
    const name = req.body.name
    if (name === undefined) {
        return res.json("failed");
        res.end()
    }
    else {
        const qu = `INSERT INTO approved(amount, des, user, date, time, approved) VALUES ((SELECT amount from requests WHERE RequestID =${id}), (SELECT des from requests WHERE RequestID =${id}), (select user from requests WHERE RequestID =${id} ), '${date}', '${time}', '${name}')`
        con.query(qu)
        const q = "DELETE FROM requests WHERE RequestID = ?";
        con.query(q, [id], (err) => {
            if (err) throw err;
            return res.json("Deleted")
        })
    }
});
app.get("/approved", (req, res) => {
    con.query('SELECT * FROM approved', (err, result) => {
        if (err) throw err
        console.log(result)
        return res.json(result)
    })
});

app.listen(5500, () => {
    console.log('started')
});

module.exports = con

