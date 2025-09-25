'use client';
import { useCallback, useEffect } from "react";
import Delta from "quill-delta";
import { ImageUrls } from "@/app/state/PostState";
import ReactQuill from "react-quill-new";

interface Props {
    ref: React.RefObject<ReactQuill | null>;
    quillLoaded: boolean;
    storageLoad: boolean;
    alertedRef: React.MutableRefObject<boolean>;
    setImageUrls: React.Dispatch<React.SetStateAction<ImageUrls[]>>;
    MAX_IMG_COUNT: number;
    MAX_IMG_SIZE: number;
}

export function useImageGuard({
    ref,
    quillLoaded,
    storageLoad,
    alertedRef,
    setImageUrls,
    MAX_IMG_COUNT,
}: Props) {
    const handleImageLimit = useCallback(() => {
        if (storageLoad) return;
        
        const editor = ref.current?.getEditor();
        if (!editor) return;
        const editorRoot = editor.root;

        const imgTags = Array.from(editorRoot.querySelectorAll("img"));
        const currentSrcs = imgTags.map((img) => (img as HTMLImageElement).src);

        if (currentSrcs.length > MAX_IMG_COUNT) {
            imgTags.slice(4).forEach((img) => img.remove());
            alert(`최대 ${MAX_IMG_COUNT}개의 이미지만 업로드 가능합니다.`);
            alertedRef.current = true;
            return;
        }

        setImageUrls((prev) => {
            const prevMap = new Map<string, ImageUrls>();
            for (const imgs of prev) {
                if (imgs.localSrc) prevMap.set(imgs.localSrc, imgs);
            }

            const merged: ImageUrls[] = currentSrcs.map((src) => {
                const existing = prevMap.get(src);
                return existing ?? { localSrc: src };
            });

            return merged;
        });

        if (currentSrcs.length < MAX_IMG_COUNT) {
            alertedRef.current = false;
        }
    }, [storageLoad, ref, alertedRef, setImageUrls])

    useEffect(() => {
        if (!quillLoaded) return;
        if (storageLoad) return;

        const editor = ref.current?.getEditor();
        if (!editor) return;

        editor.clipboard.matchers = editor.clipboard.matchers.filter(
            ([nodeName]) => nodeName !== 'IMG'
        );

        editor.clipboard.addMatcher("IMG", (node: Node, delta: Delta) => {
            if (storageLoad) return delta;
            const imgTags = Array.from(editor.root.querySelectorAll("img"));
            if (imgTags.length >= MAX_IMG_COUNT) {
                alert(`최대 ${MAX_IMG_COUNT}개의 이미지만 추가할 수 있습니다.`);
                alertedRef.current = true;
                return new Delta();
            }
            return delta;
        });

        // 이미지 개수 감시
        editor.on("text-change", handleImageLimit);

        return () => {
            editor.off("text-change", handleImageLimit);
            // matcher 정리
            editor.clipboard.matchers = editor.clipboard.matchers.filter(
                ([nodeName]) => nodeName !== 'IMG'
            );
        };
    }, [ref, storageLoad, alertedRef, handleImageLimit])
}