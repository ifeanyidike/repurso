import { fetchFile, toBlobURL } from "@ffmpeg/util";
import { CustomFabricObject, ElementTypes } from "../types/properties";
import { ffmpeg_util } from "./FFmpeg";
import { Video, Element, Subtitle, SubtitleItem, Audio } from "../types/editor";
import { runInAction } from "mobx";
import { FabricVideo } from "../customFabricElements/video";
import { stores } from "../store/Stores";
import { EditorStore } from "../store/EditorStore";

class Utility {
    public setFabricProperties(o: any) {
        return {
            width: o.width,
            height: o.height,
            absolutePositioned: o.absolutePositioned,
            angle: o.angle,
            ...(o.borderRadius && { borderRadius: o.borderRadius }),
            ...(o.borderColor && { borderColor: o.borderColor }),
            ...(o.backgroundColor && { backgroundColor: o.backgroundColor }),
            ...(o.borderScaleFactor && { borderScaleFactor: o.borderScaleFactor }),
            ...(o.cornerColor && { cornerColor: o.cornerColor }),
            ...(o.cornerSize && { cornerSize: o.cornerSize }),
            ...(o.cornerStrokeColor && { cornerStrokeColor: o.cornerStrokeColor }),
            ...(o.cornerStyle && { cornerStyle: o.cornerStyle }),
            ...(o.direction && { direction: o.direction }),
            ...(o.editable && { editable: o.editable }),
            ...(o.editingBorderColor && { editingBorderColor: o.editingBorderColor }),
            ...(o.fill && { fill: o.fill }),
            ...(o.flipX && { flipX: o.flipX }),
            ...(o.flipY && { flipY: o.flipY }),
            ...(o.fontFamily && { fontFamily: o.fontFamily }),
            ...(o.fontSize && { fontSize: o.fontSize }),
            ...(o.fontStyle && { fontStyle: o.fontStyle }),
            ...(o.fontWeight && { fontWeight: o.fontWeight }),
            ...(o.hasBorders && { hasBorders: o.hasBorders }),
            ...(o.hasControls && { hasControls: o.hasControls }),
            ...(o.left && { left: o.left }),
            ...(o.lineHeight && { lineHeight: o.lineHeight }),
            ...(o.linethrough && { linethrough: o.linethrough }),
            ...(o.lockMovementX && { lockMovementX: o.lockMovementX }),
            ...(o.lockMovementY && { lockMovementY: o.lockMovementY }),
            ...(o.lockRotation && { lockRotation: o.lockRotation }),
            ...(o.lockScalingFlip && { lockScalingFlip: o.lockScalingFlip }),
            ...(o.lockScalingX && { lockScalingX: o.lockScalingX }),
            ...(o.lockScalingY && { lockScalingY: o.lockScalingY }),
            ...(o.lockSkewingX && { lockSkewingX: o.lockSkewingX }),
            ...(o.lockSkewingY && { lockSkewingY: o.lockSkewingY }),
            ...(o.opacity && { opacity: o.opacity }),
            ...(o.originX && { originX: o.originX }),
            ...(o.originY && { originY: o.originY }),
            ...(o.preserveObjectStacking && { preserveObjectStacking: o.preserveObjectStacking }),
            ...(o.scaleX && { scaleX: o.scaleX }),
            ...(o.scaleY && { scaleY: o.scaleY }),
            ...(o.selectionColor && { selectionColor: o.selectionColor }),
            ...(o.selectionEnd && { selectionEnd: o.selectionEnd }),
            ...(o.selectionStart && { selectionStart: o.selectionStart }),
            ...(o.skewX && { skewX: o.skewX }),
            ...(o.strokeColor && { strokeColor: o.strokeColor }),
            ...(o.subscript && { subscript: o.subscript }),
            ...(o.superscript && { superscript: o.superscript }),
            ...(o.text && { text: o.text }),
            ...(o.textAlign && { textAlign: o.textAlign }),
            ...(o.textLines && { textLines: o.textLines }),
            ...(o.top && { top: o.top }),
            ...(o.touchCornerSize && { touchCornerSize: o.touchCornerSize }),
            ...(o.transparentCorners && { transparentCorners: o.transparentCorners }),
            ...(o.underline && { underline: o.underline }),
            ...(o.visible && { visible: o.visible }),
            ...(o.padding && { padding: o.padding }),
            ...(o.srcFromAttribute && { srcFromAttribute: o.srcFromAttribute }),
            ...(o.transparentCorners && { transparentCorners: o.transparentCorners }),
            ...(o.cropX && { cropX: o.cropX }),
            ...(o.cropY && { cropY: o.cropY }),
            ...(o.crossOrigin && { crossOrigin: o.crossOrigin }),
            ...(o.src && { src: o.src }),
        }
    }
    public async splitPrimaryVideo() {
        console.log("Entered")
        const currentStore = stores.editorStore!
        const element = currentStore.store.elements.find(e => e.type === ElementTypes.primaryVideo)
        const el = element as Video
        if (!element) return

        const splitTime = currentStore.videoTime
        console.log("Splitting video", splitTime)
        if (splitTime <= 0) return
        const parts = await ffmpeg_util.splitVideo(el.src, splitTime)
        const part1Audio = await ffmpeg_util.extractAudio(parts?.part1!.url!)
        const part2Audio = await ffmpeg_util.extractAudio(parts?.part2!.url!)
        console.log("part1Audio", part1Audio)

        console.log("parts: ", parts)


        const element1 = {
            ...el,
            datUrl: undefined,
            time: element.time,
            duration: splitTime,
            src: parts!.part1.url,
            videoBlob: parts!.part1.blob,

            // datUrl: await fetchFile(parts.part1),
            audio: part1Audio.url,
            audioBlob: part1Audio.blob,
            size: el.size,
        } as unknown as Element

        const element2 = {
            ...el,
            id: crypto.randomUUID(),
            src: parts!.part2,
            datUrl: undefined,
            // datUrl: await fetchFile(parts.part2),
            audio: part2Audio,
            time: splitTime,
            duration: element.duration - splitTime,
            size: el.size,
        } as unknown as Element

        const index = currentStore.store.elements.findIndex(e => e.id === element.id)
        runInAction(async () => {
            const splittedSrt = this.splitSubtitle(currentStore.srt)
            const srtIdx = currentStore.store.elements.findIndex(e => e.type === ElementTypes.subtitle)
            if (srtIdx !== -1 && splittedSrt.start) {
                stores.editorStore!.store.elements[srtIdx] = {
                    ...stores.editorStore!.store.elements[srtIdx],
                    duration: splitTime,
                    elements: splittedSrt.start.arr,
                }
                stores.editorStore!.srt = splittedSrt.start.srt
            }

            stores.editorStore!.store.elements.splice(index, 1, element1)
            const { end } = await this.splitMatchingElements()

            const currentObject = currentStore.fabricCanvas?.getObjects().find(o => (o as CustomFabricObject).id === element.id)
            if (currentObject) {
                const videoElement = (currentObject as FabricVideo).getElement() as HTMLVideoElement
                const fabricSource = videoElement.querySelector('source');
                videoElement.src = parts!.part1.url
                if (fabricSource) {
                    fabricSource.src = parts!.part1.url;
                    // (currentObject as FabricVideo).setElement(videoElement)
                    // videoElement.load();
                }
            }
            stores.editorStore!.changeCount++;


            const newOriginalVideoUrl = parts!.part2.url
            const datUrl = null
            const newOriginalVideoTitle = currentStore.title
            const newVideoAudioUrl = part2Audio.url
            const newTitle = "Untitled Video"
            const newSRT = splittedSrt.end?.srt || null
            console.log("end", end)
            const newElements = [...end]
            const newStore = new EditorStore(
                newOriginalVideoUrl,
                datUrl,
                newOriginalVideoTitle,
                newVideoAudioUrl,
                newTitle,
                newSRT,
                parts?.part2.blob,
                part2Audio.blob
            )
            newStore.initialElements = newElements
            // newStore.store.elements.push(...newElements)
            stores.editorStores.push(newStore)
            stores.editorStore!.timelineStore.videoTriggerPlaceholder =
                !stores.editorStore!.timelineStore.videoTriggerPlaceholder;
        })

        return parts
    }

