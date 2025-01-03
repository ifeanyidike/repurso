import { FabricObject } from "fabric";
import AnimationEffect from "../service/AnimationEffect";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";
import { stores } from "../store/Stores";
import { ElementTypes } from "../types/properties";
import { Audio, Store } from "../types/editor";
import { EditorStore } from "../store/EditorStore";
import {
  db,
  EditorStoreData,
  SerializedEditorStore,
  StringifiedEditorStoreData,
} from "../store/db";

export function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

export const twoDigitFormatter = new Intl.NumberFormat("en-US", {
  style: "decimal",
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
});

export const SRT = `0
00:00:00,009 --> 00:00:02,930
I feel like I'm one of the lucky ones because of breast cancer.

1
00:00:03,059 --> 00:00:05,519
They found my ovarian cancer diagnosis early.

2
00:00:05,530 --> 00:00:09,270
Otherwise I was asymptomatic, wouldn't have found it until it was, you know,

3
00:00:09,279 --> 00:00:10,029
much too late.

4
00:00:10,039 --> 00:00:10,880
My name is Jan.

5
00:00:10,970 --> 00:00:14,119
My role with the Canadian Cancer Society is as

6
00:00:14,130 --> 00:00:17,510
a site moderator for our peer support community.

7
00:00:17,520 --> 00:00:20,510
I am a patient advocate as well and I participated

8
00:00:20,520 --> 00:00:24,309
on the research um panel for the Canadian Cancer Society.

9
00:00:24,319 --> 00:00:26,829
I retired in October

10
00:00:26,934 --> 00:00:30,354
2018 after 30 years of working in health care.

11
00:00:30,364 --> 00:00:34,215
So I was really looking forward to retirement and going cruising

12
00:00:34,224 --> 00:00:38,064
and getting into my sewing room and doing quilting in January.

13
00:00:38,075 --> 00:00:42,235
I went for my screening mammogram and my breast cancer was found at that time.

14
00:00:42,244 --> 00:00:43,705
So I really didn't have a lot of time

15
00:00:43,715 --> 00:00:46,625
for when I retired until my breast cancer diagnosis.

16
00:00:46,735 --> 00:00:50,604
It was a shock to me because I've been having mammograms since I was 40

17
00:00:52,294 --> 00:00:53,794
they've always been negative. So,

18
00:00:54,000 --> 00:00:55,659
um that was quite a shock for me.

19
00:00:55,860 --> 00:01:00,180
Um I didn't want to tell my family like other than my husband or my friends

20
00:01:00,189 --> 00:01:04,419
because I didn't really want them to worry until I knew kind of what was happening.

21
00:01:04,980 --> 00:01:09,620
So it was very anxiety provoking. I've never had anxiety like that before in my life.

22
00:01:09,629 --> 00:01:13,620
Um Once I got to the point where I was seeing the surgeon,

23
00:01:14,059 --> 00:01:18,959
um and we had a treatment plan in place then that anxiety lessened a lot for me.

24
00:01:18,970 --> 00:01:23,199
I came across the Canadian Cancer Society, um Cancer connection,

25
00:01:23,209 --> 00:01:25,309
peer support community just

26
00:01:26,069 --> 00:01:28,330
just by chance when I was doing a web search.

27
00:01:28,669 --> 00:01:32,010
Um so I joined because I felt I really needed the peer support.

28
00:01:32,019 --> 00:01:37,410
What I found there was unbelievable. Um People got it.

29
00:01:37,419 --> 00:01:39,480
People understood where you're coming from,

30
00:01:40,230 --> 00:01:44,260
even though I had great support at home and with my friends and family,

31
00:01:44,569 --> 00:01:46,690
they don't get it because they haven't been through it.

32
00:01:47,230 --> 00:01:52,089
As I participated in that community, I was then asked to become a community mentor.

33
00:01:52,099 --> 00:01:53,510
I took on that role.

34
00:01:53,569 --> 00:01:55,360
And that's how I got involved with the

35
00:01:55,370 --> 00:01:58,410
Canadian Cancer Society when I joined the community.

36
00:01:58,419 --> 00:02:01,400
One of the things that I really felt strongly about was that I

37
00:02:01,410 --> 00:02:04,849
didn't want anybody to ever feel alone because you can feel so alone.

38
00:02:04,860 --> 00:02:07,050
That was kind of the guiding principle for me.

39
00:02:07,059 --> 00:02:09,570
I just wanted everybody to feel supported.

40
00:02:09,788 --> 00:02:12,889
I think it helped my mental health too because it helped me

41
00:02:12,899 --> 00:02:15,770
deal a lot with what was happening to me at the time.

42
00:02:15,779 --> 00:02:19,460
And I think the community itself is hopeful, the people that are there.

43
00:02:19,470 --> 00:02:22,470
That's what cancer patients want, they want a sense of hope, right?

44
00:02:22,479 --> 00:02:24,929
They allow us to talk the real talk too.

45
00:02:25,220 --> 00:02:25,740
But

46
00:02:26,050 --> 00:02:27,339
I think at the end of the day,

47
00:02:27,350 --> 00:02:30,610
it's a hope that keeps people going through their treatment

48
00:02:30,910 --> 00:02:32,649
because it can be pretty grueling.

49
00:02:32,660 --> 00:02:37,240
There was a woman who had been diagnosed with breast cancer and they

50
00:02:37,250 --> 00:02:41,130
had also discovered that they had found a mass on her ovary.

51
00:02:41,139 --> 00:02:45,250
So like me in a very short time after her breast cancer diagnosis,

52
00:02:45,259 --> 00:02:47,500
she was also diagnosed with ovarian cancer.

53
00:02:47,669 --> 00:02:52,050
So we made quite AAA bond because we were going through the same things.

54
00:02:52,059 --> 00:02:55,839
I felt that we both really understood each other really well.

55
00:02:55,850 --> 00:02:58,360
So that was kind of a unique opportunity for me

56
00:02:58,369 --> 00:03:00,509
to be able to help support her through that.

57
00:03:00,529 --> 00:03:03,479
The one thing about ovarian cancer that's really challenging,

58
00:03:03,490 --> 00:03:08,039
there's no reliable test or screening test for ovarian cancer.

59
00:03:08,089 --> 00:03:10,210
And that is an area that I think as well.

60
00:03:10,220 --> 00:03:12,919
Research really needs to focus on to try and give

61
00:03:12,929 --> 00:03:18,009
women a better chance of survival and being able to diagnose

62
00:03:18,119 --> 00:03:21,509
ovarian cancer. At a much earlier stage, I was approached

63
00:03:21,639 --> 00:03:25,149
by someone on the research team with the Canadian Cancer Society to be

64
00:03:25,160 --> 00:03:28,589
patient advocate to look at the research proposals that were being put forward.

65
00:03:28,600 --> 00:03:30,830
I think the patient voice is really important

66
00:03:30,960 --> 00:03:35,899
because you need to understand the impacts of your research on the patient,

67
00:03:35,910 --> 00:03:38,570
not just the researcher having gone through treatment.

68
00:03:38,580 --> 00:03:40,779
There are several things that I have had to endure.

69
00:03:41,050 --> 00:03:44,509
I feel like even though the cure for cancer is always out there, as you know,

70
00:03:44,520 --> 00:03:46,949
the thing that we ultimately want to get to

71
00:03:47,190 --> 00:03:49,190
my focus is more about

72
00:03:49,610 --> 00:03:52,169
what can we do to make treatment more humane,

73
00:03:52,220 --> 00:03:56,550
what research can we get going or can we support to help improve

74
00:03:56,850 --> 00:03:59,080
the treatment experience for patients

75
00:03:59,289 --> 00:04:03,559
in the cancer connection community? We have a very large group of

76
00:04:03,699 --> 00:04:05,809
people who are caregivers and

77
00:04:05,919 --> 00:04:08,149
it's a really interesting mix to have both the

78
00:04:08,160 --> 00:04:11,509
patients and the caregivers in the same peer support community

79
00:04:11,729 --> 00:04:15,779
because the, the caregivers are coming at it from a different lens.

80
00:04:15,789 --> 00:04:17,390
But there's great support for both.

81
00:04:17,399 --> 00:04:19,940
I feel like I'm one of the lucky ones because I

82
00:04:19,950 --> 00:04:23,690
just feel that the more I can share my story,

83
00:04:23,700 --> 00:04:27,070
the more I can normalize the story a little bit.

84
00:04:27,079 --> 00:04:29,589
Hopefully it helps people be less afraid,

85
00:04:29,720 --> 00:04:32,910
help advocate for themselves in the health care system.

86
00:04:32,920 --> 00:04:36,209
I was definitely stronger than I ever thought I could be. I did treatment.

87
00:04:36,220 --> 00:04:37,429
I said I would never do.

88
00:04:38,089 --> 00:04:38,670
Um

89
00:04:40,339 --> 00:04:44,119
And I learned to give myself some grace and it was OK to ask for help.

90
00:04:44,130 --> 00:04:47,630
And now I'm five years out from when I was first diagnosed,

91
00:04:47,640 --> 00:04:50,760
I still have no evidence of disease which I'm very grateful for.

92
00:04:50,769 --> 00:04:51,519
I'm now

93
00:04:52,589 --> 00:04:53,320
healthy.

94
00:04:54,000 --> 00:04:56,059
So that's a, that's a good thing.

95
00:04:56,359 --> 00:04:57,290
It's a good thing.

96
00:04:57,570 --> 00:05:01,059
I have a little quote that I, I like to say,

97
00:05:01,369 --> 00:05:05,339
um, that every day may not be good but there's something good in every day,

98
00:05:05,609 --> 00:05:06,209
um,

99
00:05:06,670 --> 00:05:08,820
because some days are pretty awful but

100
00:05:09,570 --> 00:05:11,640
there's always something good in there always.`;

