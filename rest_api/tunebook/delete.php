<?php
// required headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
 
// include database and object file
include_once '../config/database.php';
include_once 'tunebook.php';
 
// get database connection
$database = new Database();
$db = $database->getConnection();
 
// prepare tunebook object
$tunebook = new Tunebook($db);
 
// get tunebook id
$data = json_decode(file_get_contents("php://input"));
 
// set tunebook id to be deleted
$tunebook->id = $data->id;
 
// delete the tunebook
if($tunebook->delete()){
 
    // set response code - 200 ok
    http_response_code(200);
 
    // tell the user
    echo json_encode(array("message" => "Tunebook was deleted."));
}
 
// if unable to delete the tunebook
else{
 
    // set response code - 503 service unavailable
    http_response_code(503);
 
    // tell the user
    echo json_encode(array("message" => "Unable to delete tunebook."));
}
?>