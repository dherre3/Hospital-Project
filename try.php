<?php
require('/Applications/MAMP/htdocs/vendor/ktamas77/firebase-php/autoload.php');
$user = 'root';
$password = 'root';
$db = 'Patients';
$socket = 'localhost:/Applications/MAMP/tmp/mysql/mysql.sock';

$link = mysql_connect(
   $socket, 
   $user, 
   $password
);
$db_selected = mysql_select_db(
   $db, 
   $link
);
const DEFAULT_URL = 'https://blazing-inferno-1723.firebaseio.com/';
const DEFAULT_TOKEN = 'MqL0c8tKCtheLSYcygYNtGhU8Z2hULOFs9OKPdEp';
const DEFAULT_PATH = '/users';
$firebase = new \Firebase\FirebaseLib(DEFAULT_URL);
for ($i=2; $i < 4; $i++) {
	$userString="simplelogin:".(string)$i;
	$pathStringUser=DEFAULT_PATH."/".$userString."/fields";
	

	$value = $firebase->get($pathStringUser); 
	$arrayFirebaseResult=json_decode($value,true);
	//var_dump($value);
	$array=array();
	if($arrayFirebaseResult["logged"]==="true"){
		$result = mysql_query("SELECT FirstName, LastName, TelNum, Email FROM PatientInfo WHERE loginId='".$userString."'") or die("yeyey");

			while ($row = mysql_fetch_array($result, MYSQL_ASSOC)) {
	   		 	$array["FirstName"]=$row["FirstName"];
	   		 	$array["LastName"]=$row["LastName"];
		   		$array["TelNum"]=$row["TelNum"];
	   			$array["Email"]=$row["Email"];
	   			$firebase->update($pathStringUser, $array); 
			}
		mysql_free_result($result);
	}else{
		$array["logged"]="false";
		$firebase->set($pathStringUser,$array); 

	}


 
}


?>