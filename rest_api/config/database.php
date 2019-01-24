<?php

// https://www.codeofaninja.com/2017/02/create-simple-rest-api-in-php.html
// path to your db.php
include_once '../../../db.php';

class Database{
    public $conn;
 
    // get the database connection
    public function getConnection(){
 
        $this->conn = null;
 
        try{
            $settings = new DbSettings();
            
            $this->conn = new PDO("mysql:host=" . $settings->host . ";dbname=" . $settings->db_name, $settings->username, $settings->password);
            $this->conn->exec("set names utf8");
        }catch(PDOException $exception){
            echo "Connection error: " . $exception->getMessage();
        }
 
        return $this->conn;
    }
}
?>