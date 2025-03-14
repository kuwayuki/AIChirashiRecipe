import {
  AdEventType,
  RewardedAdEventType,
  RewardedInterstitialAd,
  TestIds,
} from "react-native-google-mobile-ads";
import { BANNER_UNIT_ID } from "./constant";
import { sleep } from "./utils";

export const getRandomId = (maxCount: number) => {
  const randomIndex = Math.floor(Math.random() * maxCount);
  return randomIndex;
};

function selectAdId() {
  const random = getRandomId(0);
  // const random = getRandomId(3);
  switch (random) {
    case 0:
      // TODO: 後で直す
      return BANNER_UNIT_ID.REWARD_INTERSTIAL_1;
    // return TestIds.REWARDED_INTERSTITIAL;
    case 1:
      return BANNER_UNIT_ID.REWARD_INTERSTIAL_1;
    case 2:
      return BANNER_UNIT_ID.REWARD_INTERSTIAL_1;
  }
  // return TestIds.INTERSTITIAL;
  return BANNER_UNIT_ID.REWARD_INTERSTIAL_1;
}

let interstitial: RewardedInterstitialAd | null = null;

export function rewardInitializeInterstitialAd(
  setAdClosed: (is: boolean | null) => void,
  isLoadedShow?: boolean
) {
  // alert("initializeInterstitialAd");
  const id = selectAdId();
  interstitial = RewardedInterstitialAd.createForAdRequest(id);

  interstitial.load();
  // alert("load");

  // イベントリスナーの追加
  interstitial.addAdEventListener(RewardedAdEventType.LOADED, () => {
    console.log("Ad Loaded");
    if (isLoadedShow) {
      setAdClosed(null);
      interstitial!.show();
    }
    // alert("Ad Loaded");
  });

  interstitial.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
    console.log("Ad Rewarded");
    setAdClosed(true);
    interstitial?.load(); // 広告をリロード
  });

  interstitial.addAdEventListener(AdEventType.CLOSED, (error) => {
    console.error("Ad Load Closed: ", error);
    console.error(JSON.stringify(error, null, 2));
    setAdClosed(false);
    interstitial?.load(); // 広告をリロード
  });

  interstitial.addAdEventListener(AdEventType.ERROR, (error) => {
    console.error("Ad Load Error: ", error);
    setAdClosed(true);
    interstitial?.load(); // 広告をリロード
  });
}

/**
 * ロード済で即時抗告表示したい場合
 * @param setAdClosed
 */
export async function showRewardInterstitialAd(
  setAdClosed: (is: boolean | null) => void
) {
  if (interstitial?.loaded) {
    setAdClosed(null);
    interstitial!.show();
  } else {
    // 再読み込み&広告表示
    rewardInitializeInterstitialAd(setAdClosed, true);
  }
}

async function waitLoad(): Promise<boolean> {
  const start = Date.now();

  if (!interstitial?.loaded) interstitial?.load();
  // 読み込めてなかったら再ロード
  const loadTimeout = 20 * 1000; // 20 seconds
  while (true) {
    if (interstitial?.loaded) return true;

    await sleep(1000);
    if (Date.now() - start > loadTimeout) break;
  }
  return false;
}

// /**
//  * ロード済で即時抗告表示したい場合
//  * @param setAdClosed
//  */
// export async function showRewardInterstitialAd(
//   setAdClosed: (is: boolean) => void
// ) {
//   const isLoad = await waitLoad();
//   if (isLoad) {
//     setAdClosed(false);
//     isAdmobing = false;
//     isRewarded = false;
//     interstitial!.show();

//     const start = Date.now();
//     const timeout = 80 * 1000;
//     while (true) {
//       await sleep(1000);
//       if (isAdmobing || Date.now() - start > timeout) break;
//     }
//   } else {
//     rewardInitializeInterstitialAd(setAdClosed);
//   }
// }
