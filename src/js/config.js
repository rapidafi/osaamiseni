'use strict';

let developmentmode=false;
let lang='fi';
let baseuri=location.origin;
let osaamiseniuri=baseuri+'';

let opintopolkuuri = "https://koodistopalvelu.fi/opintopolku.php?type=json";

if (location.hostname=='127.0.0.1' || location.hostname=='localhost') {
  console.log("@localhost: developing")
  console.debug(location)
  developmentmode=true;
}
