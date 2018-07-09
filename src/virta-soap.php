<?php
ini_set('display_errors', 'On');
error_reporting(E_ALL);

define("ws_virta","http://virtawstesti.csc.fi/luku/opiskelijatiedot.wsdl");

$virta = new SoapClient(ws_virta, array("trace"=>1));

// parametrit / argumentit
$p_rajapinta = "OpiskelijanKaikkiTiedot";
$p_kansallinenOppijanumero = null;
$p_henkilotunnus = null;
$p_organisaatio = null;
if ($_GET) {
    if(isset($_GET['rajapinta'])) {
        $p_rajapinta = $_GET['rajapinta'];
        if ($p_rajapinta == '') { $p_rajapinta = "OpiskelijanKaikkiTiedot"; }
    }
    if(isset($_GET['kansallinenOppijanumero'])) {
        $p_kansallinenOppijanumero = $_GET['kansallinenOppijanumero'];
        if ($p_kansallinenOppijanumero == '') { $p_kansallinenOppijanumero = null; }
    }
    if(isset($_GET['henkilotunnus'])) {
        $p_henkilotunnus = $_GET['henkilotunnus'];
        if ($p_henkilotunnus == '') { $p_henkilotunnus = null; }
    }
    if(isset($_GET['organisaatio'])) {
        $p_organisaatio = $_GET['organisaatio'];
        if ($p_organisaatio == '') { $p_organisaatio = null; }
    }
}

// jos parametrit annettu, suoritetaan ws soap-haku
$Kutsuja = array(
        'jarjestelma'=>'virtawstesti',
        'tunnus'=>'virta.php',
        'avain'=>'salaisuus'
);

// valitse oppijaid tai hetu
// organisaatio menee aina, jos annettu
if (isset($p_kansallinenOppijanumero) || isset($p_henkilotunnus)) {
  if (isset($p_kansallinenOppijanumero)) {
    $Hakuehdot = array(
      'kansallinenOppijanumero' => $p_kansallinenOppijanumero,
      'organisaatio' => $p_organisaatio
    );
  } elseif (isset($p_henkilotunnus)) {
    $Hakuehdot = array(
      'henkilotunnus' => $p_henkilotunnus,
      'organisaatio' => $p_organisaatio
    );
  }
  switch ($p_rajapinta) {
    case "OpiskelijanTiedot":
      $result = $virta->OpiskelijanTiedot(array("Kutsuja"=>$Kutsuja,"Hakuehdot"=>$Hakuehdot));
      break;
    case "Opiskeluoikeudet":
      $result = $virta->Opiskeluoikeudet(array("Kutsuja"=>$Kutsuja,"Hakuehdot"=>$Hakuehdot));
      break;
    case "LukukausiIlmoittautumiset":
      $result = $virta->LukukausiIlmoittautumiset(array("Kutsuja"=>$Kutsuja,"Hakuehdot"=>$Hakuehdot));
      break;
    case "Opintosuoritukset":
      $result = $virta->Opintosuoritukset(array("Kutsuja"=>$Kutsuja,"Hakuehdot"=>$Hakuehdot));
      break;
    case "Tutkinnot":
      $result = $virta->Tutkinnot(array("Kutsuja"=>$Kutsuja,"Hakuehdot"=>$Hakuehdot));
      break;
    default:
      $result = $virta->OpiskelijanKaikkiTiedot(array("Kutsuja"=>$Kutsuja,"Hakuehdot"=>$Hakuehdot));
      break;
  }
  //print_r($result);
  $json = json_encode($result);
  print_r($json);
}
?>
