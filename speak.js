// speak.js
const { useState, useEffect, useCallback } = React;

function useSpeech() {
    // 朗讀播放器狀態[cite: 4]
    const [playbackState, setPlaybackState] = useState('stopped'); // 'stopped' | 'playing' | 'paused'
    const [currentUtterance, setCurrentUtterance] = useState(null);

    // 廣東話朗讀文字優化與破音字校正[cite: 4]
    const formatCantoneseText = useCallback((rawText) => {
        if (!rawText) return '';
        let text = rawText;
        text = text.replace(/[\r\n]+/g, '，');
        text = text.replace(/[─—…]+/g, '，');
        
        const cantoneseFixMap = {
            '宛': '苑', '女': '汝', '還': '環', '見': '現', '假': '借', '樂': '洛', '長': '場',
        };
        Object.keys(cantoneseFixMap).forEach((key) => {
            text = text.replaceAll(key, cantoneseFixMap[key]);
        });
        return text;
    }, []);

    // 播放功能
    const playSpeech = useCallback((text) => {
        if (!window.speechSynthesis) return;

        // 如果目前是暫停狀態，則繼續播放
        if (playbackState === 'paused') {
            window.speechSynthesis.resume();
            setPlaybackState('playing');
            return;
        }

        // 停止之前的語音
        window.speechSynthesis.cancel();

        const formattedText = formatCantoneseText(text);
        const utterance = new SpeechSynthesisUtterance(formattedText);
        utterance.lang = 'zh-HK'; // 設定為廣東話
        utterance.rate = 0.85; // 語速稍微放慢，更有詩詞韻味

        utterance.onstart = () => setPlaybackState('playing');
        utterance.onend = () => setPlaybackState('stopped');
        utterance.onerror = () => setPlaybackState('stopped');

        setCurrentUtterance(utterance);
        window.speechSynthesis.speak(utterance);
    }, [playbackState, formatCantoneseText]);

    // 暫停功能
    const pauseSpeech = useCallback(() => {
        if (window.speechSynthesis) {
            window.speechSynthesis.pause();
            setPlaybackState('paused');
        }
    }, []);

    // 停止功能
    const stopSpeech = useCallback(() => {
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
            setPlaybackState('stopped');
        }
    }, []);

    // 當元件卸載時，自動停止語音
    useEffect(() => {
        return () => {
            if (window.speechSynthesis) window.speechSynthesis.cancel();
        };
    }, []);

    return { playbackState, playSpeech, pauseSpeech, stopSpeech };
}