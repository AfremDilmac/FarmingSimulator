<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Max-Age: 1000');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

define ('INDEX', true);
// --- Step 0 : connect to db
require 'inc/dbcon.php';
require 'inc/base.php';
// PRODUCTENadd
// --- Voeg een product toe  

$add = $conn->prepare("INSERT INTO gebruikers (NAME, PW) VALUES (?,?)");

if (!$add){
    //oeps, probleem met prepared statement!
    $response['code'] = 7;
    $response['status'] = 200; // 'ok' status, anders een bad request ...
    $response['data'] = $conn->error;
    deliver_response($response);
}

if(!$add->bind_param("ss", $postvars['NAME'], $postvars['PW'])){
    // binden van de parameters is mislukt
    $response['code'] = 7;
    $response['status'] = 200; // 'ok' status, anders een bad request ...
    $response['data'] = $conn->error;
    deliver_response($response);
}

if (!$add->execute()) {
    // het uitvoeren van het statement zelf mislukte
    $response['code'] = 7;
    $response['status'] = $api_response_code[$response['code']]['HTTP Response'];
    $response['data'] = $conn->error;
    deliver_response($response);
}

if($add->affected_rows == 0){
    //niets toegevoegd
    $response['code'] = 7;
    $response['status'] = $api_response_code[$response['code']]['HTTP Response'];
    $response['data'] = 'geen rij toegevoegd';
    deliver_response($response);
}

$response['code'] = 1;
$response['status'] = $api_response_code[$response['code']]['HTTP Response'];
$response['data'] = 'rij toegevoegd';

// sluit de connectie met de databank
$conn->close();
// Return Response to browser
deliver_JSONresponse($response);
?>