export const fillerWords = ["umm", "uhh", "um"];

export const getDocumentHeight = () =>
  Math.max(
    document.body.scrollHeight,
    document.documentElement.scrollHeight,
    document.body.offsetHeight,
    document.documentElement.offsetHeight,
    document.body.clientHeight,
    document.documentElement.clientHeight
  );

export const animationMethods = (
  effect: AnimationEffect,
  duration: number = 1,

  el: Element | FabricObject
) => {
  return {
    fadeIn: () => effect.fadeIn(duration),
    fadeOut: () => effect.fadeOut(duration),
    fade: () => effect.fade(0, 1, duration),
    // slideX: () => effect.slideX(-el.clientWidth, 0, duration),
    // slideLeftIn: () => effect.slideX(-el.clientWidth, 0, duration),
    // slideLeftOut: () => effect.slideX(0, el.clientWidth + 200, duration),
    // slideRightIn: () => effect.slideX(el.clientWidth, 0, duration),
    // slideRightOut: () => effect.slideX(0, -el.clientWidth, duration),

    // slideY: () => effect.slideY(-el.clientHeight, 0, duration),
    // slideUpIn: () => effect.slideY(-el.clientHeight, 0, duration),
    // slideUpOut: () => effect.slideY(0, el.clientHeight, duration),
    // slideDownIn: () => effect.slideY(el.clientHeight, 0, duration),
    // slideDownOut: () => effect.slideY(0, -el.clientHeight, duration),
    // slide: () =>
    //   effect.slide(-el.clientWidth, -el.clientHeight, 0, 0, duration),

    zoomIn: () => effect.zoomTo(1.5, duration),
    zoomOut: () => effect.zoomTo(0.5, duration),
    zoomTo: () => effect.zoomTo(1.5, duration),
    zoomFrom: () => effect.zoomFrom(1.5, duration),

    // wipeX: () => effect.wipeX(-el.clientWidth, 0, 0, 1, duration),
    // wipeLeft: () => effect.wipeX(-el.clientWidth, 0, 0, 1, duration),
    // wipeRight: () => effect.wipeX(el.clientWidth, 0, 0, 1, duration),

    // wipeY: () => effect.wipeY(-el.clientHeight, 0, 0, 1, duration),
    // wipeUp: () => effect.wipeY(-el.clientHeight, 0, 0, 1, duration),
    // wipeDown: () => effect.wipeY(el.clientHeight, 0, 0, 1, duration),
    // radialWipe: () => effect.radialWipe(duration),

    // fadeBlack: () => effect.fadeColor(duration),
    // fadeWhite: () => effect.fadeColor(duration, '#fff'),

    // smoothUpIn: () => effect.smoothY(duration, -el.clientHeight, 0),
    // smoothUpOut: () => effect.smoothY(duration, 0, el.clientHeight),
    // smoothDownIn: () => effect.smoothY(duration, el.clientHeight, 0),
    // smoothDownOut: () => effect.smoothY(duration, 0, -el.clientHeight),

    // smoothLeftIn: () => effect.smoothX(duration, -el.clientWidth, 0),
    // smoothLeftOut: () => effect.smoothX(duration, 0, el.clientWidth + 200),
    // smoothRightIn: () => effect.smoothX(duration, el.clientWidth, 0),
    // smoothRightOut: () => effect.smoothX(duration, 0, -el.clientWidth),

    // smoothTranslateUpIn: () =>
    //   effect.smoothTranslateY(-el.clientHeight, 0, duration),
    // smoothTranslateUpOut: () =>
    //   effect.smoothTranslateY(0, el.clientHeight, duration),
    // smoothTranslateDownIn: () =>
    //   effect.smoothTranslateY(el.clientHeight, 0, duration),
    // smoothTranslateDownOut: () =>
    //   effect.smoothTranslateY(0, -el.clientHeight, duration),

    // smoothTranslateLeftIn: () =>
    //   effect.smoothTranslateX(-el.clientWidth, 0, duration),
    // smoothTranslateLeftOut: () =>
    //   effect.smoothTranslateX(0, el.clientWidth + 200, duration),
    // smoothTranslateRightIn: () =>
    //   effect.smoothTranslateX(el.clientWidth, 0, duration),
    // smoothTranslateRightOut: () =>
    //   effect.smoothTranslateX(0, -el.clientWidth, duration),

    // dissolve: () => effect.dissolve(duration),
    // verticalSlice: () => effect.verticalSlice(duration),
    // horizontalSlice: () => effect.horizontalSlice(duration),
    // diagonalTLBRIn: () =>
    //   effect.diagonal(-el.clientWidth, -el.clientHeight, 0, 0, duration),
    // diagonalBLTRIn: () =>
    //   effect.diagonal(-el.clientWidth, el.clientHeight, 0, 0, duration),
    // diagonalTLBROut: () =>
    //   effect.diagonal(0, 0, el.clientWidth, el.clientHeight, duration),
    // diagonalBLTROut: () =>
    //   effect.diagonal(0, 0, el.clientWidth, -el.clientHeight, duration),
    rectCropOpen: () => effect.rectCropOpen(duration),
    rectCropClose: () => effect.rectCropClose(duration),

    none: () => effect.none(duration),
  };
};

