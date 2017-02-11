'use strict';

rapidApp.controller('osaamiseniCtrl',
['$scope', '$http', '$sanitize', 'VIRTAService', 'KoodistoService',
function($scope,$http,$sanitize,VIRTA,Koodisto)
{
  //
  // PRIVAATIT FUNKTIOT
  //

  /**
  * makeSuoritusNimi
  * - tehdään VIRTA-datan Opintosuoritus.Nimi -tiedosta yhdenmukainen kieliversioitu Nimi-objekti
  * - JSON tulkkaus XML:stä johtaa välillä Array-muuttujaan ja välillä ei. Tämä funktio huolehtii tästä.
  */
  var makeSuoritusNimi = function(nimiObj) {
    var ret = [];
    if (angular.isArray(nimiObj)) {
      angular.forEach(nimiObj, function(nobj,nkey){
        if(nobj.kieli){
          ret[nobj.kieli] = nobj['_'];
        } else { // oletus fi
          ret['fi'] = nobj['_'];
        }
      });
    } else {
      if(nimiObj.kieli){
        ret[nimiObj.kieli] = nimiObj['_'];
      } else { // oletus fi
        ret['fi'] = nimiObj['_'];
      }
    }
    return ret;
  }

  /**
  * getKiinnitetty
  * - onko suoritus kiinnitetty tutkintoon vai ei (true/false)?
  */
  let getKiinnitetty = function(avain,inpath) {
    let ret = false;
    /*
    angular.forEach(kaikkidata.Virta.Opiskelija, function(p,pkey){
      angular.forEach(p.Opintosuoritukset.Opintosuoritus, function(s,skey){
        if(s.Laji=='1'){
          angular.forEach(s.Sisaltyvyys, function(ss,sskey){
            if(ss.sisaltyvaOpintosuoritusAvain==avain){
              console.log("makeSuoritusObj kiinnitetty "+obj.avain+" < "+s.avain)
              ret = true;
            } else {
              ret = getKiinnitetty(ss,avain);
            }
          });
        }
      });
    });
    */
    return ret;
  }
  
  /**
  * makeSuoritusObj
  * - tee yhden opintosuorituksen objekti ja palauta se
  */
  var makeSuoritusObj = function(sobj) {
    var obj = {}
    obj.avain = sobj.avain;
    obj.opiskeluoikeusavain = sobj.opiskeluoikeusAvain;
    obj.Laji = sobj.Laji;
    obj.SuoritusPvm = new Date(sobj.SuoritusPvm);
    obj.Laajuus = sobj.Laajuus;
    obj.Laajuus.Opintopiste = parseFloat(obj.Laajuus.Opintopiste).toFixed(1).replace(".",",");
    obj.Nimi = makeSuoritusNimi(sobj.Nimi);
    obj.Sisaltyvyys = [];
    if(sobj.Sisaltyvyys){
      angular.forEach(sobj.Sisaltyvyys, function(ss,sskey){
        obj.Sisaltyvyys.push(ss.sisaltyvaOpintosuoritusAvain);
      });
    }
    obj.Kiinnitetty = true; //getKiinnitetty(obj.avain);
    obj.MyontajaKoodi = sobj.Myontaja;
    Koodisto.callKoodisto($http,'oppilaitosnumero',sobj.Myontaja).success(function(data) {
      obj.Myontaja = Koodisto.getKoodiSeliteObj(data);
    });
    obj.koulutusmoduulitunniste=sobj.koulutusmoduulitunniste;
    obj.nodes = [];
    return obj;
  }

  /**
  * getOpintosuoritusObj
  * - Hae Opintosuoritus.avain tiedon perusteella ja
  * - Tee yksi toivomamme näköinen Opintosuoritus-objekti saadusta VIRTA-datan
  *   Opintosuoritus-elementistä, joka on muutettu myös XML -> JSON.
  */
  var getOpintosuoritusObj = function(avain) {
    var obj = {};
    angular.forEach(kaikkidata.Virta.Opiskelija, function(pobj,pkey){
      angular.forEach(pobj.Opintosuoritukset.Opintosuoritus, function(sobj,skey){
        //if (sobj.Myontaja==organisaatio) {
          if(sobj.avain==avain){
            //console.log("Opintosuoritus.avain="+sobj.avain+" laji="+sobj.Laji);
            obj = makeSuoritusObj(sobj);
          }
        //}
      });
    });
    return obj;
  }
  var populateSuoritustree = function() {
    angular.forEach(kaikkidata.Virta.Opiskelija, function(pobj,pkey){
      angular.forEach(pobj.Opintosuoritukset.Opintosuoritus, function(sobj,skey){
        //if (sobj.Myontaja==organisaatio) {
          if(sobj.Laji=="1"){
            var obj = makeSuoritusObj(sobj);
            $scope.suoritustree.push(obj);
          }
        //}
      });
    });
    // kokonaisuudet
    for(var i=0; i<$scope.suoritustree.length; i++){
      for(var j=0; j<$scope.suoritustree[i].Sisaltyvyys.length; j++){
        var obj = getOpintosuoritusObj($scope.suoritustree[i].Sisaltyvyys[j]);
        $scope.suoritustree[i].nodes.push(obj);
      }
      // suoritukset
      for(var k=0; k<$scope.suoritustree[i].nodes.length; k++){
        for(var l=0; l<$scope.suoritustree[i].nodes[k].Sisaltyvyys.length; l++){
          var obj = getOpintosuoritusObj($scope.suoritustree[i].nodes[k].Sisaltyvyys[l]);
          $scope.suoritustree[i].nodes[k].nodes.push(obj);
        }
      }
    }
  }

  //
  // SCOPE FUNKTIOT
  //
  $scope.useOpiskeluoikeus = function(avain) {
    console.log("useOpiskeluoikeus "+avain);
    //if(!avain) return;
    $scope.tutkinnot = [];
    $scope.kokonaisuudet = [];
    $scope.opintosuoritukset = [];
    angular.forEach(kaikkidata.Virta.Opiskelija, function(pobj,pkey){
      angular.forEach(pobj.Opintosuoritukset.Opintosuoritus, function(sobj,skey){
        //if (sobj.Myontaja==organisaatio) {
          //console.log("Opintosuoritus.avain="+sobj.avain+" laji="+sobj.Laji);
          var obj = makeSuoritusObj(sobj);
          if(!avain || avain==sobj.opiskeluoikeusAvain){
            if(sobj.Laji=="1"){
              $scope.tutkinnot.push(obj);
            }
            if(sobj.Laji=="2"){
              if(sobj.Sisaltyvyys){
                $scope.kokonaisuudet.push(obj);
              } else {
                $scope.opintosuoritukset.push(obj);
              }
            }
          }
        //}
      });
    });
  }

  $scope.useTutkinto = function(avain) {
    var obj = [];
    for(var i=0; i<$scope.suoritustree.length; i++){
      if($scope.suoritustree[i].avain==avain){
        obj=$scope.suoritustree[i].nodes;
      }
    }
    return obj;
  }

  //
  // ASETUKSET ja ALUSTUS
  //

  // Asetukset

  console.debug("config" + "\ndevelopmentmode: "+developmentmode + "\nlang: "+lang + "\ni18n: "+i18n +  "\nbaseuri: "+baseuri +  "\nosaamiseniuri: "+osaamiseniuri);
  $scope.lang = lang;
  $scope.i18n = i18n;
  $scope.osaamiseniuri = osaamiseniuri;

  // autentokoitu käyttäjä
  // - organisaatio: muuttujaa käytetään useassa paikassa!
  // - kansallinenOppijanumero ja henkilotunnus: muuttujia käytetään alla!
  $scope.oppilaitos = {
    koodi: organisaatio
  };
  $scope.opiskelija = {};

  // Alusta

  Koodisto.callKoodisto($http,'oppilaitosnumero',organisaatio).success(function(data) {
    $scope.oppilaitos.selite = Koodisto.getKoodiSeliteObj(data);
  });

  // säilötään virrasta saatu kaikkitiedot data
  var kaikkidata = null;

  $scope.opiskeluoikeudet = [];
  $scope.opiskeluoikeudet.push({Koulutus: {fi:'Ei valintaa',sv:'*SV*Ei valintaa',en:'Blank'}, koulutusmoduulitunniste: '--'});

  $scope.tutkinnot = [];
  $scope.kokonaisuudet = [];
  $scope.opintosuoritukset = [];
  $scope.patevyydet = [];

  $scope.suoritustree = [];

  // opiskelijan tiedot
  VIRTA.getOpiskelijanTiedot(kansallinenOppijanumero,henkilotunnus,organisaatio)
  .success(function(data) {
    console.debug(data);
    angular.forEach(data.Opiskelijat.Opiskelija, function(pobj,pkey){
      // lista, mutta vain yksi pitäisi olla; otetaan jokin
      $scope.opiskelija = pobj;
    });
  });
  // opiskelijan kaikki tiedot
  // parametrit virta-soap:lle: rajapinta, kansallinenOppijanumero, henkilotunnus, organisaatio
  VIRTA.getKaikki(kansallinenOppijanumero,henkilotunnus,organisaatio)
  .success(function(data) {
    console.debug(data);
    kaikkidata = data;
    angular.forEach(kaikkidata.Virta.Opiskelija, function(pobj,pkey){
      angular.forEach(pobj.Opiskeluoikeudet.Opiskeluoikeus, function(oobj,okey){
        if (oobj.Myontaja==organisaatio) {
          // tutkinto-opiskeluoikeustyyppi
          if(oobj.avain && ["1","2","3","4","5"].indexOf(oobj.Tyyppi)!==-1){
            var obj = {};
            obj.avain = oobj.avain;
            obj.Tyyppi = oobj.Tyyppi;
            obj.AlkuPvm = oobj.AlkuPvm;
            obj.LoppuPvm = oobj.LoppuPvm?oobj.LoppuPvm:"";
            angular.forEach(oobj.Jakso, function(jobj,jkey){
              if(!jobj.LoppuPvm || jobj.LoppuPvm==obj.LoppuPvm){
                obj.koulutusmoduulitunniste = jobj.koulutusmoduulitunniste;
                if(jobj.Koulutuskoodi){
                  obj.Koulutuskoodi = jobj.Koulutuskoodi;
                  Koodisto.callKoodisto($http,'koulutus',jobj.Koulutuskoodi).success(function(data) {
                    obj.Koulutus = Koodisto.getKoodiSeliteObj(data);
                  });
                  // vain ne joissa koulutuskoodi (ks alla)
                  $scope.opiskeluoikeudet.push(obj);
                }
              }
            });
            // jos kaikki tutkinto-oikeudet (ks yllä)
            //$scope.opiskeluoikeudet.push(obj);
          }
        }
      });
      //patevyyydet
      angular.forEach(pobj.Opintosuoritukset.Opintosuoritus, function(sobj,skey){
        //if (sobj.Myontaja==organisaatio) {
          angular.forEach(sobj.Patevyys, function(qobj,qkey){
            var obj = {};
            obj.Koodi = qobj;
            obj.SuoritusPvm = new Date(sobj.SuoritusPvm);
            Koodisto.callKoodisto($http,'virtapatevyys',qobj).success(function(data) {
              obj.Patevyys = Koodisto.getKoodiSeliteObj(data);
            });
            obj.MyontajaKoodi = sobj.Myontaja;
            Koodisto.callKoodisto($http,'oppilaitosnumero',sobj.Myontaja).success(function(data) {
              obj.Myontaja = Koodisto.getKoodiSeliteObj(data);
            });
            $scope.patevyydet.push(obj);
          });
        //}
      });
    });
    populateSuoritustree();
    $scope.useOpiskeluoikeus();
  });

}]);
