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
        return $this->readQuery("SELECT t.id, t.title, t.abc FROM " . $this->table_name . " t WHERE t.id = " . $this->id . " ORDER BY t.id ASC");
    }

    private function readQuery($query)
    {
        // prepare query statement
        $stmt = $this->conn->prepare($query);
    
        // execute query
        $stmt->execute();
    
        return $stmt;
    }
}
?>