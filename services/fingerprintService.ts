import type { FingerprintDetails, FingerprintData, FingerprintDetailValue } from '../types';

// Cryptographically strong hashing using Web Crypto API
const sha256Hex = async (str: string): Promise<string> => {
  const data = new TextEncoder().encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

const getCanvasFingerprint = (): string | null => {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    
    const txt = `i9asdm..$#po((^@KbXrww!~cz${Math.random()}`;
    ctx.textBaseline = 'top';
    ctx.font = "14px 'Arial'";
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText(txt, 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText(txt, 4, 17);

    return canvas.toDataURL();
  } catch (e) {
    return null;
  }
};

const getWebGLDetails = (): Record<string, any> | null => {
    try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

        if (!(gl instanceof WebGLRenderingContext)) {
            return null;
        }

        const details: Record<string, any> = {};
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
            details.vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
            details.renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        }
        details.randomString = Math.random().toString(36).substring(7);
        
        details.supportedExtensions = gl.getSupportedExtensions();

        const paramsToGet = [
            'MAX_TEXTURE_SIZE', 'MAX_VIEWPORT_DIMS', 'MAX_CUBE_MAP_TEXTURE_SIZE',
            'MAX_VERTEX_UNIFORM_VECTORS', 'MAX_FRAGMENT_UNIFORM_VECTORS', 'MAX_VARYING_VECTORS',
            'MAX_VERTEX_ATTRIBS', 'MAX_TEXTURE_IMAGE_UNITS', 'MAX_VERTEX_TEXTURE_IMAGE_UNITS',
            'SHADING_LANGUAGE_VERSION', 'ALIASED_POINT_SIZE_RANGE', 'ALIASED_LINE_WIDTH_RANGE',
            'RED_BITS', 'GREEN_BITS', 'BLUE_BITS', 'ALPHA_BITS', 'DEPTH_BITS', 'STENCIL_BITS'
        ];

        paramsToGet.forEach(param => {
            const value = gl.getParameter((gl as any)[param]);
            details[param.toLowerCase()] = value.toString();
        });

        return details;

    } catch (e) {
        return null;
    }
};

const getAudioFingerprint = (): Promise<string | null> => {
    return new Promise((resolve) => {
        try {
            const AudioContext = window.OfflineAudioContext || (window as any).webkitOfflineAudioContext;
            if (!AudioContext) {
                return resolve(null);
            }
            const context = new AudioContext(1, 44100, 44100);

            const oscillator = context.createOscillator();
            oscillator.type = 'triangle';
            oscillator.frequency.setValueAtTime(10000 + Math.random() * 100, context.currentTime);

            const compressor = context.createDynamicsCompressor();
            compressor.threshold.setValueAtTime(-50, context.currentTime);
            compressor.knee.setValueAtTime(40, context.currentTime);
            compressor.ratio.setValueAtTime(12, context.currentTime);
            compressor.attack.setValueAtTime(0, context.currentTime);
            compressor.release.setValueAtTime(0.25, context.currentTime);

            oscillator.connect(compressor);
            compressor.connect(context.destination);
            oscillator.start(0);
            context.startRendering();

            context.oncomplete = (event) => {
                const buffer = event.renderedBuffer;
                const data = buffer.getChannelData(0);
                let sum = 0;
                for (let i = 0; i < data.length; i++) {
                    sum += Math.abs(data[i]);
                }
                resolve(sum.toString());
                compressor.disconnect();
                oscillator.disconnect();
            };
        } catch (e) {
            resolve(null);
        }
    });
};

