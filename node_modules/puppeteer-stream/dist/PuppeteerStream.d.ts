/// <reference types="node" />
import { LaunchOptions, Browser, Page, BrowserLaunchArgumentOptions, BrowserConnectOptions } from "puppeteer-core";
import { Readable, ReadableOptions } from "stream";
export declare class Stream extends Readable {
    private page;
    constructor(page: Page, options?: ReadableOptions);
    _read(): void;
    destroy(): Promise<void>;
}
declare module "puppeteer-core" {
    interface Page {
        index: number;
        getStream(opts: getStreamOptions): Promise<Stream>;
    }
}
export declare function launch(arg1: (LaunchOptions & BrowserLaunchArgumentOptions & BrowserConnectOptions) | any, opts?: LaunchOptions & BrowserLaunchArgumentOptions & BrowserConnectOptions): Promise<Browser>;
export declare type BrowserMimeType = "video/webm" | "video/webm;codecs=vp8" | "video/webm;codecs=vp9" | "video/webm;codecs=vp8.0" | "video/webm;codecs=vp9.0" | "video/webm;codecs=vp8,opus" | "video/webm;codecs=vp8,pcm" | "video/WEBM;codecs=VP8,OPUS" | "video/webm;codecs=vp9,opus" | "video/webm;codecs=vp8,vp9,opus" | "audio/webm" | "audio/webm;codecs=opus" | "audio/webm;codecs=pcm";
export interface getStreamOptions {
    audio: boolean;
    video: boolean;
    mimeType?: BrowserMimeType;
    audioBitsPerSecond?: number;
    videoBitsPerSecond?: number;
    bitsPerSecond?: number;
    frameSize?: number;
}
export declare function getStream(page: Page, opts: getStreamOptions): Promise<Stream>;
