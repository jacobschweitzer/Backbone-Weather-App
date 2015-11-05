<?php

$send_resume_to="_php_job@networxonline.com";

for ($x=1; $x<5; $x++){
$send_resume_to = $x . $send_resume_to;
}

$send_resume_to = substr($send_resume_to,1);
echo $send_resume_to;

?>