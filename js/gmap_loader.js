// Google Maps JavaScript API の読み込み
//
// ・Google 推奨の方式（loading=async + callback）で読み込む
// ・読み込みに失敗した場合（通信エラー、APIキー認証エラー、タイムアウト）は
//   ENABLE_GOOGLEMAPS を false にして、Google Maps なし（地理院タイル）で起動する
// ・地図の起動後に認証エラーになった場合は、Google Maps なしでページを読み直す
//
// 状態: "none"（未読込） / "loading"（読込中） / "ready"（利用可） / "failed"（利用不可）
var GMAP_STATE = "none";
var GMAP_LOAD_TIMEOUT = 10000;            // 読み込みを待つ上限（ミリ秒）
var GMAP_FAILED_KEY = "kujukuri_gmap_failed";
var GMAP_FAILED_TTL = 10 * 60 * 1000;     // 失敗を覚えておく時間（ミリ秒）

// Google Maps を使うかどうかが確定したか（起動処理はこれが true になるまで待つ）
function isGoogleMapsSettled() {
	return !ENABLE_GOOGLEMAPS || GMAP_STATE === "ready";
}

function googleMapsFailed(reason) {
	if (GMAP_STATE === "failed") return;
	console.warn("Google Maps API を読み込めませんでした（" + reason + "）。地理院タイルで表示します。");
	GMAP_STATE = "failed";
	ENABLE_GOOGLEMAPS = false;

	// すでに Google Maps で地図を作っている場合は、Google Maps なしで読み直す
	if (typeof app !== "undefined" && app.gmap) {
		try {
			sessionStorage.setItem(GMAP_FAILED_KEY, String(Date.now()));
		} catch (e) {}
		location.reload();
	}
}

function loadGoogleMaps(key, params) {
	if (!ENABLE_GOOGLEMAPS) return;

	// 直前に失敗していれば、しばらくは読み込まない（読み直しの繰り返しを防ぐ）
	try {
		var failedAt = Number(sessionStorage.getItem(GMAP_FAILED_KEY));
		if (failedAt && Date.now() - failedAt < GMAP_FAILED_TTL) {
			googleMapsFailed("直前の読み込みに失敗");
			return;
		}
		sessionStorage.removeItem(GMAP_FAILED_KEY);
	} catch (e) {}

	GMAP_STATE = "loading";

	// APIキーの認証エラー（キーの誤り、リファラ制限、請求設定など）
	window.gm_authFailure = function() {
		googleMapsFailed("APIキーの認証エラー");
	};

	// 読み込み完了時。使うライブラリを明示的に読み込んでから利用可にする
	window.onGoogleMapsLoaded = function() {
		Promise.all([
			google.maps.importLibrary("core"),
			google.maps.importLibrary("maps"),
			google.maps.importLibrary("geocoding")
		]).then(function() {
			if (GMAP_STATE === "loading") GMAP_STATE = "ready";
		}).catch(function(e) {
			googleMapsFailed("ライブラリの読み込みエラー: " + e);
		});
	};

	var query = {
		key: key,
		v: "weekly",
		loading: "async",
		libraries: "geometry",
		region: "JP",
		callback: "onGoogleMapsLoaded"
	};
	for (var k in (params || {})) query[k] = params[k];

	var append = function() {
		var script = document.createElement("script");
		script.src = "https://maps.googleapis.com/maps/api/js?" + new URLSearchParams(query).toString();
		script.async = true;
		script.onerror = function() {
			googleMapsFailed("通信エラー");
		};
		document.head.appendChild(script);

		setTimeout(function() {
			if (GMAP_STATE === "loading") googleMapsFailed("タイムアウト");
		}, GMAP_LOAD_TIMEOUT);
	};

	// ページの load 完了後に読み込む（Google 側が応答しない場合に load イベントが止まり、
	// 地図の起動処理が始まらなくなるのを防ぐ）
	if (document.readyState === "complete") {
		append();
	} else {
		window.addEventListener("load", append);
	}
}
