const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Boomerangkuwanger',
  database: 'usercalories'
});

function calculateCalories(weight, height, age) {
   
    var BMR = 66 + (13.7 * weight) + (5 * height) - (6.8 * age);
    var calorie_intake = BMR * 1.55;
    return calorie_intake;
}

connection.connect(function(err) {
  if (err) throw err;
  console.log('Connected to MySQL server.');
  
  const app = express();
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  
  app.get('/', (req, res) => {
    res.json({"message": "Welcome to the calorie calculator!"});
  });
  
  app.post('/user', (req, res) => {
    try {
      var weight = req.body.weight;
      var height = req.body.height;
      var age = req.body.age;
      var calorie_intake = calculateCalories(weight, height, age);
      connection.beginTransaction(function(err) {
          if (err) { throw err; }
          connection.query('INSERT INTO user_info SET weight = ?, height = ?, age = ?', [weight, height, age], function(err, result) {
              if (err) { 
                  connection.rollback(function() {
                      throw err;
                  });
              }
              var sql = `INSERT INTO calorie_intake SET calorie_intake = ${calorie_intake}, user_id = ${result.insertId}`;
              connection.query(sql, function (err, result) {
                  if (err) { 
                      connection.rollback(function() {
                          throw err;
                      });
                  }
                  connection.commit(function(err) {
                      if (err) { 
                          connection.rollback(function() {
                              throw err;
                          });
                      }
                      console.log("Transaction complete");
                      res.json({"message": "User information added successfully!"});
                  });
              });
          });
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Error adding user information.' });
    }
  });
  
  app.listen(3000, () => {
    console.log("Server is running on port 3000");
  });
});