const getFontFingerprint = (): string[] => {
    const fonts = [
        'Arial', 'Helvetica', 'Times New Roman', 'Times', 'Courier New', 'Courier',
        'Verdana', 'Georgia', 'Palatino', 'Garamond', 'Bookman', 'Comic Sans MS',
        'Trebuchet MS', 'Arial Black', 'Impact', 'Lucida Sans Unicode', 'Tahoma',
        'Menlo', 'Monaco', 'Consolas', 'SF Pro Text', 'Roboto', 'Segoe UI'
    ];
    const detectedFonts: string[] = [];
    
    try {
        const baseFonts = ['monospace', 'sans-serif', 'serif'];
        const testString = "mmmmmmmmmmlli";
        const testSize = '72px';

        const body = document.body;
        const h = document.createElement('div');
        h.style.cssText = 'position: absolute; top: -9999px; left: -9999px;';
        body.appendChild(h);

        const baseDimensions: {[key: string]: {width: number, height: number}} = {};
        for(const font of baseFonts) {
            const s = document.createElement('span');
            s.style.fontSize = testSize;
            s.style.fontFamily = font;
            s.innerHTML = testString;
            h.appendChild(s);
            baseDimensions[font] = { width: s.offsetWidth, height: s.offsetHeight };
            h.removeChild(s);
        }

        for(const font of fonts) {
            let detected = false;
            for(const baseFont of baseFonts) {
                const s = document.createElement('span');
                s.style.fontSize = testSize;
                s.style.fontFamily = `${font},${baseFont}`;
                s.innerHTML = testString;
                h.appendChild(s);
                if (s.offsetWidth !== baseDimensions[baseFont].width || s.offsetHeight !== baseDimensions[baseFont].height) {
                    detected = true;
                }
                h.removeChild(s);
            }
            if(detected) {
                detectedFonts.push(font);
            }
        }
        body.removeChild(h);
    } catch(e) {
        return [];
    }
    return detectedFonts;
};

const getUserAgentData = async (): Promise<Record<string, any> | null> => {
    const { userAgentData } = navigator as any;
    if (!userAgentData) {
        return null;
    }
    try {
        const highEntropyValues = await userAgentData.getHighEntropyValues([
            'architecture',
            'model',
            'platformVersion',
            'bitness',
            'fullVersionList',
            'wow64',
        ]);
        return {
            brands: userAgentData.brands,
            mobile: userAgentData.mobile,
            platform: userAgentData.platform,
            ...highEntropyValues,
        };
    } catch (e) {
        return null;
    }
};

const getSpeechVoices = (): Promise<string[]> => {
    return new Promise((resolve) => {
        try {
            const getVoices = () => window.speechSynthesis.getVoices();
            let voices = getVoices();
            if (voices.length > 0) {
                return resolve(voices.map(v => `${v.name} (${v.lang})`));
            }
            window.speechSynthesis.onvoiceschanged = () => {
                voices = getVoices();
                resolve(voices.map(v => `${v.name} (${v.lang})`));
            };
            setTimeout(() => {
                voices = getVoices();
                 if (voices.length > 0) {
                     resolve(voices.map(v => `${v.name} (${v.lang})`));
                 } else {
                     resolve([]);
                 }
            }, 200);
        } catch (e) {
            resolve([]);
        }
    });
};

const getMediaDevices = async (): Promise<Record<string, number> | null> => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        return null;
    }
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const counts: Record<string, number> = { audioinput: 0, videoinput: 0, audiooutput: 0 };
        devices.forEach(d => {
            if (d.kind in counts) (counts[d.kind] as number)++;
        });
        return counts;
    } catch (e) {
        return null;
    }
};

const getWebRTCIPs = (): Promise<string[]> => {
    return new Promise((resolve) => {
        try {
            const ips: string[] = [];
            const RTCPeerConnection = window.RTCPeerConnection || (window as any).mozRTCPeerConnection || (window as any).webkitRTCPeerConnection;
            if (!RTCPeerConnection) {
                return resolve([]);
            }
            
            const pc = new RTCPeerConnection({ iceServers: [] });
            pc.createDataChannel('');
            pc.createOffer().then(offer => pc.setLocalDescription(offer));

            pc.onicecandidate = (ice) => {
                if (ice?.candidate?.candidate) {
                    const ipMatch = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/.exec(ice.candidate.candidate);
                    if (ipMatch) {
                        ips.push(ipMatch[1]);
                    }
                }
            };

            setTimeout(() => resolve([...new Set(ips)]), 1000);
        } catch (e) {
            resolve([]);
        }
    });
};

const getTouchSupport = (): Record<string, number | boolean> | null => {
    try {
        let maxTouchPoints = 0;
        if (navigator.maxTouchPoints !== undefined) {
            maxTouchPoints = navigator.maxTouchPoints;
        } else if ((navigator as any).msMaxTouchPoints !== undefined) {
            maxTouchPoints = (navigator as any).msMaxTouchPoints;
        }
        return {
            maxTouchPoints: maxTouchPoints,
            touchEvent: 'ontouchstart' in window,
        };
    } catch (e) {
        return null;
    }
};