    public convertSrtToObject(srt: string): Subtitle {
        const lines = srt.split('\n');
        const subtitleObject: Subtitle = {};

        let currentTime = '';
        let currentText = '';

        lines.forEach(line => {
            // Check if the line contains the timestamp
            const timeRegex =
                /(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})/;
            const timeMatch = line.match(timeRegex);

            if (timeMatch) {
                currentTime = `${timeMatch[1]} --> ${timeMatch[2]}`;
            } else if (line.trim() === '' && currentTime) {
                // If we hit an empty line, save the subtitle and reset the values
                subtitleObject[currentTime] = currentText.trim();
                currentTime = '';
                currentText = '';
            } else if (!isNaN(Number(line))) {
                // Skip line numbers
                return;
            } else {
                // Accumulate the subtitle text
                currentText += `${line} `;
            }
        });

        // Handle the last subtitle in case there's no final empty line
        if (currentTime) {
            subtitleObject[currentTime] = currentText.trim();
        }

        return subtitleObject;
    }

    public convertObjectToSrt(subtitleObject: Subtitle): string {
        let srtString = '';
        let index = 1;

        for (const [time, text] of Object.entries(subtitleObject)) {
            srtString += `${index}\n${time}\n${text}\n\n`;
            index++;
        }

        return srtString.trim();
    }

    public convertSrtToArray(srt: string): SubtitleItem[] {
        const lines = srt.split('\n');
        const subtitleArray: SubtitleItem[] = [];

        let currentTime = '';
        let currentText = '';
        let currentItem: SubtitleItem | null = null;

        lines.forEach(line => {
            const timeRegex =
                /(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})/;
            const timeMatch = line.match(timeRegex);

            if (timeMatch) {
                currentItem = {
                    id: crypto.randomUUID(),
                    start: timeMatch[1],
                    end: timeMatch[2],
                    text: '',
                };
            } else if (line.trim() === '' && currentItem) {
                // If we hit an empty line, save the subtitle and reset the values
                currentItem.text = currentText.trim();
                subtitleArray.push(currentItem);
                currentItem = null;
                currentText = '';
            } else if (!isNaN(Number(line))) {
                // Skip line numbers
                return;
            } else if (currentItem) {
                // Accumulate the subtitle text
                currentText += `${line} `;
            }
        });

        // Handle the last subtitle in case there's no final empty line
        if (currentItem) {
            (currentItem as SubtitleItem).text = currentText.trim();
            subtitleArray.push(currentItem);
        }

        return subtitleArray;
    }

    public convertArrayToSrt(subtitleArray: SubtitleItem[]): string {
        let srtString = '';
        subtitleArray.forEach((item, index) => {
            srtString += `${index + 1}\n${item.start} --> ${item.end}\n${item.text}\n\n`;
        });

        return srtString.trim(); // Remove the trailing newline
    }

    public getTimeFromSrtObject(srtTimeString: string) {
        const [other, milliseconds] = srtTimeString.split(',');
        let time = parseFloat(milliseconds) / 1000;
        const [hours, minutes, seconds] = other.split(':').map(Number);
        time += hours * 3600 + minutes * 60 + seconds;
        return time;
    }

    public convertToSrtTimeFormat(timeInSeconds: number): string {
        // Extract the hours, minutes, seconds, and milliseconds from timeInSeconds
        const hours = Math.floor(timeInSeconds / 3600); // 1 hour = 3600 seconds
        const minutes = Math.floor((timeInSeconds % 3600) / 60); // 1 minute = 60 seconds
        const seconds = Math.floor(timeInSeconds % 60);
        const milliseconds = Math.round(
            (timeInSeconds - Math.floor(timeInSeconds)) * 1000
        ); // Remaining fractional seconds to milliseconds

        // Pad with leading zeroes if necessary (e.g., 01:02:03,123)
        const hoursStr = String(hours).padStart(2, '0');
        const minutesStr = String(minutes).padStart(2, '0');
        const secondsStr = String(seconds).padStart(2, '0');
        const millisecondsStr = String(milliseconds).padStart(3, '0');

        // Construct the SRT timestamp string
        return `${hoursStr}:${minutesStr}:${secondsStr},${millisecondsStr}`;
    }

    public splitSubtitle(srt: string | null) {
        if (!srt) {
            return { start: null, end: null }
        }
        const srtArray = this.convertSrtToArray(srt)
        const splitTime = stores.editorStore!.videoTime

        const splitIndex = srtArray.findIndex(srt => {
            const start = this.getTimeFromSrtObject(srt.start);
            const end = this.getTimeFromSrtObject(srt.end)
            return (start <= splitTime && end >= splitTime)
        })

        const start = srtArray.slice(0, splitIndex)
        const end = srtArray.slice(splitIndex).map(s => {
            const newStart = Math.max(0, this.getTimeFromSrtObject(s.start) - splitTime)
            const newEnd = this.getTimeFromSrtObject(s.end) - splitTime
            s.start = this.convertToSrtTimeFormat(newStart)
            s.end = this.convertToSrtTimeFormat(newEnd)
            return s
        })
        return {
            start: {
                srt: this.convertArrayToSrt(start),
                arr: start,
            },
            end: {
                srt: this.convertArrayToSrt(end),
                arr: end
            }
        }
    }


    public async splitMatchingElements() {
        const splitTime = stores.editorStore!.videoTime;

        // Filter elements that start before or overlap the splitTime
        const startElements = stores.editorStore!.store.elements.filter(
            e => (e.type !== ElementTypes.primaryVideo && e.type !== ElementTypes.subtitle) &&
                e.time < splitTime
        );

        // Filter elements that start after the splitTime
        const endElements = stores.editorStore!.store.elements.filter(
            e => (e.type !== ElementTypes.primaryVideo && e.type !== ElementTypes.subtitle) &&
                e.time >= splitTime
        );

        // Define an array to store promises for split operations
        const splitPromises = startElements.flatMap(async (e) => {
            if (e.time + e.duration > splitTime) {
                // Split the overlapping element into two parts
                const beforeSplit = {
                    ...e,
                    id: crypto.randomUUID(),
                    duration: splitTime - e.time // Duration up to `splitTime`
                };

                const afterSplit = {
                    ...e,
                    id: crypto.randomUUID(),
                    time: splitTime, // Start the second part at `splitTime`
                    duration: (e.time + e.duration) - splitTime // Remaining duration after `splitTime`
                };

                // Handle specific element types that require FFmpeg splitting
                if (e.type === ElementTypes.audio) {
                    await this.splitSingleAudio(beforeSplit as Audio, afterSplit as Audio, e as Audio, splitTime)
                }

                if (e.type === ElementTypes.video) {
                    await this.splitSingleVideo(beforeSplit as Video, afterSplit as Video, e as Video, splitTime)
                }

                return [beforeSplit, afterSplit];
            }

            // Return the element as-is if it does not overlap
            return [e];
        });

        // Wait for all promises to resolve to get the final split elements
        const splitElements = (await Promise.all(splitPromises)).flat();

        // Update the `start` elements with split results
        const start = splitElements.filter(e => e.time < splitTime);

        // Update the elements in the store to reflect the split
        stores.editorStore!.store.elements = stores.editorStore!.store.elements
            .map(e => {
                if (e.type === ElementTypes.image || e.type === ElementTypes.text || e.type === ElementTypes.audio) {
                    const newEl = start.find(s => s.id === e.id);
                    return newEl || e;
                }
                return e;
            })
            .filter(e => {
                if (e.type === ElementTypes.image || e.type === ElementTypes.text || e.type === ElementTypes.audio) {
                    return start.some(s => s.id === e.id);
                }
                return true;
            });

        // Return split results organized into `start` and `end` sections
        return {
            start, // First part of split or entire elements before split
            end: [
                ...endElements,
                ...splitElements.filter(e => e.time >= splitTime)
            ].map(e => ({ ...e, time: Math.max(0, e.time - splitTime) })) // Adjust time for end elements
        };
    }

    public async splitSingleAudio(beforeSplit: Audio, afterSplit: Audio, e: Audio, splitTime: number) {
        beforeSplit.audio?.stop()?.unload();
        afterSplit.audio?.stop()?.unload();
        delete beforeSplit.audio;
        delete afterSplit.audio;

        // Perform audio split and update `src` and `audio` attributes
        const parts = await ffmpeg_util.splitAudio((e).src, e.format!, e.time + e.duration - splitTime);
        console.log("parts: ", parts, splitTime)
        if (parts) {
            beforeSplit.src = parts.part1.url;
            beforeSplit.blob = parts.part1.blob
            beforeSplit.audio = new Howl({
                src: parts.part1.url,
                loop: false,
                autoplay: false,
                format: (e).format
            });

            afterSplit.src = parts.part2.url;
            afterSplit.blob = parts.part2.blob
            afterSplit.audio = new Howl({
                src: parts.part2.url,
                loop: false,
                autoplay: false,
                format: (e).format,
            });

            beforeSplit.audio?.on('load', () => { console.log("duration for part 1", beforeSplit.audio?.duration()) });
            afterSplit.audio?.on('load', () => { console.log("duration for part 2", afterSplit.audio?.duration()) });
        }
    }

    public async splitSingleVideo(beforeSplit: Video, afterSplit: Video, e: Video, splitTime: number) {
        delete beforeSplit.fabricObject;
        delete beforeSplit.video;
        delete afterSplit.fabricObject;
        delete afterSplit.video;
        ;
        const parts = await ffmpeg_util.splitVideo(e.src, (e as Element).time + (e as Element).duration - splitTime);
        if (!parts) throw new Error("An error occurred when splitting video")


        if (parts) {
            console.log("parts", parts)
            beforeSplit.src = parts.part1.url;
            beforeSplit.videoBlob = parts.part1.blob


            afterSplit.src = parts.part2.url;
            afterSplit.videoBlob = parts.part2.blob

        }
    }

    public async splitSingleElement() {
        const currentStore = stores.editorStore!
        const e = stores.editorStore!.store.selectedElement
        const splitTime = currentStore.videoTime
        if (!e || e.type === ElementTypes.primaryVideo) return
        const index = stores.editorStore!.store.elements.findIndex(el => el.id === e.id)
        if (index === -1) return


        if (e.time + e.duration > splitTime) {
            const beforeSplit = {
                ...e,
                id: crypto.randomUUID(),
                duration: splitTime - e.time // Duration up to `splitTime`
            };

            const afterSplit = {
                ...e,
                id: crypto.randomUUID(),
                time: splitTime, // Start the second part at `splitTime`
                duration: (e.time + e.duration) - splitTime
            };

            // Handle specific element types that require FFmpeg splitting
            if (e.type === ElementTypes.audio) {
                await this.splitSingleAudio(beforeSplit as Audio, afterSplit as Audio, e as Audio, splitTime)
            } else if (e.type === ElementTypes.video) {
                await this.splitSingleVideo(beforeSplit as Video, afterSplit as Video, e as Video, splitTime)
                console.log("before video split", beforeSplit)
                console.log("after video split", afterSplit)
            }

            if (e.type !== ElementTypes.audio) {
                const canvasElement = currentStore.fabricCanvas?.getObjects().find(o => (o as CustomFabricObject).id === e.id)
                if (canvasElement) currentStore.fabricCanvas?.remove(canvasElement)
            }

            const index = stores.editorStore!.store.elements.findIndex(el => el.id === e.id)
            stores.editorStore!.store.elements.splice(index, 1, beforeSplit, afterSplit)
        }
    }

    public async split() {
        stores.editorStore!.undoRedo.updateUndoRedoStack();
        const element = stores.editorStore!.store.selectedElement
        if (!element || element.type === ElementTypes.primaryVideo) {
            await this.splitPrimaryVideo()
        } else {
            console.log("element", element)
            await this.splitSingleElement()
        }
    }

}

export const utility = new Utility();