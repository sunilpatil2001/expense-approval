const express = require('express');
const app = express();
const cors = require('cors');
const mysql = require('mysql2');
const path = require('path');

app.use(cors())
app.use(express.json());
app.use(express.static(path.join(__dirname + "/public")))
app.use((req, res, next) => {
    res.setHeader(
      "Access-Control-Allow-Origin",
      "https://bucolic-pony-cc177a.netlify.app"
    );
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS,CONNECT,TRACE"
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-Content-Type-Options, Accept, X-Requested-With, Origin, Access-Control-Request-Method, Access-Control-Request-Headers"
    );
    res.setHeader("Access-Control-Allow-Credentials", true);
    res.setHeader("Access-Control-Allow-Private-Network", true);
    //  Firefox caps this at 24 hours (86400 seconds). Chromium (starting in v76) caps at 2 hours (7200 seconds). The default value is 5 seconds.
    res.setHeader("Access-Control-Max-Age", 7200);
  
    next();
  });

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

app.get("/", (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Max-Age", "1800");
    res.setHeader("Access-Control-Allow-Headers", "content-type");
    res.setHeader("Access-Control-Allow-Methods", "PUT, POST, GET, DELETE, PATCH, OPTIONS");
})

app.post("/login", (req, res) => {
    const q = "SELECT admin FROM Directors WHERE email= ? and pass = ?";
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
    const q = "INSERT INTO Directors (firstname, lastname, designation, email, pass) VALUES (?)";
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

    const q = "DELETE FROM Directors WHERE DirectorID = ?";

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

    const q = "UPDATE Directors SET `firstname` = ?, `lastname` = ?, `designation` = ?, `email` = ?, `pass` = ? WHERE DirectorID = ?";

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
    const q = "INSERT INTO Requests (amount, des, slip, date, time, user) VALUES (?)";
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
        const qu = `INSERT INTO Approved(amount, des, user, date, time, approved) VALUES ((SELECT amount from Requests WHERE RequestID =${id}), (SELECT des from Requests WHERE RequestID =${id}), (select user from Requests WHERE RequestID =${id} ), '${date}', '${time}', '${name}')`
        con.query(qu)
        const q = "DELETE FROM Requests WHERE RequestID = ?";
        con.query(q, [id], (err) => {
            if (err) throw err;
            return res.json("Deleted")
        })
    }
});
app.get("/approved", (req, res) => {
    con.query('SELECT * FROM Approved', (err, result) => {
        if (err) throw err
        console.log(result)
        return res.json(result)
    })
});

app.listen(5500, () => {
    console.log('started')
});

module.exports = con