export const ADDITIONAL_FABRIC_PROPS = [
  "id",
  "lockMovementX",
  "lockMovementY",
  "lockScalingX",
  "lockScalingY",
  "absolutePositioned",
];

// Function to save serialized data to IndexedDB, overwriting existing data
const serializeEditorStores = (editorStores: EditorStore[]) => {
  return editorStores.map((editorStore) => {
    const {
      storeID,
      originalVideoUrl,
      datUrl,
      videoAudioUrl,
      originalVideoTitle,
      srt,
      title,
      store,
      originalVideoAudioBlob,
      originalVideoBlob,
    } = editorStore;

    return {
      storeID,
      originalVideoUrl,
      datUrl,
      videoAudioUrl,
      originalVideoTitle,
      srt,
      title,
      store,
      originalVideoAudioBlob,
      originalVideoBlob,
    };
  });
};
export async function saveEditorStoresToDB(editorStores: EditorStore[]) {
  const serializedData: SerializedEditorStore[] =
    serializeEditorStores(editorStores);

  const editorStoreData: StringifiedEditorStoreData = {
    id: "editorStoreData", // Fixed ID for overwriting existing data
    stores: JSON.stringify(serializedData),
  };

  // Save the data to IndexedDB, overwriting if it already exists
  console.log("editorStoreData", editorStoreData);
  await db.stores.put(editorStoreData);
  console.log("Editor stores saved to IndexedDB, replacing previous data.");
}

export async function loadEditorStoresFromDB(): Promise<
  SerializedEditorStore[] | undefined
> {
  const editorStoreData = await db.stores.get("editorStoreData");
  if (editorStoreData?.stores) {
    const serializedData: SerializedEditorStore[] = JSON.parse(
      editorStoreData.stores
    );
    console.log("serializedData", serializedData);
    return serializedData;
  }
}
