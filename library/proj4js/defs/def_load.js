
function wait_proj4js() {
	var ok = false;
// 201604 ïœçX start
/*
	if ( typeof Proj4js != "undefined" ) {
		if (typeof Proj4js.defs != "undefined" ) {
			ok = true;
		}
	}
*/
	if ( typeof proj4 != "undefined" ) {
		if (typeof proj4.defs != "undefined" ) {
			ok = true;
		}
	}
// 201604 ïœçX end
	if (ok) {
	//	proj4init_wgs84();
		proj4init_jgd2000();
		proj4init_tokyo();
	//	proj4init_google();
	} else {
		setTimeout(wait_proj4js,100);
	}
}
wait_proj4js();
