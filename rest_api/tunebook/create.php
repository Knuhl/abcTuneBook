<?php
// required headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
 
// get database connection
include_once '../config/database.php';
 
// instantiate tunebook object
include_once 'tunebook.php';
 
// get posted data
$data = json_decode(file_get_contents("php://input"));
 
// make sure data is not empty
if (
    !empty($data->title) &&
    !empty($data->abc)
){

    $database = new Database();
    $db = $database->getConnection();

    $tunebook = new Tunebook($db);

    // set property values
    $tunebook->title = $data->title;
    $tunebook->abc = $data->abc;
    // $tunebook->created = date('Y-m-d H:i:s');
 
    // create the tunebook
    $id = $tunebook->create();
    if ($id >= 0) {
 
        // set response code - 201 created
        http_response_code(201);
 
        // tell the user
        echo json_encode(array("message" => "Tunebook was created.", "id" => $id));
    }
 
    // if unable to create the tunebook, tell the user
    else {
 
        // set response code - 503 service unavailable
        http_response_code(503);
 
        // tell the user
        echo json_encode(array("message" => "Unable to create tunebook."));
    }
}
 
// tell the user data is incomplete
else {
 
    // set response code - 400 bad request
    http_response_code(400);
 
    // tell the user
    echo json_encode(array("message" => "Unable to create tunebook. Data is incomplete."));
}
?>