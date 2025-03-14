import { AdEventType, InterstitialAd } from "react-native-google-mobile-ads";
import { BANNER_UNIT_ID } from "./constant";

export const getRandomId = (maxCount: number) => {
  const randomIndex = Math.floor(Math.random() * maxCount);
  return randomIndex;
};

function selectAdId() {
  const random = getRandomId(0);
  // const random = getRandomId(3);
  switch (random) {
    case 0:
      // return TestIds.INTERSTITIAL;
      return BANNER_UNIT_ID.INTERSTIAL;
    case 1:
      return BANNER_UNIT_ID.INTERSTIAL;
    case 2:
      return BANNER_UNIT_ID.INTERSTIAL;
  }
  // return TestIds.INTERSTITIAL;
  return BANNER_UNIT_ID.INTERSTIAL;
}

let interstitial: InterstitialAd | null = null;
export function initializeInterstitialAd(
  setAdClosed: (is: boolean | null) => void,
  isLoadedShow?: boolean
) {
  // alert("initializeInterstitialAd");
  const id = selectAdId();
  interstitial = InterstitialAd.createForAdRequest(id);

  interstitial.load();

  interstitial.addAdEventListener(AdEventType.LOADED, () => {
    console.log("Ad Loaded");
    if (isLoadedShow) {
      setAdClosed(null);
      interstitial!.show();
    }
  });

  interstitial.addAdEventListener(AdEventType.CLOSED, () => {
    console.log("Ad Closed");
    setAdClosed(true);
    interstitial?.load();
  });

  interstitial.addAdEventListener(AdEventType.ERROR, (error) => {
    console.error("Ad Load Error: ", error);
    // alert("Ad Load Error");
    setAdClosed(true);
    interstitial?.load();
  });
}

export async function showInterstitialAd(
  setAdClosed: (is: boolean | null) => void
) {
  if (interstitial?.loaded) {
    setAdClosed(false);
    interstitial.show();
  } else {
    initializeInterstitialAd(setAdClosed, true);
  }
}
