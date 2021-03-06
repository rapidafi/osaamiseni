'use strict';

let rapidApp = angular.module('rapidApp', ['ngSanitize', 'ui.select'])

rapidApp.service('VIRTAService', ['$http', function($http) {

  this.getKaikki = function(kansallinenOppijanumero,henkilotunnus,organisaatio) {
    if (!(kansallinenOppijanumero || henkilotunnus)) {
      return;
    }
    if (kansallinenOppijanumero) {
      return $http
      //.get(osaamiseniuri+'/virta-pg-soap.php?rajapinta=OpiskelijanKaikkiTiedot&kansallinenOppijanumero='+kansallinenOppijanumero+"&organisaatio="+organisaatio)
      .get('demo/virta-koskinen-kaikki.json');
    } else if (henkilotunnus) {
      return $http
      //.get(osaamiseniuri+'/virta-pg-soap.php?rajapinta=OpiskelijanKaikkiTiedot&henkilotunnus='+henkilotunnus+"&organisaatio="+organisaatio)
      .get('demo/virta-koskinen-kaikki.json');
    }
  }

  this.getOpiskelijanTiedot = function(kansallinenOppijanumero,henkilotunnus,organisaatio) {
    if (!(kansallinenOppijanumero || henkilotunnus) && !organisaatio) {
      return;
    }
    if (kansallinenOppijanumero) {
      return $http
      //.get(osaamiseniuri+'/virta-pg-soap.php?rajapinta=OpiskelijanTiedot&kansallinenOppijanumero='+kansallinenOppijanumero+"&organisaatio="+organisaatio)
      .get('demo/virta-koskinen-opiskelija-01901.json');
    } else if (henkilotunnus) {
      return $http
      //.get(osaamiseniuri+'/virta-pg-soap.php?rajapinta=OpiskelijanTiedot&henkilotunnus='+henkilotunnus+"&organisaatio="+oppilaitos)
      .get('demo/virta-koskinen-opiskelija-01901.json');
    }
  }
}]);

rapidApp.service('KoodistoService', ['$http', function($http) {
  this.callcache = {};
  // palauta http-kutsu, jonka success-funktiosta voi ottaa datan
  this.callKoodisto = function($http,koodisto,arvo) {
    if(!koodisto) return;
    if(!arvo) return;
    //console.debug(this.callcache);
    if(koodisto in this.callcache){
      if(arvo in this.callcache[koodisto]){
        return this.callcache[koodisto][arvo];
      }
    } else {
      this.callcache[koodisto] = {};
    }
    console.log("callKoodisto: "+koodisto+" "+arvo);
    this.callcache[koodisto][arvo] = {};
    this.callcache[koodisto][arvo] = $http.get(opintopolkuuri+"&codeset="+koodisto+"&code="+arvo);
    return this.callcache[koodisto][arvo];
  }
  // palauta metadatan nimi-tiedot (selitteet) callKoodisto-funktion success data-objektista
  this.getKoodiSeliteObj = function(data) {
    if (angular.isArray(data)) data = data[0]; // unarray
    var selite = {};
    selite['fi'] = getLanguageSpecificValueOrValidValue(data.metadata,"nimi","FI");
    selite['sv'] = getLanguageSpecificValueOrValidValue(data.metadata,"nimi","SV");
    selite['en'] = getLanguageSpecificValueOrValidValue(data.metadata,"nimi","EN");
    //console.log("getKoodiSeliteObj: "+selite.fi);
    return selite;
  }

}]);
