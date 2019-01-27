<?php
class Tunebook{
 
    // database connection and table name
    private $conn;
    private $table_name = "tunebooks";
 
    // object properties
    public $id;
    public $title;
    public $abc;
 
    // constructor with $db as database connection
    public function __construct($db){
        $this->conn = $db;
    }

    function readIdAndTitle()
    {
        return $this->readQuery("SELECT t.id, t.title FROM " . $this->table_name . " t ORDER BY t.id ASC");
    }

    function readOne()
    {
        return $this->readQuery("SELECT t.id, t.title, t.abc FROM " . $this->table_name . " t WHERE t.id = " . $this->id);
    }

    private function readQuery($query)
    {
        // prepare query statement
        $stmt = $this->conn->prepare($query);
    
        // execute query
        $stmt->execute();
    
        return $stmt;
    }

    function create(){
    
        // query to insert record
        $query = "INSERT INTO " . $this->table_name . " SET title=:title, abc=:abc";
    
        // prepare query
        $stmt = $this->conn->prepare($query);
    
        // sanitize
        $this->title=htmlspecialchars(strip_tags($this->title));
        $this->abc=htmlspecialchars(strip_tags($this->abc));
        //$this->created=htmlspecialchars(strip_tags($this->created));
    
        // bind values
        $stmt->bindParam(":title", $this->title);
        $stmt->bindParam(":abc", $this->abc);
        // $stmt->bindParam(":created", $this->created);
    
        // execute query
        if($stmt->execute()){
            $id = $this->conn->lastInsertId();
            return $id;
        }
    
        return -1;
        
    }

    function update(){
 
        // update query
        $query = "UPDATE " . $this->table_name . " SET title=:title, abc=:abc WHERE id=:id";
     
        // prepare query statement
        $stmt = $this->conn->prepare($query);
     
        // sanitize
        $this->title=htmlspecialchars(strip_tags($this->title));
        $this->abc=htmlspecialchars(strip_tags($this->abc));
        $this->id=htmlspecialchars(strip_tags($this->id));
     
        // bind new values
        $stmt->bindParam(':title', $this->title);
        $stmt->bindParam(':abc', $this->abc);
        $stmt->bindParam(':id', $this->id);
     
        // execute the query
        if($stmt->execute()){
            return true;
        }
     
        return false;
    }
}
?>