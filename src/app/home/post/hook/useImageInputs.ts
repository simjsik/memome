'use client';
import { useCallback, useEffect } from "react";
import ReactQuill from "react-quill-new";

interface Props {
    ref: React.RefObject<ReactQuill | null>;
    quillLoaded: boolean;
    storageLoad: boolean;
    alertedRef: React.MutableRefObject<boolean>;
    processImageFile: (file: File) => Promise<void>
    MAX_IMG_COUNT: number;
    MAX_IMG_SIZE: number;
}

export function useImageInputs({
    ref,
    quillLoaded,
    storageLoad,
    alertedRef,
    processImageFile,
    MAX_IMG_COUNT,
    MAX_IMG_SIZE
}: Props) {
    const handlePaste = useCallback(async (e: ClipboardEvent) => {
        if (storageLoad) return;

        const items = e.clipboardData?.items;
        if (!items) return;

        const editor = ref.current?.getEditor();
        if (!editor) return;
        const editorRoot = editor.root;

        try {

            const pasteFiles = Array.from(items)
                .filter(i => i.type.startsWith('image/'))
                .map(i => i.getAsFile())
                .filter((f): f is File => !!f);

            const pasteImg = pasteFiles.length

            const html = e.clipboardData?.getData('text/html') ?? '';
            let htmlImgDataUrls: string[] = [];
            if (html) {
                const doc = new DOMParser().parseFromString(html, 'text/html');
                const imgs = Array.from(doc.querySelectorAll('img'));
                htmlImgDataUrls = imgs
                    .map(img => img.getAttribute('src') || '')
                    .filter(src => /^data:image\/(png|jpeg|jpg|webp|gif|svg\+xml);base64,/i.test(src));
            }

            const htmlImg = htmlImgDataUrls.length
            const havImg = pasteImg > 0 || htmlImg > 0
            if (!havImg) return console.log('이미지 붙여넣기 제한 1', havImg, pasteImg, htmlImg);

            e.preventDefault();

            const imgTags = Array.from(editorRoot.querySelectorAll("img"));

            // 현재 이미지 검사
            const currentCount = imgTags.length;
            const available = Math.max(0, MAX_IMG_COUNT - currentCount);

            if (available <= 0) {
                alert(`이미지는 최대 ${MAX_IMG_COUNT}개까지 등록할 수 있습니다.`);
                return;
            }

            const dataUrlToFile = (dataUrl: string, i: number): File => {
                const m = dataUrl.match(/^data:([^;]+);base64,(.+)$/)!;
                const mime = m[1];
                const b64 = m[2];
                const bin = atob(b64);
                const u8 = new Uint8Array(bin.length);
                for (let k = 0; k < bin.length; k++) u8[k] = bin.charCodeAt(k);
                const ext = mime.split('/')[1] || 'png';
                return new File([u8], `pasted_${i}.${ext}`, { type: mime });
            };

            const htmlFiles = htmlImgDataUrls.map((d, i) => dataUrlToFile(d, i));
            const candidateFiles = [...pasteFiles, ...htmlFiles];

            // 처리 가능한 수만 입력 허용
            const inputImg = candidateFiles.length
            const toProcess = candidateFiles.slice(0, available);
            if (inputImg > available) {
                alert(`${inputImg - available}개의 파일은 최대 이미지 수를 초과하여 제외됩니다.`);
            }

            const validFiles: File[] = [];
            const skippedReasons: string[] = [];
            // 타입 검사
            for (const file of toProcess) {
                if (!file.type || !file.type.startsWith('image/')) {
                    skippedReasons.push(`${file.name}: 지원되지 않는 파일 타입`);
                    return;
                }

                // 크기 검사
                if (file.size > MAX_IMG_SIZE) {
                    skippedReasons.push(`${file.name}: 파일 크기 초과 (${Math.round(file.size / 1024)} KB)`);
                    return;
                }

                validFiles.push(file);
            }

            if (skippedReasons.length > 0) {
                alert(`허용되지 않는 이미지 파일이 있습니다. :\n- ${skippedReasons.join('\n- ')}`);
            }

            if (validFiles.length === 0) return;

            const concurrency = 1; // 상황에 따라 1~3 권장
            const results: Array<{ file: File; ok: boolean; error?: unknown }> = [];

            let idx = 0;
            const worker = async () => {
                while (true) {
                    const i = idx++;
                    if (i >= validFiles.length) break;
                    const file = validFiles[i];
                    try {
                        await processImageFile(file);
                        results.push({ file, ok: true });
                    } catch (err) {
                        console.error('processImageFile error', err);
                        results.push({ file, ok: false, error: err });
                    }
                }
            };

            // 시작
            const workers = Array.from({ length: Math.min(concurrency, validFiles.length) }).map(() => worker());
            await Promise.all(workers);

            // 요약 결과 처리
            const failed = results.filter(r => !r.ok);
            if (failed.length > 0) {
                alert(`이미지 입력에 실패했습니다. 다시 시도해 주세요.`);
            } else {
            }
        } catch (error) {
            console.error('이미지 입력에 실패' + error);
            alert(`이미지 입력에 실패했습니다. 다시 시도해 주세요.`);
            return;
        }
    }, [ref, quillLoaded, storageLoad, alertedRef, processImageFile, MAX_IMG_COUNT, MAX_IMG_SIZE])

    // 드래그&드롭 처리
    const handleDrop = useCallback(async (e: DragEvent) => {
        if (storageLoad) return;
        e.preventDefault();

        try {
            const editor = ref.current?.getEditor();
            if (!editor) return;
            const editorRoot = editor.root;

            const imgTags = Array.from(editorRoot.querySelectorAll("img"));

            const files = e.dataTransfer?.files ?? [];
            if (!files || files.length === 0) return;

            const candidateFiles = Array.from(files)
                .filter(f => f.type.startsWith('image/'));

            const inputImg = candidateFiles.length

            // 현재 이미지 검사
            const currentCount = imgTags.length;
            const available = Math.max(0, MAX_IMG_COUNT - currentCount);

            if (available <= 0) {
                alert(`이미지는 최대 ${MAX_IMG_COUNT}개까지 등록할 수 있습니다.`);
                return;
            }

            // 처리 가능한 수만 입력 허용
            const toProcess = candidateFiles.slice(0, available);
            if (inputImg > available) {
                alert(`${inputImg - available}개의 파일은 최대 이미지 수를 초과하여 제외됩니다.`);
            }

            const validFiles: File[] = [];
            const skippedReasons: string[] = [];
            toProcess.forEach((file) => {
                // 타입 검사
                if (!file.type || !file.type.startsWith('image/')) {
                    skippedReasons.push(`${file.name}: 지원되지 않는 파일 타입`);
                    return;
                }

                // 크기 검사
                if (file.size > MAX_IMG_SIZE) {
                    skippedReasons.push(`${file.name}: 파일 크기 초과 (${Math.round(file.size / 1024)} KB)`);
                    return;
                }

                validFiles.push(file);
            });

            if (skippedReasons.length > 0) {
                alert(`허용되지 않는 이미지 파일이 있습니다. :\n- ${skippedReasons.join('\n- ')}`);
            }

            if (validFiles.length === 0) return;

            const concurrency = 1; // 상황에 따라 1~3 권장
            const results: Array<{ file: File; ok: boolean; error?: unknown }> = [];

            let idx = 0;
            const worker = async () => {
                while (true) {
                    const i = idx++;
                    if (i >= validFiles.length) break;
                    const file = validFiles[i];
                    try {
                        // processImageFile는 이미 내부에서 DOM 동기화 및 상태 갱신을 수행함
                        await processImageFile(file);
                        results.push({ file, ok: true });
                    } catch (err) {
                        console.error('processImageFile error', err);
                        results.push({ file, ok: false, error: err });
                    }
                }
            };

            // 시작
            const workers = Array.from({ length: Math.min(concurrency, validFiles.length) }).map(() => worker());
            await Promise.all(workers);

            // 요약 결과 처리
            const failed = results.filter(r => !r.ok);
            if (failed.length > 0) {
                alert(`이미지 입력에 실패했습니다. 다시 시도해 주세요.`);
            } else {
            }
        } catch (error) {
            console.error('이미지 처리에 실패' + error);
            alert(`이미지 입력에 실패했습니다. 다시 시도해 주세요.`);
            return;
        }
    }, [ref, quillLoaded, storageLoad, alertedRef, processImageFile, MAX_IMG_COUNT, MAX_IMG_SIZE])

    useEffect(() => {
        if (!quillLoaded) return;

        if (storageLoad) return;

        const editor = ref.current?.getEditor();
        if (!editor) return;

        editor.root.addEventListener('paste', handlePaste, true)
        editor.root.addEventListener('drop', handleDrop, true)
        editor.root.addEventListener('dragover', e => e.preventDefault(), true)
        return () => {
            editor.root.removeEventListener('paste', handlePaste, true);
            editor.root.removeEventListener('drop', handleDrop, true);
            editor.root.removeEventListener('dragover', e => e.preventDefault(), true)
        };
    }, [ref, storageLoad, alertedRef, processImageFile, handlePaste, handleDrop, MAX_IMG_COUNT, MAX_IMG_SIZE])
}