const getBatteryInfo = async (): Promise<Record<string, any> | null> => {
    if (!('getBattery' in navigator)) {
        return null;
    }
    try {
        const battery = await (navigator as any).getBattery();
        return {
            charging: battery.charging,
            level: battery.level,
        };
    } catch (e) {
        return null;
    }
};

const getConnectionInfo = (): Record<string, any> | null => {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    if (!connection) {
        return null;
    }
    return {
        downlink: connection.downlink,
        effectiveType: connection.effectiveType,
        rtt: connection.rtt,
        type: connection.type,
    };
};

const getErrorFingerprint = (): Record<string, string | undefined> | null => {
    try {
        throw new Error('test');
    } catch (e: any) {
        return {
            message: e.message,
            stack: e.stack,
        };
    }
};

export const generateVisitorId = async (): Promise<FingerprintData> => {
  const details: FingerprintDetails = {};

  // === Collect synchronous signals ===
  details.userAgent = navigator.userAgent;
  details.language = navigator.language;
  details.languages = navigator.languages;
  details.colorDepth = screen.colorDepth;
  details.deviceMemory = (navigator as any).deviceMemory || 'N/A';
  details.hardwareConcurrency = navigator.hardwareConcurrency;
  details.screenResolution = `${screen.width}x${screen.height}x${screen.pixelDepth}`;
  details.availableScreenResolution = `${screen.availWidth}x${screen.availHeight}`;
  details.devicePixelRatio = window.devicePixelRatio;
  details.timezoneOffset = new Date().getTimezoneOffset();
  details.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  details.sessionStorage = !!window.sessionStorage;
  details.localStorage = !!window.localStorage;
  details.indexedDB = !!window.indexedDB;
  details.platform = navigator.platform;
  details.doNotTrack = navigator.doNotTrack || (window as any).doNotTrack || (navigator as any).msDoNotTrack || 'N/A';
  details.plugins = Array.from(navigator.plugins).map(p => p.name);
  details.canvasFingerprint = getCanvasFingerprint();
  details.webGLDetails = JSON.stringify(getWebGLDetails());
  details.fontFingerprint = getFontFingerprint();
  details.touchSupport = JSON.stringify(getTouchSupport());
  details.connectionInfo = JSON.stringify(getConnectionInfo());
  details.vibrationSupport = 'vibrate' in navigator;
  details.errorFingerprint = JSON.stringify(getErrorFingerprint());
  details.automationWebDriver = navigator.webdriver;


  // === Collect asynchronous signals in parallel ===
  const [
      audioFingerprint,
      userAgentData,
      speechVoices,
      mediaDevices,
      webRTCIPs,
      batteryInfo
  ] = await Promise.all([
      getAudioFingerprint(),
      getUserAgentData(),
      getSpeechVoices(),
      getMediaDevices(),
      getWebRTCIPs(),
      getBatteryInfo()
  ]);

  details.audioFingerprint = audioFingerprint;
  details.userAgentData = userAgentData ? JSON.stringify(userAgentData) : null;
  details.speechVoices = speechVoices;
  details.mediaDevices = mediaDevices ? JSON.stringify(mediaDevices) : null;
  details.webRTCIPs = webRTCIPs;
  details.batteryInfo = batteryInfo ? JSON.stringify(batteryInfo) : null;
  
  // Create a stable string from the details
  const detailString = Object.keys(details)
    .sort()
    .map(key => {
        const value = details[key];
        if (value === null || value === undefined) {
            return `${key}:null`;
        }
        return `${key}:${Array.isArray(value) ? value.join(',') : value}`;
    })
    .join(';');

  const visitorId = await sha256Hex(detailString);

  const maxEntropy = Object.keys(details).length;
  
  // Calculate entropy based on the number of unique data points
  const entropy = Object.values(details).filter(v => 
      v !== null && v !== undefined && v !== 'N/A' && v !== false && (!Array.isArray(v) || v.length > 0)
  ).length;

  return { visitorId, details, entropy, maxEntropy };
};
