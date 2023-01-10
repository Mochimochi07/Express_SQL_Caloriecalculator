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
  console.log('You are now connected to MySQL server.');
  
  const app = express();
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  
  app.get('/', (req, res) => {
    res.json({"message": "Welcome to the calorie calculator"});
  });
  
  app.post('/user', (req, res) => {
    try {
      var weight = req.body.weight;
      var height = req.body.height;
      var age = req.body.age;
      var calorie_intake = calculateCalories(weight, height, age);
   
      var sql = `INSERT INTO user_info (weight, height, age, calorie_intake) VALUES (${weight}, ${height}, ${age}, ${calorie_intake})`;
      connection.query(sql, function (err, result) {
          if (err) throw err;
          res.json({"message": "User information added successfully!"});
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Error upon getting user information. Please try again.' });
    }
  });
  
  app.get('/user/:id', (req, res) => {
    try {
      var id = req.params.id;
      var sql = `SELECT calorie_intake FROM user_info WHERE id = ${id}`;
      connection.query(sql, function (err, result) {
          if (err) throw err;
          res.json(result);
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Error upon getting user information. Please try again.' });
    }
  });
  
  app.listen(3000, () => {
    console.log("Server is running on port 3000. Please use Localhost:3000");
  });
